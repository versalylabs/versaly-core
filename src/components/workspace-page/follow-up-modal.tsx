"use client";

import { Clock, X } from "lucide-react";

import type { MyWorkspaceModel } from "./use-my-workspace";

export function FollowUpModal({ d }: { d: MyWorkspaceModel }) {
  const { modalType, modalMode, setModalType, handleSaveFollowUp, fuContact, setFuContact, fuChannel, setFuChannel, fuDue, setFuDue, fuDesc, setFuDesc } = d;
  return (
    <>
      {/* MODAL: FOLLOW-UP ADD / EDIT */}
      {modalType === "FOLLOWUP" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                <span>{modalMode === "ADD" ? "Add Follow-up Action" : "Edit Follow-up Action"}</span>
              </h2>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Contact / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={fuContact}
                  onChange={(e) => setFuContact(e.target.value)}
                  placeholder="e.g. Grandview Apartments (Faith Kimani)"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Channel
                  </label>
                  <select
                    value={fuChannel}
                    onChange={(e) => setFuChannel(e.target.value as Parameters<typeof setFuChannel>[0])}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Call">Phone Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">In-Person Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Due Date / Time
                  </label>
                  <input
                    type="text"
                    value={fuDue}
                    onChange={(e) => setFuDue(e.target.value)}
                    placeholder="Today 3:00 PM"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Touchpoint Objective / Description
                </label>
                <textarea
                  rows={3}
                  value={fuDesc}
                  onChange={(e) => setFuDesc(e.target.value)}
                  placeholder="e.g. Answer board query on LipaTim automated rent billing..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                >
                  {modalMode === "ADD" ? "Create Follow-up" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
