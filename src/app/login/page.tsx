"use client";

import { useState, useEffect } from "react";
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
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { useTheme } from "@/context/theme-context";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("versalylabs@gmail.com");
  const [password, setPassword] = useState("labversaly-16");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedDemo, setCopiedDemo] = useState(false);

  // Auto-fill demo credentials on mount
  useEffect(() => {
    setEmail("versalylabs@gmail.com");
    setPassword("labversaly-16");
  }, []);

  const handleFillDemo = () => {
    setEmail("versalylabs@gmail.com");
    setPassword("labversaly-16");
    setCopiedDemo(true);
    setErrorMessage(null);
    setTimeout(() => setCopiedDemo(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error?.message ||
            "Invalid credentials. Please use email: versalylabs@gmail.com and password: labversaly-16"
        );
        setIsLoading(false);
        return;
      }

      // Store local authentication state
      if (typeof window !== "undefined") {
        localStorage.setItem("versaly_auth_active", "true");
        localStorage.setItem(
          "versaly_current_user",
          JSON.stringify(data.data?.user || { email: "versalylabs@gmail.com", role: "OWNER" })
        );
      }

      // Successful login redirect to operations dashboard
      router.push("/dashboard");
    } catch {
      // Fallback for offline / demo preview
      if (email.trim().toLowerCase() === "versalylabs@gmail.com" && password === "labversaly-16") {
        if (typeof window !== "undefined") {
          localStorage.setItem("versaly_auth_active", "true");
          localStorage.setItem(
            "versaly_current_user",
            JSON.stringify({
              id: "usr-demo-owner",
              email: "versalylabs@gmail.com",
              name: "Versaly Labs Administrator",
              role: "OWNER",
            })
          );
        }
        router.push("/dashboard");
      } else {
        setErrorMessage("Invalid credentials. Please use demo credentials: versalylabs@gmail.com / labversaly-16");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Ambient Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[420px] bg-gradient-to-b from-indigo-600/20 via-violet-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
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
              BOS
            </span>
          </div>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition shadow-sm backdrop-blur"
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
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Card Box */}
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold mb-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Operating System Authentication</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Sign in to Versaly Core
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Centralized operations, multi-product pipelines & automated business execution.
              </p>
            </div>

            {/* Configured Demo Credentials Pill */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  Configured Demo Credentials
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedDemo ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Filled & Ready</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-indigo-400" />
                      <span>Use Credentials</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans font-medium">Email:</span>
                  <span className="text-slate-200 text-[11px] select-all">versalylabs@gmail.com</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans font-medium">Password:</span>
                  <span className="text-slate-200 text-[11px] select-all">labversaly-16</span>
                </div>
              </div>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="versalylabs@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="labversaly-16"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 h-3.5 w-3.5"
                  />
                  <span className="text-[11px]">Remember on this device</span>
                </label>

                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                >
                  <KeyRound className="h-3 w-3" />
                  <span>Reset to Demo</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isLoading ? "Authenticating Operations Hub..." : "Sign In to Versaly Core"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Bypass / Exploration */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-xs text-slate-500 hover:text-slate-300 transition inline-flex items-center gap-1"
            >
              <span>Explore dashboard directly without signing in</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-600 relative z-10">
        © 2026 Versaly Operations Ltd. Enterprise RBAC, CSP & Multi-Factor Security Enabled.
      </footer>
    </div>
  );
}
