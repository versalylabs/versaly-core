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

export const INITIAL_APPROVALS: ApprovalItem[] = [];

export const INITIAL_ATTENTION_NOTICES: AttentionNotice[] = [];
