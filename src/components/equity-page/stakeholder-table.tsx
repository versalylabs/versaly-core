"use client";

import { CheckCircle2, Calendar, Edit2, Trash2 } from "lucide-react";

import type { EquityModel } from "./use-equity";

export function StakeholderTable({ d }: { d: EquityModel }) {
  const { activeScenario, palette, handleOpenEditShareholder, handleDeleteShareholder } = d;
  return (
    <>
      {/* Stakeholder Table & Detail Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Shareholders & Cap Table Register</h2>
              <p className="text-xs text-slate-400">Detailed rights, vesting terms, and share classes</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Scenario: <strong className="text-white">{activeScenario.scenarioName}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeScenario.stakeholders.map((sh, idx) => (
              <div
                key={sh.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${palette[idx % palette.length]} flex items-center justify-center text-white font-bold text-base shadow-lg`}>
                        {sh.shareholderName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">{sh.shareholderName}</h3>
                        <p className="text-xs text-slate-400">{sh.roleTitle}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-indigo-400 font-mono">
                      {sh.percentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block">Shares Count</span>
                      <span className="font-bold text-white font-mono mt-0.5 block">{sh.sharesCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Share Class</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-800 font-mono text-indigo-300 font-medium">
                        {sh.shareClass}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Voting Rights</span>
                      <span className={`inline-flex items-center gap-1 font-medium mt-0.5 ${sh.votingRights !== false ? "text-emerald-400" : "text-slate-400"}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {sh.votingRights !== false ? "Voting" : "Non-Voting"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Legal Status</span>
                      <span className={`inline-flex items-center gap-1 font-medium mt-0.5 ${sh.isLegallyBinding ? "text-emerald-400" : "text-amber-400"}`}>
                        {sh.isLegallyBinding ? "BRS Filed" : "Proposed"}
                      </span>
                    </div>
                  </div>

                  {/* Vesting Schedule Details */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        Vesting Schedule
                      </span>
                      <span className="font-mono text-white font-medium">{sh.vestingMonths || 48} Months</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Cliff Period</span>
                      <span className="font-mono text-white">{sh.cliffMonths || 12} Months</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Commencement</span>
                      <span className="font-mono text-slate-300">{sh.vestingStartDate || "At incorporation"}</span>
                    </div>
                  </div>

                  {sh.notes && (
                    <div className="mt-3 text-[11px] text-slate-400 italic bg-slate-800/30 p-2 rounded-lg">
                      &ldquo;{sh.notes}&rdquo;
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenEditShareholder(sh)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1"
                    title="Edit shareholder terms"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteShareholder(sh.id, sh.shareholderName)}
                    className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs flex items-center gap-1"
                    title="Remove shareholder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
    </>
  );
}
