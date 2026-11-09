"use client";

import { Megaphone, DollarSign, Share2, Flame } from "lucide-react";
import Link from "next/link";

import type { MarketingOverviewModel } from "./use-marketing-overview";

export function OverviewHeader({ d }: { d: MarketingOverviewModel }) {
  const { setShowQuickSpendModal, setShowQuickPostModal } = d;
  return (
    <>
      {/* Top Header & Quick Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Marketing Engine
              </span>
              <span className="text-xs text-slate-500">Launch Growth & Ad Spend</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-rose-500" />
              <span>Marketing Command Center</span>
            </h1>
            <p className="text-xs text-slate-400">
              Track billboard investments, high-converting digital campaigns, daily social media cadence, and CAC attribution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowQuickSpendModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition shadow-sm"
            >
              <DollarSign className="h-4 w-4" />
              <span>+ Log Ad Spend</span>
            </button>
            <button
              onClick={() => setShowQuickPostModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition shadow-sm"
            >
              <Share2 className="h-4 w-4" />
              <span>+ Draft Daily Post</span>
            </button>
            <Link
              href="/marketing/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition"
            >
              <Flame className="h-4 w-4" />
              <span>Campaigns Overview</span>
            </Link>
          </div>
        </div>
    </>
  );
}
