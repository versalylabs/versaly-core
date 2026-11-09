"use client";

import { Flame, X } from "lucide-react";
import { SCORECARD_ROWS } from "@/lib/dashboard-data";
import Link from "next/link";

import type { DashboardModel } from "./use-dashboard";

export function FridayReview({ d }: { d: DashboardModel }) {
  const { isFridayReview, handleSaveFridayScorecard, setIsFridayReview, catalogProducts, fridayScorecard, setFridayScorecard } = d;
  return (
    <>
      {/* Friday 20-Min Review Spotlight Banner & Scorecard */}
        {isFridayReview && (
          <div className="liquid-glass p-6 rounded-2xl border border-amber-500/40 text-xs animate-in slide-in-from-top-2 duration-200 space-y-5">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-amber-500/20">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-extrabold text-amber-300 text-sm flex items-center gap-2">
                    <span>Friday Weekly Review (17:00, 30 Minutes)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                      Executive Scorecard
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    Fill this in every Friday at 17:00 across all 4 core products to calibrate conversion, eliminate lead bottlenecks, and audit client delivery.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveFridayScorecard}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition shadow-sm"
                >
                  Save Scorecard
                </button>
                <button
                  type="button"
                  onClick={() => setIsFridayReview(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Dynamic Product Scorecard Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/60">
                    <th className="p-3">Weekly Review Question</th>
                    {catalogProducts.map((cp) => (
                      <th key={cp.slug} className="p-3 text-center text-indigo-400 whitespace-nowrap">
                        {cp.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {SCORECARD_ROWS.map((row) => (
                    <tr key={row.key}>
                      <td className="p-3 font-medium text-slate-200">{row.label}</td>
                      {catalogProducts.map((cp) => (
                        <td key={cp.slug} className="p-2 text-center">
                          <input
                            type="text"
                            value={fridayScorecard[row.key]?.[cp.slug] || "0"}
                            onChange={(e) =>
                              setFridayScorecard((p) => ({
                                ...p,
                                [row.key]: {
                                  ...p[row.key],
                                  [cp.slug]: e.target.value,
                                },
                              }))
                            }
                            className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* The 3 Core Diagnostic Questions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                  Question 1: Where are leads getting stuck?
                </span>
                <span className="text-[10px] text-slate-400 italic block">
                  Few replies → fix message. Few demos → fix free check. Few sales → fix offer/price.
                </span>
                <textarea
                  rows={3}
                  value={fridayScorecard.leadsStuckNotes}
                  onChange={(e) =>
                    setFridayScorecard((p) => ({ ...p, leadsStuckNotes: e.target.value }))
                  }
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                  Question 2: What one change will I test next week?
                </span>
                <span className="text-[10px] text-slate-400 italic block">
                  Iterate on a specific outreach script, diagnostic deliverable, or demo angle.
                </span>
                <textarea
                  rows={3}
                  value={fridayScorecard.oneChangeTest}
                  onChange={(e) =>
                    setFridayScorecard((p) => ({ ...p, oneChangeTest: e.target.value }))
                  }
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">
                  Question 3: Which client needs attention?
                </span>
                <span className="text-[10px] text-slate-400 italic block">
                  Identify implementation blockers, training needs, or overdue invoice accounts.
                </span>
                <textarea
                  rows={3}
                  value={fridayScorecard.clientNeedsAttention}
                  onChange={(e) =>
                    setFridayScorecard((p) => ({ ...p, clientNeedsAttention: e.target.value }))
                  }
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Link
                  href="/leads"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold transition"
                >
                  Review Pipeline Deals →
                </Link>
                <Link
                  href="/projects"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold transition"
                >
                  Check Go-Live Blockers →
                </Link>
              </div>

              <button
                type="button"
                onClick={handleSaveFridayScorecard}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md shadow-amber-500/20"
              >
                Save Friday Scorecard
              </button>
            </div>
          </div>
        )}
    </>
  );
}
