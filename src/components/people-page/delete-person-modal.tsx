"use client";

import { AlertCircle, Trash2 } from "lucide-react";

import type { PeopleModel } from "./use-people";

export function DeletePersonModal({ d }: { d: PeopleModel }) {
  const { deleteConfirmPerson, setDeleteConfirmPerson, handleDeletePerson } = d;
  return (
    <>
      {/* Modal: Delete Confirmation */}
        {deleteConfirmPerson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-sm w-full rounded-2xl p-6 space-y-4 shadow-2xl border border-rose-500/30">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Delete Stakeholder?</h3>
                  <p className="text-xs text-slate-400">
                    Remove &quot;{deleteConfirmPerson.fullName}&quot; ({deleteConfirmPerson.primaryOrganizationName}) and all associated relationships from your network?
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmPerson(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePerson(deleteConfirmPerson.id)}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-600/25 text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
