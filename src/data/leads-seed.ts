export type DealStageType =
  | "CONTACTED"
  | "DEMO_BOOKED"
  | "PROPOSAL_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export interface RawLeadItem {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  whatsapp: string;
  email: string;
  productSlug: string;
  productName: string;
  location: string;
  source: "Walk-in Route" | "Referral" | "Cold Email" | "WhatsApp Inquiry" | "Social Media";
  notes: string;
  status: "UNCONTACTED" | "CONTACTED" | "ARCHIVED";
  createdAt: string;
}

export interface ActiveDealItem {
  id: string;
  businessName: string;
  contactName: string;
  contactPhone: string;
  contactWhatsApp: string;
  contactEmail: string;
  productSlug: string;
  productName: string;
  stage: DealStageType;
  setupFeeKES: number;
  monthlyFeeKES: number;
  winProbability: number;
  targetCloseDate: string;
  outreachChannel: string;
  nextAction: string;
  nextActionDate: string;
  lostReason?: string;
  onboardingProjectCreated?: boolean;
}

export const INITIAL_RAW_LEADS: RawLeadItem[] = [
  {
    id: "raw-1",
    businessName: "Auto Care Precision Bay",
    contactName: "Samuel Kamau",
    phone: "+254 721 345 678",
    whatsapp: "+254 721 345 678",
    email: "samuel@autocarebay.co.ke",
    productSlug: "vehisoft",
    productName: "Vehisoft",
    location: "Commercial St, Industrial Area",
    source: "Walk-in Route",
    notes: "Spotted 8 mechanic bays, busy workshop. Needs mechanic commission tracking.",
    status: "UNCONTACTED",
    createdAt: "Today 08:30 AM",
  },
  {
    id: "raw-2",
    businessName: "Sparkle & Shine Dry Cleaners",
    contactName: "Beatrice Mwende",
    phone: "+254 733 999 888",
    whatsapp: "+254 733 999 888",
    email: "sparkleclean@gmail.com",
    productSlug: "versandry",
    productName: "Versandry",
    location: "Chaka Rd, Kilimani",
    source: "Walk-in Route",
    notes: "Owner frustrated with customers abandoning washed jackets for 3+ months.",
    status: "UNCONTACTED",
    createdAt: "Yesterday",
  },
  {
    id: "raw-3",
    businessName: "Golden Spoon Eatery & Grill",
    contactName: "Vikram Shah",
    phone: "+254 712 555 123",
    whatsapp: "+254 712 555 123",
    email: "manager@goldenspoon.co.ke",
    productSlug: "melio-rms",
    productName: "Melio RMS",
    location: "Parklands 3rd Ave",
    source: "Referral",
    notes: "Referral from Mama Rocks manager. Wants kitchen display system for quick orders.",
    status: "UNCONTACTED",
    createdAt: "Oct 17, 2026",
  },
  {
    id: "raw-4",
    businessName: "Kileleshwa Heights Residence",
    contactName: "Chairman Otieno",
    phone: "+254 702 444 333",
    whatsapp: "+254 702 444 333",
    email: "board@kileleshwaheights.com",
    productSlug: "lipatim",
    productName: "LipaTim",
    location: "Kileleshwa",
    source: "WhatsApp Inquiry",
    notes: "Estate committee wants automated M-Pesa service charge collection for 64 units.",
    status: "UNCONTACTED",
    createdAt: "Oct 16, 2026",
  },
  {
    id: "raw-5",
    businessName: "Highrise Displays & Print",
    contactName: "Francis Kioko",
    phone: "+254 722 888 777",
    whatsapp: "+254 722 888 777",
    email: "kioko@highrisedisplays.ke",
    productSlug: "adversoft",
    productName: "Adversoft",
    location: "Mombasa Rd, Near City Cabanas",
    source: "Referral",
    notes: "Controls 14 highway billboard locations. Still using Google Sheets for availability.",
    status: "UNCONTACTED",
    createdAt: "Oct 15, 2026",
  },
];

export const INITIAL_ACTIVE_DEALS: ActiveDealItem[] = [
  {
    id: "deal-1",
    businessName: "Apex Auto Clinic",
    contactName: "James Mwangi",
    contactPhone: "+254 733 456 789",
    contactWhatsApp: "+254 733 456 789",
    contactEmail: "james@apexautoclinic.com",
    productSlug: "vehisoft",
    productName: "Vehisoft",
    stage: "DEMO_BOOKED",
    setupFeeKES: 35000,
    monthlyFeeKES: 12500,
    winProbability: 60,
    targetCloseDate: "2026-10-24",
    outreachChannel: "Walk-in Visit",
    nextAction: "Conduct 10-minute live job card demo on mobile phone",
    nextActionDate: "Today 10:30 AM",
  },
  {
    id: "deal-2",
    businessName: "Prime Clean Laundromat",
    contactName: "Grace Wanjiku",
    contactPhone: "+254 720 111 222",
    contactWhatsApp: "+254 720 111 222",
    contactEmail: "grace@primeclean.co.ke",
    productSlug: "versandry",
    productName: "Versandry",
    stage: "CONTACTED",
    setupFeeKES: 30000,
    monthlyFeeKES: 10000,
    winProbability: 35,
    targetCloseDate: "2026-10-28",
    outreachChannel: "WhatsApp Outreach",
    nextAction: "Send WhatsApp video mockup of customer pickup alerts",
    nextActionDate: "Today 04:00 PM",
  },
  {
    id: "deal-3",
    businessName: "Urban Plate Bistro",
    contactName: "Chef Dennis",
    contactPhone: "+254 711 234 567",
    contactWhatsApp: "+254 711 234 567",
    contactEmail: "chef@urbanplatebistro.ke",
    productSlug: "melio-rms",
    productName: "Melio RMS",
    stage: "PROPOSAL_SENT",
    setupFeeKES: 50000,
    monthlyFeeKES: 18000,
    winProbability: 70,
    targetCloseDate: "2026-10-26",
    outreachChannel: "Phone Call & Visit",
    nextAction: "Review tablet POS proposal with restaurant co-owner",
    nextActionDate: "Oct 22, 2026",
  },
  {
    id: "deal-4",
    businessName: "Horizon Signcraft Ltd",
    contactName: "Peter Ochieng",
    contactPhone: "+254 722 345 678",
    contactWhatsApp: "+254 722 345 678",
    contactEmail: "peter@horizonsigncraft.com",
    productSlug: "adversoft",
    productName: "Adversoft",
    stage: "NEGOTIATION",
    setupFeeKES: 45000,
    monthlyFeeKES: 15000,
    winProbability: 80,
    targetCloseDate: "2026-10-23",
    outreachChannel: "In-Person Demo",
    nextAction: "Finalize founding-client agreement and M-Pesa setup terms",
    nextActionDate: "Tomorrow 02:00 PM",
  },
  {
    id: "deal-5",
    businessName: "Grandview Apartments",
    contactName: "Faith Kimani",
    contactPhone: "+254 733 777 666",
    contactWhatsApp: "+254 733 777 666",
    contactEmail: "faith@grandviewapts.co.ke",
    productSlug: "lipatim",
    productName: "LipaTim",
    stage: "PROPOSAL_SENT",
    setupFeeKES: 25000,
    monthlyFeeKES: 8000,
    winProbability: 55,
    targetCloseDate: "2026-10-29",
    outreachChannel: "WhatsApp & Email",
    nextAction: "Follow up with estate management on automated tenant billings",
    nextActionDate: "Oct 21, 2026",
  },
  {
    id: "deal-6",
    businessName: "Safari Auto Clinic",
    contactName: "Dan Omondi",
    contactPhone: "+254 722 100 200",
    contactWhatsApp: "+254 722 100 200",
    contactEmail: "service@safariauto.co.ke",
    productSlug: "vehisoft",
    productName: "Vehisoft",
    stage: "WON",
    setupFeeKES: 35000,
    monthlyFeeKES: 12500,
    winProbability: 100,
    targetCloseDate: "2026-10-15",
    outreachChannel: "Walk-in & Live Demo",
    nextAction: "Supervising 8-step onboarding project (Step 4 active)",
    nextActionDate: "Active Live",
    onboardingProjectCreated: true,
  },
];
