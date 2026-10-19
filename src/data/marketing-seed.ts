// ============================================================================
// VERSALY CORE: MARKETING DOMAIN DATA SEED & TYPES
// Covers: Campaigns (Digital & Billboards), Ad Spend, Content & Social Media,
// Creative Assets, and Performance Reporting.
// ============================================================================

export type MarketingProduct =
  | "Adversoft"
  | "Vehisoft"
  | "Versandry"
  | "LipaTim"
  | "Melio RMS"
  | "Versaly Core / Brand";

export type CampaignChannel =
  | "Billboard"
  | "Meta (FB & IG)"
  | "Google Ads"
  | "TikTok"
  | "LinkedIn"
  | "Print & Flyers"
  | "Direct / Events";

export type CampaignStatus = "Active" | "Planned" | "Paused" | "Completed";

export interface MarketingCampaign {
  id: string;
  name: string;
  product: MarketingProduct;
  channel: CampaignChannel;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  allocatedBudget: number; // KES
  totalSpend: number; // KES
  impressions: number;
  clicks: number;
  leadsGenerated: number;
  dealsWon: number;
  revenueGenerated: number; // KES
  locationDetails?: string; // For physical billboards / outdoor
  targetAudience: string;
  notes: string;
}

export type SpendChannel =
  | "Billboard / Outdoor"
  | "Meta Ads"
  | "Google Ads"
  | "TikTok Ads"
  | "LinkedIn Ads"
  | "Print & Banners"
  | "Influencer / Sponsorship";

export type PaymentMethod = "M-Pesa Paybill" | "Bank Wire" | "Credit Card" | "Cash";
export type SpendStatus = "Paid" | "Pending" | "Scheduled";

export interface AdSpendEntry {
  id: string;
  campaignId?: string;
  campaignName: string;
  date: string;
  channel: SpendChannel;
  product: MarketingProduct;
  amount: number; // KES
  paymentMethod: PaymentMethod;
  invoiceNumber?: string;
  vendor: string;
  status: SpendStatus;
  notes: string;
}

export type SocialChannel =
  | "LinkedIn"
  | "X / Twitter"
  | "TikTok"
  | "Instagram"
  | "Facebook"
  | "YouTube Shorts";

export type ContentStatus = "Idea" | "Drafting" | "Scheduled" | "Published";

export type ContentCategory =
  | "Educational / Case Study"
  | "Product Demo Reel"
  | "Customer Pain Point"
  | "Launch Announcement"
  | "Behind The Scenes"
  | "eTIMS Compliance Tip";

export interface SocialPost {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "08:30 AM"
  channels: SocialChannel[];
  product: MarketingProduct;
  contentType: ContentCategory;
  copy: string;
  mediaAssetUrl?: string;
  status: ContentStatus;
  engagement: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    inquiries: number;
  };
  notes?: string;
}

export type CreativeType =
  | "Billboard Mockup"
  | "Short Video Reel"
  | "Carousel Graphic"
  | "Ad Banner"
  | "Sales One-Pager"
  | "Demo Clip"
  | "Print Flyer";

export type CreativeStatus = "Production Ready" | "In Review" | "Draft" | "Archived";

export interface MarketingCreative {
  id: string;
  title: string;
  type: CreativeType;
  product: MarketingProduct;
  dimensions: string; // e.g. "12m x 4m (Billboard)", "9:16 (Vertical)", "1:1 (Square)"
  status: CreativeStatus;
  assetUrl: string;
  targetAudience: string;
  primaryHook: string;
  tags: string[];
  createdDate: string;
  notes?: string;
}

// ----------------------------------------------------------------------------
// INITIAL SEED DATA
// Realistically reflects Versaly's launch: Billboards on high-traffic Nairobi
// corridors, targeted Meta campaigns for car dealerships/laundries, Google Ads
// for eTIMS compliance, and daily social publishing.
// ----------------------------------------------------------------------------

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: "camp-001",
    name: "Westlands & Ngong Rd Prime Billboard Rollout",
    product: "Adversoft",
    channel: "Billboard",
    status: "Active",
    startDate: "2026-10-15",
    endDate: "2026-11-30",
    allocatedBudget: 180000,
    totalSpend: 150000,
    impressions: 480000,
    clicks: 1240,
    leadsGenerated: 28,
    dealsWon: 2,
    revenueGenerated: 240000,
    locationDetails: "Westlands Roundabout Billboard & Ngong Road near Adams Arcade",
    targetAudience: "Out-of-Home media buyers, agency leads, and billboard site owners",
    notes: "High footfall & vehicle traffic corridor. QR code directs to Adversoft instant billboard audit.",
  },
  {
    id: "camp-002",
    name: "Vehisoft Dealership Lead Accelerator (Meta)",
    product: "Vehisoft",
    channel: "Meta (FB & IG)",
    status: "Active",
    startDate: "2026-10-18",
    endDate: "2026-11-15",
    allocatedBudget: 60000,
    totalSpend: 24500,
    impressions: 112000,
    clicks: 3450,
    leadsGenerated: 42,
    dealsWon: 3,
    revenueGenerated: 195000,
    targetAudience: "Car yard owners, automotive dealers, showroom managers in Nairobi, Kiambu, Mombasa",
    notes: "Focus on instant WhatsApp vehicle inventory sync and stopping lost customer walk-ins.",
  },
  {
    id: "camp-003",
    name: "LipaTim eTIMS Urgent Compliance Search Ads",
    product: "LipaTim",
    channel: "Google Ads",
    status: "Active",
    startDate: "2026-10-12",
    endDate: "2026-11-20",
    allocatedBudget: 45000,
    totalSpend: 18200,
    impressions: 38400,
    clicks: 1980,
    leadsGenerated: 31,
    dealsWon: 4,
    revenueGenerated: 140000,
    targetAudience: "SME retail shops, distributors, and pharmacy owners searching for KRA eTIMS integrations",
    notes: "High conversion intent on search terms: 'eTIMS POS integration Kenya', 'KRA receipt API'.",
  },
  {
    id: "camp-004",
    name: "Versandry Laundromat Growth Stories (TikTok)",
    product: "Versandry",
    channel: "TikTok",
    status: "Active",
    startDate: "2026-10-16",
    endDate: "2026-11-10",
    allocatedBudget: 35000,
    totalSpend: 12800,
    impressions: 215000,
    clicks: 4120,
    leadsGenerated: 26,
    dealsWon: 2,
    revenueGenerated: 90000,
    targetAudience: "Laundromat operators, dry cleaners, estate residential business owners",
    notes: "Short engaging video reels demonstrating wash cycle tracking and lost ticket prevention.",
  },
  {
    id: "camp-005",
    name: "Melio RMS Hotelier & Restaurant Summit Sponsor",
    product: "Melio RMS",
    channel: "Direct / Events",
    status: "Planned",
    startDate: "2026-11-01",
    endDate: "2026-11-05",
    allocatedBudget: 75000,
    totalSpend: 0,
    impressions: 5000,
    clicks: 420,
    leadsGenerated: 0,
    dealsWon: 0,
    revenueGenerated: 0,
    locationDetails: "Sarit Expo Centre, Westlands, Nairobi",
    targetAudience: "Hospitality directors, boutique resort managers, restaurant owners",
    notes: "Executive booth showcase and live tablet demonstration of table ordering and inventory sync.",
  },
];

export const INITIAL_SPEND: AdSpendEntry[] = [
  {
    id: "spd-001",
    campaignId: "camp-001",
    campaignName: "Westlands & Ngong Rd Prime Billboard Rollout",
    date: "2026-10-14",
    channel: "Billboard / Outdoor",
    product: "Adversoft",
    amount: 150000,
    paymentMethod: "Bank Wire",
    invoiceNumber: "INV-MV-2026-881",
    vendor: "Magnate Ventures Outdoor Ltd",
    status: "Paid",
    notes: "Site lease and high-res flex print mounting for Westlands roundabout & Ngong Rd spots.",
  },
  {
    id: "spd-002",
    campaignId: "camp-002",
    campaignName: "Vehisoft Dealership Lead Accelerator (Meta)",
    date: "2026-10-18",
    channel: "Meta Ads",
    product: "Vehisoft",
    amount: 24500,
    paymentMethod: "Credit Card",
    invoiceNumber: "META-ADS-9912",
    vendor: "Meta Platforms Ireland Ltd",
    status: "Paid",
    notes: "Lead generation objective targeting automotive showroom interest in Nairobi & Kiambu.",
  },
  {
    id: "spd-003",
    campaignId: "camp-003",
    campaignName: "LipaTim eTIMS Urgent Compliance Search Ads",
    date: "2026-10-16",
    channel: "Google Ads",
    product: "LipaTim",
    amount: 18200,
    paymentMethod: "Credit Card",
    invoiceNumber: "GOOG-7721-KE",
    vendor: "Google Kenya / Ireland",
    status: "Paid",
    notes: "Targeted Search CPC campaign capturing high-intent eTIMS accounting searches.",
  },
  {
    id: "spd-004",
    campaignId: "camp-004",
    campaignName: "Versandry Laundromat Growth Stories (TikTok)",
    date: "2026-10-17",
    channel: "TikTok Ads",
    product: "Versandry",
    amount: 12800,
    paymentMethod: "Credit Card",
    invoiceNumber: "TT-AFR-4412",
    vendor: "ByteDance Advertising",
    status: "Paid",
    notes: "In-feed spark ads boosting 3 laundromat problem-solution reels.",
  },
  {
    id: "spd-005",
    campaignName: "Kiambu Road Dealership Print Flyers & Brochures",
    date: "2026-10-19",
    channel: "Print & Banners",
    product: "Vehisoft",
    amount: 8500,
    paymentMethod: "M-Pesa Paybill",
    invoiceNumber: "RAM-PRINT-104",
    vendor: "Ramco Printing Works Ltd",
    status: "Paid",
    notes: "500 heavy glossy 2-fold sales brochures for in-person car yard walk-ins.",
  },
  {
    id: "spd-006",
    campaignId: "camp-005",
    campaignName: "Melio RMS Hotelier & Restaurant Summit Sponsor",
    date: "2026-10-25",
    channel: "Influencer / Sponsorship",
    product: "Melio RMS",
    amount: 75000,
    paymentMethod: "Bank Wire",
    invoiceNumber: "SARIT-EXPO-409",
    vendor: "Hospitality Events Kenya Ltd",
    status: "Scheduled",
    notes: "Booth reservation deposit for upcoming Hospitality Expo.",
  },
];

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: "post-001",
    title: "Why Car Yards in Nairobi Lose 30% of Prospects After 5:00 PM",
    date: "2026-10-20",
    timeSlot: "08:30 AM",
    channels: ["LinkedIn", "X / Twitter", "Facebook"],
    product: "Vehisoft",
    contentType: "Customer Pain Point",
    copy: "Most car yards close gate at 6:00 PM, but car shoppers browse online between 8:00 PM and 11:00 PM. If your website and WhatsApp don't automatically send inventory sheets and pricing instantly, they move to the next dealer on Ngong Road. Here's how Vehisoft turns after-hours chats into morning bookings.",
    status: "Published",
    engagement: {
      views: 3420,
      likes: 184,
      shares: 38,
      comments: 24,
      inquiries: 7,
    },
    notes: "Strong response from Kiambu Rd car yard owners.",
  },
  {
    id: "post-002",
    title: "The KRA eTIMS Deadline: Are Your Branch POS Systems Truly Compliant?",
    date: "2026-10-21",
    timeSlot: "09:00 AM",
    channels: ["LinkedIn", "X / Twitter"],
    product: "LipaTim",
    contentType: "eTIMS Compliance Tip",
    copy: "Many shop managers think printing a standard thermal receipt is enough. Under KRA's 2026 guidelines, every invoice requires instant QR verification with cryptographic signing. LipaTim connects to your existing setup in under 48 hours without replacing your hardware.",
    status: "Scheduled",
    engagement: {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      inquiries: 0,
    },
    notes: "Tagging Nairobi retail distributors.",
  },
  {
    id: "post-003",
    title: "Inside a 200-Item-Per-Day Laundromat: Tracking Every Wash Without Lost Tickets",
    date: "2026-10-22",
    timeSlot: "12:30 PM",
    channels: ["TikTok", "Instagram", "Facebook"],
    product: "Versandry",
    contentType: "Product Demo Reel",
    copy: "Ever lost a client's favourite duvet? Here is how Kilimani's busiest laundromat uses automated SMS updates and barcode tags with Versandry to eliminate lost garments forever.",
    status: "Drafting",
    engagement: {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      inquiries: 0,
    },
    notes: "Short video filmed on phone ready for voiceover edit.",
  },
  {
    id: "post-004",
    title: "Billboard Media Owners: Stop Leaving Unsold Inventory Empty",
    date: "2026-10-23",
    timeSlot: "05:00 PM",
    channels: ["LinkedIn", "X / Twitter"],
    product: "Adversoft",
    contentType: "Educational / Case Study",
    copy: "An empty billboard costs the same ground rent as an occupied one. Adversoft gives OOH media owners automated booking proposals, client proof-of-play reports, and real-time site vacancy maps.",
    status: "Idea",
    engagement: {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      inquiries: 0,
    },
    notes: "Follow up with outdoor media agencies.",
  },
  {
    id: "post-005",
    title: "Building the Operating System for East African Businesses — Versaly Core Launch",
    date: "2026-10-24",
    timeSlot: "10:00 AM",
    channels: ["LinkedIn", "X / Twitter", "YouTube Shorts"],
    product: "Versaly Core / Brand",
    contentType: "Launch Announcement",
    copy: "We built Versaly Core because managing clients across WhatsApp, spreadsheets, and scattered invoicing tools burns 15 hours a week. Here is what an integrated business OS looks like.",
    status: "Scheduled",
    engagement: {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      inquiries: 0,
    },
  },
];

export const INITIAL_CREATIVES: MarketingCreative[] = [
  {
    id: "crt-001",
    title: "Adversoft Highway Billboard Mockup (Westlands)",
    type: "Billboard Mockup",
    product: "Adversoft",
    dimensions: "12m x 4m (Billboard)",
    status: "Production Ready",
    assetUrl: "/marketing/assets/adversoft-billboard-westlands.png",
    targetAudience: "Marketing Directors, OOH Media Agencies, Billboard Contractors",
    primaryHook: "Your Billboards, Fully Automated. Bookings, Audits & Client Proof in One Place.",
    tags: ["Billboard", "Adversoft", "Outdoor", "Print"],
    createdDate: "2026-10-14",
    notes: "Mounted at Westlands roundabout site.",
  },
  {
    id: "crt-002",
    title: "Vehisoft 30-Second Car Yard Problem-Solution Reel",
    type: "Short Video Reel",
    product: "Vehisoft",
    dimensions: "9:16 (Vertical Video)",
    status: "Production Ready",
    assetUrl: "/marketing/assets/vehisoft-car-yard-reel.mp4",
    targetAudience: "Used car yard proprietors, showroom salespeople",
    primaryHook: "Stop losing car buyers because your rep took 2 hours to reply on WhatsApp.",
    tags: ["TikTok", "Instagram", "Vehisoft", "Video"],
    createdDate: "2026-10-17",
    notes: "Includes Kenyan accent voiceover and screen capture of WhatsApp automated response.",
  },
  {
    id: "crt-003",
    title: "LipaTim eTIMS 5-Step Compliance Carousel",
    type: "Carousel Graphic",
    product: "LipaTim",
    dimensions: "1:1 (Square 1080x1080)",
    status: "Production Ready",
    assetUrl: "/marketing/assets/lipatim-etims-carousel.png",
    targetAudience: "Retail shop owners, pharmacy managers, FMCG distributors",
    primaryHook: "5 Costly eTIMS Mistakes That Trigger KRA Penalties (And How to Fix Them in 48 Hours).",
    tags: ["LinkedIn", "Instagram", "LipaTim", "eTIMS"],
    createdDate: "2026-10-18",
  },
  {
    id: "crt-004",
    title: "Versandry Laundry Ticket & SMS Notification Flyer",
    type: "Print Flyer",
    product: "Versandry",
    dimensions: "A4 Print / 2-Fold",
    status: "Production Ready",
    assetUrl: "/marketing/assets/versandry-sales-flyer.pdf",
    targetAudience: "Laundromat owners, dry cleaning depot operators",
    primaryHook: "Never lose a garment again. Automated SMS when clothes are washed, dried, and packed.",
    tags: ["Print", "Flyer", "Versandry", "Outreach"],
    createdDate: "2026-10-19",
  },
  {
    id: "crt-005",
    title: "Melio RMS Tablet POS Table Ordering Pitch Deck",
    type: "Sales One-Pager",
    product: "Melio RMS",
    dimensions: "16:9 Presentation",
    status: "In Review",
    assetUrl: "/marketing/assets/melio-rms-executive-sheet.pdf",
    targetAudience: "Fine dining managers, lounge directors, hotel F&B executives",
    primaryHook: "Turn tables 25% faster with zero kitchen order errors.",
    tags: ["Sales Deck", "Melio", "Hospitality", "One-Pager"],
    createdDate: "2026-10-19",
  },
];
