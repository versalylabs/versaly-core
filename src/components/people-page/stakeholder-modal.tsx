"use client";

import { Users, X, Plus, CheckCircle2 } from "lucide-react";
import { RelationshipType } from "@/data/people-seed";
import { ALL_RELATIONSHIP_TYPES, ALL_PRODUCTS } from "./helpers";
import type { PeopleModel } from "./use-people";

export function StakeholderModal({ d }: { d: PeopleModel }) {
  const { isModalOpen, modalMode, setIsModalOpen, handleSavePerson, formName, setFormName, formTitle, setFormTitle, formOrgName, setFormOrgName, formPhone, setFormPhone, formWhatsApp, setFormWhatsApp, formEmail, setFormEmail, formRelationship, setFormRelationship, formRelationshipContext, setFormRelationshipContext, formProductInterests, toggleProductInterest, additionalRelationships, setShowAddRelForm, showAddRelForm, handleRemoveRelationship, newRelOrg, setNewRelOrg, newRelType, setNewRelType, newRelContext, setNewRelContext, handleAddRelationship, formTags, handleRemoveTag, tagInput, setTagInput, handleAddTag, formNotes, setFormNotes } = d;
  return (
    <>
      {/* Modal: Add / Edit Stakeholder */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {modalMode === "ADD" ? "Add New Stakeholder" : "Edit Stakeholder"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Cross-entity profile &amp; relationship intelligence
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSavePerson} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Kamau"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Title / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Managing Director"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Primary Organization *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Auto Garage"
                      value={formOrgName}
                      onChange={(e) => setFormOrgName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+254 722 000 000"
                      value={formPhone}
                      onChange={(e) => {
                        setFormPhone(e.target.value);
                        if (!formWhatsApp || formWhatsApp === "+254 ") {
                          setFormWhatsApp(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">WhatsApp (if different)</label>
                    <input
                      type="text"
                      placeholder="+254 722 000 000"
                      value={formWhatsApp}
                      onChange={(e) => setFormWhatsApp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="contact@company.co.ke"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Relationship Role</label>
                    <select
                      value={formRelationship}
                      onChange={(e) => setFormRelationship(e.target.value as RelationshipType)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {ALL_RELATIONSHIP_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Primary Role Context</label>
                    <input
                      type="text"
                      placeholder="e.g. Authorizes payments, evaluates demo"
                      value={formRelationshipContext}
                      onChange={(e) => setFormRelationshipContext(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Product Interests Multi-Select */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Product Interests</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_PRODUCTS.map((prod) => {
                      const isSelected = formProductInterests.includes(prod);
                      return (
                        <button
                          key={prod}
                          type="button"
                          onClick={() => toggleProductInterest(prod)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-500"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {prod}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Entity Relationships */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">
                      Additional Organization Roles ({additionalRelationships.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddRelForm(!showAddRelForm)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{showAddRelForm ? "Cancel" : "Add Entity Role"}</span>
                    </button>
                  </div>

                  {additionalRelationships.map((rel, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-white">{rel.organizationName}</span>
                        <span className="text-[10px] text-indigo-400 ml-2">({rel.relationshipType})</span>
                        <p className="text-[11px] text-slate-400 truncate">{rel.context}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRelationship(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {showAddRelForm && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Organization name..."
                          value={newRelOrg}
                          onChange={(e) => setNewRelOrg(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs"
                        />
                        <select
                          value={newRelType}
                          onChange={(e) => setNewRelType(e.target.value as RelationshipType)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs"
                        >
                          {ALL_RELATIONSHIP_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Context (e.g. Also chairs the regional trade group)..."
                        value={newRelContext}
                        onChange={(e) => setNewRelContext(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddRelationship}
                        className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                      >
                        Add Role
                      </button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {formTags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                      >
                        <span>#{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-400"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Notes &amp; Communication Preferences
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Preferred contact hours, objection details, meeting context..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{modalMode === "ADD" ? "Save Stakeholder" : "Update Stakeholder"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
