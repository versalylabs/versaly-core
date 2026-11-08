/**
 * Who may see and change what. Pure functions (no database, no browser) so the
 * same rules are enforced on the server and used to tailor the interface, and
 * so they can be tested.
 */

import type { UserRole } from "@prisma/client";
import { hasPermission, type Permission } from "@/lib/rbac";

// ---------------------------------------------------------------------------
// Data: which collection belongs to which area
// ---------------------------------------------------------------------------

export type DataDomain = "finance" | "crm" | "projects" | "general";

const CRM_KEYS = new Set(["versaly_active_deals_v2", "versaly_raw_leads_v2", "versaly_clients_list_v2"]);
const PROJECT_KEYS = new Set([
  "versaly_projects_list_v2",
  "versaly_daily_tasks",
  "versaly_launch_roadmap_weeks",
  "versaly_weekly_rhythms",
  "versaly_last_5am_cycle",
]);

/** Which area a stored collection belongs to (decides who can read or write it). */
export function dataDomain(key: string): DataDomain {
  if (key.startsWith("versaly_finance_") || key === "versaly_payment_settings") return "finance";
  if (CRM_KEYS.has(key)) return "crm";
  if (PROJECT_KEYS.has(key)) return "projects";
  return "general";
}

const READ_PERMISSION: Record<Exclude<DataDomain, "general">, Permission> = {
  finance: "finance:read",
  crm: "crm:read",
  projects: "projects:read",
};
const WRITE_PERMISSION: Record<Exclude<DataDomain, "general">, Permission> = {
  finance: "finance:write",
  crm: "crm:write",
  projects: "projects:write",
};

export function canReadKey(role: UserRole, key: string): boolean {
  const domain = dataDomain(key);
  return domain === "general" ? true : hasPermission(role, READ_PERMISSION[domain]);
}

export function canWriteKey(role: UserRole, key: string): boolean {
  const domain = dataDomain(key);
  if (domain === "general") return role !== "READ_ONLY";
  return hasPermission(role, WRITE_PERMISSION[domain]);
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

const PAGE_RULES: { prefix: string; exact?: boolean; permission: Permission }[] = [
  { prefix: "/finance", permission: "finance:read" },
  { prefix: "/settings/team", permission: "users:create" },
  { prefix: "/settings/audit", permission: "audit:read" },
  { prefix: "/settings", exact: true, permission: "company:manage" },
];

/** The permission a page needs, or null if every signed-in role may open it. */
export function permissionForPage(pathname: string): Permission | null {
  for (const rule of PAGE_RULES) {
    const matches = rule.exact
      ? pathname === rule.prefix || pathname === `${rule.prefix}/`
      : pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`);
    if (matches) return rule.permission;
  }
  return null;
}

export function canViewPage(role: UserRole, pathname: string): boolean {
  const needed = permissionForPage(pathname);
  return needed === null || hasPermission(role, needed);
}

// ---------------------------------------------------------------------------
// Managing team members
// ---------------------------------------------------------------------------

export type TeamChange =
  | { kind: "create"; role: UserRole }
  | { kind: "role"; to: UserRole }
  | { kind: "status"; to: "ACTIVE" | "SUSPENDED" }
  | { kind: "resetPassword" };

export interface Actor {
  id: string;
  role: UserRole;
}

export type Decision = { ok: true } | { ok: false; reason: string };

const no = (reason: string): Decision => ({ ok: false, reason });

/** Roles an actor is allowed to hand out. Owners can create admins; admins cannot. Nobody creates owners here. */
export function assignableRoles(actor: Actor): UserRole[] {
  if (actor.role === "OWNER") return ["ADMIN", "MANAGER", "STAFF", "READ_ONLY"];
  if (actor.role === "ADMIN") return ["MANAGER", "STAFF", "READ_ONLY"];
  return [];
}

export function canManageUser(actor: Actor, target: Actor | null, change: TeamChange): Decision {
  if (!hasPermission(actor.role, "users:create")) return no("Only owners and admins can manage the team.");

  if (change.kind === "create") {
    return assignableRoles(actor).includes(change.role)
      ? { ok: true }
      : no(change.role === "OWNER" ? "There can only be one owner." : "Only the owner can create admin accounts.");
  }

  if (!target) return no("That person was not found.");
  if (target.id === actor.id) {
    return no(change.kind === "resetPassword" ? "Change your own password from your account instead." : "You can't change your own role or access.");
  }
  if (target.role === "OWNER") return no("The owner's account can't be changed here.");
  if (target.role === "ADMIN" && actor.role !== "OWNER") return no("Only the owner can change an admin.");

  if (change.kind === "role" && !assignableRoles(actor).includes(change.to)) {
    return no(change.to === "OWNER" ? "There can only be one owner." : "Only the owner can make someone an admin.");
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

const COMMON = ["password", "123456", "qwerty", "letmein", "welcome", "admin", "versaly", "iloveyou"];

/** Returns a problem to show the user, or null if the password is acceptable. */
export function validatePassword(password: string, email = ""): string | null {
  if (password.length < 12) return "Use at least 12 characters.";
  if (password.length > 200) return "That password is too long.";
  if (new Set(password).size < 5) return "Use a wider mix of characters.";
  const lower = password.toLowerCase();
  if (COMMON.some((w) => lower.includes(w))) return "That password is too easy to guess. Avoid common words.";
  const local = email.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && lower.includes(local)) return "Don't include your email name in your password.";
  return null;
}
