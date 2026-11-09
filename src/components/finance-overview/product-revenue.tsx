"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatKES } from "@/lib/finance-store";

import type { FinanceOverviewModel } from "./use-finance-overview";

export function ProductRevenue({ d }: { d: FinanceOverviewModel }) {
  const { summary } = d;
  return (
    <>
      {/* Product Revenue Distribution */}
        <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Revenue by Product Suite
              </span>
              <span className="text-[11px] text-slate-400">
                Performance breakdown across Versaly vertical software systems
              </span>
            </div>
            <Link
              href="/finance/revenue"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View Subscriptions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(summary.productRevenue).map(([prod, rev]) => (
              <div key={prod} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-xs font-semibold block truncate">{prod}</span>
                <div className="text-sm font-bold text-white font-mono">
                  {formatKES(rev)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {summary.totalCollected > 0 ? Math.round((rev / summary.totalCollected) * 100) : 0}% of collections
                </div>
              </div>
            ))}
          </div>
        </div>
    </>
  );
}
