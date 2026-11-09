"use client";

import { MapPin, Users, Edit2, Trash2, ChevronRight, Phone, Mail, MessageCircle, Activity } from "lucide-react";

import type { DirectoryModel } from "./use-directory";

export function DirectorySplitView({ d }: { d: DirectoryModel }) {
  const { activeTab, filteredOrganizations, selectedOrg, setSelectedOrgId, openEditModal, setDeleteConfirmOrg, filteredPeople, handleStartEditNote, handleDeleteNote, handleAddNote, newNoteText, setNewNoteText } = d;
  return (
    <>
      {/* Directory Main Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Column (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            {activeTab === "organizations" ? (
              filteredOrganizations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-slate-900/40 border border-slate-800">
                  No organizations found matching your criteria.
                </div>
              ) : (
                filteredOrganizations.map((org) => {
                  const isSelected = selectedOrg?.id === org.id;
                  return (
                    <div
                      key={org.id}
                      onClick={() => setSelectedOrgId(org.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between group relative ${
                        isSelected
                          ? "bg-indigo-950/30 border-indigo-500/40 shadow-sm"
                          : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0 pr-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-100 group-hover:text-indigo-200 transition-colors">
                            {org.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                              org.type === "CLIENT"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : org.type === "PROSPECT"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            }`}
                          >
                            {org.type}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-slate-800 text-indigo-300 border border-slate-700">
                            Fit: {org.productFit}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                          <span>{org.industry}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            <span>
                              {org.address}, {org.city}
                            </span>
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                          <Users className="h-3 w-3 shrink-0" />
                          <span>{org.contacts.length} contact: </span>
                          <span className="text-slate-300 font-medium truncate">
                            {org.contacts[0]?.firstName} {org.contacts[0]?.lastName} ({org.contacts[0]?.jobTitle})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => openEditModal(org, e)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition opacity-90 sm:opacity-0 group-hover:opacity-100"
                          title="Edit Organization"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmOrg(org);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition opacity-90 sm:opacity-0 group-hover:opacity-100"
                          title="Delete Organization"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* People View */
              filteredPeople.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-slate-900/40 border border-slate-800">
                  No people found matching your criteria.
                </div>
              ) : (
                filteredPeople.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">
                          {p.firstName} {p.lastName}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {p.jobTitle}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                          {p.contactType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Company: <span className="text-slate-200 font-medium">{p.organizationName}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <span>{p.phone}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-500" />
                          <span>{p.email}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition flex items-center gap-1.5"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))
              )
            )}
          </div>

          {/* Detail Side-Drawer (1 col) */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-5">
            {selectedOrg ? (
              <>
                {/* Org Summary */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {selectedOrg.type}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(selectedOrg)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Edit Organization"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmOrg(selectedOrg)}
                        className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                        title="Delete Organization"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <span className="text-xs text-slate-400 font-mono ml-1">PIN: {selectedOrg.taxPin || "N/A"}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">{selectedOrg.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedOrg.industry} • {selectedOrg.address}, {selectedOrg.city}
                  </p>
                </div>

                {/* Key Attributes Box */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Primary Product Fit:</span>
                    <span className="font-semibold text-indigo-300">{selectedOrg.productFit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Contact Phone:</span>
                    <span className="text-slate-200">{selectedOrg.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Email:</span>
                    <span className="text-slate-200">{selectedOrg.email}</span>
                  </div>
                </div>

                {/* Linked Contacts */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Linked Contacts ({selectedOrg.contacts.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedOrg.contacts.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">
                            {c.firstName} {c.lastName}
                          </span>
                          <span className="text-[10px] text-slate-500">{c.jobTitle}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                          <span>{c.phone}</span>
                          <span className="text-indigo-400">{c.contactType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Activity History & Notes ({selectedOrg.activities.length})</span>
                  </h4>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {selectedOrg.activities.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-2">No notes logged yet. Use the form below to post a note.</p>
                    ) : (
                      selectedOrg.activities.map((act) => (
                        <div key={act.id} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs group relative">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-indigo-300">{act.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">{act.timestamp}</span>
                              <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditNote(act)}
                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                  title="Edit Note"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNote(act.id)}
                                  className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition"
                                  title="Delete Note"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 whitespace-pre-wrap">{act.description}</p>
                          <div className="text-[10px] text-slate-500 mt-1">Logged by: {act.actor}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Add Note Form */}
                <form onSubmit={handleAddNote} className="pt-2 border-t border-slate-800/80 space-y-2">
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Log conversation note or visit outcome..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
                  >
                    Post Activity Note
                  </button>
                </form>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Select an organization to view details.
              </div>
            )}
          </div>
        </div>
    </>
  );
}
