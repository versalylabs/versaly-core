export interface UniversalActivityItem {
  id: string;
  entityType: "organization" | "client" | "project" | "lead" | "person" | "finance" | "support";
  entityId: string;
  entityName: string;
  category: "Call" | "WhatsApp" | "Proposal" | "Contract" | "Payment" | "Meeting" | "Milestone" | "Note" | "Blocker" | "Support";
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  relativeTime: string;
  metadata?: {
    amountKES?: number;
    channel?: string;
    product?: string;
    status?: string;
    ticketId?: string;
  };
}

export const INITIAL_ACTIVITY_TIMELINE: UniversalActivityItem[] = [
  {
    id: "act-1",
    entityType: "client",
    entityId: "cli-safari",
    entityName: "Safari Auto Clinic",
    category: "Payment",
    title: "M-Pesa Setup Fee Confirmed",
    description: "Received KES 35,000 onboarding setup fee via Safaricom Paybill #884920 (Ref: QHX892L1P).",
    actor: "Ted Mwangi (Finance)",
    timestamp: "2026-10-19T14:30:00Z",
    relativeTime: "4 hours ago",
    metadata: {
      amountKES: 35000,
      product: "Vehisoft",
      status: "COMPLETED",
    },
  },
  {
    id: "act-2",
    entityType: "project",
    entityId: "proj-safari",
    entityName: "Safari Auto Clinic (Vehisoft Setup)",
    category: "Blocker",
    title: "Onboarding Blocker Logged",
    description: "Client inventory export contains 240 legacy spare parts without standard OEM SKU numbers. Ted assigned to run CSV normalization script.",
    actor: "Ted Mwangi (Ops Lead)",
    timestamp: "2026-10-19T11:15:00Z",
    relativeTime: "7 hours ago",
    metadata: {
      product: "Vehisoft",
      status: "BLOCKED",
    },
  },
  {
    id: "act-3",
    entityType: "lead",
    entityId: "lead-turbo",
    entityName: "Turbo Precision Garage",
    category: "Meeting",
    title: "10-Minute Walk-In Demo Delivered",
    description: "Conducted live demonstration of digital job-card dispatch on rugged Samsung tablet with shop foreman Alex Mutua.",
    actor: "David Kariuki (Field Sales)",
    timestamp: "2026-10-19T09:45:00Z",
    relativeTime: "9 hours ago",
    metadata: {
      product: "Vehisoft",
      channel: "Walk-in Visit",
      status: "DEMO_COMPLETED",
    },
  },
  {
    id: "act-4",
    entityType: "client",
    entityId: "cli-express",
    entityName: "Express Wash Kilimani",
    category: "WhatsApp",
    title: "Driver Pickup Dispatch Test Completed",
    description: "Sent simulated SMS & WhatsApp ready-for-pickup notification to owner Grace Wanjiku. Delivered in 1.4 seconds.",
    actor: "Grace Wanjiku & Ted Mwangi",
    timestamp: "2026-10-18T16:20:00Z",
    relativeTime: "Yesterday 4:20 PM",
    metadata: {
      channel: "WhatsApp",
      product: "Versandry",
      status: "VERIFIED",
    },
  },
  {
    id: "act-5",
    entityType: "support",
    entityId: "sup-101",
    entityName: "Mama Rocks Cafe (Westlands)",
    category: "Support",
    title: "Kitchen Display Network Latency Resolved",
    description: "Waitstaff reported tablet order delay. Reconfigured local mDNS mesh on TP-Link router; latency dropped from 4.2s to 120ms.",
    actor: "AI Co-Pilot & Ted Mwangi",
    timestamp: "2026-10-18T13:00:00Z",
    relativeTime: "Yesterday 1:00 PM",
    metadata: {
      ticketId: "TICK-101",
      product: "Melio RMS",
      status: "RESOLVED",
    },
  },
  {
    id: "act-6",
    entityType: "client",
    entityId: "cli-skyline",
    entityName: "Skyline Outdoor Media Ltd",
    category: "Contract",
    title: "Master Services Agreement Signed",
    description: "Peter Ochieng signed 12-month Adversoft operational agreement for 18 billboard locations with KRA/eTIMS auto-receipting clause.",
    actor: "Peter Ochieng (Managing Director)",
    timestamp: "2026-10-17T15:45:00Z",
    relativeTime: "2 days ago",
    metadata: {
      product: "Adversoft",
      status: "ACTIVE",
    },
  },
  {
    id: "act-7",
    entityType: "lead",
    entityId: "lead-grandview",
    entityName: "Grandview Luxury Apartments",
    category: "Proposal",
    title: "Automated M-Pesa Rent Billing Proposal Sent",
    description: "Sent formal 1-page executive proposal with automated tenant STK push breakdown to Property Manager Faith Kimani.",
    actor: "David Kariuki (Field Sales)",
    timestamp: "2026-10-17T10:30:00Z",
    relativeTime: "2 days ago",
    metadata: {
      product: "LipaTim",
      amountKES: 25000,
      status: "PROPOSAL_SENT",
    },
  },
  {
    id: "act-8",
    entityType: "finance",
    entityId: "inv-1039",
    entityName: "Crown Motors Body Shop",
    category: "Payment",
    title: "Monthly Subscription Auto-Collected",
    description: "Monthly Vehisoft SaaS license fee of KES 9,500 collected via Safaricom Paybill standing order.",
    actor: "Automated Billing Engine",
    timestamp: "2026-10-16T08:00:00Z",
    relativeTime: "3 days ago",
    metadata: {
      amountKES: 9500,
      product: "Vehisoft",
      status: "PAID",
    },
  },
  {
    id: "act-9",
    entityType: "project",
    entityId: "proj-express",
    entityName: "Express Wash Kilimani",
    category: "Milestone",
    title: "Staff Hardware Training Completed",
    description: "Conducted hands-on training for 4 counter attendants on garment tagging, customer drop-off logging, and thermal receipt generation.",
    actor: "Ted Mwangi (Ops Lead)",
    timestamp: "2026-10-15T14:00:00Z",
    relativeTime: "4 days ago",
    metadata: {
      product: "Versandry",
      status: "MILESTONE_REACHED",
    },
  },
];
