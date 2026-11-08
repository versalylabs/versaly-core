import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { canManageUser, type TeamChange } from "@/lib/access";
import { generateTempPassword } from "@/lib/temp-password";
import { logAuditEvent } from "@/lib/audit";
import { apiError, apiSuccess } from "@/lib/api-response";
import { clientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { auditUserId, requirePermission } from "@/lib/team-auth";

/** Change one team member: their role, whether they can sign in, or reset their password. */

const patchSchema = z.union([
  z.object({ role: z.enum(["OWNER", "ADMIN", "MANAGER", "STAFF", "READ_ONLY"]) }),
  z.object({ status: z.enum(["ACTIVE", "SUSPENDED"]) }),
  z.object({ resetPassword: z.literal(true) }),
]);

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("users:create");
  if (auth.error) return auth.error;
  const actor = auth.user!;
  const { id } = await ctx.params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Nothing to change", "INVALID_INPUT", 400);
  const body = parsed.data;

  try {
    const target = await db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, status: true } });

    const change: TeamChange =
      "role" in body ? { kind: "role", to: body.role } : "status" in body ? { kind: "status", to: body.status } : { kind: "resetPassword" };

    const decision = canManageUser({ id: actor.id, role: actor.role }, target ? { id: target.id, role: target.role } : null, change);
    if (!decision.ok) return apiError(decision.reason, "FORBIDDEN", 403);
    if (!target) return apiError("That person was not found.", "NOT_FOUND", 404);

    const audit = (action: string, metadata: Record<string, unknown>) =>
      logAuditEvent({
        userId: auditUserId(actor),
        action,
        entityType: "User",
        entityId: target.id,
        metadata: { by: actor.email, member: target.email, ...metadata },
        ipAddress: clientIp(req.headers),
        userAgent: req.headers.get("user-agent") || "unknown",
      });

    if ("role" in body) {
      if (body.role === target.role) return apiSuccess({ unchanged: true });
      await db.user.update({ where: { id }, data: { role: body.role } });
      await audit("ROLE_CHANGED", { from: target.role, to: body.role });
      return apiSuccess({ role: body.role });
    }

    if ("status" in body) {
      if (body.status === target.status) return apiSuccess({ unchanged: true });
      await db.user.update({ where: { id }, data: { status: body.status } });
      await audit(body.status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_REACTIVATED", {});
      return apiSuccess({ status: body.status });
    }

    // Reset: new one-time password, and they must choose their own at next sign-in
    const temporaryPassword = generateTempPassword();
    await db.user.update({ where: { id }, data: { passwordHash: await hashPassword(temporaryPassword), mustChangePassword: true } });
    await audit("PASSWORD_RESET", {});
    return apiSuccess({ temporaryPassword });
  } catch (error) {
    logger.error("Updating team member failed", {}, error);
    return apiError("Could not update the team member", "INTERNAL_ERROR", 500);
  }
}
