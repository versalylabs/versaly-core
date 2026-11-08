import { describe, expect, it } from "vitest";
import {
  buildInvoiceMessage,
  DEFAULT_PAYMENT_SETTINGS,
  formatKES,
  mailtoUrl,
  normaliseKenyanPhone,
  whatsappUrl,
  type PaymentSettings,
} from "./invoice-messages";

const settings: PaymentSettings = {
  businessName: "Versaly",
  paybillNumber: "123456",
  tillNumber: "",
  bankDetails: "",
  senderName: "Ted",
};

const inv = {
  invoiceNumber: "INV-2026-1001",
  clientName: "Mombasa Fleet Ltd",
  productName: "Vehisoft",
  totalKES: 58000,
  balanceKES: 38000,
  dueDate: "2026-11-15",
};

describe("formatKES", () => {
  it("groups thousands", () => {
    expect(formatKES(58000)).toBe("KES 58,000");
    expect(formatKES(1234567)).toBe("KES 1,234,567");
    expect(formatKES(950)).toBe("KES 950");
    expect(formatKES(0)).toBe("KES 0");
  });
});

describe("buildInvoiceMessage", () => {
  it("sends the full amount with payment instructions and the invoice number as account", () => {
    const m = buildInvoiceMessage(inv, settings, "send", "2026-11-08", "Amina Hassan");
    expect(m.subject).toContain("INV-2026-1001");
    expect(m.body).toContain("Hello Amina,");
    expect(m.body).toContain("KES 58,000");
    expect(m.body).toContain("15 Nov 2026");
    expect(m.body).toContain("Paybill 123456, Account: INV-2026-1001");
    expect(m.body).toContain("Ted, Versaly");
  });
  it("reminds about the outstanding balance, not the total", () => {
    const m = buildInvoiceMessage(inv, settings, "reminder", "2026-11-13");
    expect(m.body).toContain("KES 38,000");
    expect(m.body).not.toContain("KES 58,000");
    expect(m.body).toContain("is due on 15 Nov 2026");
  });
  it("says 'due today' on the due date", () => {
    expect(buildInvoiceMessage(inv, settings, "reminder", "2026-11-15").body).toContain("is due today");
  });
  it("switches to the overdue wording once past due, whichever kind was asked for", () => {
    const m = buildInvoiceMessage(inv, settings, "reminder", "2026-11-18");
    expect(m.subject).toMatch(/^Overdue/);
    expect(m.body).toContain("3 days ago");
    expect(m.body).toContain("KES 38,000");
    expect(buildInvoiceMessage(inv, settings, "overdue", "2026-11-16").body).toContain("1 day ago");
  });
  it("still reads well when no payment method is configured", () => {
    const m = buildInvoiceMessage(inv, DEFAULT_PAYMENT_SETTINGS, "send", "2026-11-08");
    expect(m.body).not.toContain("How to pay");
    expect(m.body).toContain("Hello,");
    expect(m.body.trim().endsWith("Versaly")).toBe(true);
  });
  it("includes till and bank details when set", () => {
    const m = buildInvoiceMessage(
      inv,
      { ...settings, paybillNumber: "", tillNumber: "654321", bankDetails: "KCB 1234567890" },
      "send",
      "2026-11-08"
    );
    expect(m.body).toContain("Till 654321");
    expect(m.body).toContain("KCB 1234567890");
    expect(m.body).not.toContain("Paybill");
  });
});

describe("links", () => {
  it("normalises Kenyan phone numbers", () => {
    expect(normaliseKenyanPhone("0712 345 678")).toBe("254712345678");
    expect(normaliseKenyanPhone("+254 712 345 678")).toBe("254712345678");
    expect(normaliseKenyanPhone("254712345678")).toBe("254712345678");
    expect(normaliseKenyanPhone("712345678")).toBe("254712345678");
    expect(normaliseKenyanPhone("0112345678")).toBe("254112345678");
    expect(normaliseKenyanPhone("")).toBe("");
  });
  it("builds an encoded WhatsApp link", () => {
    const url = whatsappUrl("0712345678", "Hi there & welcome");
    expect(url).toBe("https://wa.me/254712345678?text=Hi%20there%20%26%20welcome");
  });
  it("builds an encoded mailto link", () => {
    const url = mailtoUrl("a@b.co", "Invoice #1", "Line 1\nLine 2");
    expect(url).toBe("mailto:a%40b.co?subject=Invoice%20%231&body=Line%201%0ALine%202");
  });
});
