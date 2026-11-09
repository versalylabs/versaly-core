"use client";

import { FolderGit2, X } from "lucide-react";

import type { MyWorkspaceModel } from "./use-my-workspace";

export function ProjectModal({ d }: { d: MyWorkspaceModel }) {
  const { modalType, modalMode, setModalType, handleSaveProject, projTitle, setProjTitle, projStatus, setProjStatus, projStatusVariant, setProjStatusVariant, projLead, setProjLead, projGoLive, setProjGoLive, projDesc, setProjDesc } = d;
  return (
    <>
      {/* MODAL: PROJECT ADD / EDIT */}
      {modalType === "PROJECT" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-indigo-400" />
                <span>{modalMode === "ADD" ? "Add Assigned Project" : "Edit Assigned Project"}</span>
              </h2>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Skyline Media LED Screen Implementation"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Status Label
                  </label>
                  <input
                    type="text"
                    required
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value)}
                    placeholder="e.g. On Track (85%)"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Badge Color Tone
                  </label>
                  <select
                    value={projStatusVariant}
                    onChange={(e) => setProjStatusVariant(e.target.value as Parameters<typeof setProjStatusVariant>[0])}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="success">Green (Success / On Track)</option>
                    <option value="warning">Amber (Warning / Blocked)</option>
                    <option value="info">Indigo (Info / Testing)</option>
                    <option value="neutral">Slate (Neutral / Planned)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Lead Architect / Owner
                  </label>
                  <input
                    type="text"
                    value={projLead}
                    onChange={(e) => setProjLead(e.target.value)}
                    placeholder="e.g. Ted Mwangi"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Target Go-Live
                  </label>
                  <input
                    type="text"
                    value={projGoLive}
                    onChange={(e) => setProjGoLive(e.target.value)}
                    placeholder="e.g. Thursday or 24 Oct"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description &amp; Operational Notes
                </label>
                <textarea
                  rows={3}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Details regarding hardware, data migration, or client handoff..."
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
                  {modalMode === "ADD" ? "Create Project" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
