"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Flame,
  Plus,
  Search,
  MapPin,
  DollarSign,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import {
  INITIAL_CAMPAIGNS,
  MarketingCampaign,
  MarketingProduct,
  CampaignChannel,
  CampaignStatus,
} from "@/data/marketing-seed";

const STORAGE_KEY = "versaly_marketing_campaigns_v1";

const CHANNELS: CampaignChannel[] = [
  "Billboard",
  "Meta (FB & IG)",
  "Google Ads",
  "TikTok",
  "LinkedIn",
  "Print & Flyers",
  "Direct / Events",
];

const PRODUCTS: MarketingProduct[] = [
  "Adversoft",
  "Vehisoft",
  "Versandry",
  "LipaTim",
  "Melio RMS",
  "Versaly Core / Brand",
];

export default function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_CAMPAIGNS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formProduct, setFormProduct] = useState<MarketingProduct>("Vehisoft");
  const [formChannel, setFormChannel] = useState<CampaignChannel>("Meta (FB & IG)");
  const [formStatus, setFormStatus] = useState<CampaignStatus>("Active");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formSpend, setFormSpend] = useState("");
  const [formImpressions, setFormImpressions] = useState("");
  const [formClicks, setFormClicks] = useState("");
  const [formLeads, setFormLeads] = useState("");
  const [formDealsWon, setFormDealsWon] = useState("");
  const [formRevenue, setFormRevenue] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formAudience, setFormAudience] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    } catch {
      // ignore
    }
  }, [campaigns]);

  // Aggregate KPI Calculations
  const stats = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((c) => c.status === "Active").length;
    const totalBudget = campaigns.reduce((acc, c) => acc + c.allocatedBudget, 0);
    const totalSpend = campaigns.reduce((acc, c) => acc + c.totalSpend, 0);
    const totalLeads = campaigns.reduce((acc, c) => acc + c.leadsGenerated, 0);
    const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenueGenerated, 0);
    const cpl = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;
    return { totalCampaigns, activeCampaigns, totalBudget, totalSpend, totalLeads, totalRevenue, cpl };
  }, [campaigns]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      const matchesSearch =
        camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (camp.locationDetails && camp.locationDetails.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesChannel = selectedChannel === "ALL" || camp.channel === selectedChannel;
      const matchesStatus = selectedStatus === "ALL" || camp.status === selectedStatus;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [campaigns, searchQuery, selectedChannel, selectedStatus]);

  // Open Add Modal
  const openAddModal = () => {
    setModalMode("ADD");
    setEditingCampaignId(null);
    setFormName("");
    setFormProduct("Vehisoft");
    setFormChannel("Meta (FB & IG)");
    setFormStatus("Active");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormEndDate("");
    setFormBudget("50000");
    setFormSpend("0");
    setFormImpressions("0");
    setFormClicks("0");
    setFormLeads("0");
    setFormDealsWon("0");
    setFormRevenue("0");
    setFormLocation("");
    setFormAudience("Nairobi automotive dealerships & garage owners");
    setFormNotes("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (camp: MarketingCampaign) => {
    setModalMode("EDIT");
    setEditingCampaignId(camp.id);
    setFormName(camp.name);
    setFormProduct(camp.product);
    setFormChannel(camp.channel);
    setFormStatus(camp.status);
    setFormStartDate(camp.startDate);
    setFormEndDate(camp.endDate);
    setFormBudget(camp.allocatedBudget.toString());
    setFormSpend(camp.totalSpend.toString());
    setFormImpressions(camp.impressions.toString());
    setFormClicks(camp.clicks.toString());
    setFormLeads(camp.leadsGenerated.toString());
    setFormDealsWon(camp.dealsWon.toString());
    setFormRevenue(camp.revenueGenerated.toString());
    setFormLocation(camp.locationDetails || "");
    setFormAudience(camp.targetAudience);
    setFormNotes(camp.notes);
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload: MarketingCampaign = {
      id: modalMode === "EDIT" && editingCampaignId ? editingCampaignId : `camp-${Date.now()}`,
      name: formName.trim(),
      product: formProduct,
      channel: formChannel,
      status: formStatus,
      startDate: formStartDate || new Date().toISOString().split("T")[0],
      endDate: formEndDate,
      allocatedBudget: parseFloat(formBudget) || 0,
      totalSpend: parseFloat(formSpend) || 0,
      impressions: parseInt(formImpressions) || 0,
      clicks: parseInt(formClicks) || 0,
      leadsGenerated: parseInt(formLeads) || 0,
      dealsWon: parseInt(formDealsWon) || 0,
      revenueGenerated: parseFloat(formRevenue) || 0,
      locationDetails: formLocation.trim() || undefined,
      targetAudience: formAudience.trim(),
      notes: formNotes.trim(),
    };

    if (modalMode === "ADD") {
      setCampaigns((prev) => [payload, ...prev]);
    } else {
      setCampaigns((prev) => prev.map((c) => (c.id === editingCampaignId ? payload : c)));
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete campaign "${name}"?`)) {
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Quick Toggle Status
  const toggleStatus = (id: string, current: CampaignStatus) => {
    const next: CampaignStatus =
      current === "Active" ? "Paused" : current === "Paused" ? "Active" : "Active";
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: next } : c)));
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Outbound & Inbound
              </span>
              <span className="text-xs text-slate-500">Marketing & Promotion</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Flame className="h-6 w-6 text-rose-500" />
              <span>Marketing Campaigns</span>
            </h1>
            <p className="text-xs text-slate-400">
              Manage high-impact billboard site buys, targeted Meta/Google/TikTok ads, and direct local promotions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/marketing/spend"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>Ad Spend Ledger</span>
            </Link>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>

        {/* Top Summary KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="liquid-glass p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] font-medium text-slate-400">Active Campaigns</div>
            <div className="text-lg font-bold text-white mt-1">
              {stats.activeCampaigns} <span className="text-xs text-slate-500">/ {stats.totalCampaigns}</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">Promotions Running</div>
          </div>

          <div className="liquid-glass p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] font-medium text-slate-400">Budget Allocated</div>
            <div className="text-lg font-bold text-white mt-1 font-mono">
              KES {stats.totalBudget.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Across all channels</div>
          </div>

          <div className="liquid-glass p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] font-medium text-slate-400">Incurred Spend</div>
            <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">
              KES {stats.totalSpend.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              {stats.totalBudget > 0 ? `${Math.round((stats.totalSpend / stats.totalBudget) * 100)}% deployed` : "0%"}
            </div>
          </div>

          <div className="liquid-glass p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] font-medium text-slate-400">Inbound Leads</div>
            <div className="text-lg font-bold text-indigo-400 mt-1">
              {stats.totalLeads}
            </div>
            <div className="text-[10px] text-slate-500">Attributed prospects</div>
          </div>

          <div className="liquid-glass p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] font-medium text-slate-400">Cost Per Lead (CPL)</div>
            <div className="text-lg font-bold text-amber-400 mt-1 font-mono">
              KES {stats.cpl.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Blended average</div>
          </div>

          <div className="liquid-glass p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] font-medium text-slate-400">Attributed Closed Sales</div>
            <div className="text-lg font-bold text-rose-400 mt-1 font-mono">
              KES {stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Won revenue</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="liquid-glass p-3 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns, products, corridors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Channel Filter */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full">
              <button
                onClick={() => setSelectedChannel("ALL")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                  selectedChannel === "ALL"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                All Channels
              </button>
              {CHANNELS.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                    selectedChannel === ch
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Planned">Planned</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Campaign Cards Grid */}
        {filteredCampaigns.length === 0 ? (
          <div className="liquid-glass p-12 text-center rounded-2xl border border-slate-800/80 space-y-3">
            <Flame className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Campaigns Match Filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or create a new campaign to begin tracking ad spend and lead flow.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCampaigns.map((camp) => {
              const spendPct =
                camp.allocatedBudget > 0
                  ? Math.min(100, Math.round((camp.totalSpend / camp.allocatedBudget) * 100))
                  : 0;

              const campCpl =
                camp.leadsGenerated > 0
                  ? Math.round(camp.totalSpend / camp.leadsGenerated)
                  : 0;

              return (
                <div
                  key={camp.id}
                  id={camp.id}
                  className="liquid-glass rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition p-5 space-y-4 flex flex-col justify-between group relative"
                >
                  <div className="space-y-3">
                    {/* Header Badges & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {camp.product}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {camp.channel}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleStatus(camp.id, camp.status)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                            camp.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : camp.status === "Planned"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                          title="Click to toggle status"
                        >
                          {camp.status}
                        </button>
                        <button
                          onClick={() => openEditModal(camp)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit Campaign"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(camp.id, camp.name)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete Campaign"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Campaign Title & Target */}
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                        {camp.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {camp.targetAudience}
                      </p>
                    </div>

                    {/* Physical Location Details for Billboards */}
                    {camp.locationDetails && (
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs flex items-start gap-2 text-slate-300">
                        <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-[11px]">{camp.locationDetails}</span>
                      </div>
                    )}

                    {/* Budget & Spend Progress */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Spend vs Budget</span>
                        <span className="font-mono text-white text-[11px] font-semibold">
                          KES {camp.totalSpend.toLocaleString()} / KES {camp.allocatedBudget.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            spendPct >= 90 ? "bg-rose-500" : spendPct >= 60 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${spendPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Performance Metrics Matrix */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-center">
                      <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                        <div className="text-[10px] text-slate-500">Impressions</div>
                        <div className="text-xs font-bold text-white mt-0.5 font-mono">
                          {camp.impressions.toLocaleString()}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                        <div className="text-[10px] text-slate-500">Leads</div>
                        <div className="text-xs font-bold text-indigo-400 mt-0.5 font-mono">
                          {camp.leadsGenerated}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                        <div className="text-[10px] text-slate-500">Cost / Lead</div>
                        <div className="text-xs font-bold text-amber-400 mt-0.5 font-mono">
                          KES {campCpl.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Notes & Revenue Won */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-500">
                      Dates: {camp.startDate} {camp.endDate ? `→ ${camp.endDate}` : ""}
                    </div>
                    <div className="font-mono text-emerald-400 font-bold text-xs">
                      KES {camp.revenueGenerated.toLocaleString()} won
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass border border-slate-700/80 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {modalMode === "ADD" ? "Create New Marketing Campaign" : "Edit Campaign"}
                </h3>
                <p className="text-xs text-slate-400">Configure acquisition channel, budget, and targets</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Westlands Roundabout Billboard or Vehisoft Meta Lead Gen"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Product *
                  </label>
                  <select
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value as MarketingProduct)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Channel *
                  </label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value as CampaignChannel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as CampaignStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Planned">Planned</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Allocated Budget (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Total Incurred Spend (KES)
                  </label>
                  <input
                    type="number"
                    value={formSpend}
                    onChange={(e) => setFormSpend(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Impressions
                  </label>
                  <input
                    type="number"
                    value={formImpressions}
                    onChange={(e) => setFormImpressions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Leads Generated
                  </label>
                  <input
                    type="number"
                    value={formLeads}
                    onChange={(e) => setFormLeads(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Deals Won
                  </label>
                  <input
                    type="number"
                    value={formDealsWon}
                    onChange={(e) => setFormDealsWon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              {formChannel === "Billboard" && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Billboard Site Location Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Westlands Roundabout, Ngong Road opposite Adams Arcade"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Car yard owners, laundromat proprietors in Nairobi"
                  value={formAudience}
                  onChange={(e) => setFormAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Notes & Strategy
                </label>
                <textarea
                  rows={2}
                  placeholder="Key messaging hook, offer guarantee, QR code destination..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg shadow-rose-600/25"
                >
                  {modalMode === "ADD" ? "Create Campaign" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
