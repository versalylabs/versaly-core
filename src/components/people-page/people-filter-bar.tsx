"use client";

import { Search } from "lucide-react";

import type { PeopleModel } from "./use-people";

export function PeopleFilterBar({ d }: { d: PeopleModel }) {
  const { setSelectedTag, selectedTag, people, allTags, searchQuery, setSearchQuery } = d;
  return (
    <>
      {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedTag("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                selectedTag === "ALL"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              All Stakeholders ({people.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  selectedTag === tag
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, title, organization, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
    </>
  );
}
