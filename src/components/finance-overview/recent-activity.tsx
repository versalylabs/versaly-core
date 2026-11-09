"use client";

import { Receipt, ArrowRight, ArrowDownLeft } from "lucide-react";
import Link from "next/link";
import { formatKES } from "@/lib/finance-store";

import type { FinanceOverviewModel } from "./use-finance-overview";

export function RecentActivity({ d }: { d: FinanceOverviewModel }) {
  const { invoices, summary } = d;
  return (
    <>
      {/* Two Columns: Recent Invoices & Recent Cash Receipts */}
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
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
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
                        {formatKES(inv.totalKES)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Bal: {formatKES(inv.balanceKES)}
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
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
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
                        + {formatKES(pay.amountKES)}
                      </div>
                      <div className="text-[10px] text-slate-500">Reconciled</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </>
  );
}
