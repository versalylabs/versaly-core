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

export const INITIAL_ACTIVITY_TIMELINE: UniversalActivityItem[] = [];
