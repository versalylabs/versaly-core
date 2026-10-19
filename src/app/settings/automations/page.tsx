"use client";

import { useState } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  AUTOMATION_RULES_SEED,
  AutomationRuleSeed,
} from "@/data/automations-seed";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Play,
  Plus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRuleSeed[]>(AUTOMATION_RULES_SEED);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [triggeringRuleId, setTriggeringRuleId] = useState<string | null>(null);

  const toggleRuleActive = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const next = !r.isActive;
          setToastMessage(
            next
              ? `✓ Activated rule: "${r.name}"`
              : `Paused automation rule: "${r.name}"`
          );
          setTimeout(() => setToastMessage(null), 3000);
          return { ...r, isActive: next };
        }
        return r;
      })
    );
  };

  const handleSimulateTrigger = (rule: AutomationRuleSeed) => {
    setTriggeringRuleId(rule.id);
    setTimeout(() => {
      setRules((prev) =>
        prev.map((r) =>
          r.id === rule.id
            ? {
                ...r,
                executionCount: r.executionCount + 1,
                lastTriggeredAt: "Just now (Manual Run)",
              }
            : r
        )
      );
      setTriggeringRuleId(null);
      setToastMessage(`⚡ Executed: ${rule.name}. Action: "${rule.actionSummary}"`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 700);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Operational Automations & Triggers
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Active Event Bus
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              Event-Driven Automations & Notification Engine
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Eliminate manual operational drag: automatically create onboarding projects when deals are won, escalate overdue invoices to WhatsApp follow-ups, and alert Ops to blocked client implementations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setToastMessage("✓ New automation rule wizard initialized.");
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Custom Rule</span>
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

        {/* Engine Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Active Automation Rules</div>
            <div className="text-2xl font-bold text-indigo-300 mt-2 font-mono">
              {rules.filter((r) => r.isActive).length} / {rules.length}
            </div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              <span>Event listeners armed</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Total Actions Dispatched</div>
            <div className="text-2xl font-bold text-white mt-2 font-mono">
              {rules.reduce((sum, r) => sum + r.executionCount, 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">Zero dropped webhooks</div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Alert Delivery Channels</div>
            <div className="text-2xl font-bold text-white mt-2">3 Channels</div>
            <div className="text-[11px] text-slate-400 mt-2">In-App Bell, WhatsApp & Email</div>
          </div>

          <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <div className="text-xs text-emerald-300 font-medium">Avg Execution Latency</div>
            <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">14ms</div>
            <div className="text-[11px] text-emerald-400/80 mt-2">Instant state sync</div>
          </div>
        </div>

        {/* Automations Rule Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            <span>Core Event Rules ({rules.length})</span>
            <span className="text-[10px] text-slate-500">Click Play to manually trigger simulation</span>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => {
              const isExecuting = triggeringRuleId === rule.id;
              return (
                <div
                  key={rule.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    rule.isActive
                      ? "bg-slate-900/70 border-slate-800/90 shadow-sm"
                      : "bg-slate-950/40 border-slate-900 opacity-60"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {rule.triggerType}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100">{rule.name}</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Trigger:</strong> {rule.description}
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-emerald-300/90 font-mono flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Action: {rule.actionSummary}</span>
                      </div>
                    </div>

                    <div className="flex items-center md:flex-col md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSimulateTrigger(rule)}
                          disabled={!rule.isActive || isExecuting}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 border border-slate-700/60 transition flex items-center gap-1.5"
                        >
                          <Play className={`h-3 w-3 text-indigo-400 ${isExecuting ? "animate-spin" : ""}`} />
                          <span>{isExecuting ? "Executing..." : "Test Run"}</span>
                        </button>

                        <button
                          onClick={() => toggleRuleActive(rule.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                          title={rule.isActive ? "Pause Rule" : "Activate Rule"}
                        >
                          {rule.isActive ? (
                            <ToggleRight className="h-6 w-6 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-slate-600" />
                          )}
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-500 text-right space-y-0.5">
                        <div>Triggered {rule.executionCount} times</div>
                        <div>Last: {rule.lastTriggeredAt}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
