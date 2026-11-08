#!/usr/bin/env node
/**
 * Sets the owner login for Versaly Core.
 *
 *   npm run owner:password
 *
 * Asks for the owner email and a new password (input hidden), then writes
 * OWNER_EMAIL, OWNER_PASSWORD_HASH and (if missing) AUTH_SECRET to .env.local,
 * and prints the same values for adding to Vercel.
 * The password itself is never stored, only its bcrypt hash.
 */
import { createInterface } from "node:readline";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import bcrypt from "bcryptjs";

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
        else rl.output.write("*".repeat(s.length > 2 ? 0 : s.length));
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

function upsertEnv(content, key, value) {
  const line = `${key}="${value}"`;
  const re = new RegExp(`^${key}=.*$`, "m");
  return re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
}

const defaultEmail = "versalylabs@gmail.com";
const email = ((await ask(`Owner email [${defaultEmail}]: `)) || defaultEmail).toLowerCase();
const password = await ask("New owner password (min 12 characters): ", { hidden: true });

if (password.length < 12) {
  console.error("\nPassword must be at least 12 characters. Nothing was changed.");
  process.exit(1);
}
const confirm = await ask("Repeat password: ", { hidden: true });
if (confirm !== password) {
  console.error("\nPasswords did not match. Nothing was changed.");
  process.exit(1);
}

const hashB64 = Buffer.from(await bcrypt.hash(password, 12), "utf8").toString("base64");

const envPath = ".env.local";
let env = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const hasSecret = /^AUTH_SECRET=.{32,}$/m.test(env);
const authSecret = randomBytes(48).toString("base64url");

env = upsertEnv(env, "OWNER_EMAIL", email);
env = upsertEnv(env, "OWNER_PASSWORD_HASH", hashB64);
if (!hasSecret) env = upsertEnv(env, "AUTH_SECRET", authSecret);
writeFileSync(envPath, env);

console.log(`\nSaved to ${envPath}. Restart the dev server to pick it up.\n`);
console.log("For the live site, add these in Vercel → Project → Settings → Environment Variables");
console.log("(Production and Preview), then redeploy:\n");
console.log(`  OWNER_EMAIL          ${email}`);
console.log(`  OWNER_PASSWORD_HASH  ${hashB64}`);
console.log(`  AUTH_SECRET          ${hasSecret ? "(use a NEW random value, e.g. the one below)" : authSecret}`);
if (hasSecret) console.log(`                       ${authSecret}`);
console.log("\nUse a different AUTH_SECRET in production than in development.");
