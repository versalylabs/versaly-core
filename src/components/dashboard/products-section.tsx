"use client";

import { BarChart2 } from "lucide-react";

import type { DashboardModel } from "./use-dashboard";

export function ProductsSection({ d }: { d: DashboardModel }) {
  const { activeSection, selectedProductFilter, setSelectedProductFilter, catalogProducts, filteredProducts } = d;
  return (
    <>
      {/* ========================================================================= */}
        {/* SECTION 5: PRODUCT PERFORMANCE & DAY-45 TRACTION MATRIX                   */}
        {/* ========================================================================= */}
        {(activeSection === "ALL" || activeSection === "PRODUCTS") && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    5. Product Performance & Day-45 Review Matrix
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Decide which products deserve full effort, require price/packaging adjustments, or should be paused.
                  </p>
                </div>
              </div>

              {/* Product Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Filter Product:</span>
                <select
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Products ({catalogProducts.length})</option>
                  {catalogProducts.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Performance Matrix Table */}
            <div className="liquid-glass rounded-2xl overflow-hidden border border-slate-800/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Product & Target</th>
                      <th className="p-3.5 text-center">Contacted</th>
                      <th className="p-3.5 text-center">Demos</th>
                      <th className="p-3.5 text-center">Won</th>
                      <th className="p-3.5 text-center">Conversion</th>
                      <th className="p-3.5 text-right">Cash Collected</th>
                      <th className="p-3.5 text-right">MRR</th>
                      <th className="p-3.5 text-center">Clients (Churn)</th>
                      <th className="p-3.5 text-center">Traction Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.map((p) => {
                      const tractionBadge = {
                        "Winning": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        "Building pipeline": "bg-sky-500/10 text-sky-400 border-sky-500/20",
                        "No activity yet": "bg-slate-500/10 text-slate-400 border-slate-500/20",
                      }[p.tractionStatus];

                      return (
                        <tr key={p.id} className="hover:bg-slate-900/40 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-white text-sm">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.category}</div>
                            <div className="text-[10px] text-indigo-300 mt-0.5 italic">
                              &ldquo;{p.day45Action}&rdquo;
                            </div>
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-300 font-semibold">
                            {p.leadsContacted}
                          </td>
                          <td className="p-3.5 text-center font-mono text-sky-400 font-semibold">
                            {p.demosBooked}
                          </td>
                          <td className="p-3.5 text-center font-mono text-emerald-400 font-bold">
                            {p.dealsWon}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="font-mono text-xs font-bold text-slate-200">
                              {p.conversionRatePct}%
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-white">
                            KES {(p.revenueCollected / 1000).toFixed(1)}k
                          </td>
                          <td className="p-3.5 text-right font-mono text-indigo-300 font-semibold">
                            KES {(p.mrr / 1000).toFixed(1)}k/mo
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="font-bold text-slate-200">{p.activeClients}</span>
                            {p.churnedClients > 0 && (
                              <span className="text-[10px] text-rose-400 ml-1">({p.churnedClients} churn)</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${tractionBadge}`}>
                              {p.tractionStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
