"use client";

import { Building2, Edit2 } from "lucide-react";
import { formatKES } from "@/lib/finance-store";

import type { FinanceOverviewModel } from "./use-finance-overview";

export function VaultBalances({ d }: { d: FinanceOverviewModel }) {
  const { treasury, handleOpenAccountsModal, accounts } = d;
  return (
    <>
      {/* Multi-Vault Account Balances Row */}
        <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Company Account Balances
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                Total Liquidity: <strong className="text-emerald-400">{formatKES(treasury.totalCash)}</strong>
              </span>
              <button
                type="button"
                onClick={handleOpenAccountsModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
                title="Manage Account Balances"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Manage Accounts</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">{acc.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                    {acc.currency}
                  </span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {formatKES(acc.balanceKES)}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{acc.institution}</span>
                  <span className="font-mono text-slate-500">{acc.accountNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
    </>
  );
}
