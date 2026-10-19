"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Activity,
  PhoneCall,
  MessageCircle,
  FileText,
  CreditCard,
  Users,
  AlertTriangle,
  LifeBuoy,
  Search,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import { INITIAL_ACTIVITY_TIMELINE, UniversalActivityItem } from "@/data/timeline-seed";

const STORAGE_KEY = "versaly_universal_activity_timeline_v2";

export default function ActivityPage() {
  const [activities, setActivities] = useState<UniversalActivityItem[]>(() => {
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
    return INITIAL_ACTIVITY_TIMELINE;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("ALL");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [aiSummaryEntity, setAiSummaryEntity] = useState<string | null>(null);

  // New Activity Form State
  const [formEntityName, setFormEntityName] = useState("");
  const [formEntityType, setFormEntityType] = useState<UniversalActivityItem["entityType"]>("client");
  const [formCategory, setFormCategory] = useState<UniversalActivityItem["category"]>("Call");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const formActor = "Versaly Admin";

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch {
      // ignore
    }
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesSearch =
        act.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.actor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === "ALL" || act.category === selectedCategory;
      const matchesEntity = selectedEntityType === "ALL" || act.entityType === selectedEntityType;

      return matchesSearch && matchesCat && matchesEntity;
    });
  }, [activities, searchQuery, selectedCategory, selectedEntityType]);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEntityName.trim() || !formTitle.trim()) return;

    const newActivity: UniversalActivityItem = {
      id: `act-${Date.now()}`,
      entityType: formEntityType,
      entityId: `ent-${Date.now()}`,
      entityName: formEntityName.trim(),
      category: formCategory,
      title: formTitle.trim(),
      description: formDescription.trim(),
      actor: formActor,
      timestamp: new Date().toISOString(),
      relativeTime: "Just now",
    };

    setActivities((prev) => [newActivity, ...prev]);
    setIsLogModalOpen(false);
    setFormEntityName("");
    setFormTitle("");
    setFormDescription("");
  };

  const getCategoryIcon = (category: UniversalActivityItem["category"]) => {
    switch (category) {
      case "Call":
        return <PhoneCall className="h-3.5 w-3.5 text-indigo-400" />;
      case "WhatsApp":
        return <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />;
      case "Payment":
        return <CreditCard className="h-3.5 w-3.5 text-emerald-400" />;
      case "Contract":
      case "Proposal":
        return <FileText className="h-3.5 w-3.5 text-violet-400" />;
      case "Blocker":
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />;
      case "Support":
        return <LifeBuoy className="h-3.5 w-3.5 text-sky-400" />;
      case "Meeting":
        return <Users className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-indigo-400" />;
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
                Universal Business History
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Cross-System Chronological Layer</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Universal Activity Timeline
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              The connected narrative of Versaly: every call, WhatsApp pitch, contract signing, onboarding milestone, support resolution, and M-Pesa payment in one chronological stream.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Log Business Activity</span>
            </button>
          </div>
        </div>

        {/* AI Quick Query / Summary Bar */}
        <div className="liquid-glass p-4 rounded-xl border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-200">
            <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>
              <strong>AI Chronological Query:</strong> Ready to answer <em>&ldquo;What happened with Safari Auto Clinic over the last 30 days?&rdquo;</em>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiSummaryEntity("Safari Auto Clinic")}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold hover:bg-indigo-500/30 transition"
            >
              Summarize Safari Auto
            </button>
            <button
              onClick={() => setAiSummaryEntity("Express Wash Kilimani")}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold hover:bg-indigo-500/30 transition"
            >
              Summarize Express Wash
            </button>
          </div>
        </div>

        {/* AI Summary Modal / Drawer */}
        {aiSummaryEntity && (
          <div className="liquid-glass p-5 rounded-2xl border-indigo-500/40 text-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="font-bold text-white text-sm">
                  AI Chronological Summary: {aiSummaryEntity}
                </span>
              </div>
              <button
                onClick={() => setAiSummaryEntity(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2 text-slate-300 leading-relaxed">
              <p>
                <strong>Executive Status:</strong> {aiSummaryEntity} has completed initial outreach and signed agreements. M-Pesa setup payment of KES 35,000 was confirmed today.
              </p>
              <p>
                <strong>Current Active Blocker:</strong> Onboarding is waiting on 240 inventory spare parts SKU normalization. Assigned to Ted Mwangi for resolution. Target go-live remains on track for Thursday.
              </p>
              <div className="pt-2 flex items-center gap-3 text-slate-400">
                <span>Total touchpoints logged: 4</span>
                <span>•</span>
                <span>Average response latency: 12 minutes</span>
                <span>•</span>
                <Link href="/assistant" className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                  <span>Open Deep RAG Search in Assistant</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                selectedCategory === "ALL"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              All Events ({activities.length})
            </button>
            {["Call", "WhatsApp", "Proposal", "Contract", "Payment", "Meeting", "Blocker", "Support"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}

            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Entity Types</option>
              <option value="client">Clients</option>
              <option value="project">Projects</option>
              <option value="lead">Leads</option>
              <option value="finance">Finance</option>
              <option value="support">Support</option>
            </select>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search timeline, client, actor, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Chronological Timeline Feed */}
        <div className="space-y-4">
          {filteredActivities.map((act) => (
            <div
              key={act.id}
              className="liquid-glass p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition flex items-start gap-4 group"
            >
              {/* Category Icon Badge */}
              <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:scale-105 transition-transform">
                {getCategoryIcon(act.category)}
              </div>

              {/* Main Timeline Card Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white group-hover:text-indigo-200 transition-colors">
                      {act.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {act.entityName}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400">
                      {act.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>{act.relativeTime}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {act.description}
                </p>

                {/* Footer Metadata */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span>Logged by:</span>
                    <span className="text-slate-300 font-medium">{act.actor}</span>
                    {act.metadata?.product && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">{act.metadata.product}</span>
                      </>
                    )}
                    {act.metadata?.amountKES && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          KES {act.metadata.amountKES.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setAiSummaryEntity(act.entityName)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <span>View Entity Narrative</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="p-12 text-center liquid-glass rounded-2xl">
              <Activity className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-300">No activity matches your filters</div>
              <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or search query</p>
            </div>
          )}
        </div>

        {/* Modal: Log Business Activity */}
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Activity className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Record Business Milestone / Activity</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Entity Name (Client, Lead, or Project) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Safari Auto Clinic"
                    value={formEntityName}
                    onChange={(e) => setFormEntityName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Entity Type</label>
                    <select
                      value={formEntityType}
                      onChange={(e) => setFormEntityType(e.target.value as UniversalActivityItem["entityType"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="client">Client</option>
                      <option value="lead">Lead</option>
                      <option value="project">Project</option>
                      <option value="finance">Finance</option>
                      <option value="support">Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Activity Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as UniversalActivityItem["category"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Call">Call</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Contract">Contract</option>
                      <option value="Payment">Payment</option>
                      <option value="Milestone">Milestone</option>
                      <option value="Blocker">Blocker</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Activity Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. In-person Kickoff Completed"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Details & Narrative Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Provide context, agreements made, and next steps..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save to Timeline</span>
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
