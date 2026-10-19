import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { UserRole } from "@prisma/client";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  jobTitle: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
    }

    const { name, email, password, jobTitle } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return apiError("A user with this email already exists", "USER_EXISTS", 409);
    }

    // Determine initial role: First user is OWNER, subsequent users default to STAFF
    const userCount = await db.user.count();
    const role: UserRole = userCount === 0 ? "OWNER" : "STAFF";

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
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

    // Create session token and set cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setSessionCookie(token);

    // Record audit event
    await logAuditEvent({
      userId: user.id,
      action: "USER_REGISTERED",
      entityType: "User",
      entityId: user.id,
      metadata: { role: user.role, email: user.email },
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    return apiSuccess({ user }, 201);
  } catch (error) {
    return apiError("Failed to register user", "INTERNAL_ERROR", 500, String(error));
  }
}
