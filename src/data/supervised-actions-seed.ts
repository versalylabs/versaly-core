export type ProposedActionType =
  | "CREATE_TASK"
  | "DRAFT_PROPOSAL"
  | "DRAFT_WHATSAPP_FOLLOWUP"
  | "DRAFT_MEETING_AGENDA"
  | "ESCALATE_BLOCKER";

export interface SupervisedMutation {
  id: string;
  type: ProposedActionType;
  title: string;
  rationale: string;
  targetEntity: string;
  proposedChanges: {
    field: string;
    before?: string | number | null;
    after: string | number;
  }[];
  generatedContentPreview?: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  urgency: "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
}

export const INITIAL_SUPERVISED_MUTATIONS: SupervisedMutation[] = [];
