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

export const INITIAL_RAW_LEADS: RawLeadItem[] = [];

export const INITIAL_ACTIVE_DEALS: ActiveDealItem[] = [];
