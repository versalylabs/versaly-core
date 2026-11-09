"use client";

import { appStorage } from "@/lib/app-storage";
import { collectionState, nairobiDay } from "@/lib/money";
import {
  buildInvoiceMessage,
  mailtoUrl,
  whatsappUrl,
  type MessageKind,
  type PaymentSettings,
} from "@/lib/invoice-messages";
import { CLIENTS_STORAGE_KEY } from "@/lib/workflows";
import type { ClientItem } from "@/data/clients-projects-seed";
import type { FinanceInvoice } from "@/lib/finance-store";

export type SendChannel = "whatsapp" | "email" | "copy";

function contactNameFor(inv: FinanceInvoice): string | undefined {
  if (!inv.clientId) return undefined;
  try {
    const clients = JSON.parse(appStorage.getItem(CLIENTS_STORAGE_KEY) || "[]") as ClientItem[];
    return clients.find((c) => c.id === inv.clientId)?.contactName || undefined;
  } catch {
    return undefined;
  }
}

/** Which wording fits this invoice right now. */
export function messageKindFor(inv: FinanceInvoice, todayIso = nairobiDay()): MessageKind {
  if (inv.status === "DRAFT") return "send";
  return collectionState(inv, todayIso).stage === "overdue" ? "overdue" : "reminder";
}

/** Why an invoice can't be sent on this channel (undefined = it can). */
export function channelProblem(inv: FinanceInvoice, channel: SendChannel): string | undefined {
  if (inv.status === "PAID") return "Already paid";
  if (inv.status === "VOID") return "This invoice is void";
  if (channel === "whatsapp" && !inv.clientPhone?.replace(/\D/g, "")) return "No phone number on this invoice";
  if (channel === "email" && !inv.clientEmail) return "No email address on this invoice";
  return undefined;
}

/**
 * Open a prepared WhatsApp chat or email draft (or copy the text) and return the
 * updated invoice: a draft becomes Sent, and reminders are counted. Nothing is
 * transmitted by Versaly itself; you press send in WhatsApp or your mail app.
 */
export async function sendInvoice(
  inv: FinanceInvoice,
  channel: SendChannel,
  settings: PaymentSettings,
  todayIso = nairobiDay()
): Promise<FinanceInvoice> {
  const kind = messageKindFor(inv, todayIso);
  const { subject, body } = buildInvoiceMessage(inv, settings, kind, todayIso, contactNameFor(inv));

  if (channel === "copy") {
    await navigator.clipboard.writeText(`${subject}\n\n${body}`);
    return inv;
  }

  const url = channel === "whatsapp" ? whatsappUrl(inv.clientPhone || "", body) : mailtoUrl(inv.clientEmail || "", subject, body);
  window.open(url, "_blank", "noopener,noreferrer");

  const isFirstSend = inv.status === "DRAFT";
  return {
    ...inv,
    status: isFirstSend ? "SENT" : inv.status,
    sentAt: inv.sentAt ?? todayIso,
    lastRemindedAt: isFirstSend ? inv.lastRemindedAt : todayIso,
    reminderCount: isFirstSend ? inv.reminderCount : (inv.reminderCount ?? 0) + 1,
  };
}
