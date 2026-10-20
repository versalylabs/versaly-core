"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Palette,
  Plus,
  Search,
  Video,
  Image as ImageIcon,
  Layers,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  INITIAL_CREATIVES,
  MarketingCreative,
  CreativeType,
  CreativeStatus,
  MarketingProduct,
} from "@/data/marketing-seed";
import { useProductsCatalog } from "@/lib/products-store";

const STORAGE_KEY = "versaly_marketing_creatives_v2";

const TYPES: CreativeType[] = [
  "Billboard Mockup",
  "Short Video Reel",
  "Carousel Graphic",
  "Ad Banner",
  "Sales One-Pager",
  "Demo Clip",
  "Print Flyer",
];

export default function MarketingCreativesPage() {
  const { products: catalogProducts } = useProductsCatalog();
  const productOptions = useMemo(
    () => Array.from(new Set([...catalogProducts.map((p) => p.name), "Versaly Core / Brand"])),
    [catalogProducts]
  );
  const [creatives, setCreatives] = useState<MarketingCreative[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_CREATIVES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<CreativeType>("Billboard Mockup");
  const [formProduct, setFormProduct] = useState<MarketingProduct>("Adversoft");
  const [formDimensions, setFormDimensions] = useState("12m x 4m (Billboard)");
  const [formStatus, setFormStatus] = useState<CreativeStatus>("Production Ready");
  const [formAssetUrl, setFormAssetUrl] = useState("");
  const [formAudience, setFormAudience] = useState("");
  const [formHook, setFormHook] = useState("");
  const [formTags, setFormTags] = useState("Billboard, Outdoor, Nairobi");
  const [formNotes, setFormNotes] = useState("");

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(creatives));
    } catch {
      // ignore
    }
  }, [creatives]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = creatives.length;
    const ready = creatives.filter((c) => c.status === "Production Ready").length;
    const videos = creatives.filter((c) => c.type === "Short Video Reel" || c.type === "Demo Clip").length;
    const billboards = creatives.filter((c) => c.type === "Billboard Mockup" || c.type === "Print Flyer").length;
    return { total, ready, videos, billboards };
  }, [creatives]);

  // Filtered creatives
  const filteredCreatives = useMemo(() => {
    return creatives.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.primaryHook.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === "ALL" || item.type === typeFilter;
      const matchesProduct = productFilter === "ALL" || item.product === productFilter;
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesType && matchesProduct && matchesStatus;
    });
  }, [creatives, searchQuery, typeFilter, productFilter, statusFilter]);

  // Open Add Modal
  const openAddModal = () => {
    setModalMode("ADD");
    setEditingId(null);
    setFormTitle("");
    setFormType("Billboard Mockup");
    setFormProduct("Adversoft");
    setFormDimensions("12m x 4m (Billboard)");
    setFormStatus("Production Ready");
    setFormAssetUrl("/marketing/assets/new-asset.png");
    setFormAudience("Nairobi brand managers & outdoor buyers");
    setFormHook("Automate your billboard proposals and site proof reports.");
    setFormTags("Billboard, Outdoor, Adversoft");
    setFormNotes("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: MarketingCreative) => {
    setModalMode("EDIT");
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormType(item.type);
    setFormProduct(item.product);
    setFormDimensions(item.dimensions);
    setFormStatus(item.status);
    setFormAssetUrl(item.assetUrl);
    setFormAudience(item.targetAudience);
    setFormHook(item.primaryHook);
    setFormTags(item.tags.join(", "));
    setFormNotes(item.notes || "");
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const payload: MarketingCreative = {
      id: modalMode === "EDIT" && editingId ? editingId : `crt-${Date.now()}`,
      title: formTitle.trim(),
      type: formType,
      product: formProduct,
      dimensions: formDimensions.trim(),
      status: formStatus,
      assetUrl: formAssetUrl.trim() || "/marketing/assets/placeholder.png",
      targetAudience: formAudience.trim(),
      primaryHook: formHook.trim(),
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      createdDate: new Date().toISOString().split("T")[0],
      notes: formNotes.trim() || undefined,
    };

    if (modalMode === "ADD") {
      setCreatives((prev) => [payload, ...prev]);
    } else {
      setCreatives((prev) => prev.map((c) => (c.id === editingId ? payload : c)));
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete creative asset "${title}"?`)) {
      setCreatives((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Handle Clear All
  const handleClearAll = () => {
    if (confirm("Clear all creative assets to start afresh? This cannot be undone.")) {
      setCreatives([]);
    }
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Asset Vault
              </span>
              <span className="text-xs text-slate-500">Design & Media Collateral</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Palette className="h-6 w-6 text-violet-400" />
              <span>Creative & Marketing Assets</span>
            </h1>
            <p className="text-xs text-slate-400">
              Repository of highway billboard mockups, short video pitch reels, carousel graphics, and sales one-pagers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {creatives.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 transition"
                title="Clear all creative assets to start afresh"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Start Afresh</span>
              </button>
            )}
            <Link
              href="/marketing/campaigns"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              <span>View Campaigns</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Upload / Add Creative</span>
            </button>
          </div>
        </div>

        {/* Aggregate Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Total Assets</div>
            <div className="text-xl font-bold text-white font-mono">{stats.total}</div>
            <div className="text-[10px] text-slate-500">Across 5 product lines</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Production Ready</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">{stats.ready}</div>
            <div className="text-[10px] text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Approved for ad deployment</span>
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Video Reels & Clips</div>
            <div className="text-xl font-bold text-pink-400 font-mono">{stats.videos}</div>
            <div className="text-[10px] text-slate-500">TikTok, Reels & Shorts</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Billboard & Outdoor Art</div>
            <div className="text-xl font-bold text-rose-400 font-mono">{stats.billboards}</div>
            <div className="text-[10px] text-slate-500">High-res print & flex skins</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="liquid-glass p-3 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search hooks, assets, tags, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">All Creative Types</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Product Filter */}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">All Products</option>
              {productOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">All Status</option>
              <option value="Production Ready">Production Ready</option>
              <option value="In Review">In Review</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Creative Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCreatives.length === 0 ? (
            <div className="col-span-full liquid-glass p-12 text-center rounded-2xl border border-slate-800/80 space-y-3">
              <Palette className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Creative Assets Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No items match your criteria. Upload billboard artwork or short video pitch reels to populate the vault.
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Creative</span>
              </button>
            </div>
          ) : (
            filteredCreatives.map((item) => (
              <div
                key={item.id}
                className="liquid-glass rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition p-5 space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Media Frame Mockup */}
                  <div className="h-32 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group-hover:border-violet-500/40 transition">
                    <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 via-transparent to-rose-500/10" />

                    {item.type.includes("Video") || item.type.includes("Clip") ? (
                      <Video className="h-8 w-8 text-pink-400 mb-1 z-10" />
                    ) : item.type.includes("Billboard") ? (
                      <Layers className="h-8 w-8 text-rose-400 mb-1 z-10" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-violet-400 mb-1 z-10" />
                    )}

                    <span className="text-[11px] font-bold text-white z-10 font-mono">
                      {item.dimensions}
                    </span>
                    <span className="text-[9px] text-slate-400 z-10 mt-0.5">
                      {item.type}
                    </span>
                  </div>

                  {/* Header Badges & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {item.product}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "Production Ready"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : item.status === "In Review"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {item.status}
                      </span>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Edit Creative"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete Creative"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Hook */}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 italic">
                      &quot;{item.primaryHook}&quot;
                    </p>
                  </div>

                  {/* Target Audience */}
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">Audience: </span>
                    {item.targetAudience}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Asset URL */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[180px]">
                    {item.assetUrl}
                  </span>
                  <a
                    href={item.assetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition"
                  >
                    <span>Preview</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE / EDIT CREATIVE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {modalMode === "ADD" ? "Add Creative / Asset" : "Edit Creative Asset"}
                </h3>
                <p className="text-xs text-slate-400">Store billboard artwork, video briefs, or sales one-pagers</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Westlands Highway Billboard Artwork"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Asset Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as CreativeType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Product Focus *
                  </label>
                  <select
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
                  >
                    {productOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Dimensions / Format *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12m x 4m or 9:16 (Vertical)"
                    value={formDimensions}
                    onChange={(e) => setFormDimensions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as CreativeStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Production Ready">Production Ready</option>
                    <option value="In Review">In Review</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Primary Hook / Headline Copy *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stop losing car buyers because your rep took 2 hours to reply."
                  value={formHook}
                  onChange={(e) => setFormHook(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Used car dealers on Ngong Rd & Kiambu Rd"
                  value={formAudience}
                  onChange={(e) => setFormAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Asset File URL / Storage Path
                </label>
                <input
                  type="text"
                  placeholder="e.g. /marketing/assets/adversoft-billboard.png"
                  value={formAssetUrl}
                  onChange={(e) => setFormAssetUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Billboard, Outdoor, Adversoft"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
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
                  className="px-5 py-2 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white transition shadow-lg shadow-violet-600/25"
                >
                  {modalMode === "ADD" ? "Add to Vault" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
