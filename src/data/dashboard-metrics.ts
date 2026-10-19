export interface ProductPerformanceItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  leadsContacted: number;
  demosBooked: number;
  dealsWon: number;
  revenueCollected: number; // KES
  mrr: number; // KES
  activeClients: number;
  churnedClients: number;
  averageDealSize: number; // KES
  conversionRatePct: number; // Lead to Client %
  tractionStatus: "Strong Traction" | "High ACV" | "Steady Growth" | "Watchlist";
  day45Action: string;
}

export interface StageDealItem {
  stage: string;
  count: number;
  probabilityPct: number;
  nominalValueKES: number;
  weightedValueKES: number;
  color: string;
}

export const INITIAL_MONEY_METRICS = {
  revenueCollectedThisMonth: 495000, // Actual cash received
  setupFeesCollected: 345000,
  setupFeeTarget: 520000, // Launch target
  mrr: 288000, // Monthly Recurring
  mrrTarget: 120000, // Launch baseline target
  arr: 3456000, // MRR * 12
  outstandingInvoicesKES: 63000,
  overduePaymentsKES: 18000,
  overdueClientsCount: 2,
  averageRevenuePerClient: 8470, // MRR / 34
  productRevenueBreakdown: [
    { name: "Vehisoft", collected: 174500, mrr: 104500, pct: 35.2, color: "#6366f1" },
    { name: "Versandry", collected: 112000, mrr: 63000, pct: 22.6, color: "#06b6d4" },
    { name: "Adversoft", collected: 105000, mrr: 60000, pct: 21.2, color: "#8b5cf6" },
    { name: "LipaTim", collected: 55000, mrr: 35000, pct: 11.1, color: "#10b981" },
    { name: "Melio RMS", collected: 48500, mrr: 25500, pct: 9.9, color: "#f59e0b" },
  ],
};

export const INITIAL_SALES_ACTIVITY_METRICS = {
  outreachToday: 24,
  outreachTodayTarget: 100, // 100 actions/day launch pace
  outreachThisWeek: 342,
  outreachThisWeekTarget: 500,
  newLeadsAddedWeek: 14,
  uncontactedPool: 14, // Kept separate from active pipeline
  leadsContacted: 37, // Active pipeline entries
  demosBooked: 12,
  demosCompleted: 9,
  demoCompletionRatePct: 75.0,
  proposalsSent: 6,
  dealsWon: 4,
  dealsLost: 2,
  lossReasons: [
    { reason: "Hardware upfront budget constraint", count: 1, product: "Melio RMS" },
    { reason: "Prefers handwritten ledger records", count: 1, product: "Vehisoft" },
  ],
  referralsReceived: 4,
  contactedToWonConversionPct: 10.8, // 4 won / 37 contacted
};

export const INITIAL_PIPELINE_METRICS = {
  totalPipelineValueKES: 840000,
  weightedPipelineValueKES: 412000,
  dealsWonThisMonth: 4,
  dealsWonValueKES: 183000, // Setup + first month MRR
  winRatePct: 66.7, // 4 won / 6 closed
  averageDealSizeKES: 45750, // Setup fee + MRR
  averageTimeToCloseDays: 8.4,
  followUpsDueTodayCount: 4,
  dealsByStage: [
    {
      stage: "Contacted (First Pitch)",
      count: 12,
      probabilityPct: 10,
      nominalValueKES: 180000,
      weightedValueKES: 18000,
      color: "bg-slate-500",
    },
    {
      stage: "Demo Booked",
      count: 7,
      probabilityPct: 25,
      nominalValueKES: 145000,
      weightedValueKES: 36250,
      color: "bg-sky-500",
    },
    {
      stage: "Demo Completed",
      count: 5,
      probabilityPct: 50,
      nominalValueKES: 165000,
      weightedValueKES: 82500,
      color: "bg-indigo-500",
    },
    {
      stage: "Proposal Sent",
      count: 5,
      probabilityPct: 75,
      nominalValueKES: 190000,
      weightedValueKES: 142500,
      color: "bg-violet-500",
    },
    {
      stage: "Negotiation / Close",
      count: 3,
      probabilityPct: 90,
      nominalValueKES: 160000,
      weightedValueKES: 144000,
      color: "bg-emerald-500",
    },
  ] as StageDealItem[],
};

export const INITIAL_CLIENT_DELIVERY_METRICS = {
  activeClients: 34,
  newClientsThisMonth: 5,
  clientsInOnboarding: 6,
  onboardingBlockersCount: 2,
  goLivesCompleted: 28,
  averageDaysPaymentToGoLive: 4.8, // Target is < 7 days
  clientHealth: {
    healthy: 29,
    healthyPct: 85.3,
    needsAttention: 4,
    needsAttentionPct: 11.8,
    atRisk: 1,
    atRiskPct: 2.9,
    churned: 1,
    churnedPct: 2.9,
  },
  supportIssuesOpen: 2,
  renewalsDue30Days: 8,
  churnedClients: 1,
  churnRatePct: 2.9,
};

export const INITIAL_PRODUCT_PERFORMANCE: ProductPerformanceItem[] = [
  {
    id: "prod-vehisoft",
    name: "Vehisoft",
    slug: "vehisoft",
    category: "Automotive Garages",
    leadsContacted: 14,
    demosBooked: 5,
    dealsWon: 2,
    revenueCollected: 174500,
    mrr: 104500,
    activeClients: 11,
    churnedClients: 0,
    averageDealSize: 44500,
    conversionRatePct: 14.3,
    tractionStatus: "Strong Traction",
    day45Action: "Double down on Industrial Area & Karen garage direct sales.",
  },
  {
    id: "prod-versandry",
    name: "Versandry",
    slug: "versandry",
    category: "Laundry & Dry Cleaning",
    leadsContacted: 9,
    demosBooked: 3,
    dealsWon: 1,
    revenueCollected: 112000,
    mrr: 63000,
    activeClients: 9,
    churnedClients: 0,
    averageDealSize: 32000,
    conversionRatePct: 11.1,
    tractionStatus: "Strong Traction",
    day45Action: "Bundle thermal barcode printers directly into setup fee.",
  },
  {
    id: "prod-adversoft",
    name: "Adversoft",
    slug: "adversoft",
    category: "Advertising & Signage",
    leadsContacted: 5,
    demosBooked: 2,
    dealsWon: 1,
    revenueCollected: 105000,
    mrr: 60000,
    activeClients: 4,
    churnedClients: 0,
    averageDealSize: 60000,
    conversionRatePct: 20.0,
    tractionStatus: "High ACV",
    day45Action: "Highest ACV per account. Target top 15 billboard agencies.",
  },
  {
    id: "prod-lipatim",
    name: "LipaTim",
    slug: "lipatim",
    category: "Fintech & Automated Rent",
    leadsContacted: 6,
    demosBooked: 1,
    dealsWon: 0,
    revenueCollected: 55000,
    mrr: 35000,
    activeClients: 7,
    churnedClients: 0,
    averageDealSize: 25000,
    conversionRatePct: 0.0,
    tractionStatus: "Steady Growth",
    day45Action: "Promote auto-reconciliation & M-Pesa landlord Paybill tie-in.",
  },
  {
    id: "prod-melio-rms",
    name: "Melio RMS",
    slug: "melio-rms",
    category: "Restaurants & Bars",
    leadsContacted: 3,
    demosBooked: 1,
    dealsWon: 0,
    revenueCollected: 48500,
    mrr: 25500,
    activeClients: 3,
    churnedClients: 1,
    averageDealSize: 38500,
    conversionRatePct: 0.0,
    tractionStatus: "Watchlist",
    day45Action: "Monitor hardware setup costs & simplify waiter tablet UX.",
  },
];
