"use client";

import { Flame, CheckCircle2, Circle, Eye, MessageSquare } from "lucide-react";

import type { MarketingContentModel } from "./use-marketing-content";

export function StreakRow({ d }: { d: MarketingContentModel }) {
  const { completedDaysCount, todayItem, isTodayPosted, weekDays, isDayPosted, toggleDayTicked, stats } = d;
  return (
    <>
      {/* Daily Streak & Organic Performance Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Daily Streak Banner */}
          <div className="md:col-span-2 liquid-glass p-4 rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/20 to-slate-950/40 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Daily Publishing Streak:</span>
                    <span className="text-sky-400 font-mono">
                      {completedDaysCount} {completedDaysCount === 1 ? "Day" : "Days"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {todayItem ? (
                      <>
                        Today is <span className="font-semibold text-slate-200">{todayItem.dayName}</span> • Click any day to tick if posted
                      </>
                    ) : (
                      "Target: 1 high-value piece posted every morning"
                    )}
                  </p>
                </div>
              </div>

              <div>
                {isTodayPosted ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Posted Today</span>
                  </span>
                ) : todayItem?.isSunday ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    Sunday Rest
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 animate-pulse">
                    <Circle className="h-2.5 w-2.5" />
                    <span>Due Today</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 pt-2 border-t border-slate-800/80 text-center">
              {weekDays.map((d) => {
                const posted = isDayPosted(d);
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => toggleDayTicked(d.dateStr)}
                    title={`Click to toggle posted status for ${d.dayName} (${d.dateStr})`}
                    className={`p-1.5 rounded-lg border transition text-center cursor-pointer select-none group ${
                      d.isToday
                        ? "bg-sky-950/50 border-sky-500 ring-1 ring-sky-500/40 shadow-sm shadow-sky-500/10"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-[10px] font-bold ${d.isToday ? "text-sky-300 font-extrabold" : "text-slate-400"}`}>
                        {d.dayShort}
                      </span>
                      <span className={`text-[9px] font-mono ${d.isToday ? "text-sky-400" : "text-slate-500"}`}>
                        {d.dayNum}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-center">
                      {posted ? (
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span>Done</span>
                        </div>
                      ) : d.isToday ? (
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-sky-400 group-hover:text-sky-300">
                          <Circle className="h-2.5 w-2.5 shrink-0" />
                          <span>Today</span>
                        </div>
                      ) : d.isSunday ? (
                        <span className="text-[10px] font-semibold text-slate-500">Rest</span>
                      ) : d.isPast ? (
                        <span className="text-[10px] font-semibold text-rose-400/80">Missed</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-400/80">Sched</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Organic Views */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Organic Impressions</span>
              <Eye className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">Across LinkedIn, X & TikTok</p>
            <div className="text-[10px] text-sky-400 font-medium pt-1">
              {stats.publishedCount} published pieces logged
            </div>
          </div>

          {/* Direct Inbound Leads from Social */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Social DMs & Inquiries</span>
              <MessageSquare className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {stats.totalInquiries}
            </div>
            <p className="text-[10px] text-slate-500">Actual inquiries generated</p>
            <div className="text-[10px] text-indigo-400 font-medium pt-1">
              Zero ad cost inbound
            </div>
          </div>
        </div>
    </>
  );
}
