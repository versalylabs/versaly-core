export interface ApprovalItem {
  id: string;
  type: "AI_PROPOSAL" | "INVOICE" | "CLIENT_COMMUNICATION" | "AUTOMATION_RULE";
  title: string;
  subtitle: string;
  entityName: string;
  requestedBy: string; // e.g. "AI Supervised Co-Pilot", "Ted (Ops)"
  requestedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  urgency: "HIGH" | "MEDIUM" | "LOW";
  details: string;
  actionPayload?: {
    recipient?: string;
    amountKES?: number;
    channel?: string;
  };
}

export interface AttentionNotice {
  id: string;
  category: "URGENT" | "TODAY" | "FINANCE" | "APPROVALS" | "AI_RECOMMENDATION";
  title: string;
  description: string;
  actionUrl: string;
  actionLabel: string;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
}

export const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: "appr-1",
    type: "AI_PROPOSAL",
    title: "AI-Drafted Executive Proposal: LipaTim Custom Rollout",
    subtitle: "Grandview Luxury Apartments (64 units automated M-Pesa billing)",
    entityName: "Grandview Luxury Apartments",
    requestedBy: "AI Supervised Co-Pilot",
    requestedAt: "Today 10:45 AM",
    status: "PENDING",
    urgency: "HIGH",
    details: "AI synthesized pricing: KES 25,000 setup fee + KES 5,000/mo subscription. Includes tenant STK push automated triggers and KRA eTIMS invoice generator.",
    actionPayload: {
      recipient: "faith@grandview.co.ke",
      amountKES: 25000,
    },
  },
  {
    id: "appr-2",
    type: "CLIENT_COMMUNICATION",
    title: "AI-Drafted WhatsApp Reply to Grace Wanjiku",
    subtitle: "Express Wash Kilimani (Thermal printer handover logistics)",
    entityName: "Express Wash Kilimani",
    requestedBy: "AI Supervised Co-Pilot",
    requestedAt: "Today 1:50 PM",
    status: "PENDING",
    urgency: "MEDIUM",
    details: "Draft: 'Hi Grace, confirming David and Ted will arrive at Kilimani branch by 4:30 PM with 4 extra rolls of 50x30mm water-resistant tags and the Xprinter XP-420B.'",
    actionPayload: {
      recipient: "+254 722 990 123",
      channel: "WhatsApp",
    },
  },
  {
    id: "appr-3",
    type: "INVOICE",
    title: "Tax Invoice #1043: Q4 Hardware Setup Fee",
    subtitle: "Turbo Precision Garage (Vehisoft Android Tablet Bundle)",
    entityName: "Turbo Precision Garage",
    requestedBy: "Ted Mwangi (Ops Lead)",
    requestedAt: "Yesterday 4:00 PM",
    status: "PENDING",
    urgency: "HIGH",
    details: "Invoice for KES 35,000 setup fee + 1 rugged Samsung Galaxy Tab A9 tablet at KES 22,000. Total KES 57,000 due before hardware dispatch.",
    actionPayload: {
      amountKES: 57000,
    },
  },
  {
    id: "appr-4",
    type: "AUTOMATION_RULE",
    title: "New Automated Churn Warning Rule",
    subtitle: "Alert team if client logs fewer than 5 transactions over 7 days",
    entityName: "Versaly Operating Core",
    requestedBy: "Operations Review Engine",
    requestedAt: "2 days ago",
    status: "PENDING",
    urgency: "MEDIUM",
    details: "Rule triggers proactive WhatsApp check-in from founder if active client usage drops by 50% week-over-week.",
  },
];

export const INITIAL_ATTENTION_NOTICES: AttentionNotice[] = [
  {
    id: "att-1",
    category: "URGENT",
    title: "2 Onboarding Blockers Delaying Go-Live Target",
    description: "Safari Auto Clinic (missing parts OEM taxonomy) and Express Wash (awaiting thermal printer arrival today 4:30 PM).",
    actionUrl: "/projects",
    actionLabel: "Clear Blockers",
    urgency: "CRITICAL",
  },
  {
    id: "att-2",
    category: "TODAY",
    title: "4 Immediate Follow-Ups & 2 Live Demos Due",
    description: "Grandview Apartments, Turbo Precision Garage, Kilimani Clean Hub, and Skyline Billboards waiting on replies.",
    actionUrl: "/calendar",
    actionLabel: "View Schedule",
    urgency: "HIGH",
  },
  {
    id: "att-3",
    category: "FINANCE",
    title: "KES 18,000 Overdue Subscription Payments",
    description: "Mama Rocks Cafe overdue by 3 days. Automated Paybill reminder drafted and ready to dispatch.",
    actionUrl: "/finance",
    actionLabel: "Review Overdue",
    urgency: "HIGH",
  },
  {
    id: "att-4",
    category: "APPROVALS",
    title: "4 Items Awaiting Executive Human Oversight",
    description: "1 AI proposal, 1 client WhatsApp reply, 1 hardware invoice, and 1 automation rule.",
    actionUrl: "/attention?tab=approvals",
    actionLabel: "Inspect Queue",
    urgency: "MEDIUM",
  },
  {
    id: "att-5",
    category: "AI_RECOMMENDATION",
    title: "Day-45 Traction Recommendation: Expand Vehisoft & Adversoft",
    description: "Vehisoft (35.2% revenue share) and Adversoft (KES 60,000 ACV) show fastest conversion. Recommend concentrating outbound field reps.",
    actionUrl: "/reports",
    actionLabel: "Read Insight",
    urgency: "INFO",
  },
];
