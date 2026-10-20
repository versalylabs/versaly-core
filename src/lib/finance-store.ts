"use client";

import { useState, useEffect } from "react";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amountKES: number;
}

export interface PaymentRecord {
  id: string;
  referenceNumber: string;
  channel: "MPESA_PAYBILL" | "MPESA_TILL" | "MPESA_STK" | "BANK_TRANSFER" | "CASH";
  amountKES: number;
  payerName: string;
  payerPhone?: string;
  receivedAt: string;
  notes?: string;
}

export interface FinanceInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  productSlug: "semplo" | "vehisoft" | "adversoft" | "versandry" | "lipatim" | "melio" | "custom";
  productName: string;
  status: "DRAFT" | "SENT" | "OVERDUE" | "PAID" | "VOID";
  subtotalKES: number;
  taxKES: number;
  totalKES: number;
  amountPaidKES: number;
  balanceKES: number;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  kraEtimsCode?: string;
  lineItems: InvoiceLineItem[];
  payments: PaymentRecord[];
}

export interface FinanceExpense {
  id: string;
  category:
    | "INFRASTRUCTURE_CLOUD"
    | "HARDWARE_DEVICES"
    | "FIELD_TRANSPORT"
    | "OFFICE_OPERATIONS"
    | "MARKETING_ADS"
    | "LEGAL_COMPLIANCE"
    | "COMMISSIONS_SALARIES"
    | "OTHER";
  description: string;
  amountKES: number;
  vendor: string;
  expenseDate: string;
  paymentMethod: "MPESA" | "BANK_TRANSFER" | "CASH" | "CARD";
  productSlug?: string;
  status: "PAID" | "PENDING_APPROVAL" | "SCHEDULED";
  receiptUrl?: string;
  notes?: string;
}

export const STORAGE_INVOICES = "versaly_finance_invoices_v2";
export const STORAGE_EXPENSES = "versaly_finance_expenses_v2";
export const STORAGE_SUBSCRIPTIONS = "versaly_finance_subscriptions_v2";

export interface ClientSubscription {
  id: string;
  clientName: string;
  productSlug: "semplo" | "vehisoft" | "adversoft" | "versandry" | "lipatim" | "melio" | "custom";
  productName: string;
  planTier: string;
  monthlyFeeKES: number;
  billingCycle: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  status: "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELLED";
  startDate: string;
  nextBillingDate: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
}

export const INITIAL_SUBSCRIPTIONS: ClientSubscription[] = [];

export function loadSubscriptionsFromStorage(): ClientSubscription[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_SUBSCRIPTIONS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out pre-seeded mock demo subscriptions
        const cleaned = parsed.filter(
          (s: ClientSubscription) =>
            s.id !== "sub-1" &&
            s.id !== "sub-2" &&
            s.id !== "sub-3" &&
            s.id !== "sub-4" &&
            s.id !== "sub-5" &&
            s.id !== "sub-semplo-1"
        );
        if (cleaned.length !== parsed.length) {
          saveSubscriptionsToStorage(cleaned);
        }
        return cleaned;
      }
    }
  } catch {}
  return [];
}

export function saveSubscriptionsToStorage(subs: ClientSubscription[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_SUBSCRIPTIONS, JSON.stringify(subs));
  } catch {}
}

// Shared target launch baselines
export const SETUP_FEE_LAUNCH_TARGET = 520000;
export const MRR_LAUNCH_TARGET = 120000;

export function loadInvoicesFromStorage(): FinanceInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_INVOICES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveInvoicesToStorage(invoices: FinanceInvoice[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_INVOICES, JSON.stringify(invoices));
  } catch {}
}

export function loadExpensesFromStorage(): FinanceExpense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_EXPENSES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveExpensesToStorage(expenses: FinanceExpense[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_EXPENSES, JSON.stringify(expenses));
  } catch {}
}

export function computeFinanceSummary(
  invoices: FinanceInvoice[],
  expenses: FinanceExpense[],
  subscriptions?: ClientSubscription[]
) {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalKES || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.amountPaidKES || 0), 0);

  const outstandingInvoices = invoices.filter(
    (inv) => inv.status === "SENT" || inv.status === "OVERDUE"
  );
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + (inv.balanceKES || 0), 0);

  const overdueInvoices = invoices.filter((inv) => inv.status === "OVERDUE");
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.balanceKES || 0), 0);

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amountKES || 0), 0);
  const netProfit = totalCollected - totalExpenses;
  const netMarginPct = totalCollected > 0 ? Math.round((netProfit / totalCollected) * 100) : 0;

  // Active subscriptions calculation
  const subsList = subscriptions ?? (typeof window !== "undefined" ? loadSubscriptionsFromStorage() : INITIAL_SUBSCRIPTIONS);
  const activeSubs = subsList.filter((s) => s.status === "ACTIVE");
  const contractedMRR = activeSubs.reduce((sum, s) => sum + (s.monthlyFeeKES || 0), 0);
  const contractedARR = contractedMRR * 12;

  // Compute MRR & Setup fees from invoice line items
  let setupFeesCollected = 0;
  let recurringCollected = 0;

  invoices.forEach((inv) => {
    if (inv.status === "PAID" || inv.amountPaidKES > 0) {
      inv.lineItems?.forEach((item) => {
        const desc = item.description.toLowerCase();
        if (desc.includes("setup") || desc.includes("installation") || desc.includes("onboarding")) {
          setupFeesCollected += item.amountKES;
        } else if (desc.includes("monthly") || desc.includes("subscription") || desc.includes("mrr") || desc.includes("license")) {
          recurringCollected += item.amountKES;
        }
      });
    }
  });

  // Effective MRR is the max of contracted MRR and invoiced recurring
  const effectiveMRR = contractedMRR > 0 ? contractedMRR : recurringCollected;
  const effectiveARR = effectiveMRR * 12;

  // Product splits
  const productRevenue: Record<string, number> = {
    Semplo: 0,
    Vehisoft: 0,
    Adversoft: 0,
    Versandry: 0,
    LipaTim: 0,
    "Melio RMS": 0,
  };

  invoices.forEach((inv) => {
    const paid = inv.amountPaidKES || 0;
    if (inv.productSlug === "semplo") productRevenue["Semplo"] += paid;
    else if (inv.productSlug === "vehisoft") productRevenue["Vehisoft"] += paid;
    else if (inv.productSlug === "adversoft") productRevenue["Adversoft"] += paid;
    else if (inv.productSlug === "versandry") productRevenue["Versandry"] += paid;
    else if (inv.productSlug === "lipatim") productRevenue["LipaTim"] += paid;
    else if (inv.productSlug === "melio") productRevenue["Melio RMS"] += paid;
  });

  // Product MRR splits from subscriptions
  const productMRR: Record<string, number> = {
    Semplo: 0,
    Vehisoft: 0,
    Adversoft: 0,
    Versandry: 0,
    LipaTim: 0,
    "Melio RMS": 0,
  };

  activeSubs.forEach((s) => {
    if (s.productSlug === "semplo") productMRR["Semplo"] += s.monthlyFeeKES;
    else if (s.productSlug === "vehisoft") productMRR["Vehisoft"] += s.monthlyFeeKES;
    else if (s.productSlug === "adversoft") productMRR["Adversoft"] += s.monthlyFeeKES;
    else if (s.productSlug === "versandry") productMRR["Versandry"] += s.monthlyFeeKES;
    else if (s.productSlug === "lipatim") productMRR["LipaTim"] += s.monthlyFeeKES;
    else if (s.productSlug === "melio") productMRR["Melio RMS"] += s.monthlyFeeKES;
  });

  // Extract all payment transactions
  const allPayments: (PaymentRecord & { invoiceNumber: string; clientName: string; product: string })[] = [];
  invoices.forEach((inv) => {
    inv.payments?.forEach((p) => {
      allPayments.push({
        ...p,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName,
        product: inv.productName,
      });
    });
  });

  // Sort payments descending by receivedAt
  allPayments.sort((a, b) => (b.receivedAt > a.receivedAt ? 1 : -1));

  return {
    totalInvoiced,
    totalCollected,
    totalOutstanding,
    outstandingCount: outstandingInvoices.length,
    totalOverdue,
    overdueCount: overdueInvoices.length,
    totalExpenses,
    netProfit,
    netMarginPct,
    setupFeesCollected,
    recurringCollected,
    effectiveMRR,
    effectiveARR,
    activeSubscriptionsCount: activeSubs.length,
    productRevenue,
    productMRR,
    allPayments,
  };
}
