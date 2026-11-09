"use client";

import { CheckCircle2 } from "lucide-react";

import type { FinanceOverviewModel } from "./use-finance-overview";

export function FinanceToast({ d }: { d: FinanceOverviewModel }) {
  const { toastMessage } = d;
  return (
    <>
      {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 text-white shadow-2xl animate-in slide-in-from-bottom duration-300">
            <CheckCircle2 className="w-5 h-5 text-indigo-100" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}
    </>
  );
}
