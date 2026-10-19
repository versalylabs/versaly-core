export interface NotificationSeed {
  id: string;
  title: string;
  message: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  linkUrl: string;
  entityType: "DEAL" | "INVOICE" | "PROJECT" | "CLIENT" | "SYSTEM";
  entityId?: string;
  isRead: boolean;
  timeAgo: string;
}

export interface AutomationRuleSeed {
  id: string;
  name: string;
  triggerType: "DEAL_WON" | "INVOICE_OVERDUE" | "PROJECT_BLOCKED" | "CLIENT_RENEWAL_30D" | "OUTREACH_TASK_DUE";
  description: string;
  actionSummary: string;
  isActive: boolean;
  lastTriggeredAt: string;
  executionCount: number;
}

export const NOTIFICATIONS_SEED: NotificationSeed[] = [
  {
    id: "notif-1",
    title: "Overdue Invoice: Mama Rocks Gourmet Burgers",
    message: "Invoice INV-2026-0042 (KES 20,880) is 3 days past due for Melio RMS SaaS. Automated WhatsApp reminder queued.",
    priority: "URGENT",
    linkUrl: "/finance",
    entityType: "INVOICE",
    entityId: "inv-2026-002",
    isRead: false,
    timeAgo: "10m ago",
  },
  {
    id: "notif-2",
    title: "Onboarding Blocker Escalation: City Transit Buses",
    message: "Vehisoft implementation is BLOCKED waiting on client mechanics to schedule Saturday bay access (4 days idle).",
    priority: "HIGH",
    linkUrl: "/projects",
    entityType: "PROJECT",
    entityId: "proj-2",
    isRead: false,
    timeAgo: "45m ago",
  },
  {
    id: "notif-3",
    title: "Client Renewal Coming Up: Safi Cleaners Lavington",
    message: "Versandry annual subscription renewal due in 24 days (Nov 12). Schedule 30-day health review call.",
    priority: "MEDIUM",
    linkUrl: "/clients",
    entityType: "CLIENT",
    entityId: "org-laundry-lavington",
    isRead: false,
    timeAgo: "2h ago",
  },
  {
    id: "notif-4",
    title: "New Deal Marked WON: Apex Signs & Billboards",
    message: "Won deal for Adversoft (KES 45,000 setup + KES 15,000 MRR). Automated 8-step onboarding project initialized.",
    priority: "MEDIUM",
    linkUrl: "/projects",
    entityType: "DEAL",
    entityId: "deal-adversoft-won",
    isRead: true,
    timeAgo: "5h ago",
  },
  {
    id: "notif-5",
    title: "M-Pesa STK Payout Batch Reconciled",
    message: "KES 52,200 collected from Skyline Outdoor Media Ltd matched and cleared against invoice INV-2026-0043.",
    priority: "LOW",
    linkUrl: "/finance",
    entityType: "INVOICE",
    entityId: "inv-2026-003",
    isRead: true,
    timeAgo: "Yesterday",
  },
];

export const AUTOMATION_RULES_SEED: AutomationRuleSeed[] = [
  {
    id: "rule-1",
    name: "Won Deal → Standardized 8-Step Onboarding Creator",
    triggerType: "DEAL_WON",
    description: "When any sales deal is transitioned to WON in the CRM pipeline...",
    actionSummary: "Create client organization, spawn 8-step Onboarding Project, and draft setup fee invoice.",
    isActive: true,
    lastTriggeredAt: "Today 04:30 AM",
    executionCount: 14,
  },
  {
    id: "rule-2",
    name: "Invoice Overdue → Escalation & WhatsApp Follow-up Queue",
    triggerType: "INVOICE_OVERDUE",
    description: "When an unpaid invoice surpasses its dueDate by 24 hours...",
    actionSummary: "Dispatch urgent in-app alert, generate WhatsApp follow-up task with M-Pesa paybill details.",
    isActive: true,
    lastTriggeredAt: "Yesterday 08:00 AM",
    executionCount: 8,
  },
  {
    id: "rule-3",
    name: "Project Blocker > 48h → Operations Lead Alert",
    triggerType: "PROJECT_BLOCKED",
    description: "When an onboarding project has 'hasBlocker = true' for more than 48 hours...",
    actionSummary: "Escalate to Ted (Ops Lead), send notification badge to Daily Dashboard rhythm review.",
    isActive: true,
    lastTriggeredAt: "Oct 17 02:15 PM",
    executionCount: 5,
  },
  {
    id: "rule-4",
    name: "Subscription Renewal 30-Day Early Warning",
    triggerType: "CLIENT_RENEWAL_30D",
    description: "When a client subscription renewalDate is 30 days away...",
    actionSummary: "Queue renewal conversation task for account manager and draft renewal contract.",
    isActive: true,
    lastTriggeredAt: "Oct 15 09:00 AM",
    executionCount: 19,
  },
  {
    id: "rule-5",
    name: "Daily Cold Outreach Follow-Up Reminder",
    triggerType: "OUTREACH_TASK_DUE",
    description: "Every business day at 08:00 AM EAT...",
    actionSummary: "Compile list of contacted leads who have not replied in 48 hours into Today's Outreach Task list.",
    isActive: true,
    lastTriggeredAt: "Today 08:00 AM",
    executionCount: 42,
  },
];
