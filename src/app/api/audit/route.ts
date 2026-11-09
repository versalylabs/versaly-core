import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { requirePermission } from "@/lib/team-auth";

/**
 * The audit trail: who did what, and when. Newest first, loaded in pages.
 *   ?before=<ISO time>   continue from where the last page ended
 *   ?routine=0           hide routine entries (sign-ins and data saves)
 */
const ROUTINE = ["DATA_SAVED", "USER_LOGGED_IN", "ASSISTANT_ASKED"];
const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const auth = await requirePermission("audit:read");
  if (auth.error) return auth.error;

  const beforeParam = req.nextUrl.searchParams.get("before");
  const before = beforeParam ? new Date(beforeParam) : null;
  const hideRoutine = req.nextUrl.searchParams.get("routine") === "0";

  try {
    const rows = await db.auditLog.findMany({
      where: {
        ...(before && !isNaN(before.getTime()) ? { createdAt: { lt: before } } : {}),
        ...(hideRoutine ? { action: { notIn: ROUTINE } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      include: { user: { select: { name: true, email: true, role: true } } },
    });

    const page = rows.slice(0, PAGE_SIZE);
    return apiSuccess({
      events: page.map((r) => ({
        id: r.id,
        action: r.action,
        entityType: r.entityType,
        entityId: r.entityId,
        metadata: r.metadata,
        at: r.createdAt.toISOString(),
        ip: r.ipAddress,
        actor: r.user ? { name: r.user.name, email: r.user.email, role: r.user.role } : null,
      })),
      nextBefore: rows.length > PAGE_SIZE ? page[page.length - 1].createdAt.toISOString() : null,
    });
  } catch (error) {
    logger.error("Reading audit log failed", {}, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
}
