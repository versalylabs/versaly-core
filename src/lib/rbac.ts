import { UserRole } from "@prisma/client";

export type Permission =
  // User & Workspace Management
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "company:manage"
  | "audit:read"
  // Core Directory (Organizations & People)
  | "directory:read"
  | "directory:write"
  | "directory:delete"
  // CRM & Deals
  | "crm:read"
  | "crm:write"
  | "crm:delete"
  // Projects & Tasks
  | "projects:read"
  | "projects:write"
  | "projects:delete"
  | "tasks:manage"
  // Documents & Templates
  | "documents:read"
  | "documents:write"
  | "documents:delete"
  | "templates:manage"
  // Knowledge & SOPs
  | "knowledge:read"
  | "knowledge:write"
  // Finance & Invoices
  | "finance:read"
  | "finance:write"
  // AI Operations
  | "ai:query"
  | "ai:execute_action";

/**
 * Role hierarchy matrix mapping system roles to granted permissions.
 */
const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  OWNER: [
    "users:read", "users:create", "users:update", "users:delete",
    "company:manage", "audit:read",
    "directory:read", "directory:write", "directory:delete",
    "crm:read", "crm:write", "crm:delete",
    "projects:read", "projects:write", "projects:delete", "tasks:manage",
    "documents:read", "documents:write", "documents:delete", "templates:manage",
    "knowledge:read", "knowledge:write",
    "finance:read", "finance:write",
    "ai:query", "ai:execute_action"
  ],
  ADMIN: [
    "users:read", "users:create", "users:update",
    "company:manage", "audit:read",
    "directory:read", "directory:write", "directory:delete",
    "crm:read", "crm:write", "crm:delete",
    "projects:read", "projects:write", "projects:delete", "tasks:manage",
    "documents:read", "documents:write", "documents:delete", "templates:manage",
    "knowledge:read", "knowledge:write",
    "finance:read", "finance:write",
    "ai:query", "ai:execute_action"
  ],
  MANAGER: [
    "users:read",
    "directory:read", "directory:write",
    "crm:read", "crm:write",
    "projects:read", "projects:write", "tasks:manage",
    "documents:read", "documents:write", "templates:manage",
    "knowledge:read", "knowledge:write",
    "finance:read",
    "ai:query", "ai:execute_action"
  ],
  STAFF: [
    "users:read",
    "directory:read", "directory:write",
    "crm:read", "crm:write",
    "projects:read", "projects:write", "tasks:manage",
    "documents:read", "documents:write",
    "knowledge:read",
    "ai:query"
  ],
  READ_ONLY: [
    "users:read",
    "directory:read",
    "crm:read",
    "projects:read",
    "documents:read",
    "knowledge:read",
    "ai:query"
  ],
};

/**
 * Checks whether a given role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Checks whether a role has all of the requested permissions.
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Checks whether a role has at least one of the requested permissions.
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
