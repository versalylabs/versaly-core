import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { isSyncedKey, MAX_SYNC_VALUE_BYTES } from "@/lib/sync-keys";
import { canReadKey, canWriteKey } from "@/lib/access";
import { logAuditEvent } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";

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

    // Collections this role may not read are never sent. The browser is told which ones to
    // remove from its local copy too (e.g. after someone's access is reduced).
    const allKeys = await db.workspaceDocument.findMany({ select: { key: true } });
    const deniedKeys = allKeys.map((k) => k.key).filter((k) => !canReadKey(user.role, k));

    return apiSuccess({
      serverTime: new Date().toISOString(),
      workspaceId: workspace.id,
      deniedKeys,
      documents: docs.filter((d) => canReadKey(user.role, d.key)).map((d) => ({
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

  // Changes to collections this role may not edit are refused individually; the rest still save.
  const rejected = parsed.data.changes.filter((c) => !canWriteKey(user.role, c.key)).map((c) => c.key);
  const allowed = parsed.data.changes.filter((c) => canWriteKey(user.role, c.key));
  if (!allowed.length) {
    return apiSuccess({ saved: [], rejected });
  }

  try {
    const results = await db.$transaction(async (tx) => {
      const out: { key: string; version: number; updatedAt: string }[] = [];

      for (const { key, value } of allowed) {
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

    const changedKeys = results.map((r) => r.key);
    await logAuditEvent({
      userId: user.id.startsWith("env-") ? null : user.id,
      action: "DATA_SAVED",
      entityType: "Workspace",
      metadata: { by: user.email, role: user.role, collections: changedKeys },
      ipAddress: clientIp(req.headers),
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    return apiSuccess({ saved: results, rejected });
  } catch (error) {
    logger.error("Sync write failed", { keys: allowed.map((c) => c.key) }, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }
}
