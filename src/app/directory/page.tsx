"use client";

import { useState, useMemo, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Building2,
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  MessageCircle,
  Activity,
  Edit2,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import {
  DIRECTORY_ORGANIZATIONS,
  DirectoryOrganization,
  DirectoryPerson,
  DirectoryActivity,
} from "@/data/directory-seed";

const STORAGE_KEY = "versaly_directory_orgs_v2";

export default function DirectoryPage() {
  const [organizations, setOrganizations] = useState<DirectoryOrganization[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return DIRECTORY_ORGANIZATIONS;
  });

  const [activeTab, setActiveTab] = useState<"organizations" | "people">("organizations");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0].id;
          }
        }
      } catch {
        // ignore
      }
    }
    return DIRECTORY_ORGANIZATIONS[0]?.id || "";
  });
  const [newNoteText, setNewNoteText] = useState("");

  // Modal States
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<DirectoryOrganization | null>(null);
  const [deleteConfirmOrg, setDeleteConfirmOrg] = useState<DirectoryOrganization | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<DirectoryOrganization["type"]>("CLIENT");
  const [formIndustry, setFormIndustry] = useState("");
  const [formProductFit, setFormProductFit] = useState("Vehisoft");
  const [formCity, setFormCity] = useState("Nairobi");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("+254 ");
  const [formEmail, setFormEmail] = useState("");
  const [formTaxPin, setFormTaxPin] = useState("");
  const [formContactFirstName, setFormContactFirstName] = useState("");
  const [formContactLastName, setFormContactLastName] = useState("");
  const [formContactRole, setFormContactRole] = useState("Managing Director");

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(organizations));
    } catch {
      // ignore
    }
  }, [organizations]);

  const selectedOrg = useMemo(() => {
    return organizations.find((o) => o.id === selectedOrgId) || organizations[0] || null;
  }, [organizations, selectedOrgId]);

  // Extract all people
  const allPeople: DirectoryPerson[] = useMemo(() => {
    return organizations.flatMap((org) =>
      org.contacts.map((c) => ({
        ...c,
        organizationName: org.name,
      }))
    );
  }, [organizations]);

  // Filter organizations
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const matchesType = typeFilter === "ALL" || org.type === typeFilter;
      const matchesSearch =
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.productFit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [organizations, typeFilter, searchQuery]);

  // Filter people
  const filteredPeople = useMemo(() => {
    return allPeople.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        (p.organizationName && p.organizationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery);
      return matchesSearch;
    });
  }, [allPeople, searchQuery]);

  // Note Editing State
  const [editingNote, setEditingNote] = useState<DirectoryActivity | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState("");
  const [editingNoteDesc, setEditingNoteDesc] = useState("");

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedOrg) return;

    const newActivity = {
      id: `act-${Date.now()}`,
      type: "NOTE" as const,
      title: "Operational Note Added",
      description: newNoteText.trim(),
      timestamp: "Just now",
      actor: "Operations Lead",
    };

    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === selectedOrg.id
          ? { ...o, activities: [newActivity, ...o.activities] }
          : o
      )
    );
    setNewNoteText("");
  }

  function handleStartEditNote(act: DirectoryActivity) {
    setEditingNote(act);
    setEditingNoteTitle(act.title);
    setEditingNoteDesc(act.description);
  }

  function handleSaveEditNote(e: React.FormEvent) {
    e.preventDefault();
    if (!editingNote || !selectedOrg || !editingNoteDesc.trim()) return;

    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === selectedOrg.id
          ? {
              ...o,
              activities: o.activities.map((a) =>
                a.id === editingNote.id
                  ? {
                      ...a,
                      title: editingNoteTitle.trim() || a.title,
                      description: editingNoteDesc.trim(),
                    }
                  : a
              ),
            }
          : o
      )
    );

    setEditingNote(null);
  }

  function handleDeleteNote(actId: string) {
    if (!selectedOrg) return;
    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === selectedOrg.id
          ? { ...o, activities: o.activities.filter((a) => a.id !== actId) }
          : o
      )
    );
  }

  const openAddModal = () => {
    setEditingOrg(null);
    setFormName("");
    setFormType("CLIENT");
    setFormIndustry("Automotive Services");
    setFormProductFit("Vehisoft");
    setFormCity("Nairobi");
    setFormAddress("Commercial Center");
    setFormPhone("+254 722 000 000");
    setFormEmail("");
    setFormTaxPin("");
    setFormContactFirstName("");
    setFormContactLastName("");
    setFormContactRole("Managing Director");
    setIsOrgModalOpen(true);
  };

  const openEditModal = (org: DirectoryOrganization, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOrg(org);
    setFormName(org.name);
    setFormType(org.type);
    setFormIndustry(org.industry);
    setFormProductFit(org.productFit);
    setFormCity(org.city);
    setFormAddress(org.address);
    setFormPhone(org.phone);
    setFormEmail(org.email);
    setFormTaxPin(org.taxPin || "");
    if (org.contacts.length > 0) {
      setFormContactFirstName(org.contacts[0].firstName);
      setFormContactLastName(org.contacts[0].lastName);
      setFormContactRole(org.contacts[0].jobTitle);
    } else {
      setFormContactFirstName("");
      setFormContactLastName("");
      setFormContactRole("Managing Director");
    }
    setIsOrgModalOpen(true);
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingOrg) {
      // Update
      const updatedContacts = editingOrg.contacts.length > 0
        ? [
            {
              ...editingOrg.contacts[0],
              firstName: formContactFirstName.trim() || editingOrg.contacts[0].firstName,
              lastName: formContactLastName.trim() || editingOrg.contacts[0].lastName,
              jobTitle: formContactRole.trim() || editingOrg.contacts[0].jobTitle,
              phone: formPhone.trim(),
              email: formEmail.trim(),
            },
            ...editingOrg.contacts.slice(1),
          ]
        : [
            {
              id: `per-${Date.now()}`,
              organizationId: editingOrg.id,
              organizationName: formName.trim(),
              firstName: formContactFirstName.trim() || "Primary",
              lastName: formContactLastName.trim() || "Contact",
              jobTitle: formContactRole.trim() || "Manager",
              email: formEmail.trim(),
              phone: formPhone.trim(),
              whatsapp: formPhone.trim(),
              contactType: "PRIMARY" as const,
            },
          ];

      const updated: DirectoryOrganization = {
        ...editingOrg,
        name: formName.trim(),
        type: formType,
        industry: formIndustry.trim(),
        productFit: formProductFit.trim(),
        city: formCity.trim(),
        address: formAddress.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        taxPin: formTaxPin.trim() || undefined,
        contacts: updatedContacts,
      };

      setOrganizations((prev) => prev.map((o) => (o.id === editingOrg.id ? updated : o)));
    } else {
      // Add
      const newId = `org-${Date.now()}`;
      const newOrg: DirectoryOrganization = {
        id: newId,
        name: formName.trim(),
        type: formType,
        industry: formIndustry.trim(),
        productFit: formProductFit.trim(),
        city: formCity.trim(),
        address: formAddress.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        taxPin: formTaxPin.trim() || undefined,
        status: "ACTIVE",
        contacts: [
          {
            id: `per-${Date.now()}`,
            organizationId: newId,
            organizationName: formName.trim(),
            firstName: formContactFirstName.trim() || "Primary",
            lastName: formContactLastName.trim() || "Contact",
            jobTitle: formContactRole.trim() || "Manager",
            email: formEmail.trim(),
            phone: formPhone.trim(),
            whatsapp: formPhone.trim(),
            contactType: "PRIMARY",
          },
        ],
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "NOTE",
            title: "Organization Profile Initialized",
            description: `Record created directly in Directory hub.`,
            timestamp: "Just now",
            actor: "Operations Lead",
          },
        ],
      };

      setOrganizations((prev) => [newOrg, ...prev]);
      setSelectedOrgId(newId);
    }

    setIsOrgModalOpen(false);
  };

  const handleDeleteOrg = (orgId: string) => {
    setOrganizations((prev) => {
      const remaining = prev.filter((o) => o.id !== orgId);
      if (selectedOrgId === orgId && remaining.length > 0) {
        setSelectedOrgId(remaining[0].id);
      }
      return remaining;
    });
    setDeleteConfirmOrg(null);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Core Directory
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Relational Graph Active</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Organizations & People Directory
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              One canonical record per business/client. Every lead, deal, project, task, document, and invoice links back to this relational hub.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Organization</span>
            </button>
          </div>
        </div>

        {/* Navigation & Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab("organizations")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "organizations"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Organizations ({organizations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("people")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "people"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>People ({allPeople.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search directory records..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Filters if in Organizations Tab */}
        {activeTab === "organizations" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["ALL", "CLIENT", "PROSPECT", "PARTNER", "VENDOR"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  typeFilter === type
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {type === "ALL" ? "All Types" : type}
              </button>
            ))}
          </div>
        )}

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

        {/* Add / Edit Org Modal */}
        {isOrgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-base text-white">
                    {editingOrg ? "Edit Organization" : "Add Organization Record"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOrgModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOrg} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Auto Clinic"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as DirectoryOrganization["type"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CLIENT">CLIENT</option>
                      <option value="PROSPECT">PROSPECT</option>
                      <option value="PARTNER">PARTNER</option>
                      <option value="VENDOR">VENDOR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Industry Sector</label>
                    <input
                      type="text"
                      placeholder="e.g. Automotive Services"
                      value={formIndustry}
                      onChange={(e) => setFormIndustry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Primary Product Fit</label>
                    <select
                      value={formProductFit}
                      onChange={(e) => setFormProductFit(e.target.value)}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Nairobi"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise Rd, Industrial Area"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="+254 722 000 000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="info@business.co.ke"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">KRA PIN (Optional)</label>
                    <input
                      type="text"
                      placeholder="P051239841Z"
                      value={formTaxPin}
                      onChange={(e) => setFormTaxPin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 uppercase font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <h4 className="font-semibold text-slate-200">Key Decision Maker Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">First Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Samuel"
                        value={formContactFirstName}
                        onChange={(e) => setFormContactFirstName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Last Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Kamau"
                        value={formContactLastName}
                        onChange={(e) => setFormContactLastName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Managing Director"
                        value={formContactRole}
                        onChange={(e) => setFormContactRole(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsOrgModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25"
                  >
                    {editingOrg ? "Save Organization" : "Create Record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
      </div>
    </WorkspaceLayout>
  );
}
