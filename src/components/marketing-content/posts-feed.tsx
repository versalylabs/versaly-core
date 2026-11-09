"use client";

import { Share2, Plus, Edit2, Trash2, Calendar, Copy, Eye, MessageSquare, BarChart2, Send } from "lucide-react";

import type { MarketingContentModel } from "./use-marketing-content";

export function PostsFeed({ d }: { d: MarketingContentModel }) {
  const { filteredPosts, openAddModal, openEditModal, handleDelete, handleCopyText, copiedId, openMetricsModal, handlePublishNow } = d;
  return (
    <>
      {/* Posts Feed Grid */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="liquid-glass p-12 text-center rounded-2xl border border-slate-800/80 space-y-3">
              <Share2 className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Content Pieces Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No posts match the current filter. Draft your daily piece to maintain your publishing streak.
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition"
              >
                <Plus className="h-4 w-4" />
                <span>Draft Daily Post</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="liquid-glass rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition p-5 space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {post.product}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                          {post.contentType}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            post.status === "Published"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : post.status === "Scheduled"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {post.status}
                        </span>
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit Post"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete Post"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Headline */}
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {post.date} at {post.timeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Copy Box with Quick Copy */}
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 relative group/copy">
                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-4">
                        {post.copy}
                      </p>
                      <button
                        onClick={() => handleCopyText(post.id, post.copy)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shadow-sm opacity-80 group-hover/copy:opacity-100 flex items-center gap-1 text-[10px]"
                        title="Copy text to clipboard"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedId === post.id ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Target Channels */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {post.channels.map((ch) => (
                        <span
                          key={ch}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 text-sky-400 border border-slate-700/60"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Engagement / Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2">
                    {post.status === "Published" ? (
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1 text-white">
                            <Eye className="h-3.5 w-3.5 text-sky-400" />
                            {post.engagement?.views || 0} views
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {post.engagement?.inquiries || 0} inquiries
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openMetricsModal(post)}
                          className="px-2 py-0.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer"
                          title="Manually log actual impressions & messages"
                        >
                          <BarChart2 className="h-3 w-3 text-sky-400" />
                          <span>Log Stats</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                          Ready for scheduled release
                        </span>
                        <button
                          type="button"
                          onClick={() => openMetricsModal(post)}
                          className="text-[10px] text-slate-400 hover:text-sky-300 font-medium underline cursor-pointer"
                          title="Pre-set results"
                        >
                          (Set stats)
                        </button>
                      </div>
                    )}

                    {post.status !== "Published" && (
                      <button
                        onClick={() => handlePublishNow(post.id)}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Send className="h-3 w-3" />
                        <span>Publish Now</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  );
}
