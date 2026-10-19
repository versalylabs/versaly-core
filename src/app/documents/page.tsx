"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { FileText, ExternalLink } from "lucide-react";

export default function DocumentsPage() {
  const assetCategories = [
    {
      category: "1-Page Executive Sales Sheets",
      description: "Concise product overviews, ROI metrics, and pricing structures for prospects",
      items: [
        { title: "Adversoft 1-Page Signage & Billboard Brief", product: "Adversoft", format: "PDF / Markdown" },
        { title: "Vehisoft Automotive Workshop Sales Sheet", product: "Vehisoft", format: "PDF / Markdown" },
        { title: "Versandry Laundry Workflow & Delivery Sheet", product: "Versandry", format: "PDF / Markdown" },
        { title: "LipaTim Fintech & Automated Billing Brief", product: "LipaTim", format: "PDF / Markdown" },
        { title: "Melio RMS Touchscreen POS & KDS Sales Sheet", product: "Melio RMS", format: "PDF / Markdown" },
      ],
    },
    {
      category: "WhatsApp Follow-Up & Cold Outreach Scripts",
      description: "Battle-tested scripts for phone calls, WhatsApp inquiries, and walk-in introductions",
      items: [
        { title: "Garage Owner Walk-in Introduction Pitch", product: "Vehisoft", format: "Script" },
        { title: "Dry Cleaner WhatsApp Lost Garment Objection Script", product: "Versandry", format: "Script" },
        { title: "Restaurant Peak-Hour Table Rush Pitch", product: "Melio RMS", format: "Script" },
        { title: "Overdue Invoice WhatsApp Follow-up (3 Tiers)", product: "LipaTim", format: "Script" },
      ],
    },
    {
      category: "Agreements, Onboarding & KRA / eTIMS References",
      description: "Standard contracts, founding client guarantee terms, and tax compliance specs",
      items: [
        { title: "Standard Client Master Services Agreement (MSA)", product: "Core Versaly", format: "Template" },
        { title: "Founding Client Guarantee & Setup Fee Schedule", product: "Core Versaly", format: "Document" },
        { title: "KRA eTIMS API Electronic Invoicing Integration Spec", product: "LipaTim", format: "Technical Primer" },
        { title: "Client 8-Step Onboarding Project Checklist", product: "Core Versaly", format: "Checklist" },
      ],
    },
  ];

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Sales Asset & Document Hub
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Never Search for Sales Files Again</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Sales Collateral, Scripts & Legal Templates
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Central repository of 1-page sales sheets, WhatsApp outreach scripts, demo walkthroughs, objection responses, and KRA/eTIMS references.
          </p>
        </div>

        <div className="space-y-6">
          {assetCategories.map((cat) => (
            <div key={cat.category} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-white">{cat.category}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cat.items.map((item) => (
                  <div
                    key={item.title}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-200 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="text-indigo-400 font-medium">{item.product}</span>
                          <span>•</span>
                          <span>{item.format}</span>
                        </div>
                      </div>
                    </div>

                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0 ml-2">
                      <span>Open</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
