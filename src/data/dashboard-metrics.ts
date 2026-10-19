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
  revenueCollectedThisMonth: 0, // Actual cash received
  setupFeesCollected: 0,
  setupFeeTarget: 520000, // Launch target
  mrr: 0, // Monthly Recurring
  mrrTarget: 120000, // Launch baseline target
  arr: 0, // MRR * 12
  outstandingInvoicesKES: 0,
  overduePaymentsKES: 0,
  overdueClientsCount: 0,
  averageRevenuePerClient: 0,
  productRevenueBreakdown: [
    { name: "Vehisoft", collected: 0, mrr: 0, pct: 0, color: "#6366f1" },
    { name: "Versandry", collected: 0, mrr: 0, pct: 0, color: "#06b6d4" },
    { name: "Adversoft", collected: 0, mrr: 0, pct: 0, color: "#8b5cf6" },
    { name: "LipaTim", collected: 0, mrr: 0, pct: 0, color: "#10b981" },
    { name: "Melio RMS", collected: 0, mrr: 0, pct: 0, color: "#f59e0b" },
  ],
};

export const INITIAL_SALES_ACTIVITY_METRICS = {
  outreachToday: 0,
  outreachTodayTarget: 100, // 100 actions/day launch pace
  outreachThisWeek: 0,
  outreachThisWeekTarget: 500,
  newLeadsAddedWeek: 0,
  uncontactedPool: 0, // Kept separate from active pipeline
  leadsContacted: 0, // Active pipeline entries
  demosBooked: 0,
  demosCompleted: 0,
  demoCompletionRatePct: 0,
  proposalsSent: 0,
  dealsWon: 0,
  dealsLost: 0,
  lossReasons: [] as { reason: string; count: number; product: string }[],
  referralsReceived: 0,
  contactedToWonConversionPct: 0,
};

export const INITIAL_PIPELINE_METRICS = {
  totalPipelineValueKES: 0,
  weightedPipelineValueKES: 0,
  dealsWonThisMonth: 0,
  dealsWonValueKES: 0,
  winRatePct: 0,
  averageDealSizeKES: 0,
  averageTimeToCloseDays: 0,
  followUpsDueTodayCount: 0,
  dealsByStage: [
    {
      stage: "Contacted (First Pitch)",
      count: 0,
      probabilityPct: 10,
      nominalValueKES: 0,
      weightedValueKES: 0,
      color: "bg-slate-500",
    },
    {
      stage: "Demo Booked",
      count: 0,
      probabilityPct: 25,
      nominalValueKES: 0,
      weightedValueKES: 0,
      color: "bg-sky-500",
    },
    {
      stage: "Demo Completed",
      count: 0,
      probabilityPct: 50,
      nominalValueKES: 0,
      weightedValueKES: 0,
      color: "bg-indigo-500",
    },
    {
      stage: "Proposal Sent",
      count: 0,
      probabilityPct: 75,
      nominalValueKES: 0,
      weightedValueKES: 0,
      color: "bg-violet-500",
    },
    {
      stage: "Negotiation / Close",
      count: 0,
      probabilityPct: 90,
      nominalValueKES: 0,
      weightedValueKES: 0,
      color: "bg-emerald-500",
    },
  ] as StageDealItem[],
};

export const INITIAL_CLIENT_DELIVERY_METRICS = {
  activeClients: 0,
  newClientsThisMonth: 0,
  clientsInOnboarding: 0,
  onboardingBlockersCount: 0,
  goLivesCompleted: 0,
  averageDaysPaymentToGoLive: 0, // Target is < 7 days
  clientHealth: {
    healthy: 0,
    healthyPct: 0,
    needsAttention: 0,
    needsAttentionPct: 0,
    atRisk: 0,
    atRiskPct: 0,
    churned: 0,
    churnedPct: 0,
  },
  supportIssuesOpen: 0,
  renewalsDue30Days: 0,
  churnedClients: 0,
  churnRatePct: 0,
};

export const INITIAL_PRODUCT_PERFORMANCE: ProductPerformanceItem[] = [
  {
    id: "prod-vehisoft",
    name: "Vehisoft",
    slug: "vehisoft",
    category: "Automotive Garages",
    leadsContacted: 0,
    demosBooked: 0,
    dealsWon: 0,
    revenueCollected: 0,
    mrr: 0,
    activeClients: 0,
    churnedClients: 0,
    averageDealSize: 0,
    conversionRatePct: 0,
    tractionStatus: "Strong Traction",
    day45Action: "Double down on Industrial Area & Karen garage direct sales.",
  },
  {
    id: "prod-versandry",
    name: "Versandry",
    slug: "versandry",
    category: "Laundry & Dry Cleaning",
    leadsContacted: 0,
    demosBooked: 0,
    dealsWon: 0,
    revenueCollected: 0,
    mrr: 0,
    activeClients: 0,
    churnedClients: 0,
    averageDealSize: 0,
    conversionRatePct: 0,
    tractionStatus: "Strong Traction",
    day45Action: "Bundle thermal barcode printers directly into setup fee.",
  },
  {
    id: "prod-adversoft",
    name: "Adversoft",
    slug: "adversoft",
    category: "Advertising & Signage",
    leadsContacted: 0,
    demosBooked: 0,
    dealsWon: 0,
    revenueCollected: 0,
    mrr: 0,
    activeClients: 0,
    churnedClients: 0,
    averageDealSize: 0,
    conversionRatePct: 0,
    tractionStatus: "High ACV",
    day45Action: "Highest ACV per account. Target top 15 billboard agencies.",
  },
  {
    id: "prod-lipatim",
    name: "LipaTim",
    slug: "lipatim",
    category: "Fintech & Automated Rent",
    leadsContacted: 0,
    demosBooked: 0,
    dealsWon: 0,
    revenueCollected: 0,
    mrr: 0,
    activeClients: 0,
    churnedClients: 0,
    averageDealSize: 0,
    conversionRatePct: 0,
    tractionStatus: "Steady Growth",
    day45Action: "Promote auto-reconciliation & M-Pesa landlord Paybill tie-in.",
  },
  {
    id: "prod-melio-rms",
    name: "Melio RMS",
    slug: "melio-rms",
    category: "Restaurants & Bars",
    leadsContacted: 0,
    demosBooked: 0,
    dealsWon: 0,
    revenueCollected: 0,
    mrr: 0,
    activeClients: 0,
    churnedClients: 0,
    averageDealSize: 0,
    conversionRatePct: 0,
    tractionStatus: "Watchlist",
    day45Action: "Monitor hardware setup costs & simplify waiter tablet UX.",
  },
];
