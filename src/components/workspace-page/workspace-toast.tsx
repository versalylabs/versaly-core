"use client";

import { CheckCircle2 } from "lucide-react";

import type { MyWorkspaceModel } from "./use-my-workspace";

export function WorkspaceToast({ d }: { d: MyWorkspaceModel }) {
  const { toastMessage } = d;
  return (
    <>
      {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-indigo-300 text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
    </>
  );
}
