"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";



export function WorkspaceHeader() {

  return (
    <>
      {/* Header Banner with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Personal Executive Cockpit
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">What Do I Need To Do Today?</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              My Workspace
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Your personal operational focus: assigned implementation projects, daily outreach queues, upcoming client meetings, and items waiting for your approval.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition"
            >
              <span>View Company Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
    </>
  );
}
