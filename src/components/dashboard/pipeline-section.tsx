"use client";

import { Target, ArrowRight, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";
import { STAGE_STYLE } from "./helpers";
import type { DashboardModel } from "./use-dashboard";

export function PipelineSection({ d }: { d: DashboardModel }) {
  const { activeSection, pipeline, followUpsDue, openWhatsAppModal } = d;
  return (
    <>
      {/* ========================================================================= */}
        {/* SECTION 3: PIPELINE METRICS                                               */}
        {/* ========================================================================= */}
        {(activeSection === "ALL" || activeSection === "PIPELINE") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    3. Pipeline Metrics (Future Revenue & Stalling Analysis)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Weighted deal forecasting, stage distribution, and immediate follow-ups.
                  </p>
                </div>
              </div>
              <Link
                href="/leads"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>Pipeline Board</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Pipeline KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Total Pipeline Value</div>
                <div className="text-xl font-bold text-white mt-1">
                  KES {(pipeline.totalPipelineValueKES / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{pipeline.openDealCount} open deal{pipeline.openDealCount === 1 ? "" : "s"} (setup + first month)</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl border border-violet-500/30">
                <div className="text-[11px] font-medium text-violet-400">Weighted Pipeline</div>
                <div className="text-xl font-bold text-violet-300 mt-1">
                  KES {(pipeline.weightedPipelineValueKES / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Probability adjusted</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Deals Won This Month</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{pipeline.wonThisMonthCount}</div>
                <div className="text-[10px] text-emerald-400/90 mt-1">KES {(pipeline.wonThisMonthValueKES / 1000).toFixed(0)}k volume ({pipeline.wonCount} won overall)</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Win Rate</div>
                <div className="text-xl font-bold text-white mt-1">{pipeline.winRatePct}%</div>
                <div className="text-[10px] text-slate-500 mt-1">Won vs closed opportunities</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Average Deal Size</div>
                <div className="text-xl font-bold text-slate-200 mt-1">
                  KES {(pipeline.averageDealSizeKES / 1000).toFixed(1)}k
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Setup fee + 1st mo</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Average Time to Close</div>
                <div className="text-xl font-bold text-amber-300 mt-1">{pipeline.averageDaysToClose === null ? "—" : `${pipeline.averageDaysToClose} days`}</div>
                <div className="text-[10px] text-slate-500 mt-1">{pipeline.averageDaysToClose === null ? "Shows once a deal is won" : "From deal created to won"}</div>
              </div>
            </div>

            {/* Pipeline Stage Distribution & Follow-ups Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deals by Stage Chart */}
              <div className="liquid-glass p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Deals by Stage & Probability Forecast
                  </h3>
                  <span className="text-[10px] text-slate-400">Shows where opportunities are moving</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">
                  {pipeline.openDealCount === 0
                    ? "No open deals yet. Add one on the Leads page and it will show up here."
                    : `${pipeline.openDealCount} open deal${pipeline.openDealCount === 1 ? "" : "s"} worth KES ${Math.round(pipeline.totalPipelineValueKES / 1000)}k, about KES ${Math.round(pipeline.weightedPipelineValueKES / 1000)}k once weighted by how likely each is.`}
                </p>

                <div className="space-y-3">
                  {pipeline.dealsByStage.map((st) => {
                    const s = { ...st, ...STAGE_STYLE[st.stage] };
                    const widest = Math.max(1, ...pipeline.dealsByStage.map((x) => x.nominalValueKES));
                    return (
                    <div key={s.stage} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${s.color}`} />
                          <span className="font-semibold text-slate-200">{s.stage}</span>
                          <span className="text-[10px] text-slate-400">({s.count} deals)</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-white">
                            KES {(s.nominalValueKES / 1000).toFixed(0)}k
                          </span>
                          <span className="text-[10px] text-indigo-400 font-mono ml-2">
                            ({s.probabilityPct}% prob → KES {(s.weightedValueKES / 1000).toFixed(0)}k)
                          </span>
                        </div>
                      </div>

                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${s.color} rounded-full`}
                          style={{ width: `${(s.nominalValueKES / widest) * 100}%` }}
                        />
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Follow-ups Due Today (Immediate Action List) */}
              <div className="liquid-glass p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Follow-Ups Due ({followUpsDue.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Immediate Sales To-Do
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">
                  Prospects awaiting your follow-up after demos, proposals, or WhatsApp reviews
                </p>

                <div className="space-y-2.5">
                  {followUpsDue.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                      Nothing is waiting: no deal in demo, proposal or negotiation has been quiet for 3 days or more.
                    </div>
                  ) : (
                    followUpsDue.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{item.business}</span>
                            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                              {item.product}
                            </span>
                            <span className="text-[10px] text-amber-400 font-mono">{item.daysWaiting}d waiting</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.context}</p>
                        </div>

                        <button
                          onClick={() => openWhatsAppModal(item)}
                          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition shrink-0"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
