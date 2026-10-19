"use client";

import { useState } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  queryInternalKnowledge,
  AssistantAnswer,
} from "@/lib/grounded-rag";
import {
  Sparkles,
  Search,
  ShieldCheck,
  ExternalLink,
  Lightbulb,
  Send,
} from "lucide-react";

export default function AssistantPage() {
  const [inputQuery, setInputQuery] = useState("");
  const [currentQuery, setCurrentQuery] = useState("Which invoices are overdue and what projects have blockers?");
  const [result, setResult] = useState<AssistantAnswer>(() =>
    queryInternalKnowledge("Which invoices are overdue and what projects have blockers?")
  );
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    "Which client invoices are currently overdue?",
    "What onboarding projects have active blockers?",
    "What is the pricing, setup fee, and guarantee for Adversoft?",
    "Show me the SOP for Melio RMS KRA eTIMS integration",
    "What are our active sales pipeline conversion stages?",
    "What was decided in ADR 001 regarding the database?",
  ];

  const handleAsk = (queryToRun: string) => {
    if (!queryToRun.trim()) return;
    setIsLoading(true);
    setCurrentQuery(queryToRun);
    setTimeout(() => {
      const answer = queryInternalKnowledge(queryToRun);
      setResult(answer);
      setIsLoading(false);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(inputQuery);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Internal AI Copilot (Read-Only RAG)
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3 w-3" />
              100% Grounded in Versaly Core Data
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            Operational Assistant & Grounded Search
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Ask natural-language questions across products, deals, clients, onboarding blockers, invoices, and verified SOPs with explicit citations and zero hallucination.
          </p>
        </div>

        {/* Natural Language Query Bar */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ask anything about clients, overdue balances, project blockers, or SOPs..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="absolute right-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <span>{isLoading ? "Querying..." : "Search"}</span>
              <Send className="h-3 w-3" />
            </button>
          </div>
        </form>

        {/* Suggested Quick Queries */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            Try asking:
          </span>
          {samplePrompts.map((prompt) => (
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

        {/* Answer Canvas */}
        <div className="space-y-6">
          {/* Main Grounded Answer Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Query:</span>
                <span className="text-xs font-bold text-indigo-300 font-mono">
                  &ldquo;{currentQuery}&rdquo;
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Confidence: {Math.round(result.confidenceScore * 100)}%
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Pre-Retrieval RBAC: VERIFIED
                </span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Executive Summary
              </div>
              <div className="text-xs text-slate-200 leading-relaxed font-medium">
                {result.summary}
              </div>
            </div>

            {/* Direct Answer Details */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Grounded Internal Findings
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line space-y-2">
                {result.directAnswer}
              </div>
            </div>

            {/* Strategic Recommendation */}
            {result.recommendation && (
              <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/20 text-xs flex items-start gap-3">
                <Lightbulb className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-300 uppercase text-[10px] tracking-wider">
                    Recommended Operational Next Step
                  </div>
                  <div className="text-slate-300 leading-relaxed">
                    {result.recommendation}
                  </div>
                </div>
              </div>
            )}

            {/* Explicit Citations & Evidence Trail */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Verified Internal Citations ({result.citations.length})</span>
                <span className="text-[10px] text-slate-500">Zero Hallucination Anchor</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.citations.map((cite, idx) => (
                  <Link
                    key={idx}
                    href={cite.linkUrl}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 hover:bg-slate-800/30 transition block group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                        {cite.sourceType}
                      </span>
                      <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-indigo-400 transition" />
                    </div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white transition line-clamp-1">
                      {cite.title}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {cite.snippet}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
