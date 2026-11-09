"use client";

import { DollarSign, Users, Sparkles, Target, TrendingUp, Zap, Share2, Calendar } from "lucide-react";

import type { MarketingOverviewModel } from "./use-marketing-overview";

export function MetricCards({ d }: { d: MarketingOverviewModel }) {
  const { totalSpent, totalAllocatedBudget, totalLeads, totalImpressions, totalClicks, costPerLead, totalRevenue, campaigns, roas, posts } = d;
  return (
    <>
      {/* 6 Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Card 1: Total Ad Spend */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Total Ad Invested</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">
                KES {totalSpent.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
                <span>Budget: KES {totalAllocatedBudget.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    totalAllocatedBudget > 0 ? (totalSpent / totalAllocatedBudget) * 100 : 0
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Card 2: Marketing Leads */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Marketing Leads</span>
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">{totalLeads}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {totalImpressions.toLocaleString()} views · {totalClicks} clicks
              </p>
            </div>
            <div className="text-[10px] text-indigo-400 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>High intent inbound</span>
            </div>
          </div>

          {/* Card 3: Cost Per Lead (CPL) */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Avg Cost / Lead</span>
              <Target className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">
                KES {costPerLead.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Blended digital & outdoor</p>
            </div>
            <div className="text-[10px] text-amber-400 font-medium">
              Target: &lt; KES 2,500
            </div>
          </div>

          {/* Card 4: Attributed Revenue */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Attributed Sales</span>
              <TrendingUp className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">
                KES {totalRevenue.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Closed deals from campaigns</p>
            </div>
            <div className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
              <span>{campaigns.reduce((a, b) => a + b.dealsWon, 0)} won clients</span>
            </div>
          </div>

          {/* Card 5: Blended ROAS */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Blended ROAS</span>
              <Zap className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">{roas}x</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Return on ad investment</p>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              Profitable acquisition
            </div>
          </div>

          {/* Card 6: Daily Posting Cadence */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Daily Social Posts</span>
              <Share2 className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">
                {posts.filter((p) => p.status === "Published").length} / {posts.length}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Published pieces</p>
            </div>
            <div className="text-[10px] text-sky-400 font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Daily rhythm active</span>
            </div>
          </div>
        </div>
    </>
  );
}
