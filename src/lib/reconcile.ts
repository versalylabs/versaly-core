"use client";

import { applyPayment, matchInvoiceByReference, type IncomingPayment } from "@/lib/money";
import { loadInvoicesFromStorage, saveInvoicesToStorage, type FinanceInvoice } from "@/lib/finance-store";

import { todayIsoDate } from "@/lib/ids";
/** A payment Safaricom reported that hasn't been applied to an invoice yet. */
export interface IncomingMpesa {
  transId: string;
  transTime: string | null;
  amount: number;
  billRef: string | null;
  msisdn: string | null;
  payerName: string | null;
  receivedAt: string;
}

export async function fetchUnappliedPayments(): Promise<IncomingMpesa[] | null> {
  try {
    const res = await fetch("/api/payments/incoming", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.data?.payments as IncomingMpesa[]) ?? [];
  } catch {
    return null;
  }
}

export async function markPayment(transId: string, status: "APPLIED" | "IGNORED", invoiceId?: string): Promise<boolean> {
  try {
    const res = await fetch("/api/payments/incoming", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transId, status, invoiceId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Daraja timestamps look like 20261108141530; fall back to when we received it. */
function receivedDate(p: IncomingMpesa): string {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(p.transTime ?? "");
  return m ? `${m[1]}-${m[2]}-${m[3]}` : p.receivedAt.slice(0, 10);
}

export function toInvoicePayment(p: IncomingMpesa): IncomingPayment {
  return {
    id: `pay-${p.transId}`,
    referenceNumber: p.transId,
    channel: "MPESA_PAYBILL",
    amountKES: p.amount,
    payerName: p.payerName || "M-Pesa customer",
    payerPhone: p.msisdn && /^\+?\d{9,13}$/.test(p.msisdn) ? p.msisdn : undefined,
    receivedAt: receivedDate(p),
    notes: p.billRef ? `Account number entered: ${p.billRef}` : undefined,
  };
}

/** Apply a payment to an invoice and save. Returns the updated invoice, or null if it was not applied. */
export async function applyIncomingToInvoice(
  payment: IncomingMpesa,
  invoice: FinanceInvoice,
  todayIso = todayIsoDate()
): Promise<FinanceInvoice | null> {
  const { invoice: updated, applied } = applyPayment(invoice, toInvoicePayment(payment), todayIso);
  // "Not applied" because this reference is already on the invoice still means the payment is accounted for
  const alreadyThere = invoice.payments.some((p) => p.referenceNumber === payment.transId);
  if (!applied && !alreadyThere) return null;

  if (applied) {
    const all = loadInvoicesFromStorage().map((i) => (i.id === updated.id ? updated : i));
    saveInvoicesToStorage(all);
  }
  await markPayment(payment.transId, "APPLIED", invoice.id);
  return applied ? updated : invoice;
}

/**
 * Match every waiting payment to an invoice using the account number the client
 * typed (normally the invoice number). Returns how many were applied; the rest
 * stay waiting for manual assignment.
 */
export async function reconcileIncomingPayments(): Promise<number> {
  const waiting = await fetchUnappliedPayments();
  if (!waiting?.length) return 0;

  let appliedCount = 0;
  for (const payment of waiting) {
    const invoices = loadInvoicesFromStorage(); // re-read: earlier payments may have changed balances
    const match = payment.billRef ? matchInvoiceByReference(payment.billRef, invoices) : null;
    if (!match) continue;
    const result = await applyIncomingToInvoice(payment, match);
    if (result) appliedCount++;
  }
  return appliedCount;
}
