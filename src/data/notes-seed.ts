export interface RandomNote {
  id: string;
  title: string;
  content: string;
  category: "General" | "Idea" | "Meeting" | "Technical" | "Finance" | "Action Item";
  color: "slate" | "indigo" | "emerald" | "amber" | "rose" | "violet";
  pinned: boolean;
  linkedProjectId?: string; // e.g. "proj-safari" or empty
  linkedProjectName?: string; // e.g. "Safari Auto Clinic - Vehisoft"
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_RANDOM_NOTES: RandomNote[] = [
  {
    id: "note-1",
    title: "M-Pesa STK Push Timeout Mitigation Strategy",
    content: "When customer M-Pesa prompt times out after 45 seconds, trigger a secondary fallback SMS webhook rather than dropping the checkout session. Verified across LipaTim and Melio RMS setups.",
    category: "Technical",
    color: "indigo",
    pinned: true,
    linkedProjectId: "proj-express",
    linkedProjectName: "Express Wash Kilimani (Versandry)",
    tags: ["M-Pesa", "Architecture", "Payments"],
    createdAt: "Oct 18, 2026",
    updatedAt: "Oct 19, 2026",
  },
  {
    id: "note-2",
    title: "Q4 Hardware Pricing Comparison for Thermal Printers",
    content: "Xprinter XP-420B thermal barcode printer costs KES 11,500 at Luthuli Avenue suppliers. Fits standard 50x30mm laundry tag rolls. Recommend bundling with Versandry onboarding kits.",
    category: "Idea",
    color: "amber",
    pinned: true,
    linkedProjectId: "proj-express",
    linkedProjectName: "Express Wash Kilimani (Versandry)",
    tags: ["Hardware", "Logistics", "Printers"],
    createdAt: "Oct 16, 2026",
    updatedAt: "Oct 17, 2026",
  },
  {
    id: "note-3",
    title: "Industrial Area Garage Mechanic Retention Insights",
    content: "Mechanics in Industrial Area don't want desktop computers in greasy service bays. Tablets with rugged silicone rubber cases and oversized touch buttons for job cards had 100% adoption within 48 hours.",
    category: "Meeting",
    color: "emerald",
    pinned: false,
    linkedProjectId: "proj-safari",
    linkedProjectName: "Safari Auto Clinic (Vehisoft)",
    tags: ["Field Visit", "UX", "Adoption"],
    createdAt: "Oct 17, 2026",
    updatedAt: "Oct 18, 2026",
  },
  {
    id: "note-4",
    title: "Draft Pitch Script for Outdoor Billboard Owners",
    content: "Hook: 'How many times this year did your sales rep double-book the Westlands roundabout billboard because the Excel schedule wasn't synced?' Solution: Adversoft 1-click photo mockup certificate.",
    category: "General",
    color: "violet",
    pinned: false,
    linkedProjectId: "proj-skyline",
    linkedProjectName: "Skyline Outdoor Media Ltd (Adversoft)",
    tags: ["Sales Pitch", "Objection Handling"],
    createdAt: "Oct 15, 2026",
    updatedAt: "Oct 15, 2026",
  },
  {
    id: "note-5",
    title: "Universal Founder Retrospective & Product Principles",
    content: "1. Build software that solves the first friction point in under 15 minutes.\n2. Keep single relational integrity across all products.\n3. Always collect setup fee upfront before field deployment.",
    category: "General",
    color: "slate",
    pinned: false,
    tags: ["Culture", "Principles", "Founders"],
    createdAt: "Oct 14, 2026",
    updatedAt: "Oct 14, 2026",
  },
];
