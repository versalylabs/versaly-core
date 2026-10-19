export interface CommunicationMessage {
  id: string;
  channel: "WhatsApp" | "Email" | "Call" | "SMS" | "Meeting";
  direction: "INBOUND" | "OUTBOUND" | "INTERNAL";
  organizationId: string;
  organizationName: string;
  contactName: string;
  contactAddress: string; // phone or email
  subject?: string;
  body: string;
  timestamp: string;
  relativeTime: string;
  status: "DELIVERED" | "READ" | "REPLIED" | "PENDING";
  tags: string[];
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  channel: "WhatsApp" | "Email" | "SMS";
  product: string;
  subject?: string;
  body: string;
}

export const INITIAL_COMMUNICATIONS: CommunicationMessage[] = [
  {
    id: "comm-1",
    channel: "WhatsApp",
    direction: "INBOUND",
    organizationId: "org-express",
    organizationName: "Express Wash Kilimani",
    contactName: "Grace Wanjiku",
    contactAddress: "+254 722 990 123",
    body: "Hi Ted, the pickup alert we tested on WhatsApp worked instantly on my phone! Can we get 2 more thermal tag rolls when you bring the printer today?",
    timestamp: "2026-10-19T13:45:00Z",
    relativeTime: "5 hours ago",
    status: "READ",
    tags: ["High Priority", "Hardware", "Versandry"],
  },
  {
    id: "comm-2",
    channel: "WhatsApp",
    direction: "OUTBOUND",
    organizationId: "org-express",
    organizationName: "Express Wash Kilimani",
    contactName: "Grace Wanjiku",
    contactAddress: "+254 722 990 123",
    body: "Great news Grace! Packing 4 additional thermal tag rolls right now. David and I will be at the Kilimani branch by 4:30 PM for hardware setup.",
    timestamp: "2026-10-19T13:50:00Z",
    relativeTime: "5 hours ago",
    status: "DELIVERED",
    tags: ["Hardware Handover", "Versandry"],
  },
  {
    id: "comm-3",
    channel: "Call",
    direction: "OUTBOUND",
    organizationId: "org-1",
    organizationName: "Safari Auto Clinic",
    contactName: "Dan Omondi",
    contactAddress: "+254 722 100 200",
    subject: "Spare parts CSV normalization",
    body: "12-minute phone call. Walked through Dan's parts spreadsheet. Agreed to categorize into 5 main groups: Brakes, Suspension, Engine Fluids, Electrical, and Filters.",
    timestamp: "2026-10-19T11:30:00Z",
    relativeTime: "7 hours ago",
    status: "REPLIED",
    tags: ["Data Normalization", "Vehisoft"],
  },
  {
    id: "comm-4",
    channel: "Email",
    direction: "OUTBOUND",
    organizationId: "org-skyline",
    organizationName: "Skyline Outdoor Media Ltd",
    contactName: "Peter Ochieng",
    contactAddress: "ochieng@skylineoutdoor.co.ke",
    subject: "Versaly Core — Signed MSA & Electronic Tax Invoice #1042",
    body: "Dear Peter, Thank you for signing the 12-month Adversoft operational agreement. Attached find your formal KRA/eTIMS compliant invoice #1042 for KES 45,000.",
    timestamp: "2026-10-18T17:10:00Z",
    relativeTime: "Yesterday 5:10 PM",
    status: "READ",
    tags: ["Invoice Sent", "Contract", "Adversoft"],
  },
  {
    id: "comm-5",
    channel: "WhatsApp",
    direction: "OUTBOUND",
    organizationId: "org-grandview",
    organizationName: "Grandview Luxury Apartments",
    contactName: "Faith Kimani",
    contactAddress: "+254 701 333 222",
    body: "Hi Faith, this is David following up on the LipaTim automated rent billing proposal. Would you have 10 minutes tomorrow morning around 9:30 AM to address the board's Paybill fee question?",
    timestamp: "2026-10-18T10:15:00Z",
    relativeTime: "Yesterday 10:15 AM",
    status: "DELIVERED",
    tags: ["Proposal Follow-up", "LipaTim"],
  },
  {
    id: "comm-6",
    channel: "SMS",
    direction: "OUTBOUND",
    organizationId: "org-urban",
    organizationName: "Urban Plate Bistro (Westlands)",
    contactName: "Chef Dennis",
    contactAddress: "+254 711 902 345",
    body: "Hi Chef Dennis, confirming our 2:00 PM Melio RMS tablet ordering demo today at your Westlands restaurant. See you shortly!",
    timestamp: "2026-10-19T08:30:00Z",
    relativeTime: "Today 8:30 AM",
    status: "DELIVERED",
    tags: ["Demo Reminder", "Melio RMS"],
  },
];

export const INITIAL_COMM_TEMPLATES: CommunicationTemplate[] = [
  {
    id: "tpl-1",
    name: "Outreach 1st Pitch: Garage Spare Leakage",
    channel: "WhatsApp",
    product: "Vehisoft",
    body: "Habari {contactName}, how many spare parts walked out of {businessName} last month without showing up on an invoice? We built Vehisoft specifically for Kenyan garages to lock down parts, print instant digital job cards, and send WhatsApp status updates to vehicle owners. Would you be open to a 10-minute demo on a rugged tablet at your garage this week?",
  },
  {
    id: "tpl-2",
    name: "Post-Demo Proposal Follow-up",
    channel: "WhatsApp",
    product: "All",
    body: "Hi {contactName}, thanks for testing {productName} with us. I've uploaded your custom setup scope and pricing sheet. When would be a good time today to finalize the start date so our technical team can reserve your onboarding slot?",
  },
  {
    id: "tpl-3",
    name: "Overdue Subscription Reminder (Friendly)",
    channel: "WhatsApp",
    product: "Finance",
    body: "Hi {contactName}, hope operations are going smoothly at {businessName}. This is a gentle reminder that your monthly subscription invoice of KES {amount} was due on {dueDate}. You can settle directly via Safaricom Paybill #884920, Account: {accountRef}.",
  },
  {
    id: "tpl-4",
    name: "Formal Enterprise Proposal Cover Letter",
    channel: "Email",
    product: "Adversoft",
    subject: "Operational Software Proposal for {businessName} — Versaly Core",
    body: "Dear {contactName},\n\nFollowing our review of your advertising inventory management workflows, please find attached our formal operational proposal for {productName}.\n\nThis deployment eliminates spreadsheet versioning errors, provides live billboard availability maps, and automates proof-of-posting certificates for your clients.\n\nLooking forward to reviewing this together.\n\nWarm regards,\nVersaly Core Team",
  },
];
