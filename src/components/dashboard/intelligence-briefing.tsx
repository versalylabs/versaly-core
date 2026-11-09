"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import type { DashboardModel } from "./use-dashboard";

export function IntelligenceBriefing({ d }: { d: DashboardModel }) {
  const { canSeeFinance, intelligenceBriefing } = d;
  return (
    <>
      {/* Versaly Intelligence Briefing */}
        <div className="liquid-glass p-4 rounded-2xl border border-indigo-500/20">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-bold text-xs text-white">Versaly Intelligence Briefing</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Autonomous
                </span>
                {canSeeFinance && intelligenceBriefing.overdueInvoices > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                    ⚠ Action Required
                  </span>
                )}
              </div>
              <p className="text-[12px] text-slate-400 leading-relaxed italic">
                &ldquo;Good day. You have{" "}
                <span className="font-bold text-white not-italic">{intelligenceBriefing.activeTasks} active task{intelligenceBriefing.activeTasks !== 1 ? "s" : ""}</span>{" "}
                in your execution queue,{" "}
                <span className="font-bold text-white not-italic">{intelligenceBriefing.upcomingEvents} upcoming event{intelligenceBriefing.upcomingEvents !== 1 ? "s" : ""}</span>{" "}
                in the next 7 days,{" "}
                <span className="font-bold text-white not-italic">{intelligenceBriefing.activeProjects} active project{intelligenceBriefing.activeProjects !== 1 ? "s" : ""}</span>{" "}
                in delivery, and{" "}
                <span className="font-bold text-white not-italic">{intelligenceBriefing.openDeals} open deal{intelligenceBriefing.openDeals !== 1 ? "s" : ""}</span>{" "}
                in the pipeline.
                {!canSeeFinance
                  ? null
                  : intelligenceBriefing.overdueInvoices > 0
                  ? <> <span className="font-bold text-rose-400 not-italic">{intelligenceBriefing.overdueInvoices} invoice{intelligenceBriefing.overdueInvoices !== 1 ? "s are" : " is"} overdue</span> — immediate attention required.</>
                  : " All invoices are current."
                }
                {intelligenceBriefing.uncontactedLeads > 0 && (
                  <> <span className="font-bold text-amber-400 not-italic">{intelligenceBriefing.uncontactedLeads} cold lead{intelligenceBriefing.uncontactedLeads !== 1 ? "s" : ""}</span> await first contact.&rdquo;</>
                )}
                {intelligenceBriefing.uncontactedLeads === 0 && " Versaly has organized your priorities across all subsystems.\u201d"}
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap text-[11px]">
                <Link
                  href="/tasks"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/40 transition-colors"
                >
                  <span>📋</span>
                  <span>{intelligenceBriefing.activeTasks} Tasks</span>
                </Link>
                <Link
                  href="/calendar"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/40 transition-colors"
                >
                  <span>📅</span>
                  <span>{intelligenceBriefing.upcomingEvents} Events</span>
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/40 transition-colors"
                >
                  <span>🚀</span>
                  <span>{intelligenceBriefing.activeProjects} Projects</span>
                </Link>
                <Link
                  href="/leads"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/40 transition-colors"
                >
                  <span>💼</span>
                  <span>{intelligenceBriefing.openDeals} Pipeline</span>
                </Link>
                {intelligenceBriefing.uncontactedLeads > 0 && (
                  <Link
                    href="/leads"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:border-amber-500/40 transition-colors"
                  >
                    <span>⚡</span>
                    <span>{intelligenceBriefing.uncontactedLeads} Cold Leads</span>
                  </Link>
                )}
                {intelligenceBriefing.overdueInvoices > 0 && (
                  <Link
                    href="/finance/invoices"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:border-rose-500/40 transition-colors"
                  >
                    <span>⚠️</span>
                    <span>{intelligenceBriefing.overdueInvoices} Overdue</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
    </>
  );
}
