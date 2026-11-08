/* eslint-disable @next/next/no-img-element */
import { BrandMark } from "./brand-mark";

/**
 * Full-screen branded loading state: the Versaly mark with an animated glass
 * halo, shown over the aurora backdrop while the workspace loads or syncs.
 */
export function BrandLoader({ label = "Loading Versaly Core…", sublabel }: { label?: string; sublabel?: string }) {
  return (
    <div className="brand-loader min-h-screen flex items-center justify-center p-6" role="status" aria-live="polite">
      <div className="brand-loader-card rounded-3xl px-10 py-9 flex flex-col items-center gap-5 text-center max-w-xs w-full">
        <div className="relative h-[76px] w-[76px]">
          <div className="brand-loader-halo" />
          <BrandMark size={76} className="relative rounded-[22px] shadow-2xl shadow-indigo-950/60" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-semibold tracking-tight text-white">{label}</div>
          {sublabel && <div className="text-xs text-slate-400">{sublabel}</div>}
        </div>
        <div className="brand-loader-bar" />
      </div>
    </div>
  );
}
