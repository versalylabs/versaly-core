"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  FinanceInvoice,
  FinanceExpense,
  ClientSubscription,
  loadInvoicesFromStorage,
  saveInvoicesToStorage,
  loadExpensesFromStorage,
  saveExpensesToStorage,
  loadSubscriptionsFromStorage,
  computeFinanceSummary,
  SETUP_FEE_LAUNCH_TARGET,
  MRR_LAUNCH_TARGET,
} from "@/lib/finance-store";
import {
  Wallet,
  Receipt,
  ArrowDownLeft,
  TrendingDown,
  TrendingUp,
  BarChart3,
  CreditCard,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  DollarSign,
  Building2,
  FileText,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

export default function FinanceDashboardPage() {
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [expenses, setExpenses] = useState<FinanceExpense[]>([]);
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setInvoices(loadInvoicesFromStorage());
    setExpenses(loadExpensesFromStorage());
    setSubscriptions(loadSubscriptionsFromStorage());
    setIsLoaded(true);

    const handleSync = () => {
      setInvoices(loadInvoicesFromStorage());
      setExpenses(loadExpensesFromStorage());
      setSubscriptions(loadSubscriptionsFromStorage());
    };
    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const summary = computeFinanceSummary(invoices, expenses, subscriptions);

  const setupPct = Math.min(100, Math.round((summary.setupFeesCollected / SETUP_FEE_LAUNCH_TARGET) * 100));
  const mrrPct = Math.min(100, Math.round((summary.effectiveMRR / MRR_LAUNCH_TARGET) * 100));

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header Banner */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Treasury &amp; Cashflow Command
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Single Source of Financial Truth</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Wallet className="h-6 w-6 text-emerald-400" />
              <span>Finance Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Unified financial overview of cash collected, receivables, operating expenses, launch targets, and net operating profit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative z-10">
            <Link
              href="/finance/invoices"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition"
            >
              <Plus className="h-4 w-4" />
              <span>New Invoice</span>
            </Link>
            <Link
              href="/finance/expenses"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition"
            >
              <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
              <span>Log Expense</span>
            </Link>
          </div>
        </div>

        {/* Section Navigation Quick Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            href="/finance"
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span>Overview</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
              Live
            </span>
          </Link>

          <Link
            href="/finance/invoices"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Invoices</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">({invoices.length})</span>
          </Link>

          <Link
            href="/finance/payments"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Receivables</span>
            </div>
            {summary.overdueCount > 0 && (
              <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">
                {summary.overdueCount} due
              </span>
            )}
          </Link>

          <Link
            href="/finance/expenses"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Expenses</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">({expenses.length})</span>
          </Link>

          <Link
            href="/finance/revenue"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Revenue</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono">MRR</span>
          </Link>

          <Link
            href="/finance/reports"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>P&amp;L Reports</span>
            </div>
            <span className="text-[10px] text-slate-500">P&amp;L</span>
          </Link>
        </div>

        {/* Primary Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Revenue Collected MTD</span>
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              KES {summary.totalCollected.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span>Cash received in bank / till</span>
            </div>
          </div>

          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Outstanding Invoices</span>
              <Receipt className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-slate-200 font-mono">
              KES {summary.totalOutstanding.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">
              {summary.outstandingCount} active invoices issued
            </div>
          </div>

          <div className="liquid-glass p-5 rounded-2xl border border-rose-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-rose-300">Overdue Payments</span>
              <AlertCircle className="h-4 w-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              KES {summary.totalOverdue.toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-300/80">
              {summary.overdueCount} clients require immediate follow-up
            </div>
          </div>

          <div className="liquid-glass p-5 rounded-2xl border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-indigo-300">Net Operating Profit</span>
              <TrendingUp className="h-4 w-4 text-indigo-400" />
            </div>
            <div className={`text-2xl font-black font-mono ${summary.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              KES {summary.netProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">
              Total Expenses: KES {summary.totalExpenses.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Launch Targets Tracking Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Setup Fees Collected (Launch Push)
                </span>
                <span className="text-[11px] text-slate-400">
                  Target: KES {SETUP_FEE_LAUNCH_TARGET.toLocaleString()} across 4 launch weeks
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-400">
                {setupPct}%
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${setupPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">
                KES {summary.setupFeesCollected.toLocaleString()} Collected
              </span>
              <span className="text-slate-500">
                Remaining: KES {Math.max(0, SETUP_FEE_LAUNCH_TARGET - summary.setupFeesCollected).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Monthly Recurring Revenue (MRR)
                </span>
                <span className="text-[11px] text-slate-400">
                  Target: KES {MRR_LAUNCH_TARGET.toLocaleString()}/mo recurring baseline
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-indigo-400">
                {mrrPct}%
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${mrrPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">
                KES {summary.effectiveMRR.toLocaleString()} MRR
              </span>
              <span className="text-slate-500">
                ARR Run-Rate: KES {summary.effectiveARR.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Product Revenue Distribution */}
        <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Revenue by Product Suite
              </span>
              <span className="text-[11px] text-slate-400">
                Which vertical SaaS product is driving cash generation
              </span>
            </div>
            <Link
              href="/finance/revenue"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View Subscriptions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(summary.productRevenue).map(([prod, rev]) => (
              <div key={prod} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-xs font-semibold block">{prod}</span>
                <div className="text-sm font-bold text-white font-mono">
                  KES {rev.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">
                  {summary.totalCollected > 0 ? Math.round((rev / summary.totalCollected) * 100) : 0}% of collections
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Columns: Recent Invoices & Recent Reconciled Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Recent Invoices
                </span>
              </div>
              <Link
                href="/finance/invoices"
                className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View All ({invoices.length})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Receipt className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No invoices issued yet.</p>
                <Link
                  href="/finance/invoices"
                  className="text-xs text-emerald-400 font-semibold hover:underline inline-block"
                >
                  + Create your first client invoice
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {invoices.slice(0, 5).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono text-[11px]">
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            inv.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : inv.status === "OVERDUE"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : inv.status === "SENT"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <div className="text-slate-300 text-xs font-medium truncate mt-0.5">
                        {inv.clientName}
                      </div>
                      <div className="text-[10px] text-slate-500">Due: {inv.dueDate}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-slate-200">
                        KES {inv.totalKES.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Bal: KES {inv.balanceKES.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Payments & Reconciliations */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Recent Cash Receipts
                </span>
              </div>
              <Link
                href="/finance/payments"
                className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View Ledger ({summary.allPayments.length})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {summary.allPayments.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <ArrowDownLeft className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No payment records logged yet.</p>
                <Link
                  href="/finance/payments"
                  className="text-xs text-emerald-400 font-semibold hover:underline inline-block"
                >
                  + Record incoming payment
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {summary.allPayments.slice(0, 5).map((pay) => (
                  <div
                    key={pay.id || pay.referenceNumber}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400 font-mono text-[11px]">
                          {pay.referenceNumber}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                          {pay.channel.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-slate-300 text-xs font-medium truncate mt-0.5">
                        {pay.clientName} ({pay.invoiceNumber})
                      </div>
                      <div className="text-[10px] text-slate-500">{pay.receivedAt}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-emerald-400">
                        + KES {pay.amountKES.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">Reconciled</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
