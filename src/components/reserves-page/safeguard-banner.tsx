"use client";

import { ShieldCheck, Lock } from "lucide-react";



export function SafeguardBanner() {

  return (
    <>
      {/* MANDATORY ACCOUNTING SAFEGUARD BANNER */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm">
              <span className="font-bold text-indigo-300">ACCOUNTING SAFEGUARD:</span> Reserve allocations are internal earmarks within company vaults, NOT additional cash and NOT realized expenses. In Balance Sheet and P&L statements, these funds remain part of Total Cash and are never double-counted.
              <div className="mt-1 text-slate-400 text-xs">
                Free Operating Cash reflects cash immediately available after accounting for your internal earmarked buffers.
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
            <Lock className="w-3.5 h-3.5" />
            Zero Double-Counting
          </span>
        </div>
    </>
  );
}
