"use client";

import { RotateCcw, Plus } from "lucide-react";

import type { PeopleModel } from "./use-people";

export function PeopleHeader({ d }: { d: PeopleModel }) {
  const { people, handleClearAll, openAddModal } = d;
  return (
    <>
      {/* Header Banner with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Stakeholder &amp; Relationship Layer
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Multi-Entity People Intelligence</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              People &amp; Key Stakeholders
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              One individual, multiple business relationships: track decision makers, workshop managers, partners, and referrers across organizations without duplicating records.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
            {people.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                title="Clear all mock/test stakeholders to start fresh"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Start Afresh</span>
              </button>
            )}
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Stakeholder</span>
            </button>
          </div>
        </div>
    </>
  );
}
