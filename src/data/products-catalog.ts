export interface VersalyProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: "Advertising & Signage" | "Automotive" | "Laundry & Dry Cleaning" | "Fintech & Payments" | "Hospitality";
  targetMarket: string;
  description: string;
  setupFee: number; // in KES
  monthlyFee: number; // MRR in KES
  pricingModel: string;
  guaranteeOffer: string;
  features: string[];
  salesCollateral: {
    title: string;
    type: "sales_sheet" | "demo_script" | "objection_guide" | "whatsapp_script";
    description: string;
  }[];
  activeClientsCount: number;
  pipelineDealsCount: number;
  status: "ACTIVE" | "BETA" | "ROADMAP";
}

export const VERSALY_PRODUCTS: VersalyProduct[] = [
  {
    id: "prod-adversoft",
    slug: "adversoft",
    name: "Adversoft",
    tagline: "Centralized business advertising & signage operational management.",
    category: "Advertising & Signage",
    targetMarket: "Outdoor advertising agencies, print & signage shops, billboard operators",
    description:
      "End-to-end management for advertising inventory, billboard availability tracking, client print bookings, installation scheduling, and proof-of-posting reports.",
    setupFee: 45000,
    monthlyFee: 15000,
    pricingModel: "Monthly Subscription per location/inventory",
    guaranteeOffer: "Founding Client Guarantee: 100% full inventory audit within 14 days or money back.",
    features: [
      "Real-time billboard & digital display availability grid",
      "Client proposal generator with photo mockups",
      "Field installation task manager & crew proof-of-work",
      "Automated client proof-of-posting certificates",
      "M-Pesa payment collection & KRA/eTIMS receipting",
    ],
    salesCollateral: [
      { title: "Adversoft 1-Page Executive Sales Sheet", type: "sales_sheet", description: "Product overview & ROI comparison for outdoor signage firms" },
      { title: "Adversoft 10-Minute Walkthrough Script", type: "demo_script", description: "Structured live pitch focusing on unsold display waste reduction" },
      { title: "Objection Response: 'We already use Excel for sites'", type: "objection_guide", description: "Clear comparison showing how spreadsheet versioning causes double-bookings" },
    ],
    activeClientsCount: 4,
    pipelineDealsCount: 7,
    status: "ACTIVE",
  },
  {
    id: "prod-vehisoft",
    slug: "vehisoft",
    name: "Vehisoft",
    tagline: "Automotive garage, repair shop, and spare parts management solution.",
    category: "Automotive",
    targetMarket: "Auto repair workshops, mechanics, fleet garages, spare parts retailers",
    description:
      "A complete garage operating system managing vehicle job cards, mechanic labor tracking, spare parts inventory, customer service history, and automated SMS service reminders.",
    setupFee: 35000,
    monthlyFee: 12500,
    pricingModel: "Monthly SaaS per workshop tier",
    guaranteeOffer: "14-Day Live Workshop Go-Live Guarantee with full mechanic onboarding.",
    features: [
      "Digital Vehicle Intake & Job Card Tracking",
      "Mechanic commission & labor hour calculation",
      "Spare parts inventory with low-stock reorder alerts",
      "Automated SMS notification when vehicle is ready",
      "M-Pesa Till/Paybill integration with instant eTIMS reconciliation",
    ],
    salesCollateral: [
      { title: "Vehisoft Workshop Sales Sheet", type: "sales_sheet", description: "Highlights parts leak prevention and fast billing" },
      { title: "Workshop Owner Walk-in Pitch Script", type: "whatsapp_script", description: "Quick 2-minute introductory script for in-person garage visits" },
      { title: "Vehisoft Live Job Card Demo Script", type: "demo_script", description: "Intake-to-invoice demo flow in under 8 minutes" },
    ],
    activeClientsCount: 8,
    pipelineDealsCount: 12,
    status: "ACTIVE",
  },
  {
    id: "prod-versandry",
    slug: "versandry",
    name: "Versandry",
    tagline: "Laundry and dry-cleaning enterprise workflow & delivery system.",
    category: "Laundry & Dry Cleaning",
    targetMarket: "Commercial laundromats, hotel laundry services, dry cleaners",
    description:
      "Designed specifically for laundry businesses to track garment tags, wash/iron/fold stages, express delivery dispatches, recurring subscriptions, and customer pickup reminders.",
    setupFee: 30000,
    monthlyFee: 10000,
    pricingModel: "Monthly Subscription with pickup/delivery modules",
    guaranteeOffer: "Zero Lost Garments Guarantee: Built-in barcode tag accountability.",
    features: [
      "Barcode & QR garment tracking from dropoff to pickup",
      "Customer automated WhatsApp ready-for-pickup alerts",
      "Express delivery driver routing & dispatch log",
      "Bulk institutional client invoicing (Hotels, Hospitals)",
      "Daily cash register & M-Pesa balance reconciliation",
    ],
    salesCollateral: [
      { title: "Versandry 1-Page Sales Sheet", type: "sales_sheet", description: "Tailored for retail dry cleaners and laundromats" },
      { title: "WhatsApp Customer Pickup Template", type: "whatsapp_script", description: "Polite automated notification with M-Pesa prompt" },
      { title: "Objection Response: 'Paper receipts work fine'", type: "objection_guide", description: "Illustrates lost revenue from unclaimed garments and disputes" },
    ],
    activeClientsCount: 6,
    pipelineDealsCount: 9,
    status: "ACTIVE",
  },
  {
    id: "prod-lipatim",
    slug: "lipatim",
    name: "LipaTim",
    tagline: "Micro-payments, M-Pesa collection, and customer billing engine.",
    category: "Fintech & Payments",
    targetMarket: "SMEs, subscription services, schools, landlords, recurring billing businesses",
    description:
      "Intelligent payment collection gateway automating STK Push, Paybill reconciliation, recurring bill reminders, and compliant KRA eTIMS invoice generation in real-time.",
    setupFee: 25000,
    monthlyFee: 8000,
    pricingModel: "Base monthly platform fee + 0.5% transaction volume",
    guaranteeOffer: "Instant 48-Hour Integration Guarantee with existing accounting workflows.",
    features: [
      "Automated Safaricom M-Pesa STK Push checkout",
      "Instant Paybill / Till transaction-to-customer reconciliation",
      "Automated KRA/eTIMS compliant electronic invoice signing",
      "Smart WhatsApp payment reminder links",
      "Overdue invoice escalation engine",
    ],
    salesCollateral: [
      { title: "LipaTim Fintech Executive Brief", type: "sales_sheet", description: "Outlines eTIMS compliance and collection velocity" },
      { title: "WhatsApp Overdue Payment Follow-Up Template", type: "whatsapp_script", description: "Professional 3-stage reminder messages" },
      { title: "eTIMS Integration Technical Primer", type: "demo_script", description: "Step-by-step breakdown of automated KRA compliance" },
    ],
    activeClientsCount: 11,
    pipelineDealsCount: 15,
    status: "ACTIVE",
  },
  {
    id: "prod-melio-rms",
    slug: "melio-rms",
    name: "Melio RMS",
    tagline: "Comprehensive restaurant, cafe, and hospitality management system.",
    category: "Hospitality",
    targetMarket: "Restaurants, cafes, lounge bars, hotel dining rooms",
    description:
      "All-in-one POS and operational hub covering table reservations, kitchen display system (KDS), recipe-level inventory control, waiter order tablets, and instant bill splitting.",
    setupFee: 50000,
    monthlyFee: 18000,
    pricingModel: "Monthly SaaS per terminal/branch",
    guaranteeOffer: "100% staff adoption within 5 days with shift-shadowing onboarding.",
    features: [
      "Fast cloud-based touchscreen POS for waitstaff",
      "Kitchen Display Screen (KDS) & order routing",
      "Recipe ingredient inventory depletion tracking",
      "Table status and reservation floor-plan visualization",
      "Integrated split-billing & M-Pesa dynamic QR codes",
    ],
    salesCollateral: [
      { title: "Melio RMS Restaurant Sales Sheet", type: "sales_sheet", description: "Focuses on table turnover speed and food waste reduction" },
      { title: "Restaurant Owner Live Pitch Script", type: "demo_script", description: "Tailored around peak-hour rush bottlenecks" },
      { title: "Objection Response: 'Hardware cost is too high'", type: "objection_guide", description: "Shows how Melio runs on existing Android tablets and smartphones" },
    ],
    activeClientsCount: 5,
    pipelineDealsCount: 8,
    status: "ACTIVE",
  },
];
