"use client";

import { useState } from "react";
import Link from "next/link";
import { BellRing, Copy, Mail, MessageCircle, Send, Check } from "lucide-react";
import type { FinanceInvoice } from "@/lib/finance-store";
import { usePaymentSettings, hasPaymentMethod } from "@/lib/payment-settings";
import { channelProblem, messageKindFor, sendInvoice, type SendChannel } from "./send-invoice";

const BUTTON =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

/**
 * Send an invoice, or chase it, from the invoice detail view. Opens a prepared
 * WhatsApp chat or email draft; a draft invoice becomes "Sent" when you do.
 */
export function InvoiceSendPanel({
  invoice,
  onChange,
}: {
  invoice: FinanceInvoice;
  onChange: (updated: FinanceInvoice) => void;
}) {
  const [settings] = usePaymentSettings();
  const [copied, setCopied] = useState(false);
  const kind = messageKindFor(invoice);
  const isDraft = invoice.status === "DRAFT";
  const label = isDraft ? "Send invoice" : kind === "overdue" ? "Chase payment" : "Send reminder";

  if (invoice.status === "PAID" || invoice.status === "VOID") return null;

  const run = async (channel: SendChannel) => {
    const updated = await sendInvoice(invoice, channel, settings);
    if (channel === "copy") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      onChange(updated);
    }
  };

  const whatsappProblem = channelProblem(invoice, "whatsapp");
  const emailProblem = channelProblem(invoice, "email");

  return (
    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          {isDraft ? <Send className="h-3.5 w-3.5 text-indigo-400" /> : <BellRing className="h-3.5 w-3.5 text-amber-400" />}
          <span>{label}</span>
        </div>
        {!isDraft && (
          <span className="text-[10px] text-slate-400">
            {invoice.sentAt ? `Sent ${invoice.sentAt}` : "Sent"}
            {invoice.reminderCount ? ` · ${invoice.reminderCount} reminder${invoice.reminderCount === 1 ? "" : "s"}` : ""}
            {invoice.lastRemindedAt ? ` · last ${invoice.lastRemindedAt}` : ""}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={Boolean(whatsappProblem)}
          title={whatsappProblem || "Open a WhatsApp chat with the message ready to send"}
          onClick={() => void run("whatsapp")}
          className={`${BUTTON} bg-emerald-600/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </button>
        <button
          type="button"
          disabled={Boolean(emailProblem)}
          title={emailProblem || "Open an email draft in your mail app"}
          onClick={() => void run("email")}
          className={`${BUTTON} bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30`}
        >
          <Mail className="h-3.5 w-3.5" />
          Email
        </button>
        <button
          type="button"
          title="Copy the message to paste anywhere"
          onClick={() => void run("copy")}
          className={`${BUTTON} bg-slate-800 border-slate-700 text-slate-300 hover:text-white`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy message"}
        </button>
      </div>

      {!hasPaymentMethod(settings) && (
        <p className="text-[11px] text-amber-300/90">
          Messages won&apos;t say how to pay yet.{" "}
          <Link href="/settings" className="underline underline-offset-2 hover:text-white">
            Add your Paybill, Till or bank details in Settings
          </Link>
          .
        </p>
      )}
      {isDraft && (
        <p className="text-[11px] text-slate-500">
          Opens a ready-to-send message. The invoice is marked Sent when you open it.
        </p>
      )}
    </div>
  );
}
