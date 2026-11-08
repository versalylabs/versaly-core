import { describe, expect, it } from "vitest";
import { currentYear, isoDaysFromNow, newId, randomCode, todayIsoDate } from "./ids";
import { nextInvoiceNumber } from "./money";

describe("ids and dates", () => {
  it("builds prefixed ids", () => {
    expect(newId("inv")).toMatch(/^inv-\d{13}$/);
  });
  it("formats dates as YYYY-MM-DD", () => {
    expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(isoDaysFromNow(0)).toBe(todayIsoDate());
    expect(isoDaysFromNow(7) > todayIsoDate()).toBe(true);
    expect(isoDaysFromNow(-7) < todayIsoDate()).toBe(true);
  });
  it("knows the current year", () => {
    expect(currentYear()).toBe(new Date().getFullYear());
  });
  it("makes short upper-case codes of the requested length", () => {
    for (let i = 0; i < 50; i++) expect(randomCode(8)).toMatch(/^[A-Z0-9]{8}$/);
    expect(randomCode(4)).toHaveLength(4);
  });
});

describe("nextInvoiceNumber", () => {
  const inv = (invoiceNumber: string) => ({ invoiceNumber });
  it("starts the year at 1001", () => {
    expect(nextInvoiceNumber([], 2026)).toBe("INV-2026-1001");
  });
  it("continues after the highest number used that year", () => {
    expect(nextInvoiceNumber([inv("INV-2026-1001"), inv("INV-2026-1007"), inv("INV-2026-1003")], 2026)).toBe("INV-2026-1008");
  });
  it("never reuses a number, even when invoices were added out of order", () => {
    const list = [inv("INV-2026-1002"), inv("INV-2026-1001")];
    const next = nextInvoiceNumber(list, 2026);
    expect(list.some((i) => i.invoiceNumber === next)).toBe(false);
  });
  it("counts each year separately and ignores unrelated numbers", () => {
    expect(nextInvoiceNumber([inv("INV-2025-1500"), inv("CUSTOM-9999"), inv("INV-2026-1004")], 2026)).toBe("INV-2026-1005");
    expect(nextInvoiceNumber([inv("INV-2026-1004")], 2027)).toBe("INV-2027-1001");
  });
  it("copes past four digits", () => {
    expect(nextInvoiceNumber([inv("INV-2026-9999")], 2026)).toBe("INV-2026-10000");
  });
});
