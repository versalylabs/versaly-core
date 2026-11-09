import { appStorage } from "@/lib/app-storage";

export function readStored<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = appStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export const STAGE_STYLE: Record<string, { stage: string; color: string }> = {
  CONTACTED: { stage: "Contacted (First Pitch)", color: "bg-slate-500" },
  DEMO_BOOKED: { stage: "Demo Booked", color: "bg-sky-500" },
  PROPOSAL_SENT: { stage: "Proposal Sent", color: "bg-violet-500" },
  NEGOTIATION: { stage: "Negotiation / Close", color: "bg-emerald-500" },
};
