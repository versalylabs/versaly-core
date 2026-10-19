export interface ClientItem {
  id: string;
  organizationId: string;
  businessName: string;
  contactName: string;
  contactPhone: string;
  contactWhatsApp: string;
  contactEmail: string;
  productSlug: string;
  productName: string;
  monthlyMRR: number;
  status: "ONBOARDING" | "ACTIVE" | "PAST_DUE";
  renewalDate: string;
  currentOnboardingStep: number;
  onboardingProgressPct: number;
  signedContractDoc: string;
  paymentMethod: string;
  taxPin?: string;
}

export interface ProjectTaskItem {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  assignedTo: string;
}

export interface ImplementationProjectItem {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  productSlug: string;
  productName: string;
  status: "ACTIVE" | "BLOCKED" | "COMPLETED";
  leadArchitect: string;
  targetGoLiveDate: string;
  progressPct: number;
  hasBlocker: boolean;
  blockerDescription?: string;
  blockerDays?: number;
  tasks: ProjectTaskItem[];
}

export const INITIAL_CLIENTS: ClientItem[] = [];

export const INITIAL_PROJECTS: ImplementationProjectItem[] = [];
