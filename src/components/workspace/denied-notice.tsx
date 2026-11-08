"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

function Inner() {
  const params = useSearchParams();
  const denied = params.get("denied");
  if (!denied) return null;

  // Only show the path, never anything that could be markup
  const page = denied.startsWith("/") ? denied.slice(0, 80) : "that page";
  return (
    <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
      <Lock className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
      <span>
        You don&apos;t have access to <span className="font-mono">{page}</span>. If you need it, ask the owner to change your role.
      </span>
    </div>
  );
}

/** Shown on the dashboard when someone was turned away from a page their role can't open. */
export function DeniedNotice() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
