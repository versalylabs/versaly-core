"use client";

import { Plus, Clock, MessageSquare, Phone, Mail, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import type { MyWorkspaceModel } from "./use-my-workspace";

export function FollowUpsTab({ d }: { d: MyWorkspaceModel }) {
  const { activeTab, openAddFollowUp, myFollowUps, openEditFollowUp, setDeleteTarget } = d;
  return (
    <>
      {/* Tab 3: Follow-ups */}
        {activeTab === "FOLLOWUPS" && (
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Immediate Sales &amp; Proposal Follow-ups Assigned to Me
                </span>
                <span className="text-[11px] text-slate-400">Direct outreach touchpoints and scheduled follow-ups</span>
              </div>
              <button
                onClick={openAddFollowUp}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Follow-up</span>
              </button>
            </div>

            {myFollowUps.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Clock className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No scheduled follow-up actions right now.</p>
                <button
                  onClick={openAddFollowUp}
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  + Add a follow-up action
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myFollowUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{fu.contact}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold uppercase">
                          {fu.channel}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">
                          {fu.due}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        {fu.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={fu.link || "/communications"}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition text-xs flex items-center gap-1.5 ${
                          fu.channel === "WhatsApp"
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        {fu.channel === "WhatsApp" && <MessageSquare className="h-3.5 w-3.5" />}
                        {fu.channel === "Call" && <Phone className="h-3.5 w-3.5" />}
                        {fu.channel === "Email" && <Mail className="h-3.5 w-3.5" />}
                        <span>Take Action</span>
                      </Link>

                      <button
                        onClick={() => openEditFollowUp(fu)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-300 hover:bg-slate-800 transition"
                        title="Edit follow-up"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget({ type: "FOLLOWUP", id: fu.id, title: fu.contact })}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete follow-up"
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
