"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, KeyRound, Plus, ShieldCheck, UserCheck, UserX, Users, X } from "lucide-react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { assignableRoles, canManageUser } from "@/lib/access";

type Role = "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "READ_ONLY";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "INVITED" | "SUSPENDED" | "INACTIVE";
  jobTitle: string | null;
  lastLoginAt: string | null;
  mustChangePassword: boolean;
  source: "database" | "environment";
}

const ROLE_INFO: Record<Role, { label: string; blurb: string }> = {
  OWNER: { label: "Owner", blurb: "Everything, including the team" },
  ADMIN: { label: "Admin", blurb: "Everything except changing the owner or other admins" },
  MANAGER: { label: "Manager", blurb: "Sales, projects and documents; can see finance but not change it" },
  STAFF: { label: "Staff", blurb: "Sales, projects and notes; no finance" },
  READ_ONLY: { label: "Read only", blurb: "Can look at sales and projects, can't change anything" },
};

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Never";

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [meId, setMeId] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [secret, setSecret] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [role, setRole] = useState<Role>("STAFF");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/team", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setMembers(json.data.members);
      setMeId(json.data.you);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const me = members.find((m) => m.id === meId);
  const actor = me ? { id: me.id, role: me.role } : null;
  const creatable = actor ? assignableRoles(actor) : [];

  const call = async (url: string, method: string, body: unknown) => {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, json };
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    const { ok, json } = await call("/api/team", "POST", { name, email, role, jobTitle: jobTitle || undefined });
    setBusy(false);
    if (!ok) return setNotice({ ok: false, text: json?.error?.message || "Could not add them." });
    setSecret({ name: json.data.member.name, email: json.data.member.email, password: json.data.temporaryPassword });
    setShowAdd(false);
    setName("");
    setEmail("");
    setJobTitle("");
    setRole("STAFF");
    void load();
  };

  const change = async (m: Member, body: object, success: string) => {
    setNotice(null);
    const { ok, json } = await call(`/api/team/${m.id}`, "PATCH", body);
    if (!ok) return setNotice({ ok: false, text: json?.error?.message || "That didn't work." });
    if (json.data?.temporaryPassword) setSecret({ name: m.name, email: m.email, password: json.data.temporaryPassword });
    else setNotice({ ok: true, text: success });
    void load();
  };

  const copy = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <div className="liquid-glass liquid-glass-glow p-6 rounded-2xl flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              <span>SETTINGS • ACCESS</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Team &amp; Access</h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Who can sign in and what they can see. Permissions are enforced on the server, so hiding a page isn&apos;t the only protection.
            </p>
          </div>
          {creatable.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAdd(!showAdd)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add team member
            </button>
          )}
        </div>

        {notice && (
          <div className={`p-3.5 rounded-xl border text-xs ${notice.ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200" : "bg-rose-500/10 border-rose-500/30 text-rose-200"}`}>
            {notice.text}
          </div>
        )}

        {secret && (
          <div className="liquid-glass p-5 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white">Temporary password for {secret.name}</h2>
                <p className="text-[11px] text-slate-400 mt-1">
                  Shown only now. Send it to {secret.email} privately (not in a group chat). They&apos;ll be asked to choose their own the first time they sign in.
                </p>
              </div>
              <button type="button" onClick={() => setSecret(null)} className="text-slate-400 hover:text-white cursor-pointer" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono tracking-wider text-amber-200 select-all">{secret.password}</code>
              <button
                type="button"
                onClick={() => void copy()}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {showAdd && (
          <form onSubmit={addMember} className="liquid-glass p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-white">Add a team member</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address" required className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100" />
              <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job title (optional)" className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100" />
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100">
                {creatable.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_INFO[r].label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400">{ROLE_INFO[role].blurb}.</p>
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer">
                {busy ? "Adding…" : "Add and show temporary password"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        )}

        {state === "loading" && <p className="text-xs text-slate-500">Loading…</p>}
        {state === "error" && <p className="text-xs text-slate-400">Couldn&apos;t load the team. Only owners and admins can see this page.</p>}

        {state === "ready" && (
          <div className="space-y-3">
            {members.map((m) => {
              const target = { id: m.id, role: m.role };
              const isMe = m.id === meId;
              const fixed = m.source === "environment";
              const canRole = !fixed && actor && canManageUser(actor, target, { kind: "role", to: "STAFF" }).ok;
              const canStatus = !fixed && actor && canManageUser(actor, target, { kind: "status", to: "SUSPENDED" }).ok;
              const suspended = m.status === "SUSPENDED";
              return (
                <div key={m.id} className={`bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 ${suspended ? "opacity-60" : ""}`}>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">{m.name}</span>
                      {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold">You</span>}
                      {suspended && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold">Suspended</span>}
                      {m.mustChangePassword && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">Hasn&apos;t set a password yet</span>}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {m.email}
                      {m.jobTitle ? ` · ${m.jobTitle}` : ""}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {fixed ? "Signs in through the hosting settings" : `Last sign-in: ${when(m.lastLoginAt)}`}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canRole ? (
                      <select
                        value={m.role}
                        onChange={(e) => void change(m, { role: e.target.value }, `${m.name} is now ${ROLE_INFO[e.target.value as Role].label}.`)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100"
                        title={ROLE_INFO[m.role].blurb}
                      >
                        {[m.role, ...creatable.filter((r) => r !== m.role)].map((r) => (
                          <option key={r} value={r}>
                            {ROLE_INFO[r].label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5" title={ROLE_INFO[m.role].blurb}>
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />
                        {ROLE_INFO[m.role].label}
                      </span>
                    )}

                    {canStatus && (
                      <>
                        <button
                          type="button"
                          onClick={() => void change(m, { resetPassword: true }, "")}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          title="Give them a new temporary password"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Reset password
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (suspended || confirm(`Suspend ${m.name}? They will be signed out of everything and can't sign in until you reactivate them.`)) {
                              void change(m, { status: suspended ? "ACTIVE" : "SUSPENDED" }, suspended ? `${m.name} can sign in again.` : `${m.name} has been suspended.`);
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                            suspended ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-300" : "bg-rose-600/10 border-rose-500/30 text-rose-300"
                          }`}
                        >
                          {suspended ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                          {suspended ? "Reactivate" : "Suspend"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-300">What each role can do</p>
          {(Object.keys(ROLE_INFO) as Role[]).map((r) => (
            <p key={r}>
              <span className="text-slate-200 font-semibold">{ROLE_INFO[r].label}:</span> {ROLE_INFO[r].blurb}.
            </p>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
