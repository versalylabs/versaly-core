"use client";

import { X, Share2, BarChart2 } from "lucide-react";
import { ContentCategory, ContentStatus } from "@/data/marketing-seed";
import { CATEGORIES, CHANNELS } from "./helpers";
import type { MarketingContentModel } from "./use-marketing-content";

export function PostModal({ d }: { d: MarketingContentModel }) {
  const { isModalOpen, setIsModalOpen, modalMode, handleSave, formTitle, setFormTitle, formProduct, setFormProduct, productOptions, formCategory, setFormCategory, formDate, setFormDate, formTimeSlot, setFormTimeSlot, formStatus, setFormStatus, formChannels, setFormChannels, formCopy, setFormCopy, formMediaUrl, setFormMediaUrl, formViews, setFormViews, formInquiries, setFormInquiries, formLikes, setFormLikes, formShares, setFormShares } = d;
  return (
    <>
      {/* CREATE / EDIT POST MODAL */}
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
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Share2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {modalMode === "ADD" ? "Draft Daily Social Post" : "Edit Social Piece"}
                </h3>
                <p className="text-xs text-slate-400">Craft educational copy and schedule channel broadcast</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Topic / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Why Nairobi Car Yards Lose 30% of Prospects After Hours"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Product Focus *
                  </label>
                  <select
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value as Parameters<typeof setFormProduct>[0])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    {productOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Content Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ContentCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Publish Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={formTimeSlot}
                    onChange={(e) => setFormTimeSlot(e.target.value)}
                    placeholder="08:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ContentStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                    <option value="Drafting">Drafting</option>
                    <option value="Idea">Idea</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Distribution Channels
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CHANNELS.map((ch) => {
                    const isSelected = formChannels.includes(ch);
                    return (
                      <button
                        type="button"
                        key={ch}
                        onClick={() => {
                          setFormChannels((prev) =>
                            isSelected ? prev.filter((c) => c !== ch) : [...prev, ch]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? "bg-sky-500 text-white shadow-sm"
                            : "bg-slate-900 text-slate-400 hover:text-white"
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Post Copy & Hook *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Draft the text, formatting, call to action, and WhatsApp link..."
                  value={formCopy}
                  onChange={(e) => setFormCopy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Media / Reel Attachment Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /marketing/assets/vehisoft-reel.mp4"
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              {/* Manual Performance & Inbound Results Logging */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5" />
                    <span>Actual Performance & Inbound Logs</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Manual Entry</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Manually record the impressions and messages this piece generated once published.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                      Impressions / Views
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formViews}
                      onChange={(e) => setFormViews(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                      Inbound Messages / DMs
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formInquiries}
                      onChange={(e) => setFormInquiries(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1 text-[10px]">
                      Likes & Reactions (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formLikes}
                      onChange={(e) => setFormLikes(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1 text-[10px]">
                      Shares & Reposts (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formShares}
                      onChange={(e) => setFormShares(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
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
                  className="px-5 py-2 rounded-xl font-bold bg-sky-600 hover:bg-sky-500 text-white transition shadow-lg shadow-sky-600/25 cursor-pointer"
                >
                  {modalMode === "ADD" ? "Save Daily Post" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
