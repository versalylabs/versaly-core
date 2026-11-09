"use client";

import { Clock } from "lucide-react";

import type { TasksModel } from "./use-tasks";

export function ResetInfoCard({ d }: { d: TasksModel }) {
  const { lastCycle, todayLabel } = d;
  return (
    <>
      {/* 5:00 AM Reset Automation Info Card */}
        <div className="liquid-glass p-3.5 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <span>Automated 5:00 AM Daily Reset Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Active (Cycle: {lastCycle || "Current"})
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Every morning at 5:00 AM, the queue unchecks all completed actions and automatically reloads the day&apos;s scheduled rhythm.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-mono">
              Today: {todayLabel}
            </span>
          </div>
        </div>
    </>
  );
}
