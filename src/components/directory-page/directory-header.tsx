"use client";

import { Plus } from "lucide-react";

import type { DirectoryModel } from "./use-directory";

export function DirectoryHeader({ d }: { d: DirectoryModel }) {
  const { openAddModal } = d;
  return (
    <>
      {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Core Directory
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Relational Graph Active</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Organizations & People Directory
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              One canonical record per business/client. Every lead, deal, project, task, document, and invoice links back to this relational hub.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Organization</span>
            </button>
          </div>
        </div>
    </>
  );
}
