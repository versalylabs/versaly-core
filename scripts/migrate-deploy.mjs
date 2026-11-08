#!/usr/bin/env node
/**
 * Applies pending database migrations during a Vercel build.
 * Skipped (with a warning) when no database is configured, so the site still
 * deploys and runs in local-only mode until a database is connected.
 */
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL_UNPOOLED && !process.env.DATABASE_URL) {
  console.warn("⚠  No DATABASE_URL set: skipping migrations. Data will stay in each browser until a database is connected.");
  process.exit(0);
}

execSync("npx prisma migrate deploy", { stdio: "inherit" });
