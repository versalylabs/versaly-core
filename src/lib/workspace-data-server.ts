import type { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { KEYS } from "@/lib/storage-keys";
import { canReadKey } from "@/lib/access";
import { PAYMENT_SETTINGS_KEY } from "@/lib/invoice-messages";
import { emptyWorkspaceData, type WorkspaceData } from "@/lib/insights";

/** Collections are stored as { raw: <json> } (or { text } / { deleted }), see /api/sync. */
function unwrap(value: unknown): unknown {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const v = value as Record<string, unknown>;
    if ("raw" in v) return v.raw;
    if ("text" in v && typeof v.text === "string") {
      try {
        return JSON.parse(v.text);
      } catch {
        return null;
      }
    }
  }
  return null;
}

const asList = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/**
 * Read the workspace straight from the database (for server jobs such as the
 * weekly review email, and the AI assistant). Collections you haven't saved yet
 * are simply empty.
 *
 * Pass `role` to read only what that role may see: collections it can't read are
 * never even fetched from the database, so they can't leak further along.
 */
export async function loadWorkspaceDataFromDb(options: { role?: UserRole } = {}): Promise<{ data: WorkspaceData; businessName?: string }> {
  const { role } = options;
  const allKeys: string[] = [...Object.values(KEYS), PAYMENT_SETTINGS_KEY];
  const keys = role ? allKeys.filter((k) => canReadKey(role, k)) : allKeys;
  const rows = keys.length ? await db.workspaceDocument.findMany({ where: { key: { in: keys } } }) : [];
  const byKey = new Map(rows.map((r) => [r.key, unwrap(r.value)]));

  const data: WorkspaceData = {
    ...emptyWorkspaceData(),
    invoices: asList(byKey.get(KEYS.invoices)),
    subscriptions: asList(byKey.get(KEYS.subscriptions)),
    deals: asList(byKey.get(KEYS.deals)),
    projects: asList(byKey.get(KEYS.projects)),
    clients: asList(byKey.get(KEYS.clients)),
    accounts: asList(byKey.get(KEYS.accounts)),
    vendorSubscriptions: asList(byKey.get(KEYS.vendorSubscriptions)),
    expenses: asList(byKey.get(KEYS.expenses)),
  };

  const settings = byKey.get(PAYMENT_SETTINGS_KEY) as { businessName?: string } | null | undefined;
  return { data, businessName: settings?.businessName || undefined };
}
