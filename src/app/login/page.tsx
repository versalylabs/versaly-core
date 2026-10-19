"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/context/theme-context";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("versalylabs@gmail.com");
  const [password, setPassword] = useState("labversaly-16");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedDemo, setCopiedDemo] = useState(false);

  const handleFillDemo = () => {
    setEmail("versalylabs@gmail.com");
    setPassword("labversaly-16");
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Invalid credentials provided");
        setIsLoading(false);
        return;
      }

      // Successful login
      router.push("/dashboard");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to connect to authentication server");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-600/15 via-violet-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Bar with Brand & Theme Toggle */}
      <header className="p-6 flex items-center justify-between max-w-6xl w-full mx-auto relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              Versaly Core
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
              OS
            </span>
          </div>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          )}
        </button>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Card */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="text-center space-y-1.5">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Sign in to Versaly Core
              </h1>
              <p className="text-xs text-slate-400">
                Single source of truth for all business operations, products, and pipelines.
              </p>
            </div>

            {/* Demo Credentials Pill */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Pre-Configured Demo Credentials
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition"
                >
                  {copiedDemo ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Applied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Use Credentials</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-sans">Email:</span>
                  <span className="text-slate-200">versalylabs@gmail.com</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-sans">Password:</span>
                  <span className="text-slate-200">labversaly-16</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. versalylabs@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Secret Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? "Authenticating Session..." : "Sign In to Operations Hub"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Direct Workspace Bypass Link */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Skip directly to Workspace Dashboard →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-600 relative z-10">
        © 2026 Versaly Operations Ltd. Protected by enterprise RBAC, CSP & HSTS security headers.
      </footer>
    </div>
  );
}
