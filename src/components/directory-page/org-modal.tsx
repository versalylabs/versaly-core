"use client";

import { Building2, X } from "lucide-react";
import { DirectoryOrganization } from "@/data/directory-seed";

import type { DirectoryModel } from "./use-directory";

export function OrgModal({ d }: { d: DirectoryModel }) {
  const { isOrgModalOpen, editingOrg, setIsOrgModalOpen, handleSaveOrg, formName, setFormName, formType, setFormType, formIndustry, setFormIndustry, formProductFit, setFormProductFit, formCity, setFormCity, formAddress, setFormAddress, formPhone, setFormPhone, formEmail, setFormEmail, formTaxPin, setFormTaxPin, formContactFirstName, setFormContactFirstName, formContactLastName, setFormContactLastName, formContactRole, setFormContactRole } = d;
  return (
    <>
      {/* Add / Edit Org Modal */}
        {isOrgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-base text-white">
                    {editingOrg ? "Edit Organization" : "Add Organization Record"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOrgModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOrg} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Auto Clinic"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as DirectoryOrganization["type"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CLIENT">CLIENT</option>
                      <option value="PROSPECT">PROSPECT</option>
                      <option value="PARTNER">PARTNER</option>
                      <option value="VENDOR">VENDOR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Industry Sector</label>
                    <input
                      type="text"
                      placeholder="e.g. Automotive Services"
                      value={formIndustry}
                      onChange={(e) => setFormIndustry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Primary Product Fit</label>
                    <select
                      value={formProductFit}
                      onChange={(e) => setFormProductFit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Vehisoft">Vehisoft</option>
                      <option value="Versandry">Versandry</option>
                      <option value="Adversoft">Adversoft</option>
                      <option value="LipaTim">LipaTim</option>
                      <option value="Melio RMS">Melio RMS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Nairobi"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise Rd, Industrial Area"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="+254 722 000 000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="info@business.co.ke"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">KRA PIN (Optional)</label>
                    <input
                      type="text"
                      placeholder="P051239841Z"
                      value={formTaxPin}
                      onChange={(e) => setFormTaxPin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 uppercase font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <h4 className="font-semibold text-slate-200">Key Decision Maker Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">First Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Samuel"
                        value={formContactFirstName}
                        onChange={(e) => setFormContactFirstName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Last Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Kamau"
                        value={formContactLastName}
                        onChange={(e) => setFormContactLastName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Managing Director"
                        value={formContactRole}
                        onChange={(e) => setFormContactRole(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsOrgModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25"
                  >
                    {editingOrg ? "Save Organization" : "Create Record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
