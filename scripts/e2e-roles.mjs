#!/usr/bin/env node
/**
 * End-to-end test of sign-in, roles and the data rules, against a RUNNING app
 * and a TEST database.
 *
 *   npm run build && npm start        (in one terminal, with a test DATABASE_URL)
 *   npm run test:e2e                  (in another)
 *
 * It creates throwaway users (@e2e.test), signs in as each role, and checks
 * that every role can see and change only what it should. It refuses to run
 * against a non-local database unless E2E_ALLOW_REMOTE=1, so it can't touch
 * real data by accident. Everything it creates is removed afterwards.
 *
 * Env: DATABASE_URL (required), E2E_BASE_URL (default http://localhost:3000),
 *      MPESA_CALLBACK_SECRET (optional: also checks the M-Pesa receiver).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const BASE = (process.env.E2E_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const DB_URL = process.env.DATABASE_URL || "";

if (!DB_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}
if (!/@(localhost|127\.0\.0\.1|postgres)[:/]/.test(DB_URL) && process.env.E2E_ALLOW_REMOTE !== "1") {
  console.error("Refusing to run against a non-local database (set E2E_ALLOW_REMOTE=1 only for a disposable test database).");
  process.exit(1);
}

const db = new PrismaClient();
let passed = 0;
let failed = 0;
const failures = [];

function check(name, expected, actual) {
  if (expected === actual) {
    passed++;
    console.log(`  ✔ ${name}`);
  } else {
    failed++;
    failures.push(`${name} (expected ${expected}, got ${actual})`);
    console.log(`  ✘ ${name} (expected ${expected}, got ${actual})`);
  }
}
const section = (t) => console.log(`\n== ${t} ==`);

/** A tiny browser: keeps the session cookie between requests and never follows redirects. */
class Client {
  cookie = "";
  async req(path, { method = "GET", body } = {}) {
    const res = await fetch(BASE + path, {
      method,
      redirect: "manual",
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(this.cookie ? { Cookie: this.cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const m = /^(versaly_session)=([^;]*)/.exec(c);
      if (m) this.cookie = m[2] ? `${m[1]}=${m[2]}` : "";
    }
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* page or empty body */
    }
    return { status: res.status, json, location: res.headers.get("location") || "" };
  }
  login(email, password) {
    return this.req("/api/auth/login", { method: "POST", body: { email, password } });
  }
}

const strong = () => `${randomBytes(9).toString("base64url")}-Lantern-47`;
const NEW_PASSWORD = "purple-Lantern-4821-ok";
const EMAIL = (n) => `${n}@e2e.test`;

async function cleanup() {
  await db.auditLog.deleteMany({ where: { user: { email: { endsWith: "@e2e.test" } } } });
  await db.user.deleteMany({ where: { email: { endsWith: "@e2e.test" } } });
  await db.workspaceDocumentRevision.deleteMany({ where: { key: { in: ["versaly_finance_invoices_v2", "versaly_active_deals_v2", "versaly_random_notes_list_v2", "versaly_payment_settings"] } } });
  await db.workspaceDocument.deleteMany({ where: { key: { in: ["versaly_finance_invoices_v2", "versaly_active_deals_v2", "versaly_random_notes_list_v2", "versaly_payment_settings"] } } });
  await db.incomingPayment.deleteMany({ where: { transId: { startsWith: "E2E" } } });
}

async function main() {
  // The app must be up
  const up = await fetch(`${BASE}/api/health`).catch(() => null);
  if (!up) throw new Error(`The app isn't reachable at ${BASE}. Start it first.`);

  await cleanup();
  const ownerPw = strong();
  await db.user.create({ data: { email: EMAIL("owner"), name: "E2E Owner", role: "OWNER", passwordHash: await bcrypt.hash(ownerPw, 10) } });

  const owner = new Client();
  section("Owner signs in and adds the team");
  check("owner signs in", 200, (await owner.login(EMAIL("owner"), ownerPw)).status);
  check("owner can list the team", 200, (await owner.req("/api/team")).status);

  const sync = (c, changes) => c.req("/api/sync", { method: "POST", body: { changes } });
  await sync(owner, [
    { key: "versaly_finance_invoices_v2", value: '[{"id":"i1","invoiceNumber":"INV-1"}]' },
    { key: "versaly_active_deals_v2", value: '[{"id":"d1"}]' },
    { key: "versaly_random_notes_list_v2", value: '[{"id":"n1"}]' },
    { key: "versaly_payment_settings", value: '{"paybillNumber":"123456"}' },
  ]);

  const add = (name, email, role) => owner.req("/api/team", { method: "POST", body: { name, email, role } });
  const people = {};
  for (const [key, name, role] of [["admin", "E2E Admin", "ADMIN"], ["manager", "E2E Manager", "MANAGER"], ["staff", "E2E Staff", "STAFF"], ["viewer", "E2E Viewer", "READ_ONLY"]]) {
    const r = await add(name, EMAIL(key), role);
    people[key] = { id: r.json?.data?.member?.id, temp: r.json?.data?.temporaryPassword, c: new Client() };
  }
  check("temporary password is generated (16+ characters)", true, (people.staff.temp || "").length >= 16);
  check("a duplicate email is refused", 409, (await add("Dup Person", EMAIL("staff"), "STAFF")).status);
  check("the owner role can't be created", 400, (await owner.req("/api/team", { method: "POST", body: { name: "Another Owner", email: EMAIL("o2"), role: "OWNER" } })).status);

  section("A new member must choose a password first");
  const s = people.staff;
  const first = await s.c.login(EMAIL("staff"), s.temp);
  check("login says a password change is required", true, first.json?.data?.mustChangePassword);
  const page = await s.c.req("/dashboard");
  check("pages redirect to the change-password page", "307 /change-password", `${page.status} ${page.location.replace(BASE, "")}`);
  check("the data API is blocked until they change it (403)", 403, (await s.c.req("/api/sync")).status);
  check("a weak new password is refused", 400, (await s.c.req("/api/auth/password", { method: "POST", body: { currentPassword: s.temp, newPassword: "password12345" } })).status);
  check("a wrong current password is refused", 400, (await s.c.req("/api/auth/password", { method: "POST", body: { currentPassword: "nope-nope-nope", newPassword: NEW_PASSWORD } })).status);
  check("a strong password is accepted", 200, (await s.c.req("/api/auth/password", { method: "POST", body: { currentPassword: s.temp, newPassword: NEW_PASSWORD } })).status);
  check("the old temporary password no longer works", 401, (await new Client().login(EMAIL("staff"), s.temp)).status);
  await s.c.login(EMAIL("staff"), NEW_PASSWORD);
  check("the dashboard opens after the change", 200, (await s.c.req("/dashboard")).status);

  for (const key of ["admin", "manager", "viewer"]) {
    const p = people[key];
    await p.c.login(EMAIL(key), p.temp);
    await p.c.req("/api/auth/password", { method: "POST", body: { currentPassword: p.temp, newPassword: NEW_PASSWORD } });
    await p.c.login(EMAIL(key), NEW_PASSWORD);
  }

  const keysFor = async (c) => {
    const j = (await c.req("/api/sync")).json?.data;
    return { keys: (j?.documents ?? []).map((d) => d.key), denied: j?.deniedKeys ?? [] };
  };
  const has = (list, part) => list.some((k) => k.includes(part));

  section("What each role can read");
  const read = { owner: await keysFor(owner), manager: await keysFor(people.manager.c), staff: await keysFor(s.c), viewer: await keysFor(people.viewer.c) };
  check("staff receive no finance data", false, has(read.staff.keys, "finance"));
  check("staff receive no payment settings", false, has(read.staff.keys, "payment_settings"));
  check("staff still receive deals and notes", true, has(read.staff.keys, "active_deals") && has(read.staff.keys, "notes"));
  check("the server tells staff which cached keys to drop", true, read.staff.denied.length >= 2);
  check("managers receive finance data", true, has(read.manager.keys, "finance_invoices"));
  check("read-only accounts receive no finance data", false, has(read.viewer.keys, "finance"));

  section("What each role can change");
  const write = async (c, key) => {
    const r = await sync(c, [{ key, value: "[1]" }]);
    return r.json?.success ? (r.json.data.saved.length ? "saved" : "rejected") : `error:${r.json?.error?.code}`;
  };
  check("staff can't write finance", "rejected", await write(s.c, "versaly_finance_invoices_v2"));
  check("staff can write deals", "saved", await write(s.c, "versaly_active_deals_v2"));
  check("managers can't write finance", "rejected", await write(people.manager.c, "versaly_finance_invoices_v2"));
  check("managers can write deals", "saved", await write(people.manager.c, "versaly_active_deals_v2"));
  check("read-only accounts can't write notes", "rejected", await write(people.viewer.c, "versaly_random_notes_list_v2"));
  check("read-only accounts can't write deals", "rejected", await write(people.viewer.c, "versaly_active_deals_v2"));
  check("admins can write finance", "saved", await write(people.admin.c, "versaly_finance_invoices_v2"));
  const fin = (await owner.req("/api/sync")).json?.data?.documents?.find((d) => d.key === "versaly_finance_invoices_v2");
  check("refused writes left finance data untouched (only the admin's save landed)", "[1]@2", `${fin?.value}@${fin?.version}`);

  section("Other areas");
  check("staff are blocked from the payments API", 403, (await s.c.req("/api/payments/incoming")).status);
  check("managers can read the payments API", 200, (await people.manager.c.req("/api/payments/incoming")).status);
  check("managers can't apply payments", 403, (await people.manager.c.req("/api/payments/incoming", { method: "POST", body: { transId: "E2E-ABC123", status: "IGNORED" } })).status);
  check("staff are blocked from the team list", 403, (await s.c.req("/api/team")).status);
  check("managers are blocked from the audit log", 403, (await people.manager.c.req("/api/audit")).status);
  check("staff are blocked from the backup export", 403, (await s.c.req("/api/sync/export")).status);
  check("staff are blocked from the weekly review", 403, (await s.c.req("/api/weekly-review")).status);
  const finPage = await s.c.req("/finance");
  check("staff are redirected away from /finance", "307 /dashboard?denied=%2Ffinance", `${finPage.status} ${finPage.location.replace(BASE, "")}`);
  check("staff are redirected away from /settings/team", 307, (await s.c.req("/settings/team")).status);
  check("managers can open /finance/forecast", 200, (await people.manager.c.req("/finance/forecast")).status);
  check("read-only accounts are redirected away from /finance", 307, (await people.viewer.c.req("/finance")).status);
  check("admins can open the team page", 200, (await people.admin.c.req("/settings/team")).status);
  check("signed-out requests to the data API are refused", 401, (await new Client().req("/api/sync")).status);
  check("signed-out page requests go to the login page", "307 /login?next=%2Fdashboard", await (async () => { const r = await new Client().req("/dashboard"); return `${r.status} ${r.location.replace(BASE, "")}`; })());

  section("Managing people");
  const ownerId = (await owner.req("/api/team")).json?.data?.you;
  const patch = (c, id, body) => c.req(`/api/team/${id}`, { method: "PATCH", body });
  const adminC = people.admin.c;
  check("admins can't create another admin", 403, (await adminC.req("/api/team", { method: "POST", body: { name: "Sneaky Admin", email: EMAIL("sneaky"), role: "ADMIN" } })).status);
  check("admins can create staff", 201, (await adminC.req("/api/team", { method: "POST", body: { name: "Extra Staff", email: EMAIL("extra"), role: "STAFF" } })).status);
  check("managers can't create anyone", 403, (await people.manager.c.req("/api/team", { method: "POST", body: { name: "Nope Person", email: EMAIL("nope"), role: "STAFF" } })).status);
  check("admins can't suspend the owner", 403, (await patch(adminC, ownerId, { status: "SUSPENDED" })).status);
  check("admins can't suspend themselves", 403, (await patch(adminC, people.admin.id, { status: "SUSPENDED" })).status);
  check("nobody can lower the owner's role", 403, (await patch(adminC, ownerId, { role: "STAFF" })).status);
  check("the owner promotes a manager to admin", 200, (await patch(owner, people.manager.id, { role: "ADMIN" })).status);
  check("a role change applies immediately (they can now read the team)", 200, (await people.manager.c.req("/api/team")).status);
  check("the owner demotes them again", 200, (await patch(owner, people.manager.id, { role: "MANAGER" })).status);
  check("...and the access is gone immediately", 403, (await people.manager.c.req("/api/team")).status);

  section("Suspending and password resets");
  check("the owner suspends staff", 200, (await patch(owner, s.id, { status: "SUSPENDED" })).status);
  check("suspended staff are locked out at once", 401, (await s.c.req("/api/sync")).status);
  check("suspended staff can't sign in", 403, (await new Client().login(EMAIL("staff"), NEW_PASSWORD)).status);
  check("the owner reactivates them", 200, (await patch(owner, s.id, { status: "ACTIVE" })).status);
  await s.c.login(EMAIL("staff"), NEW_PASSWORD);
  check("staff can work again", 200, (await s.c.req("/api/sync")).status);
  const reset = await patch(owner, s.id, { resetPassword: true });
  check("a reset returns a new temporary password", true, Boolean(reset.json?.data?.temporaryPassword));
  check("a reset forces another password change", true, (await new Client().login(EMAIL("staff"), reset.json?.data?.temporaryPassword)).json?.data?.mustChangePassword);

  section("Audit trail");
  const audit = (await owner.req("/api/audit?routine=0")).json?.data?.events ?? [];
  const actions = new Set(audit.map((e) => e.action));
  for (const a of ["USER_CREATED", "PASSWORD_CHANGED", "ROLE_CHANGED", "USER_SUSPENDED", "USER_REACTIVATED", "PASSWORD_RESET", "LOGIN_BLOCKED"]) {
    check(`the audit log records ${a}`, true, actions.has(a));
  }

  if (process.env.MPESA_CALLBACK_SECRET) {
    section("M-Pesa receiver");
    const secret = process.env.MPESA_CALLBACK_SECRET;
    const post = (path, body) => new Client().req(path, { method: "POST", body });
    const payload = { TransID: "E2E000001", TransAmount: "58000.00", TransTime: "20261108141530", BillRefNumber: "INV-2026-1001", FirstName: "Amina", LastName: "Hassan" };
    check("a wrong secret is refused (404)", 404, (await post("/api/payments/c2b/wrong-secret-value-123456/confirmation", payload)).status);
    check("validation is accepted", 0, (await post(`/api/payments/c2b/${secret}/validation`, {})).json?.ResultCode);
    check("a confirmation is accepted", 0, (await post(`/api/payments/c2b/${secret}/confirmation`, payload)).json?.ResultCode);
    await post(`/api/payments/c2b/${secret}/confirmation`, payload);
    check("a repeated delivery is stored only once", 1, await db.incomingPayment.count({ where: { transId: "E2E000001" } }));
    check("an unusable payload is accepted but stores nothing", 0, (await post(`/api/payments/c2b/${secret}/confirmation`, { hello: "world" })).json?.ResultCode);
  }
}

try {
  await main();
} catch (error) {
  failed++;
  failures.push(String(error?.message || error));
  console.error(`\n✘ ${error?.message || error}`);
} finally {
  await cleanup().catch(() => {});
  await db.$disconnect();
}

console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
if (failed) {
  console.log("\nFailures:\n  " + failures.join("\n  "));
  process.exit(1);
}
