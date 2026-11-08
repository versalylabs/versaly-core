#!/usr/bin/env node
/**
 * Helper for connecting Versaly Core to Safaricom Daraja (M-Pesa C2B).
 *
 *   npm run daraja -- check              is the live receiver switched on?
 *   npm run daraja -- register           register your two callback URLs with Safaricom
 *   npm run daraja -- simulate           (sandbox only) fake a customer payment
 *
 * Add  --env production  to register against the live Safaricom API once your
 * app has gone live (the sandbox is the default).
 *
 * Your Daraja consumer key/secret are typed into the prompt (hidden) and are
 * never saved. The callback URLs are read from .env.mpesa-callback-urls.txt,
 * which `scripts` never prints.
 */
import { createInterface } from "node:readline";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith("--"));
const envName = args.includes("--env") ? args[args.indexOf("--env") + 1] : "sandbox";
const BASE = envName === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

if (!["check", "register", "simulate"].includes(command || "")) {
  console.error("Usage: npm run daraja -- <check|register|simulate> [--env sandbox|production]");
  process.exit(1);
}
if (!["sandbox", "production"].includes(envName)) {
  console.error('--env must be "sandbox" or "production".');
  process.exit(1);
}

/** Exit after a short pause so Windows can close network connections cleanly. */
async function finish(code) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  process.exit(code);
}

function ask(question, { hidden = false, fallback = "" } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim() || fallback);
    });
  });
}

function loadUrls() {
  const file = fileURLToPath(new URL("../.env.mpesa-callback-urls.txt", import.meta.url));
  if (!existsSync(file)) {
    console.error("Missing .env.mpesa-callback-urls.txt (it holds your callback URLs).");
    process.exit(1);
  }
  const urls = readFileSync(file, "utf8").split(/\r?\n/).filter((l) => l.startsWith("https://"));
  const confirmation = urls.find((u) => u.endsWith("/confirmation"));
  const validation = urls.find((u) => u.endsWith("/validation"));
  if (!confirmation || !validation) {
    console.error("Could not find both URLs in .env.mpesa-callback-urls.txt.");
    process.exit(1);
  }
  return { confirmation, validation };
}

async function getToken(key, secret) {
  const res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` },
  });
  if (!res.ok) {
    throw new Error(`Safaricom rejected the consumer key/secret (HTTP ${res.status}). Check them on your Daraja "My Apps" page.`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error("Safaricom did not return an access token.");
  return data.access_token;
}

async function post(path, token, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  return { status: res.status, json };
}

async function credentials() {
  console.log(`\nUsing the Safaricom ${envName.toUpperCase()} API (${BASE}).`);
  const key = process.env.DARAJA_CONSUMER_KEY || (await ask("Consumer Key: ", { hidden: true }));
  const secret = process.env.DARAJA_CONSUMER_SECRET || (await ask("Consumer Secret: ", { hidden: true }));
  const shortCode = process.env.DARAJA_SHORTCODE || (await ask("Paybill / Shortcode (sandbox test shortcode is on your Test Credentials page): "));
  if (!key || !secret || !shortCode) {
    console.error("Key, secret and shortcode are all required.");
    process.exit(1);
  }
  return { key, secret, shortCode };
}

if (command === "check") {
  const { validation } = loadUrls();
  const res = await fetch(validation, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).catch((e) => ({ status: 0, error: e }));
  if (res.status === 200) {
    console.log("✔ Your live receiver is switched on and the secret is correct. Safe to register the URLs.");
  } else if (res.status === 404) {
    console.log("✘ The live site doesn't recognise the secret yet. Redeploy the project in Vercel (Deployments → ⋯ → Redeploy), then run this again.");
  } else {
    console.log(`✘ Unexpected answer (HTTP ${res.status}). The site may be down or still deploying.`);
  }
  await finish(0);
}

const { key, secret, shortCode } = await credentials();
let token;
try {
  token = await getToken(key, secret);
} catch (e) {
  console.error(`\n✘ ${e.message}`);
  process.exit(1);
}

if (command === "register") {
  const { confirmation, validation } = loadUrls();

  if (envName === "sandbox" && shortCode === "174379") {
    console.log("\n⚠ 174379 is Safaricom's sandbox shortcode for STK Push, not for C2B payments. If this fails, use the C2B test shortcode instead:");
    console.log('  Daraja → My Apps → your app → Simulate (or APIs → C2B) shows the C2B test shortcode. It usually starts with 600.');
  }

  // Try the newer API first; if Safaricom's sandbox has a server error, try the older one, which is often steadier.
  const attempts = ["v2", "v1"];
  let ok = false;
  for (const version of attempts) {
    const { status, json } = await post(`/mpesa/c2b/${version}/registerurl`, token, {
      ShortCode: shortCode,
      ResponseType: "Completed", // if our validation URL can't be reached, still complete the customer's payment
      ConfirmationURL: confirmation,
      ValidationURL: validation,
    });
    console.log(`\nSafaricom (${version}) answered HTTP ${status}:`);
    console.log(JSON.stringify(json, null, 2));
    ok = status === 200 && /success/i.test(JSON.stringify(json));
    if (ok || status < 500) break;
    console.log(`\n${version} returned a server error; trying the next API version…`);
  }

  console.log(ok ? "\n✔ URLs registered." : "\n✘ Not registered. Read Safaricom's message above.");
  if (!ok) {
    console.log("\nWhat to try:");
    console.log("  • Use the C2B test shortcode (starts with 600) from the Simulate page, not 174379.");
    console.log("  • Error 500.003.1001 is often Safaricom's sandbox being down. Wait a few minutes and run this again.");
    console.log("  • Make sure the Daraja app has the C2B product ticked (My Apps → your app).");
  }
  await finish(ok ? 0 : 1);
}

if (command === "simulate") {
  if (envName !== "sandbox") {
    console.error("Simulating payments only works in the sandbox.");
    await finish(1);
  }
  console.log("\nThis makes Safaricom send a FAKE payment to your live site. Use a reference that is not a real invoice number,");
  console.log("so it appears in the 'M-Pesa payments to match' panel and does not settle a real invoice.");
  const amount = await ask("Amount in KES [10]: ", { fallback: "10" });
  const ref = await ask("Account reference [SANDBOXTEST]: ", { fallback: "SANDBOXTEST" });
  const { status, json } = await post("/mpesa/c2b/v1/simulate", token, {
    ShortCode: shortCode,
    CommandID: "CustomerPayBillOnline",
    Amount: Number(amount),
    Msisdn: "254708374149", // Safaricom's published sandbox test number
    BillRefNumber: ref,
  });
  console.log(`\nSafaricom answered (HTTP ${status}):`);
  console.log(JSON.stringify(json, null, 2));
  console.log("\nGive it a few seconds, then open Finance → Invoices on your live site: the payment should be listed under 'M-Pesa payments to match'.");
  await finish(0);
}
