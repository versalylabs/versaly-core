import { apiError } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/rbac";

/** Shared guard for admin-only endpoints: returns the signed-in user, or a ready-made error response. */
export async function requirePermission(permission: Permission) {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return { error: apiError("Database unavailable", "DB_UNAVAILABLE", 503) } as const;
  }
  if (!user) return { error: apiError("Unauthenticated", "UNAUTHORIZED", 401) } as const;
  if (!hasPermission(user.role, permission)) return { error: apiError("You don't have access to this", "FORBIDDEN", 403) } as const;
  return { user } as const;
}

/** The audit log links to real user rows; the environment-configured owner has none. */
export const auditUserId = (user: { id: string }) => (user.id.startsWith("env-") ? null : user.id);
