"use client";



import type { DirectoryModel } from "./use-directory";

export function OrgFilters({ d }: { d: DirectoryModel }) {
  const { activeTab, setTypeFilter, typeFilter } = d;
  return (
    <>
      {/* Filters if in Organizations Tab */}
        {activeTab === "organizations" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["ALL", "CLIENT", "PROSPECT", "PARTNER", "VENDOR"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  typeFilter === type
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {type === "ALL" ? "All Types" : type}
              </button>
            ))}
          </div>
        )}
    </>
  );
}
