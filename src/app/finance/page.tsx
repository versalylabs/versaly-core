"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { AlertCircle, TrendingUp } from "lucide-react";

export default function FinancePage() {
  const financialSummary = {
    mrrKES: 286500,
    mrrGrowth: "+18.4%",
    totalInvoicedKES: 495000,
    collectedKES: 412000,
    overdueKES: 83000,
  };

  const recentTransactions = [
    {
      id: "tx-1",
      client: "Express Wash Kilimani",
      product: "Versandry",
      amountKES: 30000,
      type: "Setup Fee",
      channel: "M-Pesa Paybill",
      status: "PAID",
      date: "Today 08:15 AM",
    },
    {
      id: "tx-2",
      client: "Mama Rocks Gourmet Burgers",
      product: "Melio RMS",
      amountKES: 18000,
      type: "Monthly Subscription",
      channel: "Bank Transfer",
      status: "OVERDUE",
      date: "Due Oct 16",
    },
    {
      id: "tx-3",
      client: "Skyline Outdoor Media",
      product: "Adversoft",
      amountKES: 45000,
      type: "Setup Fee",
      channel: "M-Pesa STK Push",
      status: "PAID",
      date: "Yesterday",
    },
    {
      id: "tx-4",
      client: "Safari Auto Clinic",
      product: "Vehisoft",
      amountKES: 35000,
      type: "Setup Fee",
      channel: "M-Pesa Paybill",
      status: "PAID",
      date: "Oct 15",
    },
  ];

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Operational Finance & Billing
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Cashflow & Recurring Revenue</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Invoicing, M-Pesa Collections & MRR
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Track setup fees, monthly subscriptions across all 5 products, M-Pesa Paybill reconciliations, and follow up on overdue client balances.
          </p>
        </div>

        {/* Finance Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Monthly Recurring Revenue (MRR)</div>
            <div className="text-2xl font-bold text-indigo-300 mt-2 font-mono">
              KES {financialSummary.mrrKES.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{financialSummary.mrrGrowth} from last month</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Total Cash Collected</div>
            <div className="text-2xl font-bold text-white mt-2 font-mono">
              KES {financialSummary.collectedKES.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">M-Pesa + Bank accounts</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Total Invoiced (October)</div>
            <div className="text-2xl font-bold text-white mt-2 font-mono">
              KES {financialSummary.totalInvoicedKES.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">Setup fees & subscriptions</div>
          </div>

          <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/20">
            <div className="text-xs text-rose-300 font-medium">Overdue Invoices</div>
            <div className="text-2xl font-bold text-rose-400 mt-2 font-mono">
              KES {financialSummary.overdueKES.toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-400/80 mt-2 flex items-center gap-1 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Follow-up tasks queued</span>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <h2 className="text-sm font-bold text-white mb-4">Recent Invoices & Transactions</h2>

          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{tx.client}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {tx.product}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>{tx.type}</span>
                    <span>•</span>
                    <span className="text-slate-300">{tx.channel}</span>
                    <span>•</span>
                    <span>{tx.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono">
                    KES {tx.amountKES.toLocaleString()}
                  </div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                      tx.status === "PAID"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
