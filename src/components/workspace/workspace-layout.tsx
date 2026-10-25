"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CommandPalette } from "./command-palette";
import { OfflineBanner } from "./offline-banner";

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Responsive Sidebar (Desktop sticky, Mobile drawer) */}
      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <OfflineBanner />
        <Header
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
