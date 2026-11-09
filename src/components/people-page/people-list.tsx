"use client";

import { Users, Plus, Building2, Edit2, Trash2, MessageCircle, Mail, Phone, Sparkles, Briefcase, ExternalLink } from "lucide-react";
import Link from "next/link";

import type { PeopleModel } from "./use-people";

export function PeopleList({ d }: { d: PeopleModel }) {
  const { people, openAddModal, filteredPeople, searchQuery, selectedPerson, setSelectedPersonId, openEditModal, setDeleteConfirmPerson } = d;
  return (
    <>
      {/* Master & Detail Layout or Empty State */}
        {people.length === 0 ? (
          <div className="liquid-glass rounded-2xl p-12 text-center border border-slate-800/80 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-white">No Stakeholders Registered Yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your people registry is clean and ready. Add decision makers, car yard owners, laundromat proprietors, property managers, and referral partners to start mapping relationships.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Stakeholder</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* People Master Grid (1 col) */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 px-1 flex items-center justify-between">
                <span>Directory ({filteredPeople.length})</span>
                <span className="text-[10px] text-slate-500">Cross-Entity</span>
              </div>

              <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                {filteredPeople.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                    No stakeholders match &quot;{searchQuery}&quot;.
                  </div>
                ) : (
                  filteredPeople.map((person) => {
                    const isSelected = selectedPerson?.id === person.id;
                    return (
                      <div
                        key={person.id}
                        onClick={() => setSelectedPersonId(person.id)}
                        className={`liquid-glass p-4 rounded-xl cursor-pointer transition flex flex-col justify-between border group relative ${
                          isSelected
                            ? "border-indigo-500/60 shadow-lg shadow-indigo-500/10 bg-indigo-950/20 ring-1 ring-indigo-500/40"
                            : "border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                              {person.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-white truncate">
                                {person.fullName}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {person.primaryTitle}
                              </div>
                              <div className="text-[10px] text-indigo-400 mt-0.5 flex items-center gap-1 font-semibold truncate">
                                <Building2 className="h-3 w-3 shrink-0" />
                                <span>{person.primaryOrganizationName}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Edit/Delete on list item */}
                          <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(person);
                              }}
                              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition"
                              title="Edit stakeholder"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmPerson(person);
                              }}
                              className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                              title="Delete stakeholder"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-mono text-slate-400">{person.phone}</span>
                          <span className="text-slate-400">
                            {person.relationships.length} relationship
                            {person.relationships.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* People Universal Relationship Canvas (2 cols) */}
            <div className="lg:col-span-2">
              {selectedPerson ? (
                <div className="liquid-glass rounded-2xl p-6 space-y-6 border border-slate-800/80">
                  {/* Person Profile Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-lg font-extrabold text-white shadow-md shadow-indigo-600/30">
                        {selectedPerson.fullName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          {selectedPerson.fullName}
                        </h2>
                        <p className="text-xs text-slate-400">
                          {selectedPerson.primaryTitle} •{" "}
                          <strong className="text-slate-200">
                            {selectedPerson.primaryOrganizationName}
                          </strong>
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {selectedPerson.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium border border-slate-700/60"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(selectedPerson)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmPerson(selectedPerson)}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition"
                        title="Delete stakeholder"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {selectedPerson.whatsApp && (
                        <button
                          onClick={() => {
                            const cleanPhone = selectedPerson.whatsApp.replace(/[^0-9]/g, "");
                            window.open(`https://wa.me/${cleanPhone}`, "_blank");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      {selectedPerson.email && (
                        <a
                          href={`mailto:${selectedPerson.email}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Mail className="h-3.5 w-3.5 text-sky-400" />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Direct Contact Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>Direct Phone</span>
                      </span>
                      <div className="font-mono text-slate-200 font-bold mt-1">
                        {selectedPerson.phone || "Not specified"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>Email Address</span>
                      </span>
                      <div className="text-slate-200 font-medium truncate mt-1">
                        {selectedPerson.email || "Not specified"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-indigo-400" />
                        <span>Product Focus</span>
                      </span>
                      <div className="text-indigo-400 font-semibold mt-1">
                        {selectedPerson.productInterests?.join(", ") || "General"}
                      </div>
                    </div>
                  </div>

                  {/* Multi-Relationship Graph Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Active Entity Relationships ({selectedPerson.relationships.length})</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => openEditModal(selectedPerson)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Relationship</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {selectedPerson.relationships.map((rel, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">
                                {rel.organizationName}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {rel.relationshipType}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {rel.context}
                            </p>
                          </div>

                          <Link
                            href="/directory"
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0"
                          >
                            <span>Open Org</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Private Notes & Preferences */}
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs">
                    <span className="font-semibold text-slate-300">
                      Executive Notes &amp; Communication Preferences:
                    </span>
                    <p className="text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap">
                      {selectedPerson.notes || "No notes recorded yet."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="liquid-glass rounded-2xl p-12 text-center text-xs text-slate-500">
                  Select a stakeholder from the left column to view contact intelligence.
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );
}
