// ============================================================================
// VERSALY CORE: MARKETING DOMAIN DATA SEED & TYPES
// Covers: Campaigns (Digital & Billboards), Ad Spend, Content & Social Media,
// Creative Assets, and Performance Reporting.
// ============================================================================

export type MarketingProduct =
  | "Semplo"
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
// INITIAL SEED DATA (Clean initial state for live operations)
// ----------------------------------------------------------------------------

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [];
export const INITIAL_SPEND: AdSpendEntry[] = [];
export const INITIAL_SOCIAL_POSTS: SocialPost[] = [];
export const INITIAL_CREATIVES: MarketingCreative[] = [];

