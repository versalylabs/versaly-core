"use client";

import { useState } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { Shield, Building, Wallet } from "lucide-react";
import { usePaymentSettings } from "@/lib/payment-settings";
import { WeeklyReviewCard } from "@/components/settings/weekly-review-card";
import type { PaymentSettings } from "@/lib/invoice-messages";

export default function SettingsPage() {


  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Workspace Administration
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Company & RBAC Security</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Settings & Access Control
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Configure Versaly company operating metadata, timezone, default currency, team roles, and system permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Profile Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2.5">
              <Building className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Company Profile</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Organization Name</label>
                <input
                  type="text"
                  defaultValue="Versaly Operations Ltd"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">Operating Timezone</label>
                <input
                  type="text"
                  defaultValue="Africa/Nairobi (EAT, UTC+3)"
                  disabled
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">Base Currency</label>
                <input
                  type="text"
                  defaultValue="KES (Kenyan Shilling)"
                  disabled
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <button className="w-full py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm">
              Save Profile Changes
            </button>
          </div>

          {/* Payment details used in invoice messages */}
          <PaymentDetailsCard />
          <WeeklyReviewCard />

          {/* Team & access now lives on its own page */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Shield className="h-5 w-5 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Team &amp; Access</h2>
                <p className="text-xs text-slate-400">Add people, set what each can see, suspend access, and review the audit log.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/settings/team" className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">
                Manage team
              </Link>
              <Link href="/settings/audit" className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition">
                Audit log
              </Link>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}

function PaymentDetailsCard() {
  const [saved, save] = usePaymentSettings();
  const [draft, setDraft] = useState<PaymentSettings>(saved);
  const [justSaved, setJustSaved] = useState(false);

  const field = (key: keyof PaymentSettings, label: string, placeholder: string, hint?: string) => (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold text-slate-300">{label}</span>
      <input
        value={draft[key]}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
      />
      {hint && <span className="block text-[10px] text-slate-500">{hint}</span>}
    </label>
  );

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
      <div className="flex items-center gap-2.5">
        <Wallet className="h-5 w-5 text-emerald-400" />
        <h2 className="text-sm font-bold text-white">Payment Details</h2>
      </div>
      <p className="text-xs text-slate-400">
        Included in every invoice and reminder you send, so clients know exactly how to pay.
      </p>
      <div className="space-y-3">
        {field("businessName", "Business name", "Versaly")}
        {field("paybillNumber", "M-Pesa Paybill number", "e.g. 247247", "Clients use the invoice number as the account number.")}
        {field("tillNumber", "M-Pesa Till number (optional)", "e.g. 5123456")}
        {field("bankDetails", "Bank details (optional)", "e.g. KCB, A/C 1234567890, Versaly Ltd")}
        {field("senderName", "Your name (sign-off)", "e.g. Ted")}
      </div>
      <button
        type="button"
        onClick={() => {
          save({
            ...draft,
            businessName: draft.businessName.trim() || "Versaly",
            paybillNumber: draft.paybillNumber.trim(),
            tillNumber: draft.tillNumber.trim(),
            bankDetails: draft.bankDetails.trim(),
            senderName: draft.senderName.trim(),
          });
          setJustSaved(true);
          setTimeout(() => setJustSaved(false), 2500);
        }}
        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
      >
        {justSaved ? "Saved" : "Save Payment Details"}
      </button>
    </div>
  );
}
