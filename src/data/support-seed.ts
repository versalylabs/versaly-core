export interface SupportTicket {
  id: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  contactName: string;
  contactPhone: string;
  product: string;
  issueType: "Bug" | "How-To" | "Incident" | "Feature Request";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "IN_PROGRESS" | "WAITING_ON_CLIENT" | "RESOLVED";
  assignedOwner: string;
  businessImpact: string;
  firstResponseTime: string;
  resolutionTarget: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [];
