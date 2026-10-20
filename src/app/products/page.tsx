"use client";

import { useState, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { VERSALY_PRODUCTS, VersalyProduct } from "@/data/products-catalog";
import {
  Package,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Users,
  Target,
  ArrowRight,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";

const STORAGE_KEY = "versaly_products_catalog";

export default function ProductsPage() {
  const [products, setProducts] = useState<VersalyProduct[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const hasSemplo = parsed.some((p: VersalyProduct) => p.slug === "semplo");
            if (!hasSemplo) {
              const semplo = VERSALY_PRODUCTS.find((p) => p.slug === "semplo");
              if (semplo) {
                return [semplo, ...parsed];
              }
            }
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return VERSALY_PRODUCTS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VersalyProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<VersalyProduct | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<VersalyProduct["category"]>("Automotive");
  const [formTagline, setFormTagline] = useState("");
  const [formTargetMarket, setFormTargetMarket] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSetupFee, setFormSetupFee] = useState(35000);
  const [formMonthlyFee, setFormMonthlyFee] = useState(12500);
  const [formPricingModel, setFormPricingModel] = useState("Monthly SaaS per tier");
  const [formGuarantee, setFormGuarantee] = useState("14-Day Live Implementation Guarantee.");
  const [formStatus, setFormStatus] = useState<VersalyProduct["status"]>("ACTIVE");
  const [formFeatures, setFormFeatures] = useState("");

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory("Automotive");
    setFormTagline("");
    setFormTargetMarket("");
    setFormDescription("");
    setFormSetupFee(35000);
    setFormMonthlyFee(12500);
    setFormPricingModel("Monthly SaaS Subscription");
    setFormGuarantee("14-Day Implementation Guarantee or 100% refund.");
    setFormStatus("ACTIVE");
    setFormFeatures("Automated digital workflows\nReal-time analytics dashboard\nCustomer SMS/WhatsApp alerts\nM-Pesa Paybill integration\nRole-based multi-user access");
    setIsModalOpen(true);
  };

  const openEditModal = (prod: VersalyProduct) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormTagline(prod.tagline);
    setFormTargetMarket(prod.targetMarket);
    setFormDescription(prod.description);
    setFormSetupFee(prod.setupFee);
    setFormMonthlyFee(prod.monthlyFee);
    setFormPricingModel(prod.pricingModel);
    setFormGuarantee(prod.guaranteeOffer);
    setFormStatus(prod.status);
    setFormFeatures(prod.features.join("\n"));
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const parsedFeatures = formFeatures
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingProduct) {
      // Edit existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formName.trim(),
                category: formCategory,
                tagline: formTagline.trim(),
                targetMarket: formTargetMarket.trim(),
                description: formDescription.trim(),
                setupFee: Number(formSetupFee),
                monthlyFee: Number(formMonthlyFee),
                pricingModel: formPricingModel.trim(),
                guaranteeOffer: formGuarantee.trim(),
                status: formStatus,
                features: parsedFeatures.length > 0 ? parsedFeatures : p.features,
              }
            : p
        )
      );
      setToastMessage(`✓ Updated product details for "${formName}"`);
    } else {
      // Create new product
      const slug = formName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      const newProduct: VersalyProduct = {
        id: `prod-${Date.now()}`,
        slug: slug || `prod-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        tagline: formTagline.trim() || `${formName} specialized industry software.`,
        targetMarket: formTargetMarket.trim() || "Target commercial businesses",
        description: formDescription.trim() || `${formName} business operations software.`,
        setupFee: Number(formSetupFee),
        monthlyFee: Number(formMonthlyFee),
        pricingModel: formPricingModel.trim() || "Monthly SaaS",
        guaranteeOffer: formGuarantee.trim() || "14-Day Implementation Guarantee.",
        status: formStatus,
        features:
          parsedFeatures.length > 0
            ? parsedFeatures
            : [
                "Real-time operational dashboard",
                "Automated customer messaging",
                "M-Pesa payment reconciliation",
              ],
        salesCollateral: [
          {
            title: `${formName} 1-Page Sales Sheet`,
            type: "sales_sheet",
            description: "Product overview & ROI comparison",
          },
          {
            title: `${formName} 10-Minute Walkthrough Script`,
            type: "demo_script",
            description: "Structured live pitch for decision makers",
          },
        ],
        activeClientsCount: 0,
        pipelineDealsCount: 0,
      };

      setProducts((prev) => [newProduct, ...prev]);
      setToastMessage(`✓ Created new product "${formName}"`);
    }

    setIsModalOpen(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    setToastMessage(`✓ Deleted product "${deletingProduct.name}"`);
    setDeletingProduct(null);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Product Portfolio Hub
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400">{products.length} Products Configured</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Versaly Core Offerings &amp; Sales Collateral
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Every lead, deal, client, document, task, and invoice connects directly back to these offerings.
              Manage pricing models, guarantee structures, and pitch assets in real time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              id={prod.slug}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div>
                {/* Title, Badge & Actions */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold group-hover:scale-105 transition-transform">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">{prod.name}</h2>
                        <span className="text-[11px] text-indigo-400 font-medium">{prod.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {prod.status}
                    </span>
                    <button
                      onClick={() => openEditModal(prod)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Edit Product Details"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingProduct(prod)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                      title="Delete Product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tagline & Target Market */}
                <p className="mt-3 text-xs text-slate-300 font-medium">{prod.tagline}</p>
                <div className="mt-2 text-[11px] text-slate-500">
                  <span className="text-slate-400 font-medium">Target Market: </span>
                  {prod.targetMarket}
                </div>

                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{prod.description}</p>

                {/* Pricing & Guarantee Box */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pricing Structure:</span>
                    <span className="font-semibold text-slate-200">{prod.pricingModel}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Setup Fee:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      KES {prod.setupFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Monthly Recurring (MRR):</span>
                    <span className="font-bold text-indigo-300 font-mono">
                      KES {prod.monthlyFee.toLocaleString()}/mo
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-amber-300/90">
                    <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{prod.guaranteeOffer}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-4">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Key Product Capabilities
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {prod.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales Collateral Assets */}
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Linked Sales Asset Library
                  </div>
                  <div className="space-y-2">
                    {prod.salesCollateral.map((asset) => (
                      <div
                        key={asset.title}
                        className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs group/asset hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-slate-500 group-hover/asset:text-indigo-400 transition-colors" />
                          <div>
                            <div className="font-medium text-slate-200 group-hover/asset:text-white transition-colors">
                              {asset.title}
                            </div>
                            <div className="text-[10px] text-slate-500">{asset.description}</div>
                          </div>
                        </div>
                        <a
                          href="/documents"
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0 ml-2"
                        >
                          <span>View</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Metrics & Links */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{prod.activeClientsCount} Signed Clients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{prod.pipelineDealsCount} in Pipeline</span>
                  </div>
                </div>

                <a
                  href={`/leads?product=${prod.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>View Pipeline</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add / Edit Product */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-xl w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {editingProduct ? `Edit ${editingProduct.name}` : "Create New Versaly Product"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Configure offering specifications, pricing models, and guarantees.
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

              <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CleanSoft"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Industry Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as VersalyProduct["category"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="HR & Workforce Management">HR &amp; Workforce Management</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Laundry & Dry Cleaning">Laundry &amp; Dry Cleaning</option>
                      <option value="Advertising & Signage">Advertising &amp; Signage</option>
                      <option value="Fintech & Payments">Fintech &amp; Payments</option>
                      <option value="Hospitality">Hospitality</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. Smart operations for modern dry cleaners"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Target Market ICP</label>
                    <input
                      type="text"
                      placeholder="e.g. Commercial laundries, hotel laundry facilities"
                      value={formTargetMarket}
                      onChange={(e) => setFormTargetMarket(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Description</label>
                  <textarea
                    rows={2}
                    placeholder="Comprehensive description of the product and the problem it solves..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Setup Fee (KES) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      value={formSetupFee}
                      onChange={(e) => setFormSetupFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Monthly MRR (KES) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      value={formMonthlyFee}
                      onChange={(e) => setFormMonthlyFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as VersalyProduct["status"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="BETA">BETA</option>
                      <option value="ROADMAP">ROADMAP</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Pricing Model Structure</label>
                    <input
                      type="text"
                      placeholder="e.g. Monthly SaaS per location"
                      value={formPricingModel}
                      onChange={(e) => setFormPricingModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Founding Guarantee Offer</label>
                    <input
                      type="text"
                      placeholder="e.g. 14-day live implementation guarantee"
                      value={formGuarantee}
                      onChange={(e) => setFormGuarantee(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Key Capabilities &amp; Features (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter features separated by line breaks..."
                    value={formFeatures}
                    onChange={(e) => setFormFeatures(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-[11px] placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{editingProduct ? "Save Changes" : "Create Product"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl border border-rose-500/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Delete Product</h3>
                  <p className="text-xs text-slate-400">
                    Are you sure you want to remove <span className="text-white font-semibold">{deletingProduct.name}</span> from the catalog?
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-950/70 p-3 rounded-xl border border-slate-800 leading-relaxed">
                This will delete the product offering specifications, guarantee models, and pricing definitions from the local registry.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-600/25 text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Product</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
