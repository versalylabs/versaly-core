import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { OfflineProvider } from "@/context/offline-context";
import { PWAProvider } from "@/context/pwa-context";
import { SyncProvider } from "@/context/sync-context";
import { PWAInstallBanner, IOSInstallModal } from "@/components/workspace/pwa-install";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#080a14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: {
    default: "Versaly Core — Operating System for Versaly",
    template: "%s | Versaly Core",
  },
  description: "Centralized business operations platform and single source of truth for Versaly.",
  applicationName: "Versaly Core",
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/favicon-32x32.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Versaly Core",
    startupImage: [
      {
        url: "/icons/icon-512.png",
      },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "application-name": "Versaly Core",
    "msapplication-TileColor": "#080a14",
    "msapplication-TileImage": "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-100">
        <OfflineProvider>
          <PWAProvider>
              <SyncProvider>{children}</SyncProvider>
              <PWAInstallBanner />
              <IOSInstallModal />
          </PWAProvider>
        </OfflineProvider>
      </body>
    </html>
  );
}
