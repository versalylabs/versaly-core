import { describe, expect, it } from "vitest";
import {
  addDaysIso,
  addMonthsIso,
  applyPayment,
  calcInvoiceTotals,
  collectionState,
  cycleMonths,
  daysBetween,
  matchInvoiceByReference,
  type IncomingPayment,
  type PayableInvoice,
} from "./money";

const invoice = (over: Partial<PayableInvoice> = {}): PayableInvoice => ({
  status: "SENT",
  totalKES: 58000,
  amountPaidKES: 0,
  balanceKES: 58000,
  payments: [],
  ...over,
});

const payment = (over: Partial<IncomingPayment> = {}): IncomingPayment => ({
  id: "pay-1",
  referenceNumber: "QGH7XYZ123",
  channel: "MPESA_PAYBILL",
  amountKES: 58000,
  payerName: "Amina Hassan",
  receivedAt: "2026-11-08",
  ...over,
});

describe("calcInvoiceTotals", () => {
  it("adds 16% VAT", () => {
    expect(calcInvoiceTotals(50000)).toEqual({ subtotalKES: 50000, taxKES: 8000, totalKES: 58000 });
  });
  it("rounds VAT to the nearest shilling", () => {
    // 12,345 * 0.16 = 1,975.2
    expect(calcInvoiceTotals(12345)).toEqual({ subtotalKES: 12345, taxKES: 1975, totalKES: 14320 });
    // 100 * 0.16 = 16 exactly; 3 * 0.16 = 0.48 -> 0
    expect(calcInvoiceTotals(3).taxKES).toBe(0);
    expect(calcInvoiceTotals(4).taxKES).toBe(1);
  });
  it("handles zero", () => {
    expect(calcInvoiceTotals(0)).toEqual({ subtotalKES: 0, taxKES: 0, totalKES: 0 });
  });
});

describe("dates", () => {
  it("adds days across month and year ends", () => {
    expect(addDaysIso("2026-11-28", 7)).toBe("2026-12-05");
    expect(addDaysIso("2026-12-30", 5)).toBe("2027-01-04");
  });
  it("counts days between dates in both directions", () => {
    expect(daysBetween("2026-11-08", "2026-11-15")).toBe(7);
    expect(daysBetween("2026-11-08", "2026-11-01")).toBe(-7);
    expect(daysBetween("2026-11-08", "2026-11-08")).toBe(0);
  });
  it("adds months, clamping to the end of shorter months", () => {
    expect(addMonthsIso("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonthsIso("2028-01-31", 1)).toBe("2028-02-29"); // leap year
    expect(addMonthsIso("2026-11-08", 1)).toBe("2026-12-08");
    expect(addMonthsIso("2026-12-15", 1)).toBe("2027-01-15");
    expect(addMonthsIso("2026-11-08", 12)).toBe("2027-11-08");
  });
  it("maps billing cycles to months", () => {
    expect(cycleMonths("MONTHLY")).toBe(1);
    expect(cycleMonths("QUARTERLY")).toBe(3);
    expect(cycleMonths("ANNUAL")).toBe(12);
  });
});

describe("applyPayment", () => {
  it("settles an invoice paid in full", () => {
    const { invoice: out, applied } = applyPayment(invoice(), payment(), "2026-11-08");
    expect(applied).toBe(true);
    expect(out).toMatchObject({ status: "PAID", amountPaidKES: 58000, balanceKES: 0, paidAt: "2026-11-08" });
    expect(out.payments).toHaveLength(1);
  });
  it("keeps the invoice open on a part payment", () => {
    const { invoice: out } = applyPayment(invoice(), payment({ amountKES: 20000 }), "2026-11-08");
    expect(out).toMatchObject({ status: "SENT", amountPaidKES: 20000, balanceKES: 38000 });
    expect(out.paidAt).toBeUndefined();
  });
  it("completes an invoice across several payments", () => {
    const first = applyPayment(invoice(), payment({ referenceNumber: "A1", amountKES: 30000 }), "2026-11-08").invoice;
    const second = applyPayment(first, payment({ referenceNumber: "A2", amountKES: 28000 }), "2026-11-09").invoice;
    expect(second).toMatchObject({ status: "PAID", balanceKES: 0, amountPaidKES: 58000, paidAt: "2026-11-09" });
  });
  it("never shows a negative balance on an overpayment", () => {
    const { invoice: out } = applyPayment(invoice(), payment({ amountKES: 60000 }), "2026-11-08");
    expect(out.balanceKES).toBe(0);
    expect(out.status).toBe("PAID");
    expect(out.amountPaidKES).toBe(60000);
  });
  it("ignores a repeated confirmation with the same reference", () => {
    const once = applyPayment(invoice(), payment({ amountKES: 20000 }), "2026-11-08").invoice;
    const again = applyPayment(once, payment({ amountKES: 20000 }), "2026-11-08");
    expect(again.applied).toBe(false);
    expect(again.invoice.amountPaidKES).toBe(20000);
    expect(again.invoice.payments).toHaveLength(1);
  });
  it("does not accept payments on voided invoices or non-positive amounts", () => {
    expect(applyPayment(invoice({ status: "VOID" }), payment(), "2026-11-08").applied).toBe(false);
    expect(applyPayment(invoice(), payment({ amountKES: 0 }), "2026-11-08").applied).toBe(false);
    expect(applyPayment(invoice(), payment({ amountKES: -50 }), "2026-11-08").applied).toBe(false);
  });
  it("clears an overdue invoice once it is fully paid", () => {
    const { invoice: out } = applyPayment(invoice({ status: "OVERDUE" }), payment(), "2026-11-08");
    expect(out.status).toBe("PAID");
  });
  it("does not change the original invoice", () => {
    const original = invoice();
    applyPayment(original, payment(), "2026-11-08");
    expect(original.amountPaidKES).toBe(0);
    expect(original.payments).toHaveLength(0);
  });
});

describe("matchInvoiceByReference", () => {
  const invoices = [
    { id: "a", invoiceNumber: "INV-2026-1001", status: "SENT" as const, balanceKES: 58000 },
    { id: "b", invoiceNumber: "INV-2026-1002", status: "SENT" as const, balanceKES: 17400 },
    { id: "c", invoiceNumber: "INV-2026-1003", status: "VOID" as const, balanceKES: 0 },
  ];
  it("matches the invoice number however it was typed", () => {
    for (const ref of ["INV-2026-1001", "inv-2026-1001", "INV20261001", "inv 2026 1001", "2026-1001", "20261001"]) {
      expect(matchInvoiceByReference(ref, invoices)?.id).toBe("a");
    }
  });
  it("matches the short tail when it is unambiguous", () => {
    expect(matchInvoiceByReference("1002", invoices)?.id).toBe("b");
  });
  it("does not guess when the tail is ambiguous", () => {
    const dup = [...invoices, { id: "d", invoiceNumber: "INV-2027-1001", status: "SENT" as const, balanceKES: 100 }];
    expect(matchInvoiceByReference("1001", dup)).toBeNull();
  });
  it("never matches voided invoices", () => {
    expect(matchInvoiceByReference("INV-2026-1003", invoices)).toBeNull();
    expect(matchInvoiceByReference("1003", invoices)).toBeNull();
  });
  it("returns null for empty or unknown references", () => {
    expect(matchInvoiceByReference("", invoices)).toBeNull();
    expect(matchInvoiceByReference("   ", invoices)).toBeNull();
    expect(matchInvoiceByReference("HELLO", invoices)).toBeNull();
    expect(matchInvoiceByReference("9999", invoices)).toBeNull();
  });
});

describe("collectionState", () => {
  const inv = (over: object = {}) => ({ status: "SENT" as const, balanceKES: 1000, dueDate: "2026-11-10", ...over });
  it("classifies by distance from the due date", () => {
    expect(collectionState(inv({ dueDate: "2026-11-20" }), "2026-11-08").stage).toBe("upcoming");
    expect(collectionState(inv({ dueDate: "2026-11-11" }), "2026-11-08").stage).toBe("due_soon");
    expect(collectionState(inv({ dueDate: "2026-11-08" }), "2026-11-08").stage).toBe("due_today");
    expect(collectionState(inv({ dueDate: "2026-11-05" }), "2026-11-08")).toEqual({ stage: "overdue", daysToDue: -3 });
  });
  it("only chases invoices that were sent and still owe money", () => {
    expect(collectionState(inv({ status: "DRAFT" }), "2026-11-08").stage).toBe("none");
    expect(collectionState(inv({ status: "PAID", balanceKES: 0 }), "2026-11-08").stage).toBe("none");
    expect(collectionState(inv({ status: "VOID" }), "2026-11-08").stage).toBe("none");
    expect(collectionState(inv({ balanceKES: 0 }), "2026-11-08").stage).toBe("none");
    expect(collectionState(inv({ status: "OVERDUE", dueDate: "2026-11-01" }), "2026-11-08").stage).toBe("overdue");
  });
});
