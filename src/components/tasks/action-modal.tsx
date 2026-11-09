"use client";

import { CheckSquare, X } from "lucide-react";
import { DailyTask } from "@/data/tasks-data";

import type { TasksModel } from "./use-tasks";

export function ActionModal({ d }: { d: TasksModel }) {
  const { showModal, editingTask, setShowModal, handleSaveTask, formTitle, setFormTitle, formCategory, setFormCategory, formProduct, setFormProduct, catalogProducts, formPriority, setFormPriority, formDue, setFormDue, formContact, setFormContact } = d;
  return (
    <>
      {/* Modal: New / Edit Action */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <CheckSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {editingTask ? "Edit Outreach Action" : "Schedule New Action"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Add to active queue with priority and due time.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Action Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 30 Adversoft calls to billboard operators"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as DailyTask["category"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Outreach">Outreach</option>
                      <option value="Demos">Demos</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Onboarding">Onboarding</option>
                      <option value="Content">Content</option>
                      <option value="Review">Review</option>
                      <option value="Finance">Finance</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Product</label>
                    <select
                      value={formProduct}
                      onChange={(e) => setFormProduct(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {catalogProducts.map((p) => (
                        <option key={p.slug} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                      <option value="Multi-product">Multi-product</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as DailyTask["priority"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="HIGH">High (Urgent)</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Due Timing</label>
                    <input
                      type="text"
                      placeholder="e.g. Today 11:30 AM"
                      value={formDue}
                      onChange={(e) => setFormDue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Person (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. James Mwangi (Apex Auto)"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>{editingTask ? "Save Changes" : "Schedule Action"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
