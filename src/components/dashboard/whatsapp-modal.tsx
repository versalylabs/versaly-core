"use client";

import { MessageCircle, X, Send } from "lucide-react";

import type { DashboardModel } from "./use-dashboard";

export function WhatsAppModal({ d }: { d: DashboardModel }) {
  const { whatsAppItem, setWhatsAppItem, whatsAppMessage, setWhatsAppMessage, handleSendWhatsApp } = d;
  return (
    <>
      {/* Modal: WhatsApp Direct */}
        {whatsAppItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Send WhatsApp Follow-up</h3>
                    <p className="text-[11px] text-slate-400">{whatsAppItem.business} ({whatsAppItem.contact})</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsAppItem(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Recipient Phone</label>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                    {whatsAppItem.phone}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Message Body</label>
                  <textarea
                    rows={4}
                    value={whatsAppMessage}
                    onChange={(e) => setWhatsAppMessage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setWhatsAppItem(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Open in WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
