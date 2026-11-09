"use client";

import { X, BarChart2, Eye, MessageSquare } from "lucide-react";

import type { MarketingContentModel } from "./use-marketing-content";

export function MetricsModal({ d }: { d: MarketingContentModel }) {
  const { metricsPost, setMetricsPost, handleSaveMetrics, metricViews, setMetricViews, metricInquiries, setMetricInquiries, metricLikes, setMetricLikes, metricShares, setMetricShares } = d;
  return (
    <>
      {/* QUICK LOG METRICS MODAL */}
      {metricsPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="liquid-glass border border-sky-500/40 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setMetricsPost(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5" />
                <span>Manual Performance Log</span>
              </span>
              <h3 className="text-sm font-bold text-white truncate">
                {metricsPost.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                Enter the actual reach and messages generated from this post.
              </p>
            </div>

            <form onSubmit={handleSaveMetrics} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-sky-400" />
                  <span>Impressions / Total Views *</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={metricViews}
                  onChange={(e) => setMetricViews(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="e.g. 520"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Inbound Direct Messages / Leads *</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={metricInquiries}
                  onChange={(e) => setMetricInquiries(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="e.g. 3"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-[10px]">
                    Likes / Reactions
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={metricLikes}
                    onChange={(e) => setMetricLikes(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-[10px]">
                    Shares / Reposts
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={metricShares}
                    onChange={(e) => setMetricShares(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMetricsPost(null)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl font-bold bg-sky-600 hover:bg-sky-500 text-white transition shadow-md shadow-sky-600/25 cursor-pointer"
                >
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
