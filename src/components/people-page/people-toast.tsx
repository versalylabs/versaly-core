"use client";

import { CheckCircle2 } from "lucide-react";

import type { PeopleModel } from "./use-people";

export function PeopleToast({ d }: { d: PeopleModel }) {
  const { toastMessage } = d;
  return (
    <>
      {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
    </>
  );
}
