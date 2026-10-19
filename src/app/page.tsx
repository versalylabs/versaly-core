import {
  ShieldCheck,
  Database,
  Layers,
  KeyRound,
  Activity,
  CheckCircle2,
  ArrowRight,
  Server,
} from "lucide-react";

export default function Home() {
  const architecturalPillars = [
    {
      title: "Core Data & Multi-Tenancy",
      description: "Prisma ORM with PostgreSQL schema defining Users, Sessions, Company profile, and Audit logs.",
      icon: Database,
      status: "Ready",
      tech: "PostgreSQL 16 + Prisma 6",
    },
    {
      title: "Authentication & Base RBAC",
      description: "Secure session tokens, password hashing, and role matrices (Owner, Admin, Manager, Staff, Read-only).",
      icon: KeyRound,
      status: "Configured",
      tech: "bcryptjs + jose JWT",
    },
    {
      title: "Audit & Event Dispatcher",
      description: "Centralized logging service capturing system mutations with entity tracking and metadata.",
      icon: ShieldCheck,
      status: "Operational",
      tech: "Structured Audit Log",
    },
    {
      title: "Observability & CI/CD",
      description: "Health checks with database ping latency, structured JSON logging, and GitHub Actions workflow.",
      icon: Activity,
      status: "Active",
      tech: "GitHub Actions + Route Health",
    },
  ];

  const developmentTimeline = [
    { phase: "Phase 0", title: "Engineering Foundation & Architecture", status: "Completed", current: true },
    { phase: "Phase 1", title: "Core Workspace, Navigation & Cmd+K", status: "Up Next", current: false },
    { phase: "Phase 2", title: "Core Directory: People & Organizations", status: "Planned", current: false },
    { phase: "Phase 3", title: "Document Hub, Templates & Storage", status: "Planned", current: false },
    { phase: "Phase 4", title: "Sales Pipeline & CRM", status: "Planned", current: false },
    { phase: "Phase 5", title: "Client Workspace & Project Operations", status: "Planned", current: false },
    { phase: "Phase 6", title: "Knowledge Base & SOPs", status: "Planned", current: false },
    { phase: "Phase 7", title: "Operational Finance & Invoicing", status: "Planned", current: false },
    { phase: "Phase 8", title: "Notification Engine & Automations", status: "Planned", current: false },
    { phase: "Phase 9", title: "AI Assistant (Grounded RAG)", status: "Planned", current: false },
    { phase: "Phase 10", title: "AI Co-Pilot & Action Engine", status: "Planned", current: false },
    { phase: "Phase 11", title: "Security Hardening & Audit", status: "Planned", current: false },
    { phase: "Phase 12", title: "Production Deployment & Go-Live", status: "Planned", current: false },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">Versaly Core</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  v0.1.0 • Phase 0
                </span>
              </div>
              <p className="text-xs text-slate-400">The operating system for Versaly</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Server className="h-3.5 w-3.5 text-emerald-400" />
              <span>/api/health</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Phase 0 — Engineering Foundation Active</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Single Source of Truth for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">Versaly Operations</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            The foundation for company knowledge, contacts, clients, projects, documents, tasks, accounts, workflows, and operational history is initialized and ready for progressive module delivery.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {architecturalPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-100 text-sm">{pillar.title}</h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{pillar.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">{pillar.tech}</span>
                  <span className="text-emerald-400 font-medium">{pillar.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Roadmap Overview */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Development Lifecycle</h2>
                <p className="text-xs text-slate-400 mt-1">13 structured phases from foundation to production cutover</p>
              </div>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                Phase 0 in progress
              </span>
            </div>

            <div className="space-y-3">
              {developmentTimeline.map((item) => (
                <div
                  key={item.phase}
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs transition ${
                    item.current
                      ? "bg-indigo-950/40 border-indigo-500/30 text-indigo-200"
                      : "bg-slate-900/20 border-slate-800/60 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-semibold ${item.current ? "text-indigo-400" : "text-slate-500"}`}>
                      {item.phase}
                    </span>
                    <span className="font-medium text-slate-200">{item.title}</span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                      item.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : item.status === "Up Next"
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        : "text-slate-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Verification & Endpoints */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Architectural Contracts</h2>
              <p className="text-xs text-slate-400 mb-6">Verified Phase 0 services and API modules ready for integration.</p>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-mono">
                    <span>GET /api/health</span>
                    <span className="text-emerald-400">200 OK</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Uptime, runtime environment, and database ping latency.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-mono">
                    <span>POST /api/auth/register</span>
                    <span className="text-indigo-400">RBAC</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">First user receives Owner role; password hashing & JWT session.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-mono">
                    <span>POST /api/auth/login</span>
                    <span className="text-indigo-400">Session</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Credential authentication, cookie issuance & audit event recording.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-mono">
                    <span>GET /api/auth/me</span>
                    <span className="text-indigo-400">Permissions</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Active profile with resolved role-based permissions matrix.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Up next: Phase 1</span>
                <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                  Workspace Shell <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
