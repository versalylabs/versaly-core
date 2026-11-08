import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { isSyncedKey, MAX_SYNC_VALUE_BYTES } from "@/lib/sync-keys";

/**
 * Workspace sync endpoint.
 *
 * GET  /api/sync[?since=ISO]  → documents (all, or changed after `since`)
 * POST /api/sync              → save changed documents { changes: [{ key, value }] }
 *
 * `value` is the raw string the browser stored. Saves are last-write-wins; every
 * overwritten value is kept in WorkspaceDocumentRevision so it can be recovered.
 */


const REVISIONS_KEPT_PER_KEY = 30;

const postSchema = z.object({
  changes: z
    .array(
      z.object({
        key: z.string(),
        // null means the browser removed the key
        value: z.string().nullable(),
      })
    )
    .min(1)
    .max(100),
});

function toStoredJson(raw: string): Prisma.InputJsonValue {
  // Most values are JSON; plain strings are wrapped so they round-trip exactly.
  try {
    return { raw: JSON.parse(raw) };
  } catch {
    return { text: raw };
  }
}

function fromStoredJson(value: Prisma.JsonValue): string | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const v = value as Record<string, unknown>;
    if ("raw" in v) return JSON.stringify(v.raw);
    if ("text" in v && typeof v.text === "string") return v.text;
    if ("deleted" in v) return null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
  if (!user) return apiError("Unauthenticated", "UNAUTHORIZED", 401);

  const sinceParam = req.nextUrl.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : null;

  try {
    // Identifies this database, so browsers notice if the app is pointed at a
    // different one and re-upload their data instead of assuming it's there.
    const workspace =
      (await db.company.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } })) ??
      (await db.company.create({ data: {}, select: { id: true } }));

    const docs = await db.workspaceDocument.findMany({
      where: since && !isNaN(since.getTime()) ? { updatedAt: { gt: since } } : undefined,
      orderBy: { key: "asc" },
    });

    return apiSuccess({
      serverTime: new Date().toISOString(),
      workspaceId: workspace.id,
      documents: docs.map((d) => ({
        key: d.key,
        value: fromStoredJson(d.value),
        version: d.version,
        updatedAt: d.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error("Sync read failed", {}, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
  if (!user) return apiError("Unauthenticated", "UNAUTHORIZED", 401);
  if (user.role === "READ_ONLY") {
    return apiError("Read-only accounts cannot change data", "FORBIDDEN", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
  }

  for (const change of parsed.data.changes) {
    if (!isSyncedKey(change.key)) {
      return apiError(`Key not allowed: ${change.key}`, "INVALID_KEY", 400);
    }
    if (change.value && Buffer.byteLength(change.value, "utf8") > MAX_SYNC_VALUE_BYTES) {
      return apiError(`Value too large for ${change.key}`, "TOO_LARGE", 413);
    }
  }

  try {
    const results = await db.$transaction(async (tx) => {
      const out: { key: string; version: number; updatedAt: string }[] = [];

      for (const { key, value } of parsed.data.changes) {
        const stored: Prisma.InputJsonValue = value === null ? { deleted: true } : toStoredJson(value);
        const existing = await tx.workspaceDocument.findUnique({ where: { key } });

        if (existing) {
          // Skip no-op writes so revision history stays meaningful
          if (JSON.stringify(existing.value) === JSON.stringify(stored)) {
            out.push({ key, version: existing.version, updatedAt: existing.updatedAt.toISOString() });
            continue;
          }

          await tx.workspaceDocumentRevision.create({
            data: {
              key,
              value: existing.value as Prisma.InputJsonValue,
              version: existing.version,
              updatedBy: existing.updatedBy,
            },
          });
        }

        const saved = await tx.workspaceDocument.upsert({
          where: { key },
          create: { key, value: stored, updatedBy: user.email },
          update: { value: stored, version: { increment: 1 }, updatedBy: user.email },
        });
        out.push({ key, version: saved.version, updatedAt: saved.updatedAt.toISOString() });
      }

      return out;
    });

    // Trim old revisions (outside the transaction; best effort)
    for (const { key } of results) {
      const stale = await db.workspaceDocumentRevision.findMany({
        where: { key },
        orderBy: { createdAt: "desc" },
        skip: REVISIONS_KEPT_PER_KEY,
        select: { id: true },
      });
      if (stale.length) {
        await db.workspaceDocumentRevision.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } });
      }
    }

    return apiSuccess({ saved: results });
  } catch (error) {
    logger.error("Sync write failed", { keys: parsed.data.changes.map((c) => c.key) }, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
}
