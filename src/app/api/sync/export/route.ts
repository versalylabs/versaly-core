import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";


/** Download every workspace collection as one JSON backup file (owner/admin only). */
export async function GET() {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
  if (!user) return apiError("Unauthenticated", "UNAUTHORIZED", 401);
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return apiError("Only owners and admins can export backups", "FORBIDDEN", 403);
  }

  try {
    const docs = await db.workspaceDocument.findMany({ orderBy: { key: "asc" } });
    const backup = {
      app: "versaly-core",
      exportedAt: new Date().toISOString(),
      exportedBy: user.email,
      collections: Object.fromEntries(docs.map((d) => [d.key, { version: d.version, updatedAt: d.updatedAt, value: d.value }])),
    };

    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="versaly-core-backup-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error("Backup export failed", {}, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
}
