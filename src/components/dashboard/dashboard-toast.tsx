"use client";

import { CheckCircle2 } from "lucide-react";

import type { DashboardModel } from "./use-dashboard";

export function DashboardToast({ d }: { d: DashboardModel }) {
  const { toastMessage } = d;
  return (
    <>
      {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
    </>
  );
}
