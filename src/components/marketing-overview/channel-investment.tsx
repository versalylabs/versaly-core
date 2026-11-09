"use client";

import { MapPin, ArrowRight, DollarSign, Sparkles, Share2, Plus } from "lucide-react";
import Link from "next/link";

import type { MarketingOverviewModel } from "./use-marketing-overview";

export function ChannelInvestment({ d }: { d: MarketingOverviewModel }) {
  const { campaigns, channelBreakdown, totalSpent, setShowQuickSpendModal, posts, handlePublishPost, setShowQuickPostModal } = d;
  return (
    <>
      {/* Channel Investment & Billboard Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Billboard / Outdoor High-Impact Card (1 col) */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Billboard & Outdoor</h3>
                  <p className="text-[10px] text-slate-400">Outdoor corridors & site presence</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                campaigns.some(c => c.channel === "Billboard")
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-800 text-slate-500"
              }`}>
                {campaigns.filter(c => c.channel === "Billboard").length} Sites
              </span>
            </div>

            {campaigns.filter(c => c.channel === "Billboard").length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
                <MapPin className="h-6 w-6 text-slate-600 mx-auto" />
                <p>No billboard sites active yet.</p>
                <Link
                  href="/marketing/campaigns"
                  className="text-rose-400 hover:underline text-[11px] font-semibold inline-block"
                >
                  + Launch billboard campaign
                </Link>
              </div>
            ) : (
              campaigns
                .filter(c => c.channel === "Billboard")
                .map((camp) => (
                  <div key={camp.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-white font-semibold">
                      <span>{camp.locationDetails || camp.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        KES {camp.totalSpend.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {camp.notes || camp.targetAudience}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                      <span>Est. {camp.impressions.toLocaleString()} views</span>
                      <span>{camp.leadsGenerated} leads</span>
                    </div>
                  </div>
                ))
            )}

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Total Outdoor Investment:</span>
              <span className="font-bold text-white font-mono">
                KES {(channelBreakdown["Billboard / Outdoor"] || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Spend by Channel Chart / Breakdown (1 col) */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Investment by Channel</h3>
                <p className="text-[10px] text-slate-400">Outdoor vs Digital allocations</p>
              </div>
              <Link
                href="/marketing/spend"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold"
              >
                <span>Ledger</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {totalSpent === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
                <DollarSign className="h-6 w-6 text-slate-600 mx-auto" />
                <p>No ad spend recorded yet.</p>
                <button
                  onClick={() => setShowQuickSpendModal(true)}
                  className="text-emerald-400 hover:underline text-[11px] font-semibold"
                >
                  + Log first ad expense
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {[
                  { name: "Billboard / Outdoor", amount: channelBreakdown["Billboard / Outdoor"] || 0, color: "bg-rose-500" },
                  { name: "Meta Ads", amount: channelBreakdown["Meta Ads"] || 0, color: "bg-blue-500" },
                  { name: "Google Ads", amount: channelBreakdown["Google Ads"] || 0, color: "bg-amber-500" },
                  { name: "TikTok Ads", amount: channelBreakdown["TikTok Ads"] || 0, color: "bg-pink-500" },
                  { name: "Print & Banners", amount: channelBreakdown["Print & Banners"] || 0, color: "bg-emerald-500" },
                ]
                  .filter((c) => c.amount > 0)
                  .map((c) => {
                    const pct = totalSpent > 0 ? ((c.amount / totalSpent) * 100).toFixed(1) : "0";
                    return (
                      <div key={c.name} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="font-medium text-white">{c.name}</span>
                          <span className="font-mono text-slate-400">
                            KES {c.amount.toLocaleString()} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`${c.color} h-1.5 rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Track ad spend across all channels in real time to calculate customer acquisition costs.
              </span>
            </div>
          </div>

          {/* Today's Social Content Cadence (1 col) */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Daily Social Cadence</h3>
                <p className="text-[10px] text-slate-400">Post daily on social media</p>
              </div>
              <Link
                href="/marketing/content"
                className="text-[11px] text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 font-semibold"
              >
                <span>Calendar</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {posts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800 space-y-1">
                  <Share2 className="h-6 w-6 text-slate-600 mx-auto mb-1" />
                  <p>No social posts scheduled yet.</p>
                </div>
              ) : (
                posts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-white line-clamp-1">
                        {post.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          post.status === "Published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : post.status === "Scheduled"
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {post.copy}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        {post.channels.map((ch) => (
                          <span key={ch} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {ch}
                          </span>
                        ))}
                      </div>
                      {post.status !== "Published" ? (
                        <button
                          onClick={() => handlePublishPost(post.id)}
                          className="px-2 py-0.5 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition text-[10px] font-semibold"
                        >
                          Publish Now
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-mono">
                          {post.engagement.views} views
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowQuickPostModal(true)}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Draft Next Piece</span>
            </button>
          </div>
        </div>
    </>
  );
}
