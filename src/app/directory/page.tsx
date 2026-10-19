"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import {
  DIRECTORY_ORGANIZATIONS,
  DirectoryOrganization,
  DirectoryPerson,
} from "@/data/directory-seed";

export default function DirectoryPage() {
  const [activeTab, setActiveTab] = useState<"organizations" | "people">("organizations");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<DirectoryOrganization | null>(DIRECTORY_ORGANIZATIONS[0]);
  const [newNoteText, setNewNoteText] = useState("");

  // Extract all people
  const allPeople: DirectoryPerson[] = useMemo(() => {
    return DIRECTORY_ORGANIZATIONS.flatMap((org) =>
      org.contacts.map((c) => ({
        ...c,
        organizationName: org.name,
      }))
    );
  }, []);

  // Filter organizations
  const filteredOrganizations = useMemo(() => {
    return DIRECTORY_ORGANIZATIONS.filter((org) => {
      const matchesType = typeFilter === "ALL" || org.type === typeFilter;
      const matchesSearch =
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.productFit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [typeFilter, searchQuery]);

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

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedOrg) return;

    const newActivity = {
      id: `act-${Date.now()}`,
      type: "NOTE" as const,
      title: "Operational Note Added",
      description: newNoteText,
      timestamp: "Just now",
      actor: "Ted (Ops Lead)",
    };

    selectedOrg.activities.unshift(newActivity);
    setNewNoteText("");
  }

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Phase 2 Core Directory
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
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Record</span>
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
              <span>Organizations ({DIRECTORY_ORGANIZATIONS.length})</span>
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
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, industry, product fit, city, or phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
          </div>
        </div>

        {/* Type Filter Pills (for Organizations) */}
        {activeTab === "organizations" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["ALL", "CLIENT", "PROSPECT", "PARTNER", "VENDOR"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  typeFilter === t
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {t === "ALL" ? "All Types" : t}
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
                      onClick={() => setSelectedOrg(org)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between group ${
                        isSelected
                          ? "bg-indigo-950/30 border-indigo-500/40 shadow-sm"
                          : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
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

                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span>{org.industry}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            <span>{org.address}, {org.city}</span>
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                          <Users className="h-3 w-3" />
                          <span>{org.contacts.length} primary contact: </span>
                          <span className="text-slate-300 font-medium">
                            {org.contacts[0]?.firstName} {org.contacts[0]?.lastName} ({org.contacts[0]?.jobTitle})
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
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
                    <span className="text-xs text-slate-400 font-mono">PIN: {selectedOrg.taxPin || "N/A"}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">{selectedOrg.name}</h3>
                  <p className="text-xs text-slate-400">{selectedOrg.industry} • {selectedOrg.address}, {selectedOrg.city}</p>
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
                          <span className="font-semibold text-slate-200">{c.firstName} {c.lastName}</span>
                          <span className="text-[10px] text-slate-500">{c.jobTitle}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                          <span>{c.phone}</span>
                          <a
                            href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline font-medium"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Activity History ({selectedOrg.activities.length})</span>
                  </h4>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {selectedOrg.activities.map((act) => (
                      <div key={act.id} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-indigo-300">{act.title}</span>
                          <span className="text-slate-500">{act.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{act.description}</p>
                        <div className="text-[10px] text-slate-500 mt-1">Logged by: {act.actor}</div>
                      </div>
                    ))}
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
                Select an organization from the list to view full relational details and history.
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
