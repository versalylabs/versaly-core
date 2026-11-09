

// Data types
export interface WorkspaceTask {
  id: string;
  title: string;
  due: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  completed: boolean;
}

export interface WorkspaceProject {
  id: string;
  title: string;
  status: string;
  statusVariant: "warning" | "success" | "info" | "neutral";
  leadArchitect: string;
  description: string;
  targetGoLive: string;
  link: string;
}

export interface WorkspaceFollowUp {
  id: string;
  contact: string;
  description: string;
  channel: "WhatsApp" | "Call" | "Email" | "Meeting";
  due: string;
  link: string;
}

export interface WorkspaceApproval {
  id: string;
  title: string;
  description: string;
  type: "Proposal" | "Invoice" | "Discount" | "Contract" | "Scope";
  status: "Pending" | "Approved" | "Rejected";
  link: string;
}

// Storage keys
export const STORAGE_TASKS = "versaly_workspace_tasks_v2";
export const STORAGE_PROJECTS = "versaly_workspace_projects_v2";
export const STORAGE_FOLLOWUPS = "versaly_workspace_followups_v2";
export const STORAGE_APPROVALS = "versaly_workspace_approvals_v2";

// Initial seed data
export const DEFAULT_TASKS: WorkspaceTask[] = [
  { id: "mt-1", title: "Normalize Safari Auto Clinic parts CSV (240 SKUs)", due: "Today 1:00 PM", priority: "HIGH", completed: false },
  { id: "mt-2", title: "Deliver Xprinter XP-420B to Express Wash Kilimani", due: "Today 4:30 PM", priority: "HIGH", completed: false },
  { id: "mt-3", title: "Confirm Safaricom Paybill reconciliation for QHX892L1P", due: "Today 5:30 PM", priority: "MEDIUM", completed: true },
  { id: "mt-4", title: "Review KRA/eTIMS tax invoice #1042 for Skyline Outdoor", due: "Tomorrow 9:00 AM", priority: "MEDIUM", completed: false },
];

export const DEFAULT_PROJECTS: WorkspaceProject[] = [
  {
    id: "mp-1",
    title: "Safari Auto Clinic Implementation",
    status: "Blocked (Parts CSV)",
    statusVariant: "warning",
    leadArchitect: "Ted Mwangi",
    description: "Lead Architect: Ted Mwangi. Normalizing 240 inventory spare parts before importing into PostgreSQL database.",
    targetGoLive: "Thursday",
    link: "/projects",
  },
  {
    id: "mp-2",
    title: "Express Wash Kilimani Implementation",
    status: "On Track (85%)",
    statusVariant: "success",
    leadArchitect: "Ted & David",
    description: "Lead Architect: Ted & David. Delivering Xprinter XP-420B thermal hardware today at 4:30 PM. Pickup notification WhatsApp workflow tested and verified.",
    targetGoLive: "Tomorrow",
    link: "/projects",
  },
];

export const DEFAULT_FOLLOWUPS: WorkspaceFollowUp[] = [
  {
    id: "mf-1",
    contact: "Grandview Apartments (Faith Kimani)",
    description: "Answer board query on LipaTim automated rent billing Paybill reconciliation",
    channel: "WhatsApp",
    due: "Today 2:00 PM",
    link: "/communications",
  },
  {
    id: "mf-2",
    contact: "Turbo Precision Garage (Alex Mutua)",
    description: "Demo completed; owner evaluating KES 35,000 setup fee invoice",
    channel: "WhatsApp",
    due: "Today 4:00 PM",
    link: "/communications",
  },
  {
    id: "mf-3",
    contact: "Apex Auto Yard (Dennis M.)",
    description: "Follow up on Vehisoft DMS vehicle catalogue migration timeline",
    channel: "Call",
    due: "Tomorrow 10:00 AM",
    link: "/communications",
  },
  {
    id: "mf-4",
    contact: "City Cleaners Westlands (Purity)",
    description: "Share Versandry thermal receipt setup instructions and driver tags",
    channel: "Email",
    due: "Tomorrow 11:30 AM",
    link: "/communications",
  },
];

export const DEFAULT_APPROVALS: WorkspaceApproval[] = [
  {
    id: "ma-1",
    title: "AI-Drafted Proposal: Grandview Apartments",
    description: "LipaTim 64-unit deployment scope with automated tenant STK push",
    type: "Proposal",
    status: "Pending",
    link: "/attention",
  },
  {
    id: "ma-2",
    title: "KES 5,000 Setup Discount: Skyline Outdoor",
    description: "Special launch concession for Adversoft 3-screen digital signage pilot",
    type: "Discount",
    status: "Pending",
    link: "/attention",
  },
  {
    id: "ma-3",
    title: "Tax Exemption Certificate: St. Jude Hospital",
    description: "Verify withholding tax exemption before issuing LipaTim invoice #1049",
    type: "Invoice",
    status: "Pending",
    link: "/finance",
  },
];
