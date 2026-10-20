"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  FinanceInvoice,
  PaymentRecord,
  loadInvoicesFromStorage,
  saveInvoicesToStorage,
  computeFinanceSummary,
} from "@/lib/finance-store";
import {
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  MessageCircle,
  ExternalLink,
  CreditCard,
  Smartphone,
  Building2,
  Calendar,
  DollarSign,
  Plus,
  X,
  Send,
  Copy,
} from "lucide-react";

export default function PaymentsReceivablesPage() {
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick WhatsApp reminder modal
  const [reminderClient, setReminderClient] = useState<FinanceInvoice | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    setInvoices(loadInvoicesFromStorage());
  }, []);

  const summary = computeFinanceSummary(invoices, []);

  // Filter Payments
  const filteredPayments = useMemo(() => {
    return summary.allPayments.filter((p) => {
      const matchesSearch =
        p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.payerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChannel = channelFilter === "ALL" || p.channel === channelFilter;
      return matchesSearch && matchesChannel;
    });
  }, [summary.allPayments, searchQuery, channelFilter]);

  // Overdue Receivables Queue
  const overdueQueue = useMemo(() => {
    return invoices.filter((i) => i.balanceKES > 0);
  }, [invoices]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getReminderScript = (inv: FinanceInvoice) => {
    return `Hello ${inv.clientName}, trust you're well. This is a gentle reminder regarding Versaly invoice ${inv.invoiceNumber} for ${inv.productName} with an outstanding balance of KES ${inv.balanceKES.toLocaleString()}, due on ${inv.dueDate}. Please remit via M-Pesa Paybill 247247, Account: ${inv.invoiceNumber}. Let us know if you need any assistance!`;
  };

  const handleCopyScript = (inv: FinanceInvoice) => {
    navigator.clipboard.writeText(getReminderScript(inv));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Cashflow Operations
              </span>
              <span className="text-xs text-slate-500">M-Pesa &amp; Banking Reconciliation</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ArrowDownLeft className="h-6 w-6 text-emerald-400" />
              <span>Payments &amp; Receivables</span>
            </h1>
            <p className="text-xs text-slate-400">
              Live ledger of incoming receipts, channel settlement distribution, and overdue payment recovery queue.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/finance/invoices"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition"
            >
              <span>Manage Invoices</span>
            </Link>
          </div>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Total Collected Receipts</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              KES {summary.totalCollected.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">
              Across {summary.allPayments.length} verified transactions
            </div>
          </div>

          <div className="liquid-glass p-5 rounded-2xl border border-sky-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Pending Receivables</span>
              <Smartphone className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              KES {summary.totalOutstanding.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">
              {summary.outstandingCount} invoices awaiting settlement
            </div>
          </div>

          <div className="liquid-glass p-5 rounded-2xl border border-rose-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-rose-300">Overdue Debt Queue</span>
              <AlertCircle className="h-4 w-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              KES {summary.totalOverdue.toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-300/80">
              {summary.overdueCount} clients overdue past terms
            </div>
          </div>
        </div>

        {/* OVERDUE RECEIVABLES RECOVERY QUEUE */}
        {overdueQueue.length > 0 && (
          <div className="liquid-glass p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Receivables Recovery Queue (Action Required)
                </span>
              </div>
              <span className="text-[11px] text-rose-300 font-medium">
                {overdueQueue.length} clients with open balances
              </span>
            </div>

            <div className="space-y-2.5">
              {overdueQueue.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{inv.clientName}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        ({inv.invoiceNumber})
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          inv.status === "OVERDUE"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Product: {inv.productName} • Due: {inv.dueDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-bold text-rose-400 text-xs">
                        KES {inv.balanceKES.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">Unpaid Balance</div>
                    </div>

                    <button
                      onClick={() => setReminderClient(inv)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp Reminder</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYMENTS RECEIVED LEDGER */}
        <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Cash Collections &amp; Reconciled Receipts Ledger
              </span>
              <span className="text-[11px] text-slate-400">
                Verified transactions credited to Versaly accounts
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Payment Channels</option>
                <option value="MPESA_PAYBILL">M-Pesa Paybill</option>
                <option value="MPESA_TILL">M-Pesa Till</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <ArrowDownLeft className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No payment records found.</p>
              <Link
                href="/finance/invoices"
                className="text-xs text-emerald-400 font-semibold hover:underline inline-block"
              >
                Go to Invoices to record client payments →
              </Link>
            </div>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-slate-900/80 p-3 font-bold text-slate-400 border-b border-slate-800">
                <span className="col-span-3">Reference / TxID</span>
                <span className="col-span-3">Payer / Client</span>
                <span className="col-span-2">Channel</span>
                <span className="col-span-2">Date</span>
                <span className="col-span-2 text-right">Amount (KES)</span>
              </div>

              {filteredPayments.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="grid grid-cols-12 p-3 border-b border-slate-800/60 text-slate-300 font-medium items-center hover:bg-slate-900/40 transition font-mono text-[11px]"
                >
                  <span className="col-span-3 font-bold text-emerald-400 truncate pr-2">
                    {p.referenceNumber}
                  </span>
                  <span className="col-span-3 font-sans font-semibold text-white truncate pr-2">
                    {p.payerName}
                  </span>
                  <span className="col-span-2 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {p.channel.replace("_", " ")}
                    </span>
                  </span>
                  <span className="col-span-2 text-slate-400 text-[10px]">
                    {p.receivedAt}
                  </span>
                  <span className="col-span-2 text-right font-bold text-white text-xs">
                    + KES {p.amountKES.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WHATSAPP REMINDER SCRIPT MODAL */}
      {reminderClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="liquid-glass border border-emerald-500/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setReminderClient(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Payment Follow-up Outreach</span>
              </span>
              <h3 className="text-base font-bold text-white">
                Reminder for {reminderClient.clientName}
              </h3>
              <p className="text-xs text-slate-400">
                Outstanding: KES {reminderClient.balanceKES.toLocaleString()} • Due: {reminderClient.dueDate}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans relative">
              {getReminderScript(reminderClient)}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleCopyScript(reminderClient)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedText ? "Copied!" : "Copy Script"}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(getReminderScript(reminderClient))}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Open in WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
