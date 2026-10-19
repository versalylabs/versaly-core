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

export const INITIAL_SUPERVISED_MUTATIONS: SupervisedMutation[] = [
  {
    id: "mut-001",
    type: "CREATE_TASK",
    title: "Schedule WhatsApp Payment Follow-up with Mama Rocks Gourmet Burgers",
    rationale: "Invoice INV-2026-0042 (KES 20,880) is 3 days overdue. Cashflow policy mandates a WhatsApp reminder within 72 hours of due date.",
    targetEntity: "Client: Mama Rocks Gourmet Burgers (Melio RMS)",
    proposedChanges: [
      { field: "Task Category", before: null, after: "Finance / Collections" },
      { field: "Assigned To", before: null, after: "Ted (Ops & Finance Lead)" },
      { field: "Due Date", before: null, after: "Today 11:30 AM" },
      { field: "Target Channel", before: null, after: "WhatsApp (+254 712 345 678)" },
    ],
    generatedContentPreview: `Jambo Mama Rocks Team,\n\nFollowing up on our Melio RMS monthly terminal subscription for October (INV-2026-0042, KES 20,880). The KRA eTIMS invoice was issued on Oct 1 and was due on Oct 15.\n\nPlease disburse via M-Pesa Paybill:\nBusiness No: 894020\nAccount No: INV-0042\nAmount: KES 20,880\n\nLet us know once settled so our system can auto-verify the receipt code. Asante!`,
    status: "PENDING_APPROVAL",
    urgency: "URGENT",
    createdAt: "Today 08:45 AM",
  },
  {
    id: "mut-002",
    type: "ESCALATE_BLOCKER",
    title: "Escalate City Transit Buses Fleet Blocker to Saturday Garage Access",
    rationale: "Vehisoft implementation is blocked for 4 days waiting on 15 buses to be in depot. Suggesting specialized Saturday morning installation crew.",
    targetEntity: "Project: City Transit Fleet GPS Installation",
    proposedChanges: [
      { field: "Project Priority", before: "NORMAL", after: "ESCALATED" },
      { field: "Assigned Special Crew", before: "Unassigned", after: "Ken + Auto Electrician Roster" },
      { field: "Target Go-Live Date", before: "2026-10-20", after: "2026-10-26" },
    ],
    generatedContentPreview: `Official Blocker Escalation Brief:\n- Issue: Commercial fleet cannot be immobilized during Monday-Friday revenue routes.\n- Action: Move installation window to Saturday 06:00 AM - 12:00 PM at Machakos County Depot.\n- Requirement: Dispatch 15 Teltonika 4G units with pre-activated Safaricom M2M SIMs and 2 senior auto electricians.`,
    status: "PENDING_APPROVAL",
    urgency: "HIGH",
    createdAt: "Today 09:15 AM",
  },
  {
    id: "mut-003",
    type: "DRAFT_PROPOSAL",
    title: "Draft Adversoft Founding Client Proposal for Highrise Displays",
    rationale: "Raw lead Highrise Displays controls 14 billboard sites on Mombasa Road currently tracked in spreadsheets. Ready for executive proposal.",
    targetEntity: "Lead: Highrise Displays & Print (Francis Kioko)",
    proposedChanges: [
      { field: "Lead Status", before: "UNCONTACTED", after: "PROPOSAL_PENDING" },
      { field: "Proposed Setup Fee", before: null, after: "KES 45,000" },
      { field: "Proposed MRR", before: null, after: "KES 15,000 / month" },
      { field: "Guarantee Term", before: null, after: "14-Day 100% Full Audit Guarantee" },
    ],
    generatedContentPreview: `Dear Francis Kioko,\n\nVersaly Core is pleased to propose our Adversoft Operating System for Highrise Displays' 14 highway locations.\n\nKey Scope:\n1. 100% digital site availability grid (replaces spreadsheet double-booking risks)\n2. Field installation crew mobile app with GPS-tagged daylight & night proof-of-posting certificates\n3. Client self-serve booking calendar & automated KRA eTIMS invoice generation\n\nCommercial Terms:\n- Setup & Site Onboarding: KES 45,000 (One-time)\n- Monthly Software Subscription: KES 15,000 / month\n- Founding Client Guarantee: If Adversoft does not catch at least 1 vacant billboard window or save 20 operational hours in your first 14 days, 100% refund.\n\nSigned on behalf of Versaly Core.`,
    status: "PENDING_APPROVAL",
    urgency: "MEDIUM",
    createdAt: "Today 09:30 AM",
  },
  {
    id: "mut-004",
    type: "DRAFT_MEETING_AGENDA",
    title: "Generate Friday 20-Minute Operational Rhythm Review Agenda",
    rationale: "Synthesizes weekly pipeline conversion, open blockers, and receivables ahead of Friday's operating rhythm meeting.",
    targetEntity: "Company: Versaly Operating Rhythm",
    proposedChanges: [
      { field: "Weekly Focus Metric", before: null, after: "Clear 2 Onboarding Blockers & Collect KES 73k Overdue" },
      { field: "Meeting Duration", before: null, after: "20 Minutes (Strict)" },
    ],
    generatedContentPreview: `Friday 20-Minute Leadership Agenda:\n\n1. Revenue & Cash Collection (5 min):\n   - Review KES 73,080 overdue balance (Mama Rocks & Prime Logistics)\n   - Verify KES 52,200 collected from Skyline Outdoor Media\n\n2. Implementation Blockers (7 min):\n   - Resolve Safari Auto Clinic spare parts inventory delay\n   - Finalize Saturday depot crew for City Transit Buses\n\n3. Sales Pipeline Conversion (5 min):\n   - Status of 4 proposals sent this week\n   - Plan next week's walk-in route for Vehisoft garages\n\n4. Commitments & Ownership (3 min):\n   - Assign owner to every priority before weekend close.`,
    status: "PENDING_APPROVAL",
    urgency: "MEDIUM",
    createdAt: "Today 09:40 AM",
  },
];
