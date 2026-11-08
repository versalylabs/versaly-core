/**
 * Which browser storage keys are business data (synced to the database) and
 * which are per-device preferences (kept only in this browser).
 * Shared by the client sync layer and the /api/sync route.
 */

export const SYNC_KEY_PREFIX = "versaly_";

/** Per-device settings and session flags that must never be synced. */
export const LOCAL_ONLY_KEYS = new Set<string>([
  "versaly_theme",
  "versaly_pwa_banner_dismissed",
  "versaly_simulate_offline",
  "versaly_last_local_save",
  "versaly_auth_active",
  "versaly_current_user",
  "versaly_sync_meta",
  "versaly_finance_current_role",
]);

export const MAX_SYNC_KEY_LENGTH = 120;
// Vercel caps request bodies at 4.5 MB, so one collection must stay below that.
export const MAX_SYNC_VALUE_BYTES = 3 * 1024 * 1024; // 3 MB per collection

export function isSyncedKey(key: string): boolean {
  return (
    key.startsWith(SYNC_KEY_PREFIX) &&
    key.length <= MAX_SYNC_KEY_LENGTH &&
    /^[a-z0-9_.:-]+$/i.test(key) &&
    !LOCAL_ONLY_KEYS.has(key)
  );
}
