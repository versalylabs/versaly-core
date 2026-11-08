"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  getSyncState,
  pullFromServer,
  pushToServer,
  subscribeSync,
  type SyncState,
} from "@/lib/app-storage";
import { BrandLoader } from "@/components/brand/brand-loader";
import { runWorkflows } from "@/lib/workflows";
import { reconcileIncomingPayments } from "@/lib/reconcile";
import { loadCurrentUser, userCan } from "@/lib/current-user";

const PUBLIC_PATHS = new Set(["/login", "/change-password"]);
const INITIAL_PULL_TIMEOUT_MS = 8000;
const MIN_PULL_INTERVAL_MS = 15000;
const WORKFLOW_INTERVAL_MS = 30 * 60 * 1000;

/**
 * Pull the latest data, then run the business workflows (recurring invoices,
 * overdue flags, go-live activation) on top of it. Returns how many things
 * changed locally, or -1 if the server could not be reached (workflows are
 * skipped then, so they never run on stale data).
 */
async function pullAndRunWorkflows(): Promise<number> {
  await loadCurrentUser();
  const pulled = await pullFromServer();
  if (pulled < 0) return pulled;

  // Invoicing, billing and payment matching change finance records: only people who may write finance run them
  if (!userCan("finance:write")) return pulled;
    let extra = 0;
  try {
    extra += runWorkflows().changed ? 1 : 0;
  } catch (error) {
    console.error("Workflow run failed", error);
  }
  try {
    extra += (await reconcileIncomingPayments()) > 0 ? 1 : 0;
  } catch (error) {
    console.error("Payment matching failed", error);
  }
  return pulled + extra;
}

/**
 * Remount the page so it re-reads freshly synced data. The page's entrance animation is
 * switched off for this one remount (it would look like the page flickered).
 */
function remount(setEpoch: (update: (e: number) => number) => void) {
  const root = document.documentElement;
  root.dataset.remount = "1";
  setTimeout(() => delete root.dataset.remount, 1000);
  setEpoch((e) => e + 1);
}

/** Current sync status, for showing "Saved" / "Saving…" / "Offline" in the UI. */
export function useSyncState(): SyncState {
  return useSyncExternalStore(subscribeSync, getSyncState, getSyncState);
}

/**
 * Loads the latest workspace data from the server before showing any page, so
 * every module starts from the shared copy. When you come back to the tab and
 * another device changed something, the page reloads its data automatically.
 */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.has(pathname);
  const [ready, setReady] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const lastPull = useRef(0);

  // Initial load
  useEffect(() => {
    if (isPublic || ready) return;
    let cancelled = false;
    let timedOut = false;
    const pull = pullAndRunWorkflows();
    const timeout = new Promise<void>((resolve) =>
      setTimeout(() => {
        timedOut = true;
        resolve();
      }, INITIAL_PULL_TIMEOUT_MS)
    );
    void Promise.race([pull, timeout]).then(() => {
      lastPull.current = Date.now();
      if (!cancelled) setReady(true);
    });
    // A slow server answered after we showed the local copy: reload with fresh data
    void pull.then((changed) => {
      if (!cancelled && timedOut && changed > 0) remount(setEpoch);
    });
    return () => {
      cancelled = true;
    };
  }, [isPublic, ready]);

  // Keep in step with other devices, and flush unsent changes when leaving
  useEffect(() => {
    if (isPublic || !ready) return;

    const refresh = async () => {
      if (Date.now() - lastPull.current < MIN_PULL_INTERVAL_MS) return;
      lastPull.current = Date.now();
      const changed = await pullAndRunWorkflows();
      if (changed > 0) remount(setEpoch);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
      else void pushToServer({ keepalive: true });
    };
    const onOnline = () => {
      void pushToServer();
      void refresh();
    };
    const onPageHide = () => void pushToServer({ keepalive: true });

    const workflowTimer = setInterval(() => void refresh(), WORKFLOW_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", onOnline);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      clearInterval(workflowTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [isPublic, ready]);

  if (isPublic) return <>{children}</>;

  if (!ready) {
    return (
      <BrandLoader label="Syncing your workspace…" sublabel="Loading the latest from your devices" />
    );
  }

  return <Fragment key={epoch}>{children}</Fragment>;
}
