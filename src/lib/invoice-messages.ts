import { daysBetween } from "@/lib/money";

/** How clients pay you. Set once in Settings; used in every invoice message. */
export interface PaymentSettings {
  businessName: string;
  paybillNumber: string;
  tillNumber: string;
  bankDetails: string;
  senderName: string;
}

export const PAYMENT_SETTINGS_KEY = "versaly_payment_settings";

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  businessName: "Versaly",
  paybillNumber: "",
  tillNumber: "",
  bankDetails: "",
  senderName: "",
};

export type MessageKind = "send" | "reminder" | "overdue";

export interface MessageInvoice {
  invoiceNumber: string;
  clientName: string;
  productName: string;
  totalKES: number;
  balanceKES: number;
  dueDate: string;
}

export const formatKES = (n: number) => `KES ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

function paymentLines(inv: MessageInvoice, s: PaymentSettings): string[] {
  const lines: string[] = [];
  if (s.paybillNumber) lines.push(`M-Pesa Paybill ${s.paybillNumber}, Account: ${inv.invoiceNumber}`);
  if (s.tillNumber) lines.push(`M-Pesa Buy Goods Till ${s.tillNumber}`);
  if (s.bankDetails) lines.push(`Bank: ${s.bankDetails}`);
  return lines;
}

/**
 * The wording for sending an invoice or chasing it, in plain, polite English.
 * Reminders quote the outstanding balance; the first send quotes the total.
 */
export function buildInvoiceMessage(
  inv: MessageInvoice,
  settings: PaymentSettings,
  kind: MessageKind,
  todayIso: string,
  contactName?: string
): { subject: string; body: string } {
  const greeting = `Hello${contactName ? ` ${contactName.split(" ")[0]}` : ""},`;
  const business = settings.businessName || "Versaly";
  const pay = paymentLines(inv, settings);
  const payBlock = pay.length ? ["", "How to pay:", ...pay.map((l) => `• ${l}`)] : [];
  const signOff = ["", "Thank you,", settings.senderName ? `${settings.senderName}, ${business}` : business];

  if (kind === "send") {
    return {
      subject: `Invoice ${inv.invoiceNumber} from ${business} — ${formatKES(inv.totalKES)}`,
      body: [
        greeting,
        "",
        `Please find invoice ${inv.invoiceNumber} for ${inv.productName}: ${formatKES(inv.totalKES)} (VAT included), due on ${formatDate(inv.dueDate)}.`,
        ...payBlock,
        ...signOff,
      ].join("\n"),
    };
  }

  const daysLate = -daysBetween(todayIso, inv.dueDate);

  if (kind === "overdue" || daysLate > 0) {
    return {
      subject: `Overdue: invoice ${inv.invoiceNumber} — ${formatKES(inv.balanceKES)} outstanding`,
      body: [
        greeting,
        "",
        `Invoice ${inv.invoiceNumber} (${inv.productName}) was due on ${formatDate(inv.dueDate)}${daysLate > 0 ? `, ${daysLate} day${daysLate === 1 ? "" : "s"} ago` : ""}. The outstanding balance is ${formatKES(inv.balanceKES)}.`,
        "",
        "If you have already paid, please share the M-Pesa confirmation message so we can update our records. Otherwise, kindly settle it at your earliest convenience.",
        ...payBlock,
        ...signOff,
      ].join("\n"),
    };
  }

  const when = daysLate === 0 ? "is due today" : `is due on ${formatDate(inv.dueDate)}`;
  return {
    subject: `Reminder: invoice ${inv.invoiceNumber} ${when}`,
    body: [
      greeting,
      "",
      `A friendly reminder that invoice ${inv.invoiceNumber} (${inv.productName}) for ${formatKES(inv.balanceKES)} ${when}.`,
      ...payBlock,
      ...signOff,
    ].join("\n"),
  };
}

/** Turn a Kenyan phone number into international form (no plus sign) for wa.me links. */
export function normaliseKenyanPhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if ((digits.startsWith("7") || digits.startsWith("1")) && digits.length === 9) return `254${digits}`;
  return digits;
}

export function whatsappUrl(phone: string, text: string): string {
  const number = normaliseKenyanPhone(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function mailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
