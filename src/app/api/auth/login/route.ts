import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { getOwnerProfile, verifyOwnerCredentials } from "@/lib/owner";
import { logAuditEvent } from "@/lib/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const loginSchema = z.object({
  email: z.string().email("Valid email address is required"),
  password: z.string().min(1, "Password is required").max(200),
});

const INVALID_CREDENTIALS = "Invalid email or password. Please check your credentials.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const ip = clientIp(req.headers);
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Throttle brute-force attempts per IP and per account
    const byIp = checkRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000);
    const byEmail = checkRateLimit(`login:email:${normalizedEmail}`, 10, 15 * 60 * 1000);
    if (!byIp.allowed || !byEmail.allowed) {
      const wait = Math.max(byIp.retryAfterSeconds, byEmail.retryAfterSeconds);
      return apiError(
        `Too many sign-in attempts. Try again in ${Math.ceil(wait / 60)} minute(s).`,
        "RATE_LIMITED",
        429
      );
    }

    // 1. Environment-configured owner account
    if (await verifyOwnerCredentials(normalizedEmail, password)) {
      const owner = getOwnerProfile()!;
      const token = await createSessionToken({
        userId: owner.id,
        email: owner.email,
        role: owner.role,
        name: owner.name,
      });
      await setSessionCookie(token);

      return apiSuccess({
        mustChangePassword: false,
        user: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          role: owner.role,
          status: owner.status,
          jobTitle: owner.jobTitle,
          avatarUrl: owner.avatarUrl,
        },
      });
    }

    // 2. Database users
    let user;
    try {
      user = await db.user.findUnique({ where: { email: normalizedEmail } });
    } catch (error) {
      logger.error("Login lookup failed (database unavailable?)", { email: normalizedEmail }, error);
      return apiError(INVALID_CREDENTIALS, "UNAUTHORIZED", 401);
    }

    const passwordOk = Boolean(user?.passwordHash && (await verifyPassword(password, user.passwordHash)));
    if (!user || !passwordOk) {
      // Record failed attempts against real accounts (not random addresses) so the owner can spot guessing
      if (user) {
        await logAuditEvent({
          userId: user.id,
          action: "LOGIN_FAILED",
          entityType: "User",
          entityId: user.id,
          ipAddress: ip,
          userAgent,
        });
      }
      return apiError(INVALID_CREDENTIALS, "UNAUTHORIZED", 401);
    }

    if (user.status !== "ACTIVE") {
      await logAuditEvent({
        userId: user.id,
        action: "LOGIN_BLOCKED",
        entityType: "User",
        entityId: user.id,
        metadata: { status: user.status },
        ipAddress: ip,
        userAgent,
      });
      return apiError("This account is not active. Please contact the owner.", "FORBIDDEN", 403);
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      mcp: user.mustChangePassword,
    });
    await setSessionCookie(token);

    await logAuditEvent({
      userId: user.id,
      action: "USER_LOGGED_IN",
      entityType: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent,
    });

    return apiSuccess({
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        jobTitle: user.jobTitle,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    logger.error("Login failed", {}, error);
    return apiError("Failed to authenticate", "INTERNAL_ERROR", 500);
  }
}
