import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { getOwnerEmail, getOwnerProfile } from "@/lib/owner";
import { canManageUser } from "@/lib/access";
import { generateTempPassword } from "@/lib/temp-password";
import { logAuditEvent } from "@/lib/audit";
import { apiError, apiSuccess } from "@/lib/api-response";
import { clientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { auditUserId, requirePermission } from "@/lib/team-auth";

/**
 *   GET  → everyone on the team (owners and admins only)
 *   POST → add a team member with a one-time temporary password
 */

export async function GET() {
  const auth = await requirePermission("users:create");
  if (auth.error) return auth.error;

  try {
    const users = await db.user.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        jobTitle: true,
        lastLoginAt: true,
        createdAt: true,
        mustChangePassword: true,
      },
    });

    // The founder who signs in through the hosting settings has no database row
    const owner = getOwnerProfile();
    const members: ((typeof users)[number] & { source: "database" | "environment" })[] = users.map((u) => ({ ...u, source: "database" }));
    if (owner && !users.some((u) => u.email === owner.email)) {
      members.unshift({
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
        status: owner.status,
        jobTitle: owner.jobTitle,
        lastLoginAt: null,
        createdAt: owner.createdAt,
        mustChangePassword: false,
        source: "environment",
      });
    }

    return apiSuccess({ members, you: auth.user!.id });
  } catch (error) {
    logger.error("Reading team failed", {}, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Enter their name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(200),
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "READ_ONLY"]),
  jobTitle: z.string().trim().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requirePermission("users:create");
  if (auth.error) return auth.error;
  const actor = auth.user!;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || "Please check the details", "INVALID_INPUT", 400);
  }
  const { name, jobTitle, role } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const decision = canManageUser({ id: actor.id, role: actor.role }, null, { kind: "create", role });
  if (!decision.ok) return apiError(decision.reason, "FORBIDDEN", 403);

  if (email === getOwnerEmail()) return apiError("That email belongs to the owner.", "USER_EXISTS", 409);

  try {
    if (await db.user.findUnique({ where: { email } })) {
      return apiError("Someone with this email is already on the team.", "USER_EXISTS", 409);
    }

    const temporaryPassword = generateTempPassword();
    const member = await db.user.create({
      data: {
        name,
        email,
        role,
        jobTitle: jobTitle || null,
        status: "ACTIVE",
        passwordHash: await hashPassword(temporaryPassword),
        mustChangePassword: true,
      },
      select: { id: true, name: true, email: true, role: true, status: true, jobTitle: true, createdAt: true },
    });

    await logAuditEvent({
      userId: auditUserId(actor),
      action: "USER_CREATED",
      entityType: "User",
      entityId: member.id,
      metadata: { by: actor.email, member: member.email, role: member.role },
      ipAddress: clientIp(req.headers),
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    // The password is shown once, here, and never stored in readable form
    return apiSuccess({ member, temporaryPassword }, 201);
  } catch (error) {
    logger.error("Creating team member failed", {}, error);
    return apiError("Could not add the team member", "INTERNAL_ERROR", 500);
  }
}
