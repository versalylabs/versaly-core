"use client";

/**
 * appStorage: a drop-in replacement for localStorage that also keeps business
 * data in the Versaly Core database.
 *
 * - Reads come from the browser's local copy (fast, works offline).
 * - Writes update the local copy immediately and are pushed to the server a
 *   moment later. Unsent changes survive reloads and go out when back online.
 * - pullFromServer() refreshes the local copy with changes made on other devices.
 *
 * Only keys accepted by isSyncedKey() are synced; device preferences stay local.
 */

import { isSyncedKey, MAX_SYNC_VALUE_BYTES } from "@/lib/sync-keys";

const META_KEY = "versaly_sync_meta";
const PUSH_DELAY_MS = 800;
const MAX_REQUEST_BYTES = 3.5 * 1024 * 1024;
const PULL_OVERLAP_MS = 5 * 60 * 1000;

export type SyncStatus = "idle" | "saving" | "saved" | "offline" | "error" | "signed-out";

interface SyncMeta {
  initialized: boolean;
  workspaceId?: string;
  lastPulledAt: string | null;
  versions: Record<string, number>;
  dirty: Record<string, true>;
}

export interface SyncState {
  status: SyncStatus;
  pending: number;
  lastSyncedAt: string | null;
  message?: string;
}

// ---------------------------------------------------------------------------
// Local metadata
// ---------------------------------------------------------------------------

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readMeta(): SyncMeta {
  const empty: SyncMeta = { initialized: false, lastPulledAt: null, versions: {}, dirty: {} };
  if (!hasStorage()) return empty;
  try {
    const raw = window.localStorage.getItem(META_KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

function writeMeta(update: (meta: SyncMeta) => void) {
  if (!hasStorage()) return;
  const meta = readMeta(); // re-read so other tabs' updates aren't lost
  update(meta);
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // storage full: sync still works in memory for this session
  }
}

// ---------------------------------------------------------------------------
// Status broadcasting
// ---------------------------------------------------------------------------

let state: SyncState = { status: "idle", pending: 0, lastSyncedAt: null };
const listeners = new Set<(s: SyncState) => void>();

function setState(patch: Partial<SyncState>) {
  state = { ...state, ...patch, pending: Object.keys(readMeta().dirty).length };
  listeners.forEach((l) => l(state));
}

export function getSyncState(): SyncState {
  return state;
}

export function subscribeSync(listener: (s: SyncState) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------------------------------------------------------------------------
// Public storage API (mirrors localStorage)
// ---------------------------------------------------------------------------

export const appStorage = {
  getItem(key: string): string | null {
    if (!hasStorage()) return null;
    return window.localStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    if (!hasStorage()) return;
    const previous = window.localStorage.getItem(key);
    window.localStorage.setItem(key, value);
    if (previous !== value && isSyncedKey(key)) markDirty(key);
  },

  removeItem(key: string): void {
    if (!hasStorage()) return;
    const existed = window.localStorage.getItem(key) !== null;
    window.localStorage.removeItem(key);
    if (existed && isSyncedKey(key)) markDirty(key);
  },
};

function markDirty(key: string) {
  // Until this device has synced once, local values may be starter/seed data.
  // The first successful pull decides what to upload (see pullFromServer).
  if (!readMeta().initialized) return;
  writeMeta((m) => {
    m.dirty[key] = true;
  });
  setState({ status: "saving" });
  schedulePush();
}

// ---------------------------------------------------------------------------
// Push (browser → server)
// ---------------------------------------------------------------------------

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let retryDelay = 5000;
let pushing = false;
let pushAgain = false;

function schedulePush(delay = PUSH_DELAY_MS) {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushToServer();
  }, delay);
}

/** Unsent changes exist but the server is unreachable: try again later. */
function retryPendingLater() {
  if (Object.keys(readMeta().dirty).length && !pushTimer) {
    schedulePush(retryDelay);
    retryDelay = Math.min(retryDelay * 2, 60_000);
  }
}

function buildBatches(keys: string[]) {
  const batches: { key: string; value: string | null }[][] = [];
  let current: { key: string; value: string | null }[] = [];
  let size = 0;

  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    const bytes = value ? new Blob([value]).size : 0;
    if (bytes > MAX_SYNC_VALUE_BYTES) {
      setState({ status: "error", message: `"${key}" is too large to sync (over 3 MB).` });
      continue;
    }
    if (current.length && (size + bytes > MAX_REQUEST_BYTES || current.length >= 100)) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push({ key, value });
    size += bytes;
  }
  if (current.length) batches.push(current);
  return batches;
}

export async function pushToServer(options: { keepalive?: boolean } = {}): Promise<boolean> {
  if (!hasStorage()) return false;
  if (pushing) {
    pushAgain = true;
    return false;
  }

  const dirtyKeys = Object.keys(readMeta().dirty);
  if (!dirtyKeys.length) {
    setState({ status: state.status === "saving" ? "saved" : state.status });
    return true;
  }

  if (!navigator.onLine) {
    setState({ status: "offline" });
    return false;
  }

  pushing = true;
  setState({ status: "saving" });
  let ok = true;

  try {
    for (const changes of buildBatches(dirtyKeys)) {
      const body = JSON.stringify({ changes });
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: options.keepalive && body.length < 60_000,
      });

      if (res.status === 401) {
        setState({ status: "signed-out" });
        ok = false;
        break;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setState({ status: "error", message: data?.error?.message || `Save failed (${res.status})` });
        ok = false;
        break;
      }

      const data = await res.json();
      const saved: { key: string; version: number }[] = data?.data?.saved ?? [];
      const rejected: string[] = data?.data?.rejected ?? [];
      writeMeta((m) => {
        // This account isn't allowed to change these; drop them from the queue instead of retrying forever
        for (const key of rejected) delete m.dirty[key];
        for (const { key, version } of saved) {
          const sent = changes.find((c) => c.key === key)?.value ?? null;
          // Only clear the flag if the value wasn't changed again while sending
          if (window.localStorage.getItem(key) === sent) delete m.dirty[key];
          m.versions[key] = version;
        }
      });
    }
  } catch {
    ok = false;
    setState({ status: navigator.onLine ? "error" : "offline", message: "Could not reach the server." });
  } finally {
    pushing = false;
  }

  if (ok) {
    retryDelay = 5000;
    setState({ status: "saved", lastSyncedAt: new Date().toISOString(), message: undefined });
  } else if (state.status !== "signed-out") {
    schedulePush(retryDelay);
    retryDelay = Math.min(retryDelay * 2, 60_000);
  }

  if (pushAgain) {
    pushAgain = false;
    schedulePush();
  }
  return ok;
}

// ---------------------------------------------------------------------------
// Pull (server → browser)
// ---------------------------------------------------------------------------

interface ServerDocument {
  key: string;
  value: string | null;
  version: number;
}

/**
 * Refresh the local copy from the server. Returns the number of collections
 * that changed locally, or -1 if the server could not be reached.
 */
export async function pullFromServer(isRetry = false): Promise<number> {
  if (!hasStorage()) return -1;
  const meta = readMeta();

  const since =
    meta.initialized && meta.lastPulledAt
      ? new Date(new Date(meta.lastPulledAt).getTime() - PULL_OVERLAP_MS).toISOString()
      : null;

  let documents: ServerDocument[];
  let serverTime: string;
  let workspaceId: string;
  let deniedKeys: string[] = [];
  try {
    const res = await fetch(`/api/sync${since ? `?since=${encodeURIComponent(since)}` : ""}`, {
      cache: "no-store",
    });
    if (res.status === 401) {
      setState({ status: "signed-out" });
      return -1;
    }
    if (!res.ok) {
      setState({ status: "error", message: "Database unavailable. Changes are kept on this device." });
      retryPendingLater();
      return -1;
    }
    const data = await res.json();
    documents = data.data.documents;
    serverTime = data.data.serverTime;
    workspaceId = data.data.workspaceId;
    deniedKeys = data.data.deniedKeys ?? [];
  } catch {
    setState({ status: navigator.onLine ? "error" : "offline" });
    retryPendingLater();
    return -1;
  }

  // Connected to a different database than last time: start over as a first
  // sync so this device's data is uploaded (and backed up) rather than skipped.
  if (meta.initialized && meta.workspaceId !== workspaceId) {
    writeMeta((m) => {
      m.initialized = false;
      m.versions = {};
      m.lastPulledAt = null;
    });
    if (!isRetry) return pullFromServer(true);
    return -1;
  }

  let changed = 0;
  const firstSync = !meta.initialized;

  if (firstSync) {
    // Before the server copy replaces anything, save this device's differing
    // values to the server's revision history so nothing is lost.
    const serverValues = new Map(documents.map((d) => [d.key, d.value]));
    const snapshot = Object.keys(window.localStorage)
      .filter((k) => isSyncedKey(k) && serverValues.has(k))
      .map((k) => ({ key: k, value: window.localStorage.getItem(k) }))
      .filter((c) => c.value !== null && c.value !== serverValues.get(c.key));
    let chunk: typeof snapshot = [];
    let size = 0;
    const send = async () => {
      if (!chunk.length) return;
      try {
        await fetch("/api/sync/snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ changes: chunk }),
        });
      } catch {
        // best effort
      }
      chunk = [];
      size = 0;
    };
    for (const item of snapshot) {
      const bytes = new Blob([item.value ?? ""]).size;
      if (chunk.length && (size + bytes > MAX_REQUEST_BYTES || chunk.length >= 200)) await send();
      chunk.push(item);
      size += bytes;
    }
    await send();
  }

  writeMeta((m) => {
    // Data this account isn't allowed to see is removed from this device (e.g. after a role change)
    for (const key of deniedKeys) {
      window.localStorage.removeItem(key);
      delete m.versions[key];
      delete m.dirty[key];
    }
    for (const doc of documents) {
      if (m.dirty[doc.key]) continue; // local edit waiting to be sent wins
      if (m.versions[doc.key] === doc.version && window.localStorage.getItem(doc.key) === doc.value) continue;

      if (doc.value === null) window.localStorage.removeItem(doc.key);
      else window.localStorage.setItem(doc.key, doc.value);
      m.versions[doc.key] = doc.version;
      changed++;
    }

    if (firstSync) {
      // First sync on this device: upload collections the server doesn't have yet
      const onServer = new Set(documents.map((d) => d.key));
      for (const key of Object.keys(window.localStorage)) {
        if (isSyncedKey(key) && !onServer.has(key)) m.dirty[key] = true;
      }
      m.initialized = true;
      m.workspaceId = workspaceId;
    }

    m.lastPulledAt = serverTime;
  });

  setState({ status: Object.keys(readMeta().dirty).length ? "saving" : "saved", lastSyncedAt: serverTime });
  if (Object.keys(readMeta().dirty).length) schedulePush(0);
  return changed;
}

// ---------------------------------------------------------------------------
// Sign-out
// ---------------------------------------------------------------------------

/**
 * Remove synced business data from this browser. Unsent changes are pushed
 * first; if that fails the local data is kept so nothing is lost.
 */
export async function clearLocalWorkspace(): Promise<boolean> {
  if (!hasStorage()) return true;
  // Never synced (e.g. database not set up yet): this device holds the only copy
  if (!readMeta().initialized) return false;
  if (Object.keys(readMeta().dirty).length) {
    const ok = await pushToServer();
    if (!ok || Object.keys(readMeta().dirty).length) return false;
  }
  for (const key of Object.keys(window.localStorage)) {
    if (isSyncedKey(key)) window.localStorage.removeItem(key);
  }
  window.localStorage.removeItem(META_KEY);
  return true;
}
