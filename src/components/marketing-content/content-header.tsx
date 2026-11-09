"use client";

import { Share2, Trash2, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

import type { MarketingContentModel } from "./use-marketing-content";

export function ContentHeader({ d }: { d: MarketingContentModel }) {
  const { posts, handleClearAll, openAddModal } = d;
  return (
    <>
      {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Daily Social Cadence
              </span>
              <span className="text-xs text-slate-500">Organic Distribution</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Share2 className="h-6 w-6 text-sky-400" />
              <span>Content & Social Media Calendar</span>
            </h1>
            <p className="text-xs text-slate-400">
              Publish daily educational insights across LinkedIn, X/Twitter, and TikTok to attract high-intent Nairobi business owners.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {posts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 transition"
                title="Clear all social posts to start afresh"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Start Afresh</span>
              </button>
            )}
            <Link
              href="/marketing/creatives"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              <span>Creative Assets</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Draft Daily Post</span>
            </button>
          </div>
        </div>
    </>
  );
}
