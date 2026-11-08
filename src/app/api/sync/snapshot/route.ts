import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { isSyncedKey, MAX_SYNC_VALUE_BYTES } from "@/lib/sync-keys";
import { canWriteKey } from "@/lib/access";


/**
 * Called once per device on its first sync. Saves the device's own copy of any
 * collection that differs from the server into revision history (version 0),
 * before the server copy replaces it locally. Nothing on the server changes.
 */
const schema = z.object({
  changes: z.array(z.object({ key: z.string(), value: z.string() })).min(1).max(200),
});

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
  if (!user) return apiError("Unauthenticated", "UNAUTHORIZED", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Validation failed", "INVALID_INPUT", 400);

  const rows = parsed.data.changes
    .filter((c) => isSyncedKey(c.key) && canWriteKey(user.role, c.key) && Buffer.byteLength(c.value, "utf8") <= MAX_SYNC_VALUE_BYTES)
    .map((c) => {
      let value: Prisma.InputJsonValue;
      try {
        value = { raw: JSON.parse(c.value) };
      } catch {
        value = { text: c.value };
      }
      return { key: c.key, value, version: 0, updatedBy: `${user.email} (device copy before first sync)` };
    });

  try {
    if (rows.length) await db.workspaceDocumentRevision.createMany({ data: rows });
    return apiSuccess({ stored: rows.length });
  } catch (error) {
    logger.error("Device snapshot failed", {}, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
}
