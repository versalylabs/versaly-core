#!/usr/bin/env node
/**
 * Connects the Friday weekly review email to your Vercel project.
 *
 *   npm run email:setup            ask for your Resend key and email, add them to Vercel
 *   npm run email:setup -- --dry-run   show what would be added, change nothing
 *
 * Your Resend API key is typed into a hidden prompt and goes straight to
 * Vercel (as a sensitive variable). It is never written to a file or shown.
 * Variables set: RESEND_API_KEY, WEEKLY_REVIEW_TO, CRON_SECRET (generated here)
 * and, if you give one, EMAIL_FROM.
 */
import { createInterface } from "node:readline";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";

const dryRun = process.argv.includes("--dry-run");

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

function fail(message) {
  console.error(`\n✘ ${message}`);
  process.exit(1);
}

const apiKey = process.env.RESEND_API_KEY || (await ask("Resend API key (starts with re_): ", { hidden: true }));
if (!/^re_[A-Za-z0-9_\-]{10,}$/.test(apiKey)) fail("That doesn't look like a Resend API key (they start with re_). Create one at resend.com → API Keys.");

const recipient = process.env.WEEKLY_REVIEW_TO || (await ask("Send the weekly review to which email address? "));
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) fail("That doesn't look like an email address.");

console.log("\nResend's free test sender can only deliver to the email you signed up to Resend with.");
const from = process.env.EMAIL_FROM ?? (await ask('Sender address, e.g. Versaly Core <reports@yourdomain.com> (press Enter to use the test sender): '));
if (from && !/^[^<>"\r\n]*<?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/.test(from)) fail("That sender address doesn't look right.");

const vars = [
  { name: "RESEND_API_KEY", value: apiKey, sensitive: true },
  { name: "WEEKLY_REVIEW_TO", value: recipient, sensitive: false },
  { name: "CRON_SECRET", value: randomBytes(24).toString("base64url"), sensitive: true },
  ...(from ? [{ name: "EMAIL_FROM", value: from, sensitive: false }] : []),
];

console.log(`\n${dryRun ? "Would add" : "Adding"} to Vercel (Production):`);
for (const v of vars) console.log(`  • ${v.name}${v.sensitive ? "  (sensitive, hidden)" : `  = ${v.value}`}`);

if (dryRun) {
  console.log("\nDry run: nothing was changed.");
  process.exit(0);
}

for (const v of vars) {
  // Values are limited to characters that are safe inside double quotes on any shell
  const quoted = `"${v.value.replace(/"/g, "")}"`;
  const args = ["env", "add", v.name, "production", v.sensitive ? "--sensitive" : "--no-sensitive", "--force", "--yes", "--value", quoted];
  const result = spawnSync("vercel", args, { shell: true, encoding: "utf8" });
  if (result.status !== 0) {
    fail(`Could not add ${v.name}. Make sure you are logged in to Vercel in this folder (run: vercel login, then vercel link).\n${(result.stderr || "").split("\n").slice(-3).join("\n")}`);
  }
  console.log(`  ✔ ${v.name}`);
}

console.log("\nDone. Two last steps:");
console.log("  1. Redeploy in Vercel: Deployments → ⋯ on the latest → Redeploy (variables only apply to new deployments).");
console.log("  2. Log in, open Settings → Friday Weekly Review, and press “Send it now”. Check your inbox (and spam).");
