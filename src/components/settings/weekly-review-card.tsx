"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Mail } from "lucide-react";

interface Preview {
  configured: boolean;
  scheduled: boolean;
  recipient: string;
  digest: { subject: string; text: string };
}

/** Shows this week's review, whether the Friday email is set up, and sends it on request. */
export function WeeklyReviewCard() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/weekly-review", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        if (cancelled) return;
        setPreview(json.data as Preview);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sendNow = async () => {
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/weekly-review", { method: "POST" });
      const json = await res.json();
      const result = json?.data;
      if (res.ok && result?.sent) setMessage({ ok: true, text: `Sent to ${result.to}.` });
      else setMessage({ ok: false, text: result?.reason || json?.error?.message || "Could not send." });
    } catch {
      setMessage({ ok: false, text: "Could not reach the server." });
    }
    setSending(false);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
      <div className="flex items-center gap-2.5">
        <CalendarClock className="h-5 w-5 text-indigo-400" />
        <h2 className="text-sm font-bold text-white">Friday Weekly Review</h2>
      </div>

      {state === "loading" && <p className="text-xs text-slate-500">Loading…</p>}
      {state === "error" && (
        <p className="text-xs text-slate-400">Only owners and admins can see the weekly review, and it needs the database to be reachable.</p>
      )}

      {state === "ready" && preview && (
        <>
          <p className="text-xs text-slate-400">
            A plain-language summary of money, pipeline and delivery, with what to focus on next. Built from your latest saved data.
          </p>

          <div className="text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email service</span>
              <span className={preview.configured ? "text-emerald-300 font-semibold" : "text-amber-300 font-semibold"}>
                {preview.configured ? "Connected" : "Not set up"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sends to</span>
              <span className="text-slate-200 truncate ml-4">{preview.recipient}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Every Friday, 6 pm</span>
              <span className={preview.scheduled ? "text-emerald-300 font-semibold" : "text-slate-500"}>{preview.scheduled ? "On" : "Off"}</span>
            </div>
          </div>

          {!preview.configured && (
            <p className="text-[11px] text-amber-300/90">
              To get it by email, add a free Resend account key as <code>RESEND_API_KEY</code> (plus <code>WEEKLY_REVIEW_TO</code> and{" "}
              <code>CRON_SECRET</code>) in your hosting settings. You can still read it here any time.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              {open ? "Hide this week's review" : "Preview this week's review"}
            </button>
            <button
              type="button"
              disabled={sending || !preview.configured}
              title={preview.configured ? "Email it now" : "Set up email first"}
              onClick={() => void sendNow()}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" />
              {sending ? "Sending…" : "Send it now"}
            </button>
          </div>

          {message && <p className={`text-xs ${message.ok ? "text-emerald-300" : "text-rose-300"}`}>{message.text}</p>}

          {open && (
            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-2">
              <div className="text-[11px] font-semibold text-slate-300">{preview.digest.subject}</div>
              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-300 font-sans">{preview.digest.text}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
