#!/usr/bin/env node
/**
 * Switches on the AI assistant by adding your Anthropic API key.
 *
 *   npm run ai:setup                 ask for the key, add it to Vercel (Production)
 *   npm run ai:setup -- --local      also add it to .env.local so it works on your computer
 *   npm run ai:setup -- --dry-run    show what would happen, change nothing
 *
 * The key is typed into a hidden prompt. It goes straight to Vercel as a
 * sensitive variable and is never printed. (--local writes it to .env.local,
 * which is git-ignored.) Create a key at https://console.anthropic.com → API keys.
 *
 * Optional: choose a cheaper model with --model claude-sonnet-5-5
 */
import { createInterface } from "node:readline";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const local = args.includes("--local");
const modelIndex = args.indexOf("--model");
const model = modelIndex >= 0 ? args[modelIndex + 1] : "";

function ask(question, { hidden = false } = {}) {
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
      resolve(answer.trim());
    });
  });
}

function fail(message) {
  console.error(`\n✘ ${message}`);
  process.exit(1);
}

if (model && !/^claude-[a-z0-9-]+$/.test(model)) fail("That model name doesn't look right. Example: claude-sonnet-5-5");

const apiKey = process.env.ANTHROPIC_API_KEY || (await ask("Anthropic API key (starts with sk-ant-): ", { hidden: true }));
if (!/^sk-ant-[A-Za-z0-9_\-]{20,}$/.test(apiKey)) fail("That doesn't look like an Anthropic API key (they start with sk-ant-). Create one at console.anthropic.com → API keys.");

const vars = [
  { name: "ANTHROPIC_API_KEY", value: apiKey, sensitive: true },
  ...(model ? [{ name: "ANTHROPIC_MODEL", value: model, sensitive: false }] : []),
];

console.log(`\n${dryRun ? "Would add" : "Adding"} to Vercel (Production):`);
for (const v of vars) console.log(`  • ${v.name}${v.sensitive ? "  (sensitive, hidden)" : `  = ${v.value}`}`);
if (local) console.log("  • and to .env.local (git-ignored)");

if (dryRun) {
  console.log("\nDry run: nothing was changed.");
  process.exit(0);
}

for (const v of vars) {
  const quoted = `"${v.value.replace(/"/g, "")}"`;
  const result = spawnSync("vercel", ["env", "add", v.name, "production", v.sensitive ? "--sensitive" : "--no-sensitive", "--force", "--yes", "--value", quoted], {
    shell: true,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    fail(`Could not add ${v.name}. Make sure you are logged in to Vercel in this folder (run: vercel login, then vercel link).\n${(result.stderr || "").split("\n").slice(-3).join("\n")}`);
  }
  console.log(`  ✔ ${v.name}`);
}

if (local) {
  const file = ".env.local";
  let text = existsSync(file) ? readFileSync(file, "utf8") : "";
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  for (const v of vars) {
    const line = `${v.name}="${v.value.replace(/"/g, "")}"`;
    const pattern = new RegExp(`^${v.name}=.*$`, "m");
    text = pattern.test(text) ? text.replace(pattern, line) : `${text}${text && !text.endsWith("\n") ? newline : ""}${line}${newline}`;
  }
  writeFileSync(file, text);
  console.log("  ✔ .env.local");
}

console.log("\nDone. Two last steps:");
console.log("  1. Redeploy in Vercel: Deployments → ⋯ on the latest → Redeploy (variables only apply to new deployments).");
console.log("  2. Open the Assistant page and ask a question. Answers use Claude, so each question costs a few cents of API credit.");
