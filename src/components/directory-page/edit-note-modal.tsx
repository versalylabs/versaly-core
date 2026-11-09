"use client";

import { Edit2, X } from "lucide-react";

import type { DirectoryModel } from "./use-directory";

export function EditNoteModal({ d }: { d: DirectoryModel }) {
  const { editingNote, selectedOrg, setEditingNote, handleSaveEditNote, editingNoteTitle, setEditingNoteTitle, editingNoteDesc, setEditingNoteDesc } = d;
  return (
    <>
      {/* Edit Note Modal */}
        {editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Edit2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Edit Activity Note</h3>
                    <p className="text-[11px] text-slate-400">{selectedOrg?.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditNote} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingNoteTitle}
                    onChange={(e) => setEditingNoteTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Note Content</label>
                  <textarea
                    rows={4}
                    required
                    value={editingNoteDesc}
                    onChange={(e) => setEditingNoteDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingNote(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
