"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Search,
  MessageCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  X,
  Building2,
  AlertCircle,
} from "lucide-react";
import { INITIAL_CLIENTS, ClientItem } from "@/data/clients-projects-seed";
import { useProductsCatalog } from "@/lib/products-store";

const STORAGE_KEY = "versaly_clients_list_v2";

export default function ClientsPage() {
  const { products: catalogProducts } = useProductsCatalog();
  const [clients, setClients] = useState<ClientItem[]>(() => {
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
    return INITIAL_CLIENTS;
  });

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
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
    return INITIAL_CLIENTS[0]?.id || "";
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState<ClientItem | null>(null);

  // Form State
  const [formBusinessName, setFormBusinessName] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formContactPhone, setFormContactPhone] = useState("");
  const [formContactWhatsApp, setFormContactWhatsApp] = useState("");
  const [formContactEmail, setFormContactEmail] = useState("");
  const [formProductSlug, setFormProductSlug] = useState("vehisoft");
  const [formMonthlyMRR, setFormMonthlyMRR] = useState("12000");
  const [formStatus, setFormStatus] = useState<ClientItem["status"]>("ONBOARDING");
  const [formRenewalDate, setFormRenewalDate] = useState("2026-11-15");
  const [formPaymentMethod, setFormPaymentMethod] = useState("M-Pesa Paybill");
  const [formTaxPin, setFormTaxPin] = useState("");
  const [formOnboardingStep, setFormOnboardingStep] = useState(1);

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
      window.dispatchEvent(new CustomEvent("versaly_clients_updated"));
    } catch {
      // ignore
    }
  }, [clients]);

  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || clients[0] || null;
  }, [clients, selectedClientId]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      const matchesSearch =
        c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.productName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [clients, statusFilter, searchQuery]);

  const totalMRRKES = useMemo(() => {
    return clients.reduce((sum, c) => sum + c.monthlyMRR, 0);
  }, [clients]);

  const onboardingCount = useMemo(() => {
    return clients.filter((c) => c.status === "ONBOARDING").length;
  }, [clients]);

  const productMap = useMemo(() => {
    const map: Record<string, string> = {};
    catalogProducts.forEach((p) => {
      map[p.slug] = p.name;
    });
    return map;
  }, [catalogProducts]);

  const openAddModal = () => {
    setEditingClient(null);
    setFormBusinessName("");
    setFormContactName("");
    setFormContactPhone("+254 ");
    setFormContactWhatsApp("+254 ");
    setFormContactEmail("");
    setFormProductSlug("vehisoft");
    setFormMonthlyMRR("15000");
    setFormStatus("ONBOARDING");
    setFormRenewalDate("2026-11-20");
    setFormPaymentMethod("M-Pesa Paybill");
    setFormTaxPin("");
    setFormOnboardingStep(1);
    setIsModalOpen(true);
  };

  const openEditModal = (client: ClientItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingClient(client);
    setFormBusinessName(client.businessName);
    setFormContactName(client.contactName);
    setFormContactPhone(client.contactPhone);
    setFormContactWhatsApp(client.contactWhatsApp);
    setFormContactEmail(client.contactEmail);
    setFormProductSlug(client.productSlug);
    setFormMonthlyMRR(client.monthlyMRR.toString());
    setFormStatus(client.status);
    setFormRenewalDate(client.renewalDate);
    setFormPaymentMethod(client.paymentMethod);
    setFormTaxPin(client.taxPin || "");
    setFormOnboardingStep(client.currentOnboardingStep || 1);
    setIsModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBusinessName.trim() || !formContactName.trim()) return;

    const mrr = parseInt(formMonthlyMRR.replace(/[^0-9]/g, ""), 10) || 0;
    const progressPct = Math.round((formOnboardingStep / 8) * 100);

    if (editingClient) {
      // Update
      const updated: ClientItem = {
        ...editingClient,
        businessName: formBusinessName.trim(),
        contactName: formContactName.trim(),
        contactPhone: formContactPhone.trim(),
        contactWhatsApp: formContactWhatsApp.trim() || formContactPhone.trim(),
        contactEmail: formContactEmail.trim(),
        productSlug: formProductSlug,
        productName: productMap[formProductSlug] || "Custom Solution",
        monthlyMRR: mrr,
        status: formStatus,
        renewalDate: formRenewalDate,
        paymentMethod: formPaymentMethod,
        taxPin: formTaxPin.trim() || undefined,
        currentOnboardingStep: formOnboardingStep,
        onboardingProgressPct: progressPct,
      };

      setClients((prev) => prev.map((c) => (c.id === editingClient.id ? updated : c)));
    } else {
      // Add
      const newId = `cli-${Date.now()}`;
      const newClient: ClientItem = {
        id: newId,
        organizationId: `org-${Date.now()}`,
        businessName: formBusinessName.trim(),
        contactName: formContactName.trim(),
        contactPhone: formContactPhone.trim(),
        contactWhatsApp: formContactWhatsApp.trim() || formContactPhone.trim(),
        contactEmail: formContactEmail.trim(),
        productSlug: formProductSlug,
        productName: productMap[formProductSlug] || "Custom Solution",
        monthlyMRR: mrr,
        status: formStatus,
        renewalDate: formRenewalDate,
        paymentMethod: formPaymentMethod,
        taxPin: formTaxPin.trim() || undefined,
        currentOnboardingStep: formOnboardingStep,
        onboardingProgressPct: progressPct,
        signedContractDoc: `MSA_Signed_${formBusinessName.replace(/\s+/g, "_")}.pdf`,
      };

      setClients((prev) => [newClient, ...prev]);
      setSelectedClientId(newId);
    }

    setIsModalOpen(false);
  };

  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => {
      const remaining = prev.filter((c) => c.id !== clientId);
      if (selectedClientId === clientId && remaining.length > 0) {
        setSelectedClientId(remaining[0].id);
      }
      return remaining;
    });
    setDeleteConfirmClient(null);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Client Operations Hub
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">360° Relationship Hub</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Client Command Center & Renewals
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Every signed client has an active subscription, linked contacts, signed documents, payment method, and live 8-step onboarding journey.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Client</span>
            </button>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
            >
              <span>View Implementations</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Portfolio Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Active Subscriptions</div>
            <div className="text-xl font-bold text-white mt-1">{clients.length} Accounts</div>
            <div className="text-[10px] text-indigo-400 mt-1">Across 5 products</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Total Monthly MRR</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              KES {totalMRRKES.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>100% M-Pesa / Bank verified</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">In Active Onboarding</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{onboardingCount} Clients</div>
            <div className="text-[10px] text-slate-500 mt-1">Advancing towards Step 7 win</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Upcoming Renewals</div>
            <div className="text-xl font-bold text-indigo-300 mt-1">
              {clients.filter((c) => c.status === "ACTIVE").length} Active Cycles
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Auto-invoices queued</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["ALL", "ONBOARDING", "ACTIVE", "PAST_DUE"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {s === "ALL" ? "All Subscriptions" : s}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients, owners, products..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 360° Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Cards List (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">No clients match the current filters.</p>
                <button
                  onClick={openAddModal}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add First Client</span>
                </button>
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative ${
                      isSelected
                        ? "bg-indigo-950/30 border-indigo-500/40 shadow-sm"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0 pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-100 group-hover:text-indigo-200 transition-colors">
                          {client.businessName}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {client.productName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                            client.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : client.status === "PAST_DUE"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {client.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                        <span>
                          Owner: <strong className="text-slate-300 font-medium">{client.contactName}</strong>
                        </span>
                        <span>•</span>
                        <span>Renewal: {client.renewalDate}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span className="text-slate-300 font-medium">
                          Onboarding Step {client.currentOnboardingStep || 1}/8 ({client.onboardingProgressPct || 12}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-bold text-emerald-400 font-mono">
                          KES {client.monthlyMRR.toLocaleString()}/mo
                        </div>
                        <span className="text-[11px] text-slate-500">{client.paymentMethod}</span>
                      </div>

                      {/* Quick Edit & Delete Actions */}
                      <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => openEditModal(client, e)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                          title="Edit Client"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmClient(client);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-500/20 transition"
                          title="Delete Client"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 360° Profile Side-Drawer (1 col) */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-5">
            {selectedClient ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {selectedClient.productName} Client
                      </span>
                      <span className="text-xs text-slate-400 font-mono">PIN: {selectedClient.taxPin || "N/A"}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-2">{selectedClient.businessName}</h3>
                    <p className="text-xs text-slate-400">
                      Active subscription • {selectedClient.status}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(selectedClient)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Edit Client Information"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmClient(selectedClient)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                      title="Delete Client"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Monthly MRR:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      KES {selectedClient.monthlyMRR.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Payment Channel:</span>
                    <span className="text-slate-200">{selectedClient.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Next Renewal Date:</span>
                    <span className="text-indigo-300 font-medium">{selectedClient.renewalDate}</span>
                  </div>
                </div>

                {/* Primary Contact with WhatsApp Action */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Primary Decision Maker
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">{selectedClient.contactName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{selectedClient.contactPhone}</div>
                      {selectedClient.contactEmail && (
                        <div className="text-[11px] text-slate-500">{selectedClient.contactEmail}</div>
                      )}
                    </div>
                    {selectedClient.contactWhatsApp && (
                      <a
                        href={`https://wa.me/${selectedClient.contactWhatsApp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition flex items-center gap-1"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* 8-Step Onboarding Journey Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      8-Step Onboarding Journey
                    </h4>
                    <span className="text-xs font-bold text-indigo-400">
                      Step {selectedClient.currentOnboardingStep || 1}/8
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${selectedClient.onboardingProgressPct || 12}%` }}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Agreement & payment instructions sent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Setup fee payment confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Data collection & bay layout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(selectedClient.currentOnboardingStep || 1) >= 4 ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      )}
                      <span className={(selectedClient.currentOnboardingStep || 1) >= 4 ? "text-slate-200" : "text-slate-500"}>
                        Product configuration & catalog
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connected Documents & Implementation Button */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileCheck className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="text-slate-300 text-[11px] font-mono truncate">{selectedClient.signedContractDoc || "MSA_Master_Agreement.pdf"}</span>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-medium shrink-0">Signed</span>
                  </div>

                  <Link
                    href={`/projects#${selectedClient.id}`}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Manage Implementation Project</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Select a client to view their complete 360° profile.
              </div>
            )}
          </div>
        </div>

        {/* Add / Edit Client Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-base text-white">
                    {editingClient ? "Edit Client Account" : "Add New Client Account"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Auto Clinic"
                      value={formBusinessName}
                      onChange={(e) => setFormBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Product Solution</label>
                    <select
                      value={formProductSlug}
                      onChange={(e) => {
                        setFormProductSlug(e.target.value);
                        const found = catalogProducts.find((p) => p.slug === e.target.value);
                        if (found) {
                          setFormMonthlyMRR(found.monthlyFee.toString());
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {catalogProducts.map((prod) => (
                        <option key={prod.slug} value={prod.slug}>
                          {prod.name} ({prod.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Primary Owner / Contact *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. James Mwangi"
                      value={formContactName}
                      onChange={(e) => setFormContactName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="+254 722 000 000"
                      value={formContactPhone}
                      onChange={(e) => setFormContactPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      placeholder="+254 722 000 000"
                      value={formContactWhatsApp}
                      onChange={(e) => setFormContactWhatsApp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
                    <input
                      type="email"
                      placeholder="client@business.co.ke"
                      value={formContactEmail}
                      onChange={(e) => setFormContactEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Monthly MRR (KES)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      placeholder="12000"
                      value={formMonthlyMRR}
                      onChange={(e) => setFormMonthlyMRR(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Subscription Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as ClientItem["status"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ONBOARDING">ONBOARDING</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PAST_DUE">PAST_DUE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Renewal Date</label>
                    <input
                      type="date"
                      value={formRenewalDate}
                      onChange={(e) => setFormRenewalDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="M-Pesa Paybill">M-Pesa Paybill</option>
                      <option value="M-Pesa STK Push">M-Pesa STK Push</option>
                      <option value="Bank Transfer">Bank Transfer (EFT/RTGS)</option>
                      <option value="Cheque / Cash">Cheque / Cash</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">KRA Tax PIN (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. P051239841Z"
                      value={formTaxPin}
                      onChange={(e) => setFormTaxPin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 uppercase placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Onboarding Step (1 - 8)</label>
                    <select
                      value={formOnboardingStep}
                      onChange={(e) => setFormOnboardingStep(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value={1}>Step 1: Agreement & Payment Instructions</option>
                      <option value={2}>Step 2: Setup Fee Payment Confirmed</option>
                      <option value={3}>Step 3: Data Collection & Layout</option>
                      <option value={4}>Step 4: Product Configuration</option>
                      <option value={5}>Step 5: Staff Training</option>
                      <option value={6}>Step 6: First Live Transaction</option>
                      <option value={7}>Step 7: First Measurable Win Confirmed</option>
                      <option value={8}>Step 8: 30-Day Check-in Complete</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25"
                  >
                    {editingClient ? "Save Changes" : "Create Client Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/30 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Delete Client Record?</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This will remove <strong className="text-white">{deleteConfirmClient.businessName}</strong> and detach associated project trackers.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmClient(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClient(deleteConfirmClient.id)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/25"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
