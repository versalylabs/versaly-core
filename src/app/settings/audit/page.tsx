"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";

interface AuditEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  at: string;
  ip: string | null;
  actor: { name: string; email: string; role: string } | null;
}

/** Plain-English descriptions of what happened. Unknown actions fall back to the raw code. */
function describe(e: AuditEvent): string {
  const m = (e.metadata ?? {}) as Record<string, unknown>;
  const member = (m.member as string) || "someone";
  const who = (m.by as string) || e.actor?.email || "Someone";
  switch (e.action) {
    case "USER_LOGGED_IN":
      return "Signed in";
    case "LOGIN_FAILED":
      return "Failed sign-in attempt (wrong password)";
    case "LOGIN_BLOCKED":
      return `Blocked sign-in: account is ${String(m.status ?? "not active").toLowerCase()}`;
    case "USER_LOGGED_OUT":
      return "Signed out";
    case "PASSWORD_CHANGED":
      return "Changed their password";
    case "PASSWORD_RESET":
      return `${who} reset ${member}'s password`;
    case "USER_CREATED":
      return `${who} added ${member} as ${String(m.role ?? "").replace("_", " ").toLowerCase()}`;
    case "ROLE_CHANGED":
      return `${who} changed ${member}'s role: ${String(m.from)} → ${String(m.to)}`;
    case "USER_SUSPENDED":
      return `${who} suspended ${member}`;
    case "USER_REACTIVATED":
      return `${who} reactivated ${member}`;
    case "DATA_SAVED": {
      const list = Array.isArray(m.collections) ? (m.collections as string[]) : [];
      return `Saved changes to ${list.length} collection${list.length === 1 ? "" : "s"}${list.length ? `: ${list.map((k) => k.replace(/^versaly_/, "").replace(/_v\d+$/, "")).slice(0, 4).join(", ")}${list.length > 4 ? "…" : ""}` : ""}`;
    }
    case "PAYMENT_MATCHED":
      return `Matched M-Pesa payment ${e.entityId ?? ""} to an invoice`;
    case "PAYMENT_IGNORED":
      return `Ignored M-Pesa payment ${e.entityId ?? ""}`;
    case "BACKUP_EXPORTED":
      return "Downloaded a full data backup";
    case "ASSISTANT_ASKED":
      return `Asked the assistant: “${String(m.question ?? "")}”${m.result === "error" ? " (it couldn't answer)" : ""}`;
    default:
      return e.action.replace(/_/g, " ").toLowerCase();
  }
}

const TONE: Record<string, string> = {
  LOGIN_FAILED: "text-rose-300 bg-rose-500/10 border-rose-500/30",
  LOGIN_BLOCKED: "text-rose-300 bg-rose-500/10 border-rose-500/30",
  USER_SUSPENDED: "text-rose-300 bg-rose-500/10 border-rose-500/30",
  ROLE_CHANGED: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  PASSWORD_RESET: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  BACKUP_EXPORTED: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  USER_CREATED: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  USER_REACTIVATED: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
};

export default function AuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [hideRoutine, setHideRoutine] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(async (before: string | null) => {
    const params = new URLSearchParams();
    if (before) params.set("before", before);
    if (hideRoutine) params.set("routine", "0");
    const res = await fetch(`/api/audit?${params}`, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()).data as { events: AuditEvent[]; nextBefore: string | null };
  }, [hideRoutine]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState("loading");
    fetchPage(null)
      .then((d) => {
        if (cancelled) return;
        setEvents(d.events);
        setNext(d.nextBefore);
        setState("ready");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const loadMore = async () => {
    if (!next) return;
    setLoadingMore(true);
    try {
      const d = await fetchPage(next);
      setEvents((prev) => [...prev, ...d.events]);
      setNext(d.nextBefore);
    } catch {
      setState("error");
    }
    setLoadingMore(false);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <div className="liquid-glass liquid-glass-glow p-6 rounded-2xl space-y-1.5">
          <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>COMPLIANCE &amp; SECURITY</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Audit Log</h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            A record of sign-ins, team changes, payments and data changes: who did what, and when. Entries can&apos;t be edited from the app.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none w-fit">
          <input type="checkbox" checked={hideRoutine} onChange={(e) => setHideRoutine(e.target.checked)} className="h-3.5 w-3.5" />
          Hide routine entries (sign-ins and everyday saves)
        </label>

        {state === "loading" && <p className="text-xs text-slate-500">Loading…</p>}
        {state === "error" && <p className="text-xs text-slate-400">Couldn&apos;t load the audit log. Only owners and admins can see it.</p>}

        {state === "ready" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl divide-y divide-slate-800/60">
            {events.length === 0 && <p className="p-6 text-xs text-slate-500">Nothing recorded yet.</p>}
            {events.map((e) => (
              <div key={e.id} className="p-3.5 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold font-mono ${TONE[e.action] ?? "text-slate-300 bg-slate-800/60 border-slate-700"}`}>
                      {e.action}
                    </span>
                    <span className="text-xs text-slate-200">{describe(e)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {e.actor ? `${e.actor.name} (${e.actor.role.replace("_", " ").toLowerCase()})` : (e.metadata as { by?: string } | null)?.by ?? "System"}
                    {e.ip && e.ip !== "unknown" ? ` · ${e.ip}` : ""}
                  </div>
                </div>
                <time className="text-[11px] text-slate-400 font-mono shrink-0" dateTime={e.at}>
                  {new Date(e.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </time>
              </div>
            ))}
          </div>
        )}

        {state === "ready" && next && (
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Show older entries"}
          </button>
        )}
      </div>
    </WorkspaceLayout>
  );
}
