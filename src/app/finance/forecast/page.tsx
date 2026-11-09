"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Info, Landmark, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { buildForecast, type ForecastWeek, type FlowKind } from "@/lib/insights";
import { formatKES } from "@/lib/invoice-messages";
import { nairobiDay } from "@/lib/money";
import { loadWorkspaceData } from "@/lib/workspace-data";

const KIND_LABEL: Record<FlowKind, string> = {
  invoice: "Invoice",
  subscription: "Subscription",
  pipeline: "Pipeline",
  vendor: "Vendor bill",
  expense: "Scheduled expense",
};

const KIND_TONE: Record<FlowKind, string> = {
  invoice: "text-emerald-300",
  subscription: "text-emerald-300",
  pipeline: "text-sky-300",
  vendor: "text-rose-300",
  expense: "text-rose-300",
};

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export default function CashForecastPage() {
  const [data] = useState(() => loadWorkspaceData());
  const [includePipeline, setIncludePipeline] = useState(false);
  const [selected, setSelected] = useState(0);
  const [today] = useState(() => nairobiDay());

  const forecast = useMemo(() => buildForecast(data, today, 8), [data, today]);
  const cashOf = (w: ForecastWeek) => (includePipeline ? w.cashWithPipelineKES : w.cashKES);

  const lowest = forecast.weeks.reduce((low, w) => (cashOf(w) < cashOf(low) ? w : low), forecast.weeks[0]);
  const inflow = forecast.totals.inflowConfirmedKES + (includePipeline ? forecast.totals.inflowPipelineKES : 0);
  const goesNegative = forecast.weeks.some((w) => cashOf(w) < 0);

  const maxBar = Math.max(1, ...forecast.weeks.map((w) => Math.max(w.inflowConfirmedKES + (includePipeline ? w.inflowPipelineKES : 0), w.outflowKES)));
  const week = forecast.weeks[selected];

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="liquid-glass liquid-glass-glow p-6 rounded-2xl space-y-2">
          <div className="text-[11px] font-semibold text-emerald-300 flex items-center gap-2">
            <Landmark className="h-3.5 w-3.5" />
            <span>FINANCE • NEXT 8 WEEKS</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Cash Flow Forecast</h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            What&apos;s likely to come in and go out, week by week, based on your invoices, subscriptions, vendor bills and scheduled
            expenses. Late invoices are counted at a lower chance of being paid.
          </p>
        </div>

        {goesNegative && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
            <TriangleAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              Projected cash drops below zero in the week of <strong>{shortDate(lowest.start)}</strong> (KES {formatKES(cashOf(lowest)).replace("KES ", "")}).
              Chase overdue invoices or delay a payment before then.{" "}
              <Link href="/finance/invoices" className="underline underline-offset-2 hover:text-white">
                Open invoices
              </Link>
            </span>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard label="Cash today" value={formatKES(forecast.startCashKES)} hint="Active company accounts" icon={<Landmark className="h-4 w-4 text-slate-400" />} />
          <SummaryCard label="Expected in" value={formatKES(inflow)} hint={includePipeline ? "Invoices, subscriptions + pipeline" : "Invoices and subscriptions"} icon={<ArrowDownRight className="h-4 w-4 text-emerald-400" />} tone="text-emerald-300" />
          <SummaryCard label="Known out" value={formatKES(forecast.totals.outflowKES)} hint="Vendor bills and scheduled expenses" icon={<ArrowUpRight className="h-4 w-4 text-rose-400" />} tone="text-rose-300" />
          <SummaryCard
            label="Lowest cash"
            value={formatKES(cashOf(lowest))}
            hint={`Week of ${shortDate(lowest.start)}`}
            icon={cashOf(lowest) < 0 ? <TrendingDown className="h-4 w-4 text-rose-400" /> : <TrendingUp className="h-4 w-4 text-emerald-400" />}
            tone={cashOf(lowest) < 0 ? "text-rose-300" : "text-white"}
          />
        </div>

        {/* Chart */}
        <div className="liquid-glass p-5 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-white">Week by week</h2>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input type="checkbox" checked={includePipeline} onChange={(e) => setIncludePipeline(e.target.checked)} className="h-3.5 w-3.5" />
              Include weighted pipeline
            </label>
          </div>

          <div className="grid grid-cols-8 gap-2">
            {forecast.weeks.map((w) => {
              const inAmount = w.inflowConfirmedKES + (includePipeline ? w.inflowPipelineKES : 0);
              const cash = cashOf(w);
              const active = w.index === selected;
              return (
                <button
                  key={w.index}
                  type="button"
                  onClick={() => setSelected(w.index)}
                  className={`flex flex-col items-center gap-2 p-1.5 rounded-xl border transition cursor-pointer ${
                    active ? "border-indigo-400/60 bg-indigo-500/10" : "border-transparent hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-end gap-1 h-28 w-full justify-center">
                    <div
                      className="w-3 sm:w-4 rounded-t bg-emerald-500/80"
                      style={{ height: `${Math.max(inAmount ? 4 : 0, (inAmount / maxBar) * 100)}%` }}
                      title={`In: ${formatKES(inAmount)}`}
                    />
                    <div
                      className="w-3 sm:w-4 rounded-t bg-rose-500/80"
                      style={{ height: `${Math.max(w.outflowKES ? 4 : 0, (w.outflowKES / maxBar) * 100)}%` }}
                      title={`Out: ${formatKES(w.outflowKES)}`}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">{shortDate(w.start)}</div>
                  <div className={`text-[10px] sm:text-[11px] font-mono font-bold ${cash < 0 ? "text-rose-300" : "text-slate-100"}`}>
                    {Math.abs(cash) >= 1_000_000 ? `${(cash / 1_000_000).toFixed(1)}M` : `${Math.round(cash / 1000)}k`}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500/80" /> Money in</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-rose-500/80" /> Money out</span>
            <span>Number under each week = projected cash at the end of it</span>
          </div>
        </div>

        {/* Selected week detail */}
        <div className="liquid-glass p-5 rounded-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white">
              {shortDate(week.start)} – {shortDate(week.end)}
            </h2>
            <span className="text-xs text-slate-400">
              Cash at week end: <span className={`font-mono font-bold ${cashOf(week) < 0 ? "text-rose-300" : "text-white"}`}>{formatKES(cashOf(week))}</span>
            </span>
          </div>

          {week.items.filter((i) => includePipeline || i.kind !== "pipeline").length === 0 ? (
            <p className="text-xs text-slate-500">Nothing expected this week.</p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {week.items
                .filter((i) => includePipeline || i.kind !== "pipeline")
                .map((item, idx) => {
                  const out = item.kind === "vendor" || item.kind === "expense";
                  return (
                    <div key={`${item.label}-${idx}`} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{item.label}</div>
                        <div className="text-[11px] text-slate-500">
                          <span className={KIND_TONE[item.kind]}>{KIND_LABEL[item.kind]}</span> · {shortDate(item.date)}
                          {item.note ? ` · ${item.note}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-mono font-bold ${out ? "text-rose-300" : "text-emerald-300"}`}>
                          {out ? "−" : "+"}
                          {formatKES(item.amountKES)}
                        </div>
                        {item.fullKES !== item.amountKES && <div className="text-[10px] text-slate-500">of {formatKES(item.fullKES)}</div>}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Honest assumptions */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-300">How this is worked out</p>
            <p>
              Invoices not yet due count at 90% (70% if still a draft); overdue ones at 60% (up to two weeks late) or 35%. Active
              subscriptions are invoiced on their billing date and counted at 90%, paid 7 days later. Pipeline deals count at their win
              probability, 14 days after their target close date.
            </p>
            <p>
              Money out only includes vendor subscriptions and expenses marked <em>Scheduled</em>. Salaries, tax and other costs
              aren&apos;t included unless you schedule them, so treat the low point as a best case.
            </p>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  icon,
  tone = "text-white",
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        {icon}
      </div>
      <div className={`text-lg font-black font-mono ${tone}`}>{value}</div>
      <div className="text-[10px] text-slate-500">{hint}</div>
    </div>
  );
}
