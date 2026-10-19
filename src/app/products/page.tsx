"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { VERSALY_PRODUCTS } from "@/data/products-catalog";
import {
  Package,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Users,
  Target,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function ProductsPage() {
  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Product Portfolio Hub
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-400">Connected Source of Truth</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Versaly Core Offerings & Sales Collateral
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Every lead, deal, client, document, task, and invoice connects directly back to one of these 5 products.
            Keep pricing models, guarantees, and pitch assets unified.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {VERSALY_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              id={prod.slug}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">{prod.name}</h2>
                        <span className="text-[11px] text-indigo-400 font-medium">{prod.category}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {prod.status}
                  </span>
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
                        className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs group hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                          <div>
                            <div className="font-medium text-slate-200 group-hover:text-white transition-colors">
                              {asset.title}
                            </div>
                            <div className="text-[10px] text-slate-500">{asset.description}</div>
                          </div>
                        </div>
                        <button className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0 ml-2">
                          <span>View</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
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
      </div>
    </WorkspaceLayout>
  );
}
