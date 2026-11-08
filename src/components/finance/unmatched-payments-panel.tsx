"use client";

import { useCallback, useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import type { FinanceInvoice } from "@/lib/finance-store";
import { formatKES } from "@/lib/invoice-messages";
import {
  applyIncomingToInvoice,
  fetchUnappliedPayments,
  markPayment,
  type IncomingMpesa,
} from "@/lib/reconcile";

/**
 * M-Pesa payments that arrived but couldn't be matched to an invoice (usually a
 * mistyped account number). Pick the right invoice to apply it, or ignore it.
 */
export function UnmatchedPaymentsPanel({
  invoices,
  onApplied,
}: {
  invoices: FinanceInvoice[];
  onApplied: (updated: FinanceInvoice) => void;
}) {
  const [payments, setPayments] = useState<IncomingMpesa[]>([]);
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const list = await fetchUnappliedPayments();
    if (list) setPayments(list);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const open = invoices.filter((i) => i.status !== "PAID" && i.status !== "VOID");

  if (!payments.length) return null;

  const apply = async (p: IncomingMpesa) => {
    const invoice = open.find((i) => i.id === choice[p.transId]);
    if (!invoice) return;
    setBusy(p.transId);
    const updated = await applyIncomingToInvoice(p, invoice);
    if (updated) onApplied(updated);
    await refresh();
    setBusy(null);
  };

  const ignore = async (p: IncomingMpesa) => {
    if (!confirm(`Ignore the ${formatKES(p.amount)} payment from ${p.payerName || "this customer"}? It will not be applied to any invoice.`)) return;
    setBusy(p.transId);
    await markPayment(p.transId, "IGNORED");
    await refresh();
    setBusy(null);
  };

  return (
    <div className="liquid-glass rounded-2xl p-4 space-y-3 border border-sky-500/20">
      <div className="flex items-center gap-2">
        <Smartphone className="h-4 w-4 text-sky-400" />
        <h2 className="text-sm font-bold text-white">M-Pesa payments to match</h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 font-bold">
          {payments.length}
        </span>
      </div>
      <p className="text-[11px] text-slate-400">
        These payments arrived but the account number didn&apos;t match an invoice. Choose the invoice each one belongs to.
      </p>

      <div className="space-y-2">
        {payments.map((p) => (
          <div key={p.transId} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white">
                  {formatKES(p.amount)} <span className="font-normal text-slate-400">from {p.payerName || "unknown"}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {p.transId} · account entered: {p.billRef || "none"}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={choice[p.transId] || ""}
                onChange={(e) => setChoice({ ...choice, [p.transId]: e.target.value })}
                className="flex-1 min-w-[180px] px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100"
              >
                <option value="">Choose an invoice…</option>
                {open.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.invoiceNumber} · {i.clientName} · {formatKES(i.balanceKES)} due
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!choice[p.transId] || busy === p.transId}
                onClick={() => void apply(p)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-40 cursor-pointer"
              >
                Apply
              </button>
              <button
                type="button"
                disabled={busy === p.transId}
                onClick={() => void ignore(p)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Ignore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
