"use client";

import { useState, useMemo } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Target,
  Plus,
  MessageCircle,
  CheckCircle2,
  FileText,
  TrendingUp,
  X,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  INITIAL_RAW_LEADS,
  INITIAL_ACTIVE_DEALS,
  ActiveDealItem,
  RawLeadItem,
  DealStageType,
} from "@/data/leads-seed";
import { renderTemplate } from "@/lib/templates";

const STAGE_CONFIG: { id: DealStageType; label: string; color: string; badge: string }[] = [
  { id: "CONTACTED", label: "First Contact", color: "border-indigo-500/30 bg-indigo-950/20", badge: "text-indigo-300" },
  { id: "DEMO_BOOKED", label: "Demo Booked", color: "border-cyan-500/30 bg-cyan-950/20", badge: "text-cyan-300" },
  { id: "PROPOSAL_SENT", label: "Proposal Sent", color: "border-amber-500/30 bg-amber-950/20", badge: "text-amber-300" },
  { id: "NEGOTIATION", label: "Negotiation", color: "border-purple-500/30 bg-purple-950/20", badge: "text-purple-300" },
  { id: "WON", label: "Won (Auto-Onboarding)", color: "border-emerald-500/30 bg-emerald-950/20", badge: "text-emerald-300" },
  { id: "LOST", label: "Lost", color: "border-slate-800 bg-slate-900/30", badge: "text-slate-500" },
];

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "raw_pool">("pipeline");
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [rawLeads, setRawLeads] = useState<RawLeadItem[]>(INITIAL_RAW_LEADS);
  const [deals, setDeals] = useState<ActiveDealItem[]>(INITIAL_ACTIVE_DEALS);

  const [selectedDeal, setSelectedDeal] = useState<ActiveDealItem | null>(null);
  const [proposalModalDeal, setProposalModalDeal] = useState<ActiveDealItem | null>(null);
  const [wonNotice, setWonNotice] = useState<string | null>(null);
  const [copiedProposal, setCopiedProposal] = useState(false);

  // New Lead Form Modal
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newBizName, setNewBizName] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newProduct, setNewProduct] = useState("vehisoft");
  const [newSource, setNewSource] = useState<RawLeadItem["source"]>("Walk-in Route");
  const [newNotes, setNewNotes] = useState("");

  // Promote raw lead to active deal
  function handlePromoteToDeal(lead: RawLeadItem) {
    const newDeal: ActiveDealItem = {
      id: `deal-from-${lead.id}-${lead.productSlug}`,
      businessName: lead.businessName,
      contactName: lead.contactName || "Decision Maker",
      contactPhone: lead.phone || "",
      contactWhatsApp: lead.whatsapp || lead.phone || "",
      contactEmail: lead.email || "",
      productSlug: lead.productSlug,
      productName: lead.productName,
      stage: "CONTACTED",
      setupFeeKES: 35000,
      monthlyFeeKES: 12500,
      winProbability: 30,
      targetCloseDate: "2026-11-05",
      outreachChannel: lead.source,
      nextAction: "Initial consultation completed; follow up with live mobile walkthrough",
      nextActionDate: "In 2 days",
    };

    setDeals((prev) => [newDeal, ...prev]);
    setRawLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setActiveTab("pipeline");
    setSelectedDeal(newDeal);
  }

  // Update deal stage
  function handleUpdateStage(dealId: string, newStage: DealStageType) {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          const updated = { ...d, stage: newStage };
          if (newStage === "WON") {
            updated.onboardingProjectCreated = true;
            updated.winProbability = 100;
            setWonNotice(`Deal Won! Automatically provisioned 8-Step Onboarding Project for ${d.businessName}.`);
            setTimeout(() => setWonNotice(null), 5000);
          }
          return updated;
        }
        return d;
      })
    );

    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
  }

  // Add new raw lead
  function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    if (!newBizName.trim()) return;

    const prodNames: Record<string, string> = {
      adversoft: "Adversoft",
      vehisoft: "Vehisoft",
      versandry: "Versandry",
      lipatim: "LipaTim",
      "melio-rms": "Melio RMS",
    };

    const newLead: RawLeadItem = {
      id: `raw-${newBizName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${rawLeads.length + 1}`,
      businessName: newBizName,
      contactName: newContactName,
      phone: newPhone,
      whatsapp: newPhone,
      email: "",
      productSlug: newProduct,
      productName: prodNames[newProduct] || "Core",
      location: "Nairobi",
      source: newSource,
      notes: newNotes,
      status: "UNCONTACTED",
      createdAt: "Just now",
    };

    setRawLeads((prev) => [newLead, ...prev]);
    setIsAddLeadOpen(false);
    setNewBizName("");
    setNewContactName("");
    setNewPhone("");
    setNewNotes("");
  }

  // Pipeline metrics
  const pipelineMetrics = useMemo(() => {
    const active = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
    const totalPipelineValue = active.reduce((sum, d) => sum + d.setupFeeKES, 0);
    const potentialMRR = active.reduce((sum, d) => sum + d.monthlyFeeKES, 0);
    const wonCount = deals.filter((d) => d.stage === "WON").length;

    return {
      activeDealsCount: active.length,
      totalPipelineValue,
      potentialMRR,
      wonCount,
      rawLeadsCount: rawLeads.length,
    };
  }, [deals, rawLeads]);

  // Filtered deals
  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      const matchesProd = productFilter === "ALL" || d.productSlug === productFilter;
      const matchesSearch =
        d.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.productName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProd && matchesSearch;
    });
  }, [deals, productFilter, searchQuery]);

  // Filtered raw leads
  const filteredRawLeads = useMemo(() => {
    return rawLeads.filter((l) => {
      const matchesProd = productFilter === "ALL" || l.productSlug === productFilter;
      const matchesSearch =
        l.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProd && matchesSearch;
    });
  }, [rawLeads, productFilter, searchQuery]);

  // Render proposal template for modal
  const proposalContent = useMemo(() => {
    if (!proposalModalDeal) return "";
    const template = `# COMMERCIAL PROPOSAL & ROI AGREEMENT

**Client Organization:** {{client_name}}
**Contact Person:** {{contact_name}} (Phone: {{contact_phone}})
**Selected Solution:** {{product_name}}
**Date:** Today

---

### 1. Proposed Implementation
Versaly will deploy and configure **{{product_name}}** for {{client_name}} to streamline operations and eliminate manual workflow bottlenecks.

### 2. Commercial Terms
- **Implementation & Bay Setup Fee:** KES {{setup_fee}} (One-time)
- **Monthly SaaS Subscription:** KES {{monthly_fee}} / month (M-Pesa / Bank)

### 3. Founding-Client Live Guarantee
If the system is not live and operational within 14 days, the setup fee is 100% refundable.

---
*Generated directly from Versaly Core CRM*`;

    return renderTemplate(template, {
      client_name: proposalModalDeal.businessName,
      contact_name: proposalModalDeal.contactName,
      contact_phone: proposalModalDeal.contactPhone,
      product_name: proposalModalDeal.productName,
      setup_fee: proposalModalDeal.setupFeeKES.toLocaleString(),
      monthly_fee: proposalModalDeal.monthlyFeeKES.toLocaleString(),
    });
  }, [proposalModalDeal]);

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Commercial CRM
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Two-Tier Sales Lifecycle</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Sales Pipeline & Raw Leads Pool
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Uncontacted prospects are kept in the Raw Pool to preserve accurate conversion metrics. Once contacted, deals advance through standard pipeline stages until won.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddLeadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Raw Prospect</span>
            </button>
          </div>
        </div>

        {/* Won Deal Notification Alert */}
        {wonNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs animate-in slide-in-from-top-2 duration-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{wonNotice}</span>
            </div>
            <button
              onClick={() => setWonNotice(null)}
              className="text-emerald-400 hover:text-white font-semibold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Pipeline Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Active Pipeline Deals</div>
            <div className="text-xl font-bold text-white mt-1">{pipelineMetrics.activeDealsCount}</div>
            <div className="text-[10px] text-indigo-400 mt-1">Contacted to Negotiation</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Pipeline Setup Value</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              KES {(pipelineMetrics.totalPipelineValue / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-slate-500 mt-1">One-time implementation fees</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Potential MRR Added</div>
            <div className="text-xl font-bold text-indigo-300 mt-1 font-mono">
              KES {(pipelineMetrics.potentialMRR / 1000).toFixed(0)}k/mo
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Monthly SaaS recurring value</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Raw Uncontacted Pool</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{pipelineMetrics.rawLeadsCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">Awaiting first outreach</div>
          </div>
        </div>

        {/* Two-Tier Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "pipeline"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Active Pipeline ({deals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("raw_pool")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "raw_pool"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>Raw Leads Pool ({rawLeads.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals, prospects, owners..."
                className="w-full pl-3 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Product Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-500 font-medium">Product Filter:</span>
          {[
            { slug: "ALL", label: "All Products" },
            { slug: "adversoft", label: "Adversoft" },
            { slug: "vehisoft", label: "Vehisoft" },
            { slug: "versandry", label: "Versandry" },
            { slug: "lipatim", label: "LipaTim" },
            { slug: "melio-rms", label: "Melio RMS" },
          ].map((p) => (
            <button
              key={p.slug}
              onClick={() => setProductFilter(p.slug)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition ${
                productFilter === p.slug
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {activeTab === "pipeline" ? (
          /* Tier 1: Active Sales Pipeline (Kanban / Stage Grid) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {STAGE_CONFIG.map((stage) => {
              const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
              const stageTotal = stageDeals.reduce((sum, d) => sum + d.setupFeeKES, 0);

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-2xl border ${stage.color} flex flex-col justify-between min-h-[450px]`}
                >
                  <div>
                    {/* Stage Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-3">
                      <div>
                        <div className={`text-xs font-bold ${stage.badge}`}>{stage.label}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          KES {(stageTotal / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.2 rounded-full">
                        {stageDeals.length}
                      </span>
                    </div>

                    {/* Stage Cards */}
                    <div className="space-y-2.5">
                      {stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          onClick={() => setSelectedDeal(deal)}
                          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition shadow-sm space-y-2 group"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-200 transition-colors">
                                {deal.businessName}
                              </span>
                              <span className="text-[9px] font-semibold text-emerald-400 font-mono">
                                {deal.winProbability}%
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{deal.contactName}</div>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-950/70 text-[10px] space-y-1">
                            <div className="flex items-center justify-between text-slate-300">
                              <span>Setup:</span>
                              <span className="font-bold text-emerald-400 font-mono">
                                KES {deal.setupFeeKES.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Monthly:</span>
                              <span className="font-medium text-indigo-300 font-mono">
                                KES {deal.monthlyFeeKES.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                            <span className="text-indigo-400 font-medium">{deal.productName}</span>
                            <span className="text-slate-500">{deal.outreachChannel}</span>
                          </div>

                          <div className="pt-1 flex items-center justify-between text-[10px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProposalModalDeal(deal);
                              }}
                              className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <FileText className="h-3 w-3" />
                              <span>Proposal</span>
                            </button>

                            {deal.stage !== "WON" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStage(deal.id, "WON");
                                }}
                                className="text-emerald-400 hover:underline font-semibold"
                              >
                                Mark Won
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Tier 2: Raw Leads Pool View */
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Uncontacted Raw Prospects</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Walk-in routes, referrals, and scraped lists. Promote to pipeline once first contact occurs.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {filteredRawLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">{lead.businessName}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {lead.productName}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.2 rounded border border-slate-700">
                        {lead.source}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span>Owner: {lead.contactName}</span>
                      <span>•</span>
                      <span>Location: {lead.location}</span>
                      <span>•</span>
                      <span>Phone: {lead.phone}</span>
                    </div>

                    <p className="text-xs text-slate-400 italic mt-1">&ldquo;{lead.notes}&rdquo;</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition flex items-center gap-1.5"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => handlePromoteToDeal(lead)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Log First Contact</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1-Click Proposal Generator Modal (Connected to Document Template Engine) */}
        {proposalModalDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Commercial Proposal Generated</h3>
                    <p className="text-[11px] text-slate-400">Pre-filled with deal financials for {proposalModalDeal.businessName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setProposalModalDeal(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                {proposalContent}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    handleUpdateStage(proposalModalDeal.id, "PROPOSAL_SENT");
                    setProposalModalDeal(null);
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:underline"
                >
                  Mark Stage as &ldquo;Proposal Sent&rdquo;
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(proposalContent);
                      setCopiedProposal(true);
                      setTimeout(() => setCopiedProposal(false), 2000);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                  >
                    {copiedProposal ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <FileText className="h-3.5 w-3.5" />}
                    <span>{copiedProposal ? "Copied!" : "Copy Proposal Text"}</span>
                  </button>

                  <button
                    onClick={() => setProposalModalDeal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Raw Lead Modal */}
        {isAddLeadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Add Raw Prospect (Uncontacted Pool)</h3>
                <button onClick={() => setIsAddLeadOpen(false)} className="text-xs text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddLead} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    placeholder="e.g. Apex Auto Clinic"
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Contact Person</label>
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="e.g. James Mwangi"
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. +254 722 000 000"
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-medium">Product Fit</label>
                    <select
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="vehisoft">Vehisoft</option>
                      <option value="adversoft">Adversoft</option>
                      <option value="versandry">Versandry</option>
                      <option value="lipatim">LipaTim</option>
                      <option value="melio-rms">Melio RMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium">Source Channel</label>
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value as RawLeadItem["source"])}
                      className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Walk-in Route">Walk-in Route</option>
                      <option value="Referral">Referral</option>
                      <option value="WhatsApp Inquiry">WhatsApp Inquiry</option>
                      <option value="Cold Email">Cold Email</option>
                      <option value="Social Media">Social Media</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Initial Notes</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Context, pain points, or observations..."
                    rows={2}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddLeadOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Save Prospect
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
