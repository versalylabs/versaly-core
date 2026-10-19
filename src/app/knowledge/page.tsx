"use client";

import { useState } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  KNOWLEDGE_ARTICLES,
  ARCHITECTURAL_DECISIONS,
  KnowledgeArticleSeed,
  DecisionRecordSeed,
} from "@/data/knowledge-seed";
import {
  BookOpen,
  Search,
  CheckSquare,
  ShieldCheck,
  GitBranch,
  FileCheck2,
  Copy,
  Check,
  Layers,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

type ActiveTab = "all" | "sop" | "technical" | "objections" | "adr";

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("ALL");
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticleSeed | null>(
    KNOWLEDGE_ARTICLES[0]
  );
  const [selectedADR, setSelectedADR] = useState<DecisionRecordSeed | null>(null);
  const [checkedSOPSteps, setCheckedSOPSteps] = useState<Record<string, boolean>>({});
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [conversionSuccessMsg, setConversionSuccessMsg] = useState<string | null>(null);

  // Filter articles
  const filteredArticles = KNOWLEDGE_ARTICLES.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProduct =
      selectedProduct === "ALL" || article.productSlug === selectedProduct;

    if (!matchesSearch || !matchesProduct) return false;

    if (activeTab === "all") return true;
    if (activeTab === "sop") return article.category === "SOP_PLAYBOOK";
    if (activeTab === "technical") return article.category === "TECHNICAL_RUNBOOK";
    if (activeTab === "objections") return article.category === "OBJECTION_PLAYBOOK";
    return true;
  });

  // Filter ADRs
  const filteredADRs = ARCHITECTURAL_DECISIONS.filter((adr) => {
    const matchesSearch =
      adr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adr.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adr.decision.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleChecklistStep = (stepKey: string) => {
    setCheckedSOPSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/knowledge#${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleConvertToProjectTasks = (article: KnowledgeArticleSeed) => {
    if (!article.checklists || article.checklists.length === 0) return;
    setConversionSuccessMsg(
      `✓ Exported ${article.checklists.length} SOP checklist steps as standardized tasks to Onboarding Engine!`
    );
    setTimeout(() => setConversionSuccessMsg(null), 4000);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Institutional Memory & Runbooks
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified Versaly Protocols
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-400" />
              Knowledge Base, SOPs & ADR Registry
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Central operational source of truth: technical runbooks, field checklists, sales objection playbooks, and architectural decisions (ADRs) that stop the team from solving the same problem twice.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab("adr");
                setSelectedADR(ARCHITECTURAL_DECISIONS[0]);
                setSelectedArticle(null);
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 border border-slate-700/60 transition flex items-center gap-2"
            >
              <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
              <span>View ADR Registry ({ARCHITECTURAL_DECISIONS.length})</span>
            </button>
          </div>
        </div>

        {/* Global Toast if converted */}
        {conversionSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{conversionSuccessMsg}</span>
          </div>
        )}

        {/* Navigation Tabs & Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {[
              { id: "all", label: "All Knowledge", count: KNOWLEDGE_ARTICLES.length },
              {
                id: "sop",
                label: "SOPs & Playbooks",
                count: KNOWLEDGE_ARTICLES.filter((a) => a.category === "SOP_PLAYBOOK").length,
              },
              {
                id: "technical",
                label: "Technical Runbooks",
                count: KNOWLEDGE_ARTICLES.filter((a) => a.category === "TECHNICAL_RUNBOOK").length,
              },
              {
                id: "objections",
                label: "Objection Playbooks",
                count: KNOWLEDGE_ARTICLES.filter((a) => a.category === "OBJECTION_PLAYBOOK").length,
              },
              {
                id: "adr",
                label: "Decisions (ADRs)",
                count: ARCHITECTURAL_DECISIONS.length,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as ActiveTab);
                    if (tab.id === "adr") {
                      setSelectedADR(ARCHITECTURAL_DECISIONS[0]);
                      setSelectedArticle(null);
                    } else {
                      setSelectedADR(null);
                      if (!selectedArticle) setSelectedArticle(KNOWLEDGE_ARTICLES[0]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-indigo-700/80 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Product Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search runbooks, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {activeTab !== "adr" && (
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                aria-label="Filter knowledge articles by product"
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Products</option>
                <option value="adversoft">Adversoft</option>
                <option value="vehisoft">Vehisoft</option>
                <option value="versandry">Versandry</option>
                <option value="lipatim">LipaTim</option>
                <option value="melio-rms">Melio RMS</option>
              </select>
            )}
          </div>
        </div>

        {/* Two-Pane Knowledge Explorer */}
        {activeTab === "adr" ? (
          /* Architectural Decision Records (ADRs) View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left list of ADRs */}
            <div className="lg:col-span-4 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                Decisions Log ({filteredADRs.length})
              </div>
              {filteredADRs.map((adr) => {
                const isSelected = selectedADR?.id === adr.id;
                return (
                  <div
                    key={adr.id}
                    onClick={() => setSelectedADR(adr)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-950/30 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        ADR #{adr.adrNumber.toString().padStart(3, "0")}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {adr.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-200 line-clamp-1">{adr.title}</div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {adr.context}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{adr.productName || "Core System"}</span>
                      <span>{adr.decidedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right ADR Detail Pane */}
            <div className="lg:col-span-8">
              {selectedADR ? (
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          ADR #{selectedADR.adrNumber.toString().padStart(3, "0")}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {selectedADR.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Decided on {selectedADR.decidedAt} by {selectedADR.decidedBy}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white tracking-tight">{selectedADR.title}</h2>
                    </div>
                  </div>

                  {/* Context */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
                      1. Context & Business Problem
                    </h3>
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs text-slate-300 leading-relaxed">
                      {selectedADR.context}
                    </div>
                  </div>

                  {/* Decision */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      2. Architectural Decision Taken
                    </h3>
                    <div className="p-3.5 rounded-xl bg-emerald-950/15 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed font-mono">
                      {selectedADR.decision}
                    </div>
                  </div>

                  {/* Consequences */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-amber-400" />
                      3. Operational & System Consequences
                    </h3>
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs text-slate-300 leading-relaxed">
                      {selectedADR.consequences}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Select an architectural decision record to view details.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Articles, SOPs, and Runbooks View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Article Catalog */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                <span>Knowledge Articles ({filteredArticles.length})</span>
                <span className="text-[10px] lowercase text-slate-500">click to inspect</span>
              </div>

              <div className="space-y-2.5">
                {filteredArticles.map((article) => {
                  const isSelected = selectedArticle?.id === article.id;
                  const categoryBadgeColor =
                    article.category === "SOP_PLAYBOOK"
                      ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                      : article.category === "TECHNICAL_RUNBOOK"
                      ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
                      : "text-amber-400 bg-amber-500/10 border-amber-500/20";

                  return (
                    <div
                      key={article.id}
                      onClick={() => {
                        setSelectedArticle(article);
                        setSelectedADR(null);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-950/30 border-indigo-500/50 shadow-lg ring-1 ring-indigo-500/30"
                          : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${categoryBadgeColor}`}
                        >
                          {article.category.replace("_", " ")}
                        </span>
                        {article.productName && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded">
                            {article.productName}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-bold text-slate-100 group-hover:text-indigo-200 transition-colors line-clamp-1">
                        {article.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <CheckSquare className="h-3 w-3 text-indigo-400" />
                          <span>
                            {article.checklists ? `${article.checklists.length} step checklist` : "Standard doc"}
                          </span>
                        </div>
                        <span className="text-slate-500">v{article.version}.0 • {article.updatedAt}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredArticles.length === 0 && (
                  <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-500">
                    No runbooks match your search criteria.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Active Document Viewer & Interactive SOP Checklist */}
            <div className="lg:col-span-7">
              {selectedArticle ? (
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-6">
                  {/* Article Metadata Header */}
                  <div className="space-y-3 pb-5 border-b border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {selectedArticle.category.replace("_", " ")}
                        </span>
                        {selectedArticle.productName && (
                          <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded">
                            {selectedArticle.productName}
                          </span>
                        )}
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(selectedArticle.slug)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition flex items-center gap-1"
                        >
                          {copiedSlug === selectedArticle.slug ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <h2 className="text-lg font-extrabold text-white tracking-tight">
                      {selectedArticle.title}
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {selectedArticle.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Author: <strong className="text-slate-300 font-medium">{selectedArticle.authorName}</strong></span>
                      <span>•</span>
                      <span>Version: <strong className="text-slate-300 font-medium">v{selectedArticle.version}.0</strong></span>
                      <span>•</span>
                      <span>Next Review: <strong className="text-slate-300 font-medium">{selectedArticle.nextReviewDate}</strong></span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {selectedArticle.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SOP Checklist Engine (if checklists exist) */}
                  {selectedArticle.checklists && selectedArticle.checklists.length > 0 && (
                    <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-indigo-400" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                            Actionable SOP Checklist ({selectedArticle.checklists.length} Steps)
                          </h3>
                        </div>

                        <button
                          onClick={() => handleConvertToProjectTasks(selectedArticle)}
                          className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold tracking-wide transition flex items-center gap-1.5"
                        >
                          <FileCheck2 className="h-3 w-3 text-indigo-400" />
                          <span>Convert to Project Tasks</span>
                        </button>
                      </div>

                      <div className="space-y-2 mt-2">
                        {selectedArticle.checklists.map((step) => {
                          const key = `${selectedArticle.id}-${step.stepOrder}`;
                          const isDone = !!checkedSOPSteps[key];
                          return (
                            <div
                              key={step.stepOrder}
                              onClick={() => toggleChecklistStep(key)}
                              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                                isDone
                                  ? "bg-emerald-950/20 border-emerald-500/30 text-slate-300"
                                  : "bg-slate-900/60 border-slate-800/70 hover:border-slate-700 text-slate-200"
                              }`}
                            >
                              <div
                                className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                                  isDone
                                    ? "bg-emerald-500 text-slate-950"
                                    : "border border-slate-600 hover:border-slate-500"
                                }`}
                              >
                                {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>

                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`font-bold ${isDone ? "line-through text-slate-400" : "text-slate-100"}`}>
                                    Step {step.stepOrder}: {step.title}
                                  </span>
                                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                    {step.roleScope}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Markdown Content Viewer */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Standard Documentation & Operational Guidance
                    </h3>
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans space-y-3 whitespace-pre-line">
                      {selectedArticle.contentMarkdown}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Select an article to review its full guidelines and SOP checklist.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
