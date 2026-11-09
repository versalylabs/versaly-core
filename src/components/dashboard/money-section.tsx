"use client";

import { DollarSign, AlertCircle, CreditCard, ExternalLink } from "lucide-react";
import Link from "next/link";

import type { DashboardModel } from "./use-dashboard";

export function MoneySection({ d }: { d: DashboardModel }) {
  const { canSeeFinance, activeSection, money, financeSummary, cashAlerts } = d;
  return (
    <>
      {/* ========================================================================= */}
        {/* SECTION 1: MONEY METRICS (At the top)                                     */}
        {/* ========================================================================= */}
        {canSeeFinance && (activeSection === "ALL" || activeSection === "MONEY") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    1. Money Metrics (Financial Reality)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Real cash received, recurring engine, and receivables tracking against the 4-week launch target.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="text-slate-400">Launch Target:</span>
                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  KES 520k Setup / KES 120k MRR
                </span>
              </div>
            </div>

            {/* Money Scorecard Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {/* 1. Cash Collected */}
              <div className="liquid-glass p-4 rounded-xl border border-emerald-500/30">
                <div className="text-[11px] font-medium text-emerald-400 flex items-center justify-between">
                  <span>Revenue Collected</span>
                  <span className="text-[9px] bg-emerald-500/20 px-1 rounded uppercase font-bold">Cash</span>
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  KES {(money.revenueCollectedThisMonth / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5">
                  Actual bank & M-Pesa receipts
                </div>
              </div>

              {/* 2. Setup Fees Collected */}
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>Setup Fees</span>
                  <span className="text-[9px] text-amber-400 font-mono">
                    {((money.setupFeesCollected / money.setupFeeTarget) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xl font-bold text-amber-300 mt-1">
                  KES {(money.setupFeesCollected / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Target: KES {(money.setupFeeTarget / 1000).toFixed(0)}k
                </div>
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(money.setupFeesCollected / money.setupFeeTarget) * 100}%` }}
                  />
                </div>
              </div>

              {/* 3. MRR */}
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>Monthly Recurring</span>
                  <span className="text-[9px] text-emerald-400 font-bold font-mono">
                    {money.mrrTarget > 0 ? `${((money.mrr / money.mrrTarget) * 100).toFixed(0)}% Target` : "0%"}
                  </span>
                </div>
                <div className="text-xl font-bold text-indigo-300 mt-1">
                  KES {(money.mrr / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Base Target: KES {(money.mrrTarget / 1000).toFixed(0)}k/mo
                </div>
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((money.mrr / money.mrrTarget) * 100))}%` }}
                  />
                </div>
              </div>

              {/* 4. ARR */}
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Annual Run-Rate (ARR)</div>
                <div className="text-xl font-bold text-white mt-1">
                  KES {(money.arr / 1000000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  MRR × 12 annualized
                </div>
              </div>

              {/* 5. Outstanding Invoices */}
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>Outstanding Invoices</span>
                  <span className="text-[9px] text-amber-400 font-mono">
                    {financeSummary.outstandingCount} {financeSummary.outstandingCount === 1 ? "bill" : "bills"}
                  </span>
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  KES {(money.outstandingInvoicesKES / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  Money owed within grace period
                </div>
              </div>

              {/* 6. Overdue Payments */}
              <div className="liquid-glass p-4 rounded-xl border border-rose-500/20">
                <div className="text-[11px] font-medium text-rose-400 flex items-center justify-between">
                  <span>Overdue Payments</span>
                  <span className="text-[9px] bg-rose-500/20 px-1 rounded font-bold">Immediate</span>
                </div>
                <div className="text-xl font-bold text-rose-300 mt-1">
                  KES {(money.overduePaymentsKES / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-rose-400/90 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>
                    {money.overdueClientsCount} {money.overdueClientsCount === 1 ? "client needs action" : "clients need action"}
                  </span>
                </div>
              </div>

              {/* 7. ARPU */}
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Avg Revenue / Client</div>
                <div className="text-xl font-bold text-slate-200 mt-1">
                  KES {money.averageRevenuePerClient.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  {money.activePayingAccountsCount} active paying {money.activePayingAccountsCount === 1 ? "account" : "accounts"}
                </div>
              </div>
            </div>

            {/* Money Visual Breakdown Chart: Revenue by Product */}
            <div className="liquid-glass p-5 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span>Revenue Collected &amp; MRR Share by Product</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Which product is actively producing cash vs. predictable subscription recurring revenue
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {money.revenueCollectedThisMonth === 0 ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-slate-600" />
                      <span>Pre-Launch: KES 0 sales logged to date</span>
                    </div>
                  ) : (
                    money.productRevenueBreakdown
                      .filter((p) => p.pct > 0)
                      .slice(0, 3)
                      .map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span>
                            {item.name} ({item.pct}%)
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Visual Stacked Bar Chart */}
              <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                {money.revenueCollectedThisMonth === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500 font-medium bg-slate-900/50">
                    No sales recorded yet (Pre-Launch Baseline)
                  </div>
                ) : (
                  money.productRevenueBreakdown.map((item) => (
                    <div
                      key={item.name}
                      className="h-full transition-all duration-300 hover:opacity-85"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      title={`${item.name}: KES ${item.collected.toLocaleString()} (${item.pct}%)`}
                    />
                  ))
                )}
              </div>

              {/* Grid of Product Cash Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 mt-4 pt-3 border-t border-slate-800/60">
                {money.productRevenueBreakdown.map((item) => (
                  <div key={item.name} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-200">{item.name}</span>
                      <span className="font-mono text-[10px] text-indigo-400">{item.pct}%</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1">
                      KES {(item.collected / 1000).toFixed(1)}k <span className="text-[9px] text-slate-400 font-normal">cash</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      KES {(item.mrr / 1000).toFixed(1)}k/mo MRR
                    </div>
                  </div>
                ))}
              </div>

              {/* Cash & Unpaid Invoices Alerts */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Immediate Receivables & Overdue Invoices ({cashAlerts.length})
                    </h4>
                  </div>
                  <Link
                    href="/finance"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Open Finance Hub</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                {cashAlerts.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                    No invoices are overdue or due today.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cashAlerts.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-200">{c.client}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{c.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400 font-mono">KES {c.amountKES.toLocaleString()}</div>
                          <div className={c.urgency === "high" ? "text-[10px] text-rose-400 font-bold" : "text-[10px] text-amber-400 font-medium"}>
                            {c.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </>
  );
}
