"use client";

import { useState } from "react";
import Link from "next/link";
import { queryInternalKnowledge, type AssistantAnswer } from "@/lib/grounded-rag";
import { loadWorkspaceData } from "@/lib/workspace-data";
import type { Role } from "@/lib/current-user";
import { Sparkles, Search, ExternalLink, Lightbulb, Send } from "lucide-react";

const SAMPLE_PROMPTS = [
  "Which client invoices are currently overdue?",
  "What onboarding projects have active blockers?",
  "What is the pricing, setup fee, and guarantee for Semplo?",
  "Show me the SOP for Melio RMS KRA eTIMS integration",
  "What are our active sales pipeline conversion stages?",
  "What was decided in ADR 001 regarding the database?",
];

/**
 * The original keyword lookup. It works without any AI service, so it stays as
 * the fallback while no Anthropic key is set. It runs in the browser on the
 * data already on this device, using the signed-in person's role.
 */
export function KeywordAssistant({ role }: { role: Role }) {
  const [inputQuery, setInputQuery] = useState("");
  const [currentQuery, setCurrentQuery] = useState("Which invoices are overdue and what projects have blockers?");
  const [result, setResult] = useState<AssistantAnswer>(() =>
    queryInternalKnowledge("Which invoices are overdue and what projects have blockers?", role, loadWorkspaceData())
  );

  const handleAsk = (query: string) => {
    if (!query.trim()) return;
    setCurrentQuery(query);
    setResult(queryInternalKnowledge(query, role, loadWorkspaceData()));
  };

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(inputQuery);
        }}
        className="relative"
      >
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Look up clients, overdue balances, project blockers, or SOPs…"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl focus:ring-1 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="absolute right-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-1.5"
          >
            <span>Search</span>
            <Send className="h-3 w-3" />
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0">Try:</span>
        {SAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              setInputQuery(prompt);
              handleAsk(prompt);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 whitespace-nowrap transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-5">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-400">Query:</span>
          <span className="text-xs font-bold text-indigo-300 font-mono">&ldquo;{currentQuery}&rdquo;</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Summary
          </div>
          <div className="text-xs text-slate-200 leading-relaxed font-medium">{result.summary}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300 leading-relaxed whitespace-pre-line">{result.directAnswer}</div>

        {result.recommendation && (
          <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/20 text-xs flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-emerald-300 uppercase text-[10px] tracking-wider">Suggested next step</div>
              <div className="text-slate-300 leading-relaxed">{result.recommendation}</div>
            </div>
          </div>
        )}

        {result.citations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.citations.map((cite, idx) => (
              <Link key={idx} href={cite.linkUrl} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 transition block group">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[9px] font-bold px-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">{cite.sourceType}</span>
                  <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-indigo-400 transition" />
                </div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-white transition line-clamp-1">{cite.title}</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{cite.snippet}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
