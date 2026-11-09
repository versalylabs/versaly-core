"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Lightbulb, X } from "lucide-react";

export interface SuggestedAction {
  title: string;
  why: string;
  page: string;
  pageLabel: string;
  draft: string;
}

/**
 * A step the assistant proposes. Nothing happens until the person opens the page
 * and does it themselves; the assistant never acts on its own.
 */
export function SuggestionCard({ suggestion }: { suggestion: SuggestedAction }) {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  if (dismissed) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(suggestion.draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the text is still on screen to select */
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-3.5 space-y-2.5">
      <div className="flex items-start gap-2.5">
        <Lightbulb className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Suggested step · you decide</div>
          <div className="text-sm font-semibold text-white mt-0.5">{suggestion.title}</div>
          {suggestion.why && <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{suggestion.why}</p>}
        </div>
        <button onClick={() => setDismissed(true)} className="p-1 rounded-md text-slate-500 hover:text-white transition" title="Dismiss">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {suggestion.draft && (
        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Draft message</div>
          <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">{suggestion.draft}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={suggestion.page}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-xs font-semibold text-white transition"
        >
          Open {suggestion.pageLabel}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
        {suggestion.draft && (
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy draft"}
          </button>
        )}
      </div>
    </div>
  );
}
