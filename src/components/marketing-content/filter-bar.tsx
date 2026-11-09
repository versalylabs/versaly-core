"use client";

import { Search } from "lucide-react";
import { CHANNELS } from "./helpers";
import type { MarketingContentModel } from "./use-marketing-content";

export function FilterBar({ d }: { d: MarketingContentModel }) {
  const { searchQuery, setSearchQuery, selectedChannel, setSelectedChannel, selectedProduct, setSelectedProduct, productOptions, selectedStatus, setSelectedStatus } = d;
  return (
    <>
      {/* Filter and Channel Selector */}
        <div className="liquid-glass p-3 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts, hooks, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Channel Filter */}
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Social Channels</option>
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>

            {/* Product Filter */}
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Products</option>
              {productOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
              <option value="Drafting">Drafting</option>
              <option value="Idea">Idea</option>
            </select>
          </div>
        </div>
    </>
  );
}
