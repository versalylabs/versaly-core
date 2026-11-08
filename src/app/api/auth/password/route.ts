import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSessionToken, getCurrentUser, hashPassword, setSessionCookie, verifyPassword } from "@/lib/auth";
import { OWNER_USER_ID } from "@/lib/owner";
import { validatePassword } from "@/lib/access";
import { logAuditEvent } from "@/lib/audit";
import { apiError, apiSuccess } from "@/lib/api-response";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const schema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(1).max(200),
});

/**
 * Change your own password. New team members land here first (they are given a
 * temporary password). The owner account signed in through the environment
 * keeps its password in the hosting settings instead (npm run owner:password).
 */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
  if (!user) return apiError("Unauthenticated", "UNAUTHORIZED", 401);
  if (user.id === OWNER_USER_ID) {
    return apiError("The owner password is set with “npm run owner:password” and in the hosting settings.", "NOT_SUPPORTED", 400);
  }

  const limit = checkRateLimit(`pwchange:${user.id}`, 8, 15 * 60 * 1000);
  if (!limit.allowed) return apiError("Too many attempts. Try again in a few minutes.", "RATE_LIMITED", 429);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Please fill in both fields.", "INVALID_INPUT", 400);
  const { currentPassword, newPassword } = parsed.data;

  try {
    const record = await db.user.findUnique({ where: { id: user.id } });
    if (!record?.passwordHash || !(await verifyPassword(currentPassword, record.passwordHash))) {
      return apiError("Your current password is not correct.", "INVALID_CREDENTIALS", 400);
    }
    if (currentPassword === newPassword) return apiError("Choose a new password that is different from the current one.", "INVALID_INPUT", 400);

    const problem = validatePassword(newPassword, user.email);
    if (problem) return apiError(problem, "WEAK_PASSWORD", 400);

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword), mustChangePassword: false },
    });

    // Fresh session without the "must change password" flag
    await setSessionCookie(await createSessionToken({ userId: user.id, email: user.email, role: user.role, name: user.name }));

    await logAuditEvent({
      userId: user.id,
      action: "PASSWORD_CHANGED",
      entityType: "User",
      entityId: user.id,
      ipAddress: clientIp(req.headers),
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    return apiSuccess({ changed: true });
  } catch (error) {
    logger.error("Password change failed", {}, error);
    return apiError("Could not change the password. Please try again.", "INTERNAL_ERROR", 500);
  }
}
