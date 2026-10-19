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

export const INITIAL_COMMUNICATIONS: CommunicationMessage[] = [];


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
