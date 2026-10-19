"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Users,
  Search,
  Plus,
  MessageCircle,
  Mail,
  Building2,
  Briefcase,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import { INITIAL_PEOPLE, PersonItem, RelationshipType } from "@/data/people-seed";

const STORAGE_KEY = "versaly_people_directory";

export default function PeoplePage() {
  const [people, setPeople] = useState<PersonItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_PEOPLE;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string>(() => {
    return INITIAL_PEOPLE[0]?.id || "";
  });

  // Form State
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("+254 ");
  const [formOrgName, setFormOrgName] = useState("");
  const [formRelationship, setFormRelationship] = useState("Decision Maker");
  const [formProduct, setFormProduct] = useState("Vehisoft");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    } catch {
      // ignore
    }
  }, [people]);

  const selectedPerson = useMemo(() => {
    return people.find((p) => p.id === selectedPersonId) || people[0] || null;
  }, [people, selectedPersonId]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    people.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [people]);

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      const matchesSearch =
        p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.primaryTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.primaryOrganizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.notes.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = selectedTag === "ALL" || p.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [people, searchQuery, selectedTag]);

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formOrgName.trim()) return;

    const newPerson: PersonItem = {
      id: `per-${Date.now()}`,
      fullName: formName.trim(),
      primaryTitle: formTitle.trim() || "Contact",
      email: formEmail.trim() || "contact@client.co.ke",
      phone: formPhone.trim(),
      whatsApp: formPhone.trim(),
      primaryOrganizationId: `org-${Date.now()}`,
      primaryOrganizationName: formOrgName.trim(),
      productInterests: [formProduct],
      relationships: [
        {
          organizationId: `org-${Date.now()}`,
          organizationName: formOrgName.trim(),
          relationshipType: formRelationship as RelationshipType,
          context: `Primary ${formRelationship} for ${formProduct} solution.`,
        },
      ],
      tags: ["Direct Contact", formProduct],
      lastContacted: "Just created",
      notes: formNotes.trim() || "Recorded in people registry.",
    };

    setPeople((prev) => [newPerson, ...prev]);
    setSelectedPersonId(newPerson.id);
    setIsAddModalOpen(false);

    setFormName("");
    setFormTitle("");
    setFormEmail("");
    setFormPhone("+254 ");
    setFormOrgName("");
    setFormNotes("");
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                First-Class Stakeholder Layer
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Multi-Relationship People Intelligence</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              People &amp; Key Stakeholders
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              One individual, multiple business relationships: track decision makers, workshop managers, partners, and referrers across all organizations without duplicating records.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Person / Stakeholder</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedTag("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                selectedTag === "ALL"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              All People ({people.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  selectedTag === tag
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search people by name, title, company, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Master & Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* People Master Grid (1 col) */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 px-1 flex items-center justify-between">
              <span>Stakeholders ({filteredPeople.length})</span>
              <span className="text-[10px] text-slate-500">First-class entity</span>
            </div>

            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {filteredPeople.map((person) => {
                const isSelected = selectedPerson?.id === person.id;
                return (
                  <div
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    className={`liquid-glass p-4 rounded-xl cursor-pointer transition flex flex-col justify-between border ${
                      isSelected
                        ? "border-indigo-500/60 shadow-lg shadow-indigo-500/10 bg-indigo-950/20"
                        : "border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
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
                        <div className="text-[10px] text-indigo-400 mt-1 flex items-center gap-1 font-semibold truncate">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span>{person.primaryOrganizationName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono">{person.phone}</span>
                      <span className="text-slate-400">{person.relationships.length} relationship{person.relationships.length > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                );
              })}
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
                        {selectedPerson.primaryTitle} • <strong className="text-slate-200">{selectedPerson.primaryOrganizationName}</strong>
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {selectedPerson.tags.map((t) => (
                          <span key={t} className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium border border-slate-700/60">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                    <a
                      href={`mailto:${selectedPerson.email}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Mail className="h-3.5 w-3.5 text-sky-400" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>

                {/* Direct Contact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Direct Phone</span>
                    <div className="font-mono text-slate-200 font-bold mt-0.5">{selectedPerson.phone}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Email Address</span>
                    <div className="text-slate-200 font-medium truncate mt-0.5">{selectedPerson.email}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Product Focus</span>
                    <div className="text-indigo-400 font-semibold mt-0.5">{selectedPerson.productInterests.join(", ")}</div>
                  </div>
                </div>

                {/* Multi-Relationship Graph Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Active Entity Relationships ({selectedPerson.relationships.length})</span>
                    </h3>
                    <span className="text-[10px] text-slate-500">Cross-system roles</span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedPerson.relationships.map((rel, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{rel.organizationName}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
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
                  <span className="font-semibold text-slate-300">Executive Notes &amp; Communication Preferences:</span>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    {selectedPerson.notes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="liquid-glass rounded-2xl p-12 text-center text-xs text-slate-500">
                Select a person to inspect their relationships and multi-entity graph.
              </div>
            )}
          </div>
        </div>

        {/* Modal: Add Stakeholder */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Add New Stakeholder</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePerson} className="space-y-4 text-xs">
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
                      placeholder="e.g. General Manager"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Organization *</label>
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
                    <label className="block text-slate-300 font-semibold mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="+254 722 000 000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="john@client.co.ke"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Relationship Role</label>
                    <select
                      value={formRelationship}
                      onChange={(e) => setFormRelationship(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Decision Maker">Decision Maker</option>
                      <option value="Client Contact">Client Contact</option>
                      <option value="Technical Lead">Technical Lead</option>
                      <option value="Partner">Partner</option>
                      <option value="Previous Lead">Previous Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Product</label>
                    <select
                      value={formProduct}
                      onChange={(e) => setFormProduct(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Vehisoft">Vehisoft</option>
                      <option value="Versandry">Versandry</option>
                      <option value="Adversoft">Adversoft</option>
                      <option value="LipaTim">LipaTim</option>
                      <option value="Melio RMS">Melio RMS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Notes & Communication Preference</label>
                  <textarea
                    rows={2}
                    placeholder="Preferred contact hours, objections, background..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save Person</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
