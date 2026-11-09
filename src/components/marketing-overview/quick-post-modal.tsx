"use client";

import { X, Share2 } from "lucide-react";
import { MarketingProduct, SocialPost } from "@/data/marketing-seed";

import type { MarketingOverviewModel } from "./use-marketing-overview";

export function QuickPostModal({ d }: { d: MarketingOverviewModel }) {
  const { showQuickPostModal, setShowQuickPostModal, handleSavePost, postTitle, setPostTitle, postProduct, setPostProduct, postChannels, setPostChannels, postCopy, setPostCopy } = d;
  return (
    <>
      {/* QUICK POST MODAL */}
      {showQuickPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowQuickPostModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Share2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Draft Daily Social Post</h3>
                <p className="text-xs text-slate-400">Schedule or draft high-value educational social copy</p>
              </div>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Post Headline / Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Why Nairobi Car Yards Lose 30% of Prospects After Hours"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Product Focus *
                  </label>
                  <select
                    value={postProduct}
                    onChange={(e) => setPostProduct(e.target.value as MarketingProduct)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Vehisoft">Vehisoft (Car Yards)</option>
                    <option value="Adversoft">Adversoft (Billboards)</option>
                    <option value="Versandry">Versandry (Laundromats)</option>
                    <option value="LipaTim">LipaTim (eTIMS POS)</option>
                    <option value="Melio RMS">Melio RMS (Hospitality)</option>
                    <option value="Versaly Core / Brand">Versaly Core (Brand)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Target Channels
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(["LinkedIn", "X / Twitter", "TikTok", "Instagram", "Facebook"] as SocialPost["channels"]).map((ch) => {
                      const isSelected = postChannels.includes(ch);
                      return (
                        <button
                          type="button"
                          key={ch}
                          onClick={() => {
                            setPostChannels((prev) =>
                              isSelected ? prev.filter((c) => c !== ch) : [...prev, ch]
                            );
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                            isSelected
                              ? "bg-sky-500 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Post Copy / Script *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Draft the hook, the business pain point, and the solution..."
                  value={postCopy}
                  onChange={(e) => setPostCopy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuickPostModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-sky-600 hover:bg-sky-500 text-white transition shadow-lg shadow-sky-600/25"
                >
                  Save to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
