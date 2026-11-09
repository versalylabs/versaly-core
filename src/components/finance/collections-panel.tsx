"use client";

import { BellRing, Mail, MessageCircle } from "lucide-react";
import type { FinanceInvoice } from "@/lib/finance-store";
import { collectionState, type CollectionStage, nairobiDay } from "@/lib/money";
import { formatKES } from "@/lib/invoice-messages";
import { usePaymentSettings } from "@/lib/payment-settings";
import { channelProblem, sendInvoice, type SendChannel } from "./send-invoice";

const STAGE_ORDER: Record<CollectionStage, number> = { overdue: 0, due_today: 1, due_soon: 2, upcoming: 3, none: 4 };

const STAGE_LABEL = (stage: CollectionStage, days: number) => {
  if (stage === "overdue") return { text: `${-days} day${days === -1 ? "" : "s"} overdue`, tone: "text-rose-300 bg-rose-500/10 border-rose-500/30" };
  if (stage === "due_today") return { text: "Due today", tone: "text-amber-300 bg-amber-500/10 border-amber-500/30" };
  return { text: `Due in ${days} day${days === 1 ? "" : "s"}`, tone: "text-sky-300 bg-sky-500/10 border-sky-500/30" };
};

/**
 * "Who needs a nudge": unpaid invoices that are overdue, due today or due within
 * three days, most urgent first, with one-tap reminders.
 */
export function CollectionsPanel({
  invoices,
  onChange,
  onSelect,
}: {
  invoices: FinanceInvoice[];
  onChange: (updated: FinanceInvoice) => void;
  onSelect: (invoice: FinanceInvoice) => void;
}) {
  const [settings] = usePaymentSettings();
  const today = nairobiDay();

  const due = invoices
    .map((inv) => ({ inv, state: collectionState(inv, today) }))
    .filter(({ state }) => state.stage === "overdue" || state.stage === "due_today" || state.stage === "due_soon")
    .sort((a, b) => STAGE_ORDER[a.state.stage] - STAGE_ORDER[b.state.stage] || a.state.daysToDue - b.state.daysToDue);

  if (!due.length) return null;

  const totalOwed = due.reduce((sum, { inv }) => sum + inv.balanceKES, 0);

  const remind = async (inv: FinanceInvoice, channel: SendChannel) => onChange(await sendInvoice(inv, channel, settings, today));

  return (
    <div className="liquid-glass rounded-2xl p-4 space-y-3 border border-amber-500/20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">Needs follow-up</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
            {due.length}
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {formatKES(totalOwed)} outstanding on these
        </span>
      </div>

      <div className="space-y-2">
        {due.map(({ inv, state }) => {
          const label = STAGE_LABEL(state.stage, state.daysToDue);
          const phoneProblem = channelProblem(inv, "whatsapp");
          const emailProblem = channelProblem(inv, "email");
          return (
            <div
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800"
            >
              <button type="button" onClick={() => onSelect(inv)} className="text-left min-w-0 cursor-pointer">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white truncate">{inv.clientName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${label.tone}`}>{label.text}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {inv.invoiceNumber} · {formatKES(inv.balanceKES)}
                  {inv.reminderCount ? ` · ${inv.reminderCount} reminder${inv.reminderCount === 1 ? "" : "s"} sent` : ""}
                </div>
              </button>
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={Boolean(phoneProblem)}
                  title={phoneProblem || "Remind on WhatsApp"}
                  onClick={() => void remind(inv, "whatsapp")}
                  className="p-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={Boolean(emailProblem)}
                  title={emailProblem || "Remind by email"}
                  onClick={() => void remind(inv, "email")}
                  className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
