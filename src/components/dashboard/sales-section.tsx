"use client";

import { PhoneCall, CheckSquare, Plus, CheckCircle2 } from "lucide-react";

import type { DashboardModel } from "./use-dashboard";

export function SalesSection({ d }: { d: DashboardModel }) {
  const { activeSection, sales, queue, setIsNewActionModalOpen, openLogModal } = d;
  return (
    <>
      {/* ========================================================================= */}
        {/* SECTION 2: SALES ACTIVITY METRICS                                         */}
        {/* ========================================================================= */}
        {(activeSection === "ALL" || activeSection === "SALES") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    2. Sales Activity Metrics (Daily Operating Work)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    High-volume outreach, uncontacted separation, and demo follow-through.
                  </p>
                </div>
              </div>
              <span className="text-xs text-indigo-300 font-mono bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                Daily Goal: 100 Actions
              </span>
            </div>

            {/* Sales Activity KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="liquid-glass p-3.5 rounded-xl border border-indigo-500/30">
                <div className="text-[11px] font-medium text-slate-400">Outreach Today</div>
                <div className="text-lg font-bold text-white mt-1">
                  {sales.outreachToday}
                  <span className="text-xs text-slate-500 font-normal"> / {sales.outreachTodayTarget}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, (sales.outreachToday / sales.outreachTodayTarget) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Outreach Week</div>
                <div className="text-lg font-bold text-white mt-1">
                  {sales.outreachThisWeek}
                  <span className="text-xs text-slate-500 font-normal"> / {sales.outreachThisWeekTarget}</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1 font-medium">{Math.round((sales.outreachThisWeek / Math.max(1, sales.outreachThisWeekTarget)) * 100)}% of target</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">New Leads Added</div>
                <div className="text-lg font-bold text-slate-200 mt-1">+{sales.newLeadsAddedWeek}</div>
                <div className="text-[10px] text-slate-500 mt-1">From scrapers & field</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl border border-sky-500/20">
                <div className="text-[11px] font-medium text-sky-400 flex items-center justify-between">
                  <span>Contacted Leads</span>
                  <span className="text-[9px] text-slate-400">Pool: {sales.uncontactedPool}</span>
                </div>
                <div className="text-lg font-bold text-white mt-1">{sales.leadsContacted}</div>
                <div className="text-[10px] text-slate-400 mt-1">In active sales rhythm</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Demos Booked</div>
                <div className="text-lg font-bold text-white mt-1">{sales.demosBooked}</div>
                <div className="text-[10px] text-indigo-400 mt-1">Across 4 products</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Demos Done</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">{sales.demosCompleted}</div>
                <div className="text-[10px] text-emerald-400 mt-1 font-medium">{sales.demoCompletionRatePct}% of booked demos</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Proposals Sent</div>
                <div className="text-lg font-bold text-white mt-1">{sales.proposalsSent}</div>
                <div className="text-[10px] text-slate-500 mt-1">Pending signature</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl border border-emerald-500/30">
                <div className="text-[11px] font-medium text-emerald-400">Deals Won / Lost</div>
                <div className="text-lg font-bold text-white mt-1">
                  <span className="text-emerald-400">{sales.dealsWon}</span>
                  <span className="text-slate-600 font-normal"> / </span>
                  <span className="text-rose-400">{sales.dealsLost}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{sales.referralsReceived} referrals rcvd</div>
              </div>
            </div>

            {/* Sales Conversion Funnel & Action Queue Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Outreach Queue (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="liquid-glass p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                          Today&apos;s Outreach Action Queue
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Scheduled calls, visits, and WhatsApp pitches
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                        {queue.length} actions
                      </span>
                      <button
                        onClick={() => setIsNewActionModalOpen(true)}
                        className="p-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
                        title="Add Action"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {queue.length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                        No outreach actions queued today. Click &quot;+&quot; to queue a call, visit, or WhatsApp pitch.
                      </div>
                    ) : (
                      queue.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 transition-colors">
                                {item.business}
                              </span>
                              <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-slate-800 text-indigo-300 border border-slate-700">
                                {item.product}
                              </span>
                              {item.loggedAt && (
                                <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Logged ({item.loggedAt})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                              <span>{item.contact}</span>
                              <span>•</span>
                              <span className="text-slate-300 font-medium">{item.channel}</span>
                              {item.phone && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-slate-400">{item.phone}</span>
                                </>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                              &ldquo;{item.script}&rdquo;
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                              {item.status}
                            </span>
                            <button
                              onClick={() => openLogModal(item)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
                            >
                              Log Action
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Graphical Funnel & Loss Analysis (1 col) */}
              <div className="space-y-4">
                <div className="liquid-glass p-5 rounded-2xl">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Sales Conversion Funnel</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      {sales.contactedToWonConversionPct}% Win Rate
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4">
                    Tracking progression from uncontacted pool down to closed-won revenue
                  </p>

                  <div className="space-y-2 text-xs">
                    {/* Uncontacted Pool */}
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Uncontacted Leads Pool</span>
                      <span className="font-mono font-bold text-slate-300">{sales.uncontactedPool}</span>
                    </div>

                    {/* Contacted */}
                    <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
                      <span className="text-indigo-200">1. Leads Contacted</span>
                      <span className="font-mono font-bold text-indigo-300">{sales.leadsContacted}</span>
                    </div>

                    {/* Demos Booked */}
                    <div className="p-2 rounded-lg bg-sky-950/30 border border-sky-500/30 flex items-center justify-between">
                      <span className="text-sky-200">2. Demos Booked</span>
                      <span className="font-mono font-bold text-sky-300">{sales.demosBooked}</span>
                    </div>

                    {/* Demos Completed */}
                    <div className="p-2 rounded-lg bg-violet-950/30 border border-violet-500/30 flex items-center justify-between">
                      <span className="text-violet-200">3. Demos Completed</span>
                      <span className="font-mono font-bold text-violet-300">{sales.demosCompleted}</span>
                    </div>

                    {/* Proposals Sent */}
                    <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                      <span className="text-purple-200">4. Proposals Sent</span>
                      <span className="font-mono font-bold text-purple-300">{sales.proposalsSent}</span>
                    </div>

                    {/* Deals Won */}
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                      <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>5. Paying Deals Won</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">{sales.dealsWon}</span>
                    </div>
                  </div>

                  {/* Deals Lost Breakdown */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] font-semibold text-rose-400 flex items-center justify-between mb-2">
                      <span>Deals Lost ({sales.dealsLost})</span>
                      <span className="text-[10px] text-slate-500">Loss Diagnosis</span>
                    </div>
                    <div className="space-y-1.5">
                      {sales.lossReasons.map((lr, idx) => (
                        <div key={idx} className="p-2 rounded bg-rose-950/20 border border-rose-500/20 text-[11px]">
                          <div className="text-rose-200 font-medium">{lr.reason}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Product: {lr.product}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
