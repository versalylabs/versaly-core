"use client";

import Link from "next/link";
import { Flame, ChevronRight, DollarSign, Share2, Palette } from "lucide-react";



export function QuickLinks() {

  return (
    <>
      {/* Quick Links Footer to all Marketing Sections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <Link
            href="/marketing/campaigns"
            className="liquid-glass p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                  Campaigns
                </div>
                <div className="text-[10px] text-slate-400">Outdoor & Digital</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </Link>

          <Link
            href="/marketing/spend"
            className="liquid-glass p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Ad Spend Ledger
                </div>
                <div className="text-[10px] text-slate-400">Invoices & Outflows</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </Link>

          <Link
            href="/marketing/content"
            className="liquid-glass p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                  Content & Social
                </div>
                <div className="text-[10px] text-slate-400">Daily Posting Plan</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </Link>

          <Link
            href="/marketing/creatives"
            className="liquid-glass p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                  Creative & Assets
                </div>
                <div className="text-[10px] text-slate-400">Mockups & Reels</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </Link>
        </div>
    </>
  );
}
