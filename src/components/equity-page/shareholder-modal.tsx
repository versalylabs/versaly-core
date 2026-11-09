"use client";

import { PieChart, X } from "lucide-react";

import type { EquityModel } from "./use-equity";

export function ShareholderModal({ d }: { d: EquityModel }) {
  const { isShareholderModalOpen, editingShareholder, setIsShareholderModalOpen, handleSaveShareholder, shareholderName, setShareholderName, roleTitle, setRoleTitle, percentage, setPercentage, sharesCount, setSharesCount, shareClass, setShareClass, vestingMonths, setVestingMonths, cliffMonths, setCliffMonths, vestingStartDate, setVestingStartDate, votingRights, setVotingRights, isLegallyBinding, setIsLegallyBinding, notes, setNotes } = d;
  return (
    <>
      {/* ADD / EDIT SHAREHOLDER MODAL */}
        {isShareholderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  {editingShareholder ? "Edit Shareholder Terms" : "Add New Shareholder"}
                </h3>
                <button
                  onClick={() => setIsShareholderModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveShareholder} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Shareholder Name *</label>
                    <input
                      type="text"
                      required
                      value={shareholderName}
                      onChange={(e) => setShareholderName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Role / Designation *</label>
                    <input
                      type="text"
                      required
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Founder & CEO"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Ownership Percentage (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={percentage}
                      onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Shares Count</label>
                    <input
                      type="number"
                      min="1"
                      value={sharesCount}
                      onChange={(e) => setSharesCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Share Class</label>
                    <select
                      value={shareClass}
                      onChange={(e) => setShareClass(e.target.value as Parameters<typeof setShareClass>[0])}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ORDINARY_A">Ordinary Class A (Voting)</option>
                      <option value="ORDINARY_B">Ordinary Class B (Non-voting)</option>
                      <option value="PREFERRED">Preferred Shares</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Vesting Period (Months)</label>
                    <input
                      type="number"
                      value={vestingMonths}
                      onChange={(e) => setVestingMonths(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Cliff Period (Months)</label>
                    <input
                      type="number"
                      value={cliffMonths}
                      onChange={(e) => setCliffMonths(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Vesting Commencement Date</label>
                    <input
                      type="date"
                      value={vestingStartDate}
                      onChange={(e) => setVestingStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={votingRights}
                      onChange={(e) => setVotingRights(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                    />
                    Voting Rights Granted
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLegallyBinding}
                      onChange={(e) => setIsLegallyBinding(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                    />
                    Legally Filed at BRS
                  </label>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Governance Notes / Agreement Ref</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Shareholders agreement date, transfer restrictions, etc."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsShareholderModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                  >
                    {editingShareholder ? "Save Changes" : "Add to Cap Table"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
