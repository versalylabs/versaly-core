"use client";

import { useState } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  INITIAL_SUPERVISED_MUTATIONS,
  SupervisedMutation,
} from "@/data/supervised-actions-seed";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Copy,
  Check,
  Plus,
} from "lucide-react";

type ActionFilter = "ALL" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export default function SupervisedActionPage() {
  const [mutations, setMutations] = useState<SupervisedMutation[]>(INITIAL_SUPERVISED_MUTATIONS);
  const [statusFilter, setStatusFilter] = useState<ActionFilter>("ALL");
  const [selectedMutation, setSelectedMutation] = useState<SupervisedMutation | null>(
    INITIAL_SUPERVISED_MUTATIONS[0] || null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // New action proposal form modal state
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const pendingCount = mutations.filter((m) => m.status === "PENDING_APPROVAL").length;
  const approvedCount = mutations.filter((m) => m.status === "APPROVED").length;

  const filteredMutations = mutations.filter((m) => {
    if (statusFilter === "ALL") return true;
    return m.status === statusFilter;
  });

  const handleApprove = (id: string) => {
    setMutations((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "APPROVED" as const } : m))
    );
    if (selectedMutation?.id === id) {
      setSelectedMutation((prev) => (prev ? { ...prev, status: "APPROVED" as const } : null));
    }
    setToastMessage("✓ Action APPROVED: Mutation validated and dispatched to operational records.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReject = (id: string) => {
    setMutations((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "REJECTED" as const } : m))
    );
    if (selectedMutation?.id === id) {
      setSelectedMutation((prev) => (prev ? { ...prev, status: "REJECTED" as const } : null));
    }
    setToastMessage("Action REJECTED: Mutation discarded with zero state modifications.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyDraft = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleSynthesizeAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsSynthesizing(true);
    setTimeout(() => {
      const newAction: SupervisedMutation = {
        id: `mut-${Date.now()}`,
        type: "DRAFT_WHATSAPP_FOLLOWUP",
        title: `AI Action: ${promptInput.slice(0, 50)}...`,
        rationale: `Synthesized from user natural language instruction: "${promptInput}"`,
        targetEntity: "Client Operations Queue",
        proposedChanges: [
          { field: "Execution State", before: "Unqueued", after: "Pending Human Sign-Off" },
          { field: "Channel", before: null, after: "WhatsApp / Direct Messaging" },
        ],
        generatedContentPreview: `AI Draft for Instruction: "${promptInput}"\n\nHello from Versaly Core. Following up regarding our agreed operational milestones. Let us know if we can assist with configuration or staff training today.`,
        status: "PENDING_APPROVAL",
        urgency: "HIGH",
        createdAt: "Just now (AI Drafted)",
      };

      setMutations([newAction, ...mutations]);
      setSelectedMutation(newAction);
      setIsSynthesizing(false);
      setShowDraftModal(false);
      setPromptInput("");
      setToastMessage("⚡ AI drafted proposed action! Review the diff below and approve to execute.");
      setTimeout(() => setToastMessage(null), 4000);
    }, 600);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                AI Co-Pilot & Action Engine
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <FileCheck2 className="h-3 w-3" />
                Human-in-the-Loop Supervised Execution
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              Supervised Action Engine & AI Co-Pilot
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              AI drafts proposals, follow-ups, and state mutations, but requires explicit human confirmation. Inspect diffs, review drafted content, and approve changes safely.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDraftModal(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Prompt AI Action</span>
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Co-Pilot Safety Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Pending Human Approval</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-2 font-mono">
              {pendingCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">Zero autonomous write mutations</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Approved & Executed Actions</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">
              {approvedCount}
            </div>
            <div className="text-[11px] text-emerald-400 mt-2">100% human-verified</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Draft Generation Speed</div>
            <div className="text-2xl font-extrabold text-white mt-2 font-mono">1.2s</div>
            <div className="text-[11px] text-slate-400 mt-2">From internal templates</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Safety Verification Tier</div>
            <div className="text-2xl font-extrabold text-indigo-300 mt-2">Level 3</div>
            <div className="text-[11px] text-slate-500 mt-2">Diff preview + audit logged</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1 border-b border-slate-800/80 pb-2 overflow-x-auto">
          {[
            { id: "ALL", label: "All Proposed Actions", count: mutations.length },
            { id: "PENDING_APPROVAL", label: "Pending Sign-off", count: pendingCount },
            { id: "APPROVED", label: "Approved / Executed", count: approvedCount },
            { id: "REJECTED", label: "Rejected", count: mutations.filter((m) => m.status === "REJECTED").length },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as ActionFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-indigo-700 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Master-Detail Action Review Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Action List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Supervised Action Queue ({filteredMutations.length})
            </div>

            <div className="space-y-2.5">
              {filteredMutations.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-500">
                  No pending AI supervised actions. Click &quot;Prompt AI Action&quot; above to draft proposals, followup messages, or tasks.
                </div>
              ) : (
                filteredMutations.map((m) => {
                  const isSelected = selectedMutation?.id === m.id;
                  const statusColor =
                    m.status === "APPROVED"
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : m.status === "REJECTED"
                      ? "text-slate-500 bg-slate-800/60 border-slate-700/60"
                      : "text-amber-400 bg-amber-500/10 border-amber-500/20";

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMutation(m)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-950/30 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30"
                          : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {m.type}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                          {m.status.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-100 line-clamp-1">{m.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {m.rationale}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="truncate max-w-[180px]">{m.targetEntity}</span>
                        <span>{m.createdAt}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Detailed Inspector & Approval Control */}
          <div className="lg:col-span-7">
            {selectedMutation ? (
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-6">
                {/* Header & Decision Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {selectedMutation.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          selectedMutation.status === "APPROVED"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : selectedMutation.status === "REJECTED"
                            ? "text-slate-500 bg-slate-800/60 border-slate-700/60"
                            : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        }`}
                      >
                        {selectedMutation.status.replace("_", " ")}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      {selectedMutation.title}
                    </h2>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Target: <strong className="text-slate-200">{selectedMutation.targetEntity}</strong>
                    </div>
                  </div>

                  {/* Approval Actions */}
                  {selectedMutation.status === "PENDING_APPROVAL" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(selectedMutation.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprove(selectedMutation.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve & Apply</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-mono font-medium text-slate-400 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      State: {selectedMutation.status}
                    </div>
                  )}
                </div>

                {/* AI Rationale */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    AI Strategic Rationale
                  </h3>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {selectedMutation.rationale}
                  </div>
                </div>

                {/* State Diff Preview */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Proposed Record Mutations (Diff Inspection)
                  </h3>
                  <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Field</th>
                          <th className="py-2.5 px-3 text-rose-400">Current Value (Before)</th>
                          <th className="py-2.5 px-3 text-emerald-400">Proposed Value (After)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-300 font-mono">
                        {selectedMutation.proposedChanges.map((change, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                              {change.field}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">
                              {change.before !== null && change.before !== undefined ? (
                                String(change.before)
                              ) : (
                                <span className="italic text-slate-600">None</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-emerald-300 font-bold">
                              + {String(change.after)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Generated Content Preview (Proposal / Script / Agenda) */}
                {selectedMutation.generatedContentPreview && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        AI Generated Collateral Preview
                      </h3>
                      <button
                        onClick={() => handleCopyDraft(selectedMutation.generatedContentPreview)}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedDraft ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied to Clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Draft</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {selectedMutation.generatedContentPreview}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                Select a proposed mutation to inspect its diff and approval requirements.
              </div>
            )}
          </div>
        </div>

        {/* Modal: Prompt AI Action */}
        {showDraftModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  Prompt AI Co-Pilot for New Action
                </h3>
                <button
                  onClick={() => setShowDraftModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSynthesizeAction} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    What operational action should the Co-Pilot draft?
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Draft a WhatsApp check-in for Safi Cleaners Lavington whose renewal is due next month, asking for a testimonial and offering multi-branch expansion."
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Safety Guardrail:</strong> The Co-Pilot will generate the action and diff into your approval queue. No emails or database edits occur until you click <em>Approve</em>.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDraftModal(false)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSynthesizing || !promptInput.trim()}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-40"
                  >
                    {isSynthesizing ? "Synthesizing Draft..." : "Generate Proposed Action"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
