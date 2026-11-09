"use client";

import { X, DollarSign } from "lucide-react";
import { AdSpendEntry, MarketingProduct } from "@/data/marketing-seed";

import type { MarketingOverviewModel } from "./use-marketing-overview";

export function QuickSpendModal({ d }: { d: MarketingOverviewModel }) {
  const { showQuickSpendModal, setShowQuickSpendModal, handleSaveSpend, spendAmount, setSpendAmount, spendChannel, setSpendChannel, spendProduct, setSpendProduct, spendVendor, setSpendVendor, spendNotes, setSpendNotes } = d;
  return (
    <>
      {/* QUICK SPEND MODAL */}
      {showQuickSpendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowQuickSpendModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Log Ad / Outdoor Spend</h3>
                <p className="text-xs text-slate-400">Add an ad expense or billboard site fee</p>
              </div>
            </div>

            <form onSubmit={handleSaveSpend} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Amount (KES) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Channel *
                  </label>
                  <select
                    value={spendChannel}
                    onChange={(e) => setSpendChannel(e.target.value as AdSpendEntry["channel"])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Billboard / Outdoor">Billboard / Outdoor</option>
                    <option value="Meta Ads">Meta Ads (FB/IG)</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                    <option value="Print & Banners">Print & Flyers</option>
                    <option value="Influencer / Sponsorship">Sponsorship / Expo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Product *
                  </label>
                  <select
                    value={spendProduct}
                    onChange={(e) => setSpendProduct(e.target.value as MarketingProduct)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Adversoft">Adversoft</option>
                    <option value="Vehisoft">Vehisoft</option>
                    <option value="Versandry">Versandry</option>
                    <option value="LipaTim">LipaTim</option>
                    <option value="Melio RMS">Melio RMS</option>
                    <option value="Versaly Core / Brand">Versaly Core / Brand</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Magnate Ventures, Meta Ireland, Ramco"
                  value={spendVendor}
                  onChange={(e) => setSpendVendor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Notes / Context
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Site rental payment for month 1, includes high-res skin mounting"
                  value={spendNotes}
                  onChange={(e) => setSpendNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuickSpendModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/25"
                >
                  Save Ad Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
