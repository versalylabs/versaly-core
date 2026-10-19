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
  Edit2,
  Trash2,
  AlertCircle,
  Phone,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { INITIAL_PEOPLE, PersonItem, RelationshipType, PersonRelationship } from "@/data/people-seed";

const STORAGE_KEY = "versaly_people_registry_v2";

const ALL_PRODUCTS = ["Vehisoft", "Versandry", "Adversoft", "LipaTim", "Melio RMS"];
const ALL_RELATIONSHIP_TYPES: RelationshipType[] = [
  "Decision Maker",
  "Client Contact",
  "Technical Lead",
  "Partner",
  "Previous Lead",
  "Supplier",
  "Champion",
];

export default function PeoplePage() {
  const [people, setPeople] = useState<PersonItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
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
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteConfirmPerson, setDeleteConfirmPerson] = useState<PersonItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("+254 ");
  const [formWhatsApp, setFormWhatsApp] = useState("+254 ");
  const [formOrgName, setFormOrgName] = useState("");
  const [formRelationship, setFormRelationship] = useState<RelationshipType>("Decision Maker");
  const [formRelationshipContext, setFormRelationshipContext] = useState("");
  const [formProductInterests, setFormProductInterests] = useState<string[]>(["Vehisoft"]);
  const [formTags, setFormTags] = useState<string[]>(["Direct Contact"]);
  const [tagInput, setTagInput] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Additional relationships
  const [additionalRelationships, setAdditionalRelationships] = useState<PersonRelationship[]>([]);
  const [newRelOrg, setNewRelOrg] = useState("");
  const [newRelType, setNewRelType] = useState<RelationshipType>("Partner");
  const [newRelContext, setNewRelContext] = useState("");
  const [showAddRelForm, setShowAddRelForm] = useState(false);

  // Sync to localStorage
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
        p.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery);

      const matchesTag = selectedTag === "ALL" || p.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [people, searchQuery, selectedTag]);

  // Open Add Modal
  const openAddModal = () => {
    setModalMode("ADD");
    setEditingPersonId(null);
    setFormName("");
    setFormTitle("");
    setFormEmail("");
    setFormPhone("+254 ");
    setFormWhatsApp("+254 ");
    setFormOrgName("");
    setFormRelationship("Decision Maker");
    setFormRelationshipContext("Primary decision maker for operational software.");
    setFormProductInterests(["Vehisoft"]);
    setFormTags(["Direct Contact"]);
    setTagInput("");
    setFormNotes("");
    setAdditionalRelationships([]);
    setShowAddRelForm(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (person: PersonItem) => {
    setModalMode("EDIT");
    setEditingPersonId(person.id);
    setFormName(person.fullName);
    setFormTitle(person.primaryTitle);
    setFormEmail(person.email);
    setFormPhone(person.phone);
    setFormWhatsApp(person.whatsApp || person.phone);
    setFormOrgName(person.primaryOrganizationName);

    // Primary relationship
    const primaryRel = person.relationships[0];
    if (primaryRel) {
      setFormRelationship(primaryRel.relationshipType);
      setFormRelationshipContext(primaryRel.context);
    } else {
      setFormRelationship("Decision Maker");
      setFormRelationshipContext("");
    }

    // Additional relationships
    setAdditionalRelationships(person.relationships.slice(1));
    setShowAddRelForm(false);

    setFormProductInterests([...person.productInterests]);
    setFormTags([...person.tags]);
    setTagInput("");
    setFormNotes(person.notes);
    setIsModalOpen(true);
  };

  // Toggle product interest
  const toggleProductInterest = (prod: string) => {
    setFormProductInterests((prev) =>
      prev.includes(prod) ? prev.filter((p) => p !== prod) : [...prev, prod]
    );
  };

  // Add tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const tag = tagInput.trim();
    if (!formTags.includes(tag)) {
      setFormTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setFormTags((prev) => prev.filter((t) => t !== tag));
  };

  // Add extra relationship
  const handleAddRelationship = () => {
    if (!newRelOrg.trim()) return;
    const newRel: PersonRelationship = {
      organizationId: `org-${Date.now()}`,
      organizationName: newRelOrg.trim(),
      relationshipType: newRelType,
      context: newRelContext.trim() || `${newRelType} role with ${newRelOrg.trim()}`,
    };
    setAdditionalRelationships((prev) => [...prev, newRel]);
    setNewRelOrg("");
    setNewRelContext("");
    setShowAddRelForm(false);
  };

  // Remove relationship
  const handleRemoveRelationship = (index: number) => {
    setAdditionalRelationships((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Person (Add or Edit)
  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formOrgName.trim()) return;

    const primaryRel: PersonRelationship = {
      organizationId: `org-${Date.now()}-prim`,
      organizationName: formOrgName.trim(),
      relationshipType: formRelationship,
      context:
        formRelationshipContext.trim() ||
        `Primary ${formRelationship} for ${formProductInterests.join(", ")} solution.`,
    };

    const allPersonRelationships = [primaryRel, ...additionalRelationships];

    if (modalMode === "ADD") {
      const newPerson: PersonItem = {
        id: `per-${Date.now()}`,
        fullName: formName.trim(),
        primaryTitle: formTitle.trim() || "Stakeholder",
        email: formEmail.trim() || "contact@client.co.ke",
        phone: formPhone.trim(),
        whatsApp: formWhatsApp.trim() || formPhone.trim(),
        primaryOrganizationId: primaryRel.organizationId,
        primaryOrganizationName: formOrgName.trim(),
        productInterests: formProductInterests.length > 0 ? formProductInterests : ["Multi-product"],
        relationships: allPersonRelationships,
        tags: formTags.length > 0 ? formTags : ["Direct Contact"],
        lastContacted: "Just added",
        notes: formNotes.trim() || "Recorded in people & network registry.",
      };

      setPeople((prev) => [newPerson, ...prev]);
      setSelectedPersonId(newPerson.id);
      setIsModalOpen(false);
      setToastMessage(`✓ Added "${newPerson.fullName}" to network registry!`);
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      if (!editingPersonId) return;

      const updatedPerson: PersonItem = {
        id: editingPersonId,
        fullName: formName.trim(),
        primaryTitle: formTitle.trim() || "Stakeholder",
        email: formEmail.trim() || "contact@client.co.ke",
        phone: formPhone.trim(),
        whatsApp: formWhatsApp.trim() || formPhone.trim(),
        primaryOrganizationId: primaryRel.organizationId,
        primaryOrganizationName: formOrgName.trim(),
        productInterests: formProductInterests.length > 0 ? formProductInterests : ["Multi-product"],
        relationships: allPersonRelationships,
        tags: formTags.length > 0 ? formTags : ["Direct Contact"],
        lastContacted: "Updated today",
        notes: formNotes.trim() || "Recorded in people & network registry.",
      };

      setPeople((prev) => prev.map((p) => (p.id === editingPersonId ? updatedPerson : p)));
      setIsModalOpen(false);
      setToastMessage(`✓ Updated stakeholder details for "${updatedPerson.fullName}"!`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Delete Person
  const handleDeletePerson = (personId: string) => {
    const toDelete = people.find((p) => p.id === personId);
    const updated = people.filter((p) => p.id !== personId);
    setPeople(updated);
    if (selectedPersonId === personId) {
      setSelectedPersonId(updated[0]?.id || "");
    }
    setDeleteConfirmPerson(null);
    setToastMessage(`✓ Removed "${toDelete?.fullName || "Stakeholder"}" from registry.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Clear all to clean slate
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all stakeholders and start afresh?")) {
      setPeople([]);
      setSelectedPersonId("");
      localStorage.removeItem(STORAGE_KEY);
      setToastMessage("✓ People directory cleared. Ready for your live network.");
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Stakeholder &amp; Relationship Layer
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Multi-Entity People Intelligence</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              People &amp; Key Stakeholders
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              One individual, multiple business relationships: track decision makers, workshop managers, partners, and referrers across organizations without duplicating records.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
            {people.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                title="Clear all mock/test stakeholders to start fresh"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Start Afresh</span>
              </button>
            )}
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Stakeholder</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

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
              All Stakeholders ({people.length})
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
                #{tag}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, title, organization, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

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
      </div>
    </WorkspaceLayout>
  );
}
