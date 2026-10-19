"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  AlertTriangle,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Check,
  Ban,
} from "lucide-react";
import {
  INITIAL_APPROVALS,
  INITIAL_ATTENTION_NOTICES,
  ApprovalItem,
} from "@/data/attention-approvals-seed";

const STORAGE_APPROVALS_KEY = "versaly_approvals_queue";

export default function AttentionCenterPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_APPROVALS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_APPROVALS;
  });

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_APPROVALS_KEY, JSON.stringify(approvals));
    } catch {
      // ignore
    }
  }, [approvals]);

  const handleApprove = (id: string, title: string) => {
    setApprovals((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "APPROVED" } : app))
    );
    setToastMessage(`✓ Approved: "${title}"`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReject = (id: string, title: string) => {
    setApprovals((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "REJECTED" } : app))
    );
    setToastMessage(`✗ Rejected: "${title}"`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const pendingApprovalsCount = useMemo(() => {
    return approvals.filter((a) => a.status === "PENDING").length;
  }, [approvals]);

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Action-Oriented Attention Engine
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">First-Class Operational Alerts</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Attention Center &amp; Approvals
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Never get surprised: critical blockers, today&apos;s follow-ups, overdue receivables, and AI-proposed mutations awaiting human executive sign-off.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 font-bold">
              {pendingApprovalsCount} Items Need Attention
            </span>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Category Jump Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
              activeCategory === "ALL"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            All Operational Notices
          </button>
          <button
            onClick={() => setActiveCategory("APPROVALS")}
            className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === "APPROVALS"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
            <span>Approvals Queue ({pendingApprovalsCount})</span>
          </button>
          <button
            onClick={() => setActiveCategory("URGENT")}
            className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === "URGENT"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>Urgent Blockers</span>
          </button>
          <button
            onClick={() => setActiveCategory("FINANCE")}
            className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === "FINANCE"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span>Overdue Receivables</span>
          </button>
        </div>

        {/* Section 1: Executive Approvals Queue */}
        {(activeCategory === "ALL" || activeCategory === "APPROVALS") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-violet-400" />
                <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Human Oversight &amp; Approvals Engine
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                Safe bridge: AI proposals &amp; invoices require executive confirmation before dispatch
              </span>
            </div>

            <div className="space-y-3">
              {approvals.map((app) => (
                <div
                  key={app.id}
                  className={`liquid-glass p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    app.status === "APPROVED"
                      ? "border-emerald-500/30 bg-emerald-950/10"
                      : app.status === "REJECTED"
                      ? "border-slate-800 opacity-60 line-through"
                      : "border-violet-500/30"
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">{app.title}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {app.entityName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        by {app.requestedBy}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      {app.details}
                    </div>
                    {app.actionPayload?.amountKES && (
                      <div className="text-xs font-mono text-emerald-400 font-bold">
                        Authorized Amount: KES {app.actionPayload.amountKES.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {app.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => handleReject(app.id, app.title)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-rose-400 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleApprove(app.id, app.title)}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve &amp; Dispatch</span>
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                        app.status === "APPROVED"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-slate-400 bg-slate-900 border-slate-800"
                      }`}>
                        {app.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Priority Attention Notices */}
        {(activeCategory === "ALL" || activeCategory !== "APPROVALS") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Operational Status Alerts ({INITIAL_ATTENTION_NOTICES.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_ATTENTION_NOTICES.map((not) => (
                <div
                  key={not.id}
                  className="liquid-glass p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{not.title}</span>
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${
                        not.urgency === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : not.urgency === "HIGH"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                      }`}>
                        {not.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {not.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
                    <Link
                      href={not.actionUrl}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition"
                    >
                      <span>{not.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
