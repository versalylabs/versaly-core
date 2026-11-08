"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { validatePassword } from "@/lib/access";

/**
 * Choose your own password. New team members are sent here first (they were
 * given a temporary one); everyone can come back to change theirs any time.
 */
export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const liveProblem = next ? validatePassword(next) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next !== confirm) return setError("The two new passwords don't match.");
    const problem = validatePassword(next);
    if (problem) return setError(problem);

    setBusy(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error?.message || "Could not change the password.");
        setBusy(false);
        return;
      }
      // Full reload so the app starts fresh with the new session
      window.location.replace("/dashboard");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  };

  const input =
    "w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-slate-100">
      <div className="liquid-glass p-7 sm:p-9 rounded-3xl w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <BrandMark size={56} className="mx-auto rounded-2xl shadow-xl shadow-indigo-950/60" />
          <h1 className="text-xl font-black text-white tracking-tight">Choose your password</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            If you were given a temporary password, enter it as your current password, then pick one only you know.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {[
            { label: "Current (or temporary) password", value: current, set: setCurrent, auto: "current-password" },
            { label: "New password", value: next, set: setNext, auto: "new-password" },
            { label: "Repeat new password", value: confirm, set: setConfirm, auto: "new-password" },
          ].map((f) => (
            <label key={f.label} className="block space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-300">{f.label}</span>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type={show ? "text" : "password"} value={f.value} onChange={(e) => f.set(e.target.value)} autoComplete={f.auto} required className={input} />
              </div>
            </label>
          ))}

          <div className="flex items-center justify-between text-[11px]">
            <button type="button" onClick={() => setShow(!show)} className="text-slate-400 hover:text-white inline-flex items-center gap-1.5 cursor-pointer">
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {show ? "Hide" : "Show"} passwords
            </button>
            <span className={liveProblem ? "text-amber-300" : next ? "text-emerald-300" : "text-slate-500"}>
              {next ? (liveProblem ?? "Looks good") : "At least 12 characters"}
            </span>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{busy ? "Saving…" : "Save new password"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-500">
          Signed in as the owner through hosting settings? Use <code>npm run owner:password</code> instead.{" "}
          <Link href="/dashboard" className="underline underline-offset-2 hover:text-slate-300">
            Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
