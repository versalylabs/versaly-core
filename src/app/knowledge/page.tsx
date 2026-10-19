"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { ArrowRight } from "lucide-react";

export default function KnowledgePage() {
  const sops = [
    {
      title: "Client Onboarding Standard Operating Procedure",
      description: "Step-by-step checklist from contract signature to first live transaction",
      category: "Operations",
      updated: "Updated 2 days ago",
    },
    {
      title: "Vehisoft Automotive Spare Parts Excel Import Guide",
      description: "Formatting client parts lists, price markups, and mechanic labor tiers",
      category: "Technical Setup",
      updated: "Updated 1 week ago",
    },
    {
      title: "LipaTim Safaricom Daraja M-Pesa Till / Paybill Integration SOP",
      description: "Consumer Key, Consumer Secret, and Shortcode webhook verification",
      category: "Technical Setup",
      updated: "Updated 3 days ago",
    },
    {
      title: "Common Objections & Rebuttals Playbook (All 5 Products)",
      description: "Responses to 'Excel works fine', 'hardware too expensive', and 'paper receipts'",
      category: "Sales Strategy",
      updated: "Updated 4 days ago",
    },
  ];

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Institutional Memory
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Preserve Decisions & Playbooks</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Knowledge Base & SOPs
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Standard operating procedures, product FAQs, setup playbooks, and competitor notes to stop solving the same problem twice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sops.map((sop) => (
            <div
              key={sop.title}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {sop.category}
                  </span>
                  <span className="text-[10px] text-slate-500">{sop.updated}</span>
                </div>
                <h2 className="text-sm font-bold text-slate-100 group-hover:text-indigo-200 transition-colors">
                  {sop.title}
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{sop.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Verified by Ted</span>
                <button className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                  <span>Read Guide</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
