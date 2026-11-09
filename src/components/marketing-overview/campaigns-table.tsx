"use client";

import { Flame, ArrowRight, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { MarketingOverviewModel } from "./use-marketing-overview";

export function CampaignsTable({ d }: { d: MarketingOverviewModel }) {
  const { campaigns } = d;
  return (
    <>
      {/* Active Campaigns Table */}
        <div className="liquid-glass rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-500" />
                <span>Active & Planned Campaigns</span>
              </h3>
              <p className="text-xs text-slate-400">
                Multi-channel acquisition performance across Versaly&apos;s product suite
              </p>
            </div>
            <Link
              href="/marketing/campaigns"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"
            >
              <span>Manage All Campaigns</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Budget / Spent</th>
                  <th className="py-3 px-4">Leads</th>
                  <th className="py-3 px-4">Won Sales</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-xs text-slate-500">
                      No active campaigns running yet. Click &quot;Manage All Campaigns&quot; to launch your first acquisition campaign.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-900/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{camp.name}</div>
                        {camp.locationDetails && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-rose-400" />
                            <span>{camp.locationDetails}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200">
                          {camp.product}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {camp.channel}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            camp.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : camp.status === "Planned"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {camp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-white font-semibold">
                          KES {camp.totalSpend.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Budget: KES {camp.allocatedBudget.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-indigo-400">
                          {camp.leadsGenerated} leads
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {camp.clicks > 0 ? `${camp.clicks} clicks` : `${camp.impressions} impr`}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-emerald-400">
                          KES {camp.revenueGenerated.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {camp.dealsWon} won deals
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/marketing/campaigns#${camp.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition"
                        >
                          <span>Details</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    </>
  );
}
