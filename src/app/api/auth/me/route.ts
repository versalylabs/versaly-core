import { getCurrentUser } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { hasPermission, Permission } from "@/lib/rbac";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return apiError("Unauthenticated", "UNAUTHORIZED", 401);
  }

  // Include permitted capabilities
  const permissionsList: Permission[] = [
    "users:read", "users:create", "users:update", "users:delete",
    "company:manage", "audit:read",
    "directory:read", "directory:write", "directory:delete",
    "crm:read", "crm:write", "crm:delete",
    "projects:read", "projects:write", "projects:delete", "tasks:manage",
    "documents:read", "documents:write", "documents:delete", "templates:manage",
    "knowledge:read", "knowledge:write",
    "finance:read", "finance:write",
    "ai:query", "ai:execute_action"
  ];

  const grantedPermissions = permissionsList.filter((p) => hasPermission(user.role, p));

  return apiSuccess({
    user,
    permissions: grantedPermissions,
  });
}
