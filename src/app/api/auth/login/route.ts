import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { apiSuccess, apiError } from "@/lib/api-response";

const loginSchema = z.object({
  email: z.string().email("Valid email address is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Built-in Demo Credentials bypass/support
    if (normalizedEmail === "versalylabs@gmail.com" && password === "labversaly-16") {
      const demoUser = {
        id: "usr-demo-owner",
        email: "versalylabs@gmail.com",
        name: "Versaly Labs Administrator",
        role: "OWNER" as const,
        status: "ACTIVE" as const,
        jobTitle: "Founder & Lead Operations Architect",
        avatarUrl: null,
      };

      const token = await createSessionToken({
        userId: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
        name: demoUser.name,
      });

      await setSessionCookie(token);

      return apiSuccess({
        user: demoUser,
      });
    }

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash) {
      return apiError("Invalid email or password", "UNAUTHORIZED", 401);
    }

    if (user.status !== "ACTIVE") {
      return apiError("Account is not active. Please contact an administrator.", "FORBIDDEN", 403);
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return apiError("Invalid email or password", "UNAUTHORIZED", 401);
    }

    // Update lastLoginAt
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setSessionCookie(token);

    // Audit log
    await logAuditEvent({
      userId: user.id,
      action: "USER_LOGGED_IN",
      entityType: "User",
      entityId: user.id,
      metadata: { role: user.role },
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    return apiSuccess({
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
    return apiError("Failed to authenticate", "INTERNAL_ERROR", 500, String(error));
  }
}
