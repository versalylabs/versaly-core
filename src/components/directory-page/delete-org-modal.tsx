"use client";

import { AlertCircle } from "lucide-react";

import type { DirectoryModel } from "./use-directory";

export function DeleteOrgModal({ d }: { d: DirectoryModel }) {
  const { deleteConfirmOrg, setDeleteConfirmOrg, handleDeleteOrg } = d;
  return (
    <>
      {/* Delete Confirmation Modal */}
        {deleteConfirmOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/30 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Delete Organization?</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This will delete <strong className="text-white">{deleteConfirmOrg.name}</strong> from the core directory.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOrg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteOrg(deleteConfirmOrg.id)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/25"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
