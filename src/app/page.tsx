"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // If user has an active session flag, go directly to dashboard; otherwise prompt login
    if (typeof window !== "undefined") {
      const isAuthActive = localStorage.getItem("versaly_auth_active");
      if (isAuthActive === "true") {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading Versaly Core...</span>
      </div>
    </div>
  );
}
