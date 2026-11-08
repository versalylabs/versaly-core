"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { Shield, Building } from "lucide-react";

export default function SettingsPage() {

  const teamMembers = [
    {
      id: "u-1",
      name: "Ted Khalwale",
      email: "khalwaleted@gmail.com",
      role: "OWNER",
      status: "ACTIVE",
      title: "Founder & Lead Architect",
    },
    {
      id: "u-2",
      name: "David Otieno",
      email: "david@versaly.co",
      role: "MANAGER",
      status: "ACTIVE",
      title: "Field Implementations Lead",
    },
    {
      id: "u-3",
      name: "Mercy Chebet",
      email: "mercy@versaly.co",
      role: "STAFF",
      status: "ACTIVE",
      title: "Client Success Specialist",
    },
  ];

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

          {/* Team Members & Role Assignment */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Team Directory & RBAC Roles</h2>
              </div>
              <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                + Invite Member
              </button>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-xs">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{member.name}</div>
                      <div className="text-[11px] text-slate-400">{member.email} • {member.title}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        member.role === "OWNER"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : member.role === "MANAGER"
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {member.role}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">{member.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
