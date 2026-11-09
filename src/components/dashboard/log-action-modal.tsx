"use client";

import { PhoneCall, X, CheckCircle2 } from "lucide-react";

import type { DashboardModel } from "./use-dashboard";

export function LogActionModal({ d }: { d: DashboardModel }) {
  const { loggingItem, setLoggingItem, handleConfirmLog, logOutcome, setLogOutcome, logDealStage, setLogDealStage, logNextAction, setLogNextAction, logNextActionDate, setLogNextActionDate, logNotes, setLogNotes, logOptOut, setLogOptOut } = d;
  return (
    <>
      {/* Modal: Log Action */}
        {loggingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Log Outreach Outcome & Next Step</h3>
                    <p className="text-[11px] text-slate-400">{loggingItem.business} • {loggingItem.contact}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLoggingItem(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmLog} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Outreach Outcome *</label>
                    <select
                      value={logOutcome}
                      onChange={(e) => setLogOutcome(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Connected - Demo Booked">Connected - Demo Booked</option>
                      <option value="Connected - Follow-up Needed">Connected - Follow-up Needed</option>
                      <option value="Left Message / Audio Note">Left Message / Audio Note</option>
                      <option value="No Answer / Voicemail">No Answer / Voicemail</option>
                      <option value="Gatekeeper Block / Call Back Later">Gatekeeper Block / Call Back Later</option>
                      <option value="Not Interested (Disqualified)">Not Interested (Disqualified)</option>
                      <option value="Wrong Contact / Disconnected">Wrong Contact / Disconnected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Update Deal Stage</label>
                    <select
                      value={logDealStage}
                      onChange={(e) => setLogDealStage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Contacted / Pitching">Contacted / Pitching</option>
                      <option value="Demo Booked">Demo Booked</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Won / Closed">Won / Closed</option>
                      <option value="Disqualified">Disqualified</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Next Action</label>
                    <input
                      type="text"
                      value={logNextAction}
                      onChange={(e) => setLogNextAction(e.target.value)}
                      placeholder="e.g. Conduct live demo, send contract..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Next Action Date & Time</label>
                    <input
                      type="text"
                      value={logNextActionDate}
                      onChange={(e) => setLogNextActionDate(e.target.value)}
                      placeholder="e.g. Tomorrow 10:30 AM"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Notes & Objections Discussed</label>
                  <textarea
                    rows={2}
                    required
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Describe feedback, customer objection, or agreed meeting time..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="optOutToggle"
                      checked={logOptOut}
                      onChange={(e) => setLogOptOut(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor="optOutToggle" className="text-slate-300 font-medium cursor-pointer">
                      Prospect requested not to be contacted (Do Not Contact / DNC)
                    </label>
                  </div>
                  {logOptOut && (
                    <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
                      Opted Out
                    </span>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setLoggingItem(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Complete & Save Log</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
