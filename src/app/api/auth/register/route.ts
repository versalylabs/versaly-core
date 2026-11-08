import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { clientIp } from "@/lib/rate-limit";

/**
 * Create a team member account. Public sign-up is disabled: only a signed-in
 * OWNER or ADMIN can add users, and the caller stays signed in as themselves.
 */
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  password: z.string().min(12, "Password must be at least 12 characters").max(200),
  jobTitle: z.string().optional(),
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "READ_ONLY"]).default("STAFF"),
});

export async function POST(req: NextRequest) {
  try {
    const actor = await getCurrentUser();
    if (!actor) {
      return apiError("Unauthenticated", "UNAUTHORIZED", 401);
    }
    if (actor.role !== "OWNER" && actor.role !== "ADMIN") {
      return apiError("Only owners and admins can add team members", "FORBIDDEN", 403);
    }

    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
    }

    const { name, email, password, jobTitle, role } = parsed.data;

    // Admins cannot create other admins; only the owner can.
    if (role === "ADMIN" && actor.role !== "OWNER") {
      return apiError("Only the owner can create admin accounts", "FORBIDDEN", 403);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return apiError("A user with this email already exists", "USER_EXISTS", 409);
    }

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        role,
        jobTitle,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        jobTitle: true,
        createdAt: true,
      },
    });

    await logAuditEvent({
      userId: actor.id.startsWith("env-") ? null : actor.id,
      action: "USER_CREATED",
      entityType: "User",
      entityId: user.id,
      metadata: { role: user.role, email: user.email, createdBy: actor.email },
      ipAddress: clientIp(req.headers),
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    return apiSuccess({ user }, 201);
  } catch (error) {
    logger.error("User registration failed", {}, error);
    return apiError("Failed to register user", "INTERNAL_ERROR", 500);
  }
}
