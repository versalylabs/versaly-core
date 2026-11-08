/**
 * Money logic, kept free of React and browser APIs so it can be unit-tested.
 * Everything here works on plain objects and ISO dates ("2026-11-08").
 */

export const VAT_RATE = 0.16;

export interface InvoiceTotals {
  subtotalKES: number;
  taxKES: number;
  totalKES: number;
}

/** VAT (16%) is applied to the subtotal and rounded to the nearest shilling. */
export function calcInvoiceTotals(subtotalKES: number): InvoiceTotals {
  const subtotal = Math.round(subtotalKES);
  const tax = Math.round(subtotal * VAT_RATE);
  return { subtotalKES: subtotal, taxKES: tax, totalKES: subtotal + tax };
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

export const isoDay = (d: Date) => d.toISOString().split("T")[0];

export function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDay(d);
}

/** Whole days from `fromIso` to `toIso` (negative if `toIso` is earlier). */
export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Add whole months, keeping the day of month where possible (31 Jan + 1 month = 28/29 Feb). */
export function addMonthsIso(isoDate: string, months: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return isoDay(d);
}

export type BillingCycle = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export function cycleMonths(cycle: BillingCycle): number {
  return cycle === "ANNUAL" ? 12 : cycle === "QUARTERLY" ? 3 : 1;
}

// ---------------------------------------------------------------------------
// Applying payments
// ---------------------------------------------------------------------------

export interface PayableInvoice {
  status: "DRAFT" | "SENT" | "OVERDUE" | "PAID" | "VOID";
  totalKES: number;
  amountPaidKES: number;
  balanceKES: number;
  paidAt?: string;
  payments: { referenceNumber: string; amountKES: number }[];
}

export interface IncomingPayment {
  id: string;
  referenceNumber: string;
  channel: "MPESA_PAYBILL" | "MPESA_TILL" | "MPESA_STK" | "BANK_TRANSFER" | "CASH" | "CHEQUE";
  amountKES: number;
  payerName: string;
  payerPhone?: string;
  receivedAt: string;
  notes?: string;
}

/**
 * Record a payment against an invoice. Returns a new invoice (the input is not
 * changed). A payment with a reference already on the invoice is ignored, so
 * replaying the same M-Pesa confirmation can never be counted twice. Voided
 * invoices don't accept payments.
 */
export function applyPayment<T extends PayableInvoice>(
  invoice: T,
  payment: IncomingPayment,
  todayIso: string
): { invoice: T; applied: boolean } {
  if (invoice.status === "VOID") return { invoice, applied: false };
  if (invoice.payments.some((p) => p.referenceNumber === payment.referenceNumber)) {
    return { invoice, applied: false };
  }
  if (!(payment.amountKES > 0)) return { invoice, applied: false };

  const amountPaidKES = invoice.amountPaidKES + payment.amountKES;
  const balanceKES = Math.max(0, invoice.totalKES - amountPaidKES);
  const settled = balanceKES === 0;

  return {
    applied: true,
    invoice: {
      ...invoice,
      amountPaidKES,
      balanceKES,
      status: settled ? "PAID" : invoice.status === "DRAFT" ? "SENT" : invoice.status,
      paidAt: settled ? todayIso : invoice.paidAt,
      payments: [...invoice.payments, payment],
    },
  };
}

// ---------------------------------------------------------------------------
// Matching incoming payments to invoices
// ---------------------------------------------------------------------------

const normalise = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

export interface MatchableInvoice {
  id: string;
  invoiceNumber: string;
  status: PayableInvoice["status"];
  balanceKES: number;
}

/**
 * Match the "account number" a client typed on the M-Pesa Paybill prompt to an
 * open invoice. Accepts the invoice number in any common spelling
 * ("INV-2026-1001", "inv20261001", "2026-1001") and, as a last resort, the
 * short tail ("1001") when exactly one open invoice ends that way.
 */
export function matchInvoiceByReference<T extends MatchableInvoice>(reference: string, invoices: T[]): T | null {
  const ref = normalise(reference);
  if (!ref) return null;
  const usable = invoices.filter((i) => i.status !== "VOID");

  const exact = usable.filter((i) => {
    const n = normalise(i.invoiceNumber);
    return n === ref || n === `INV${ref}` || n.replace(/^INV/, "") === ref;
  });
  if (exact.length === 1) return exact[0];

  if (/^\d{3,5}$/.test(ref)) {
    const tail = usable.filter((i) => i.status !== "PAID" && normalise(i.invoiceNumber).endsWith(ref));
    if (tail.length === 1) return tail[0];
  }
  return null;
}

// ---------------------------------------------------------------------------
// Collections: where an invoice stands relative to its due date
// ---------------------------------------------------------------------------

export type CollectionStage = "none" | "upcoming" | "due_soon" | "due_today" | "overdue";

export interface CollectionState {
  stage: CollectionStage;
  /** Positive: days until due. Negative: days overdue. */
  daysToDue: number;
}

export const DUE_SOON_DAYS = 3;

export function collectionState(
  invoice: { status: PayableInvoice["status"]; balanceKES: number; dueDate: string },
  todayIso: string
): CollectionState {
  const daysToDue = daysBetween(todayIso, invoice.dueDate);
  const collectable = (invoice.status === "SENT" || invoice.status === "OVERDUE") && invoice.balanceKES > 0;
  if (!collectable) return { stage: "none", daysToDue };
  if (daysToDue < 0) return { stage: "overdue", daysToDue };
  if (daysToDue === 0) return { stage: "due_today", daysToDue };
  if (daysToDue <= DUE_SOON_DAYS) return { stage: "due_soon", daysToDue };
  return { stage: "upcoming", daysToDue };
}

// ---------------------------------------------------------------------------
// Invoice numbers
// ---------------------------------------------------------------------------

/** The next invoice number for the year, continuing after the highest used so far (INV-2026-1001, 1002, …). */
export function nextInvoiceNumber(existing: { invoiceNumber: string }[], year: number): string {
  let max = 1000;
  for (const inv of existing) {
    const m = /^INV-(\d{4})-(\d+)$/.exec(inv.invoiceNumber);
    if (m && Number(m[1]) === year) max = Math.max(max, Number(m[2]));
  }
  return `INV-${year}-${max + 1}`;
}
