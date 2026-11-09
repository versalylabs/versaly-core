"use client";

import { Landmark, X, Trash2, Plus } from "lucide-react";
import { formatKES } from "@/lib/finance-store";

import type { FinanceOverviewModel } from "./use-finance-overview";

export function AccountsModal({ d }: { d: FinanceOverviewModel }) {
  const { isAccountsModalOpen, setIsAccountsModalOpen, editingAccounts, treasury, handleSaveAccounts, handleAccountBalanceChange, handleDeleteAccount, isAddingNewAccount, setIsAddingNewAccount, newAccName, setNewAccName, newAccInstitution, setNewAccInstitution, newAccNumber, setNewAccNumber, newAccBalance, setNewAccBalance, handleAddNewAccount } = d;
  return (
    <>
      {/* MANAGE COMPANY VAULT ACCOUNTS MODAL */}
        {isAccountsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Company Vault Accounts &amp; Real Cash Balances</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAccountsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Aggregate Summary Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Consolidated Vault Liquidity</span>
                  <p className="text-2xl font-black text-white font-mono mt-0.5">
                    {formatKES(editingAccounts.reduce((sum, a) => sum + (Number(a.balanceKES) || 0), 0))}
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-400">
                  <span>Free Operating Cash: </span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatKES(
                      Math.max(
                        0,
                        editingAccounts.reduce((sum, a) => sum + (Number(a.balanceKES) || 0), 0) - treasury.totalReserves
                      )
                    )}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ({formatKES(treasury.totalReserves)} internal reserves earmarked)
                  </div>
                </div>
              </div>

              {/* Account list with balance inputs */}
              <form onSubmit={handleSaveAccounts} className="space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {editingAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{acc.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                            {acc.currency}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{acc.institution}</span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="font-mono text-slate-500">Acc: {acc.accountNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <label className="text-[10px] text-slate-400 block font-medium">Balance (KES)</label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={acc.balanceKES}
                            onChange={(e) => handleAccountBalanceChange(acc.id, Number(e.target.value))}
                            className="w-36 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-mono text-right focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        {editingAccounts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(acc.id, acc.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition mt-3 cursor-pointer"
                            title="Remove account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new account expandable form */}
                {!isAddingNewAccount ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAccount(true)}
                    className="w-full py-2.5 border border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl text-xs font-semibold text-slate-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Account / Vault</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Add New Account</span>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAccount(false)}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Account Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Equity Bank Checking"
                          value={newAccName}
                          onChange={(e) => setNewAccName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Institution *</label>
                        <input
                          type="text"
                          placeholder="e.g. Equity Bank Kenya"
                          value={newAccInstitution}
                          onChange={(e) => setNewAccInstitution(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Account / Till / Paybill #</label>
                        <input
                          type="text"
                          placeholder="Account or Till number"
                          value={newAccNumber}
                          onChange={(e) => setNewAccNumber(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Initial Balance (KES)</label>
                        <input
                          type="number"
                          placeholder="Initial Balance"
                          value={newAccBalance}
                          onChange={(e) => setNewAccBalance(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewAccount}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Add to Vault List
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAccountsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
                  >
                    Save Vault Balances
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
