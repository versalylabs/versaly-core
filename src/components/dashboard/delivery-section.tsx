"use client";

import { ShieldCheck, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

import type { DashboardModel } from "./use-dashboard";

export function DeliverySection({ d }: { d: DashboardModel }) {
  const { activeSection, clientDelivery, onboardingBlockers } = d;
  return (
    <>
      {/* ========================================================================= */}
        {/* SECTION 4: CLIENT & DELIVERY HEALTH                                       */}
        {/* ========================================================================= */}
        {(activeSection === "ALL" || activeSection === "DELIVERY") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    4. Client & Delivery Health (Retention & Go-Live Velocity)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Prevent churn, accelerate onboarding under 7 days, and resolve field blockers.
                  </p>
                </div>
              </div>
              <Link
                href="/projects"
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                <span>Projects Hub</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Client Delivery KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="liquid-glass p-3.5 rounded-xl border border-sky-500/30">
                <div className="text-[11px] font-medium text-sky-400">Active Paying Clients</div>
                <div className="text-xl font-bold text-white mt-1">{clientDelivery.activeClients}</div>
                <div className="text-[10px] text-slate-400 mt-1">+{clientDelivery.newClientsThisMonth} new this month</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">In Onboarding</div>
                <div className="text-xl font-bold text-amber-300 mt-1">{clientDelivery.clientsInOnboarding}</div>
                <div className="text-[10px] text-slate-500 mt-1">Implementation phase</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl border border-rose-500/20">
                <div className="text-[11px] font-medium text-rose-400">Onboarding Blockers</div>
                <div className="text-xl font-bold text-rose-300 mt-1">{clientDelivery.onboardingBlockersCount}</div>
                <div className="text-[10px] text-rose-400 mt-1">Requires ops intervention</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Go-Lives Completed</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{clientDelivery.goLivesCompleted}</div>
                <div className="text-[10px] text-emerald-400 mt-1">Fully activated software</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl border border-emerald-500/20">
                <div className="text-[11px] font-medium text-emerald-400">Time to Go-Live</div>
                <div className="text-xl font-bold text-white mt-1">
                  —
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Not tracked yet (target &lt; 7 days)</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Renewals (30 Days)</div>
                <div className="text-xl font-bold text-slate-200 mt-1">{clientDelivery.renewalsDue30Days}</div>
                <div className="text-[10px] text-slate-500 mt-1">Coming up for renewal</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Churn Rate</div>
                <div className="text-xl font-bold text-slate-400 mt-1">—</div>
                <div className="text-[10px] text-slate-500 mt-1">Not tracked yet</div>
              </div>
            </div>

            {/* Client Health Breakdown & Blockers Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Health Status Gauge */}
              <div className="liquid-glass p-5 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-2">
                  Client Health Status Distribution
                </h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  {clientDelivery.totalClients} client{clientDelivery.totalClients === 1 ? "" : "s"}: past-due means at risk, a blocked project means needs attention
                </p>

                {/* Visual Progress Bar */}
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex shadow-inner mb-4">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${clientDelivery.clientHealth.healthyPct}%` }}
                    title={`Healthy: ${clientDelivery.clientHealth.healthy} (${clientDelivery.clientHealth.healthyPct}%)`}
                  />
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${clientDelivery.clientHealth.needsAttentionPct}%` }}
                    title={`Needs Attention: ${clientDelivery.clientHealth.needsAttention}`}
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${clientDelivery.clientHealth.atRiskPct}%` }}
                    title={`At Risk: ${clientDelivery.clientHealth.atRisk}`}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Healthy</span>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {clientDelivery.clientHealth.healthy} <span className="text-[10px] text-slate-400">({clientDelivery.clientHealth.healthyPct}%)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Attention</span>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {clientDelivery.clientHealth.needsAttention} <span className="text-[10px] text-slate-400">({clientDelivery.clientHealth.needsAttentionPct}%)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20">
                    <span className="text-[10px] text-rose-400 font-bold uppercase">At Risk</span>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {clientDelivery.clientHealth.atRisk} <span className="text-[10px] text-slate-400">({clientDelivery.clientHealth.atRiskPct}%)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Support Tickets</span>
                    <div className="text-sm font-bold text-slate-300 mt-0.5">
                      {clientDelivery.supportIssuesOpen} <span className="text-[10px] text-slate-500">open</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding Blockers Card */}
              <div className="liquid-glass p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Active Onboarding Blockers ({onboardingBlockers.length})
                    </h3>
                  </div>
                  <Link
                    href="/projects"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Resolve in Projects</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">Clients waiting on technical setup, training, or data</p>

                <div className="space-y-2.5">
                  {onboardingBlockers.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                      No blocked projects right now.
                    </div>
                  ) : (
                    onboardingBlockers.map((blk) => (
                      <div key={blk.id} className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-rose-200">{blk.client}</span>
                          <span className="text-[10px] text-rose-400 font-mono">{blk.daysBlocked}d blocked</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">{blk.blocker}</p>
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Product: {blk.product}</span>
                          <span className="text-indigo-300 font-medium">Owner: {blk.assignedTo}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
