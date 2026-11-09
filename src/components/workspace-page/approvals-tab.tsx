"use client";

import { Plus, ShieldCheck, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import type { MyWorkspaceModel } from "./use-my-workspace";

export function ApprovalsTab({ d }: { d: MyWorkspaceModel }) {
  const { activeTab, openAddApproval, myApprovals, openEditApproval, setDeleteTarget } = d;
  return (
    <>
      {/* Tab 4: Approvals */}
        {activeTab === "APPROVALS" && (
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Items Awaiting My Authorization
                </span>
                <span className="text-[11px] text-slate-400">Proposals, invoices, and contracts pending executive approval</span>
              </div>
              <button
                onClick={openAddApproval}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Approval</span>
              </button>
            </div>

            {myApprovals.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <ShieldCheck className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No items currently waiting for authorization.</p>
                <button
                  onClick={openAddApproval}
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  + Add an approval item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myApprovals.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{app.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold uppercase">
                          {app.type}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                            app.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : app.status === "Rejected"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        {app.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={app.link || "/attention"}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                      >
                        Review &amp; Authorize
                      </Link>

                      <button
                        onClick={() => openEditApproval(app)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-300 hover:bg-slate-800 transition"
                        title="Edit approval item"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget({ type: "APPROVAL", id: app.id, title: app.title })}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete approval item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </>
  );
}
