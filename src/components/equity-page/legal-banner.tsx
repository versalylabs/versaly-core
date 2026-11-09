"use client";

import { ShieldAlert, Lock } from "lucide-react";



export function LegalBanner() {

  return (
    <>
      {/* MANDATORY LEGAL SAFEGUARD BANNER */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm">
              <span className="font-bold text-amber-300">LEGAL COMPLIANCE NOTICE:</span> Financial contributions do not automatically calculate or issue shares. Ownership percentages must be managed separately and only updated following properly authorized legal board minutes and official filings with the Kenyan Business Registration Service (BRS).
              <div className="mt-1 text-slate-400 text-xs">
                Proposed ownership percentages are for strategic planning only and are not legally binding until formal issuance.
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            <Lock className="w-3.5 h-3.5" />
            Restricted Admin Area
          </span>
        </div>
    </>
  );
}
