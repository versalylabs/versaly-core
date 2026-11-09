"use client";

import { longDate } from "@/lib/money";
import { todayIsoDate } from "@/lib/ids";
import { Plus, Flame } from "lucide-react";

import type { DashboardModel } from "./use-dashboard";

export function DashboardHeader({ d }: { d: DashboardModel }) {
  const { setIsNewActionModalOpen, setIsFridayReview, isFridayReview } = d;
  return (
    <>
      {/* Top Operational Bar with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Command Operations
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">{longDate(todayIsoDate())}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Versaly Executive Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live intelligence across Money, Sales Activity, Pipeline, Client Delivery, and Product Traction.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
            <button
              onClick={() => setIsNewActionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Daily Action</span>
            </button>
            <button
              onClick={() => setIsFridayReview(!isFridayReview)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-md ${
                isFridayReview
                  ? "bg-amber-500 text-slate-950 shadow-amber-500/20"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>{isFridayReview ? "Exit Review Mode" : "Friday 20-Min Review"}</span>
            </button>
          </div>
        </div>
    </>
  );
}
