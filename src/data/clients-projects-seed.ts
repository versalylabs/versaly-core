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

export const INITIAL_CLIENTS: ClientItem[] = [
  {
    id: "cli-safari",
    organizationId: "org-1",
    businessName: "Safari Auto Clinic",
    contactName: "Dan Omondi",
    contactPhone: "+254 722 100 200",
    contactWhatsApp: "+254 722 100 200",
    contactEmail: "dan@safariauto.co.ke",
    productSlug: "vehisoft",
    productName: "Vehisoft",
    monthlyMRR: 12500,
    status: "ONBOARDING",
    renewalDate: "2026-11-15",
    currentOnboardingStep: 4,
    onboardingProgressPct: 50,
    signedContractDoc: "MSA_Signed_Safari_Auto_Clinic.pdf",
    paymentMethod: "M-Pesa Paybill",
    taxPin: "P051239841Z",
  },
  {
    id: "cli-express",
    organizationId: "org-4",
    businessName: "Express Wash Kilimani",
    contactName: "George Kariuki",
    contactPhone: "+254 720 555 444",
    contactWhatsApp: "+254 720 555 444",
    contactEmail: "george@expresswash.co.ke",
    productSlug: "versandry",
    productName: "Versandry",
    monthlyMRR: 10000,
    status: "ONBOARDING",
    renewalDate: "2026-11-01",
    currentOnboardingStep: 5,
    onboardingProgressPct: 62,
    signedContractDoc: "MSA_Signed_Express_Wash.pdf",
    paymentMethod: "M-Pesa Paybill",
    taxPin: "P051443219T",
  },
  {
    id: "cli-mama-rocks",
    organizationId: "org-3",
    businessName: "Mama Rocks Gourmet Burgers",
    contactName: "Samantha Lee",
    contactPhone: "+254 711 987 654",
    contactWhatsApp: "+254 711 987 654",
    contactEmail: "samantha@mamarocksburgers.com",
    productSlug: "melio-rms",
    productName: "Melio RMS",
    monthlyMRR: 18000,
    status: "ACTIVE",
    renewalDate: "2026-10-28",
    currentOnboardingStep: 8,
    onboardingProgressPct: 100,
    signedContractDoc: "MSA_Signed_Mama_Rocks.pdf",
    paymentMethod: "Bank Transfer",
    taxPin: "P051662198K",
  },
  {
    id: "cli-greenfield",
    organizationId: "org-5",
    businessName: "Greenfield Residential Society",
    contactName: "Treasurer Mbugua",
    contactPhone: "+254 701 333 222",
    contactWhatsApp: "+254 701 333 222",
    contactEmail: "mbugua@greenfield.co.ke",
    productSlug: "lipatim",
    productName: "LipaTim",
    monthlyMRR: 8000,
    status: "ACTIVE",
    renewalDate: "2026-11-30",
    currentOnboardingStep: 8,
    onboardingProgressPct: 100,
    signedContractDoc: "MSA_Signed_Greenfield.pdf",
    paymentMethod: "M-Pesa Paybill",
    taxPin: "P051888777R",
  },
  {
    id: "cli-skyline",
    organizationId: "org-skyline",
    businessName: "Skyline Outdoor Media Ltd",
    contactName: "Kevin Ndungu",
    contactPhone: "+254 722 999 111",
    contactWhatsApp: "+254 722 999 111",
    contactEmail: "kevin@skylineoutdoor.co.ke",
    productSlug: "adversoft",
    productName: "Adversoft",
    monthlyMRR: 15000,
    status: "ONBOARDING",
    renewalDate: "2026-11-10",
    currentOnboardingStep: 3,
    onboardingProgressPct: 37,
    signedContractDoc: "MSA_Signed_Skyline.pdf",
    paymentMethod: "M-Pesa STK Push",
    taxPin: "P051777999B",
  },
];

export const INITIAL_PROJECTS: ImplementationProjectItem[] = [
  {
    id: "proj-safari",
    clientId: "cli-safari",
    clientName: "Safari Auto Clinic",
    name: "Vehisoft Deployment & Mechanic Bay Onboarding",
    productSlug: "vehisoft",
    productName: "Vehisoft",
    status: "BLOCKED",
    leadArchitect: "Ted Khalwale (Lead)",
    targetGoLiveDate: "2026-10-25",
    progressPct: 50,
    hasBlocker: true,
    blockerDescription: "Awaiting client Excel price list of 240 inventory spare parts to populate catalog.",
    blockerDays: 2,
    tasks: [
      { id: "tsk-1", stepNumber: 1, title: "Agreement & Payment Instructions", description: "Send MSA contract and setup fee Paybill invoice", completed: true, completedAt: "Oct 15", assignedTo: "Ted" },
      { id: "tsk-2", stepNumber: 2, title: "Payment Confirmation", description: "Confirm KES 35,000 setup fee receipt via M-Pesa", completed: true, completedAt: "Oct 15", assignedTo: "Finance" },
      { id: "tsk-3", stepNumber: 3, title: "Data Collection & Bay Layout", description: "Collect mechanic names, bay numbers, and inventory catalogs", completed: true, completedAt: "Oct 16", assignedTo: "David" },
      { id: "tsk-4", stepNumber: 4, title: "Product Configuration & Parts Setup", description: "Upload parts catalog and configure labor rate tiers", completed: false, assignedTo: "Ted" },
      { id: "tsk-5", stepNumber: 5, title: "Mechanic & Service Advisor Training", description: "Conduct 45-minute tablet job card training with workshop staff", completed: false, assignedTo: "David" },
      { id: "tsk-6", stepNumber: 6, title: "First Live Intake Transaction", description: "Shadow live customer vehicle intake and print first job card", completed: false, assignedTo: "David" },
      { id: "tsk-7", stepNumber: 7, title: "First Measurable Win Confirmation", description: "Confirm 100% of vehicle parts tracked digitally for 3 consecutive days", completed: false, assignedTo: "Ted" },
      { id: "tsk-8", stepNumber: 8, title: "30-Day Check-in & Referral Request", description: "Schedule review meeting and ask garage owner for referral", completed: false, assignedTo: "Mercy" },
    ],
  },
  {
    id: "proj-express",
    clientId: "cli-express",
    clientName: "Express Wash Kilimani",
    name: "Versandry Barcode Garment Workflow Implementation",
    productSlug: "versandry",
    productName: "Versandry",
    status: "ACTIVE",
    leadArchitect: "David Otieno (Field)",
    targetGoLiveDate: "2026-10-30",
    progressPct: 62,
    hasBlocker: false,
    tasks: [
      { id: "tsk-e1", stepNumber: 1, title: "Agreement & Payment Instructions", description: "Dispatched contract and Paybill setup fee invoice", completed: true, completedAt: "Oct 14", assignedTo: "Ted" },
      { id: "tsk-e2", stepNumber: 2, title: "Payment Confirmation", description: "Confirmed KES 30,000 setup fee received via M-Pesa", completed: true, completedAt: "Today 08:15 AM", assignedTo: "Finance" },
      { id: "tsk-e3", stepNumber: 3, title: "Data Collection & Service Pricing", description: "Configured dry cleaning vs wash/fold rate schedules", completed: true, completedAt: "Oct 16", assignedTo: "David" },
      { id: "tsk-e4", stepNumber: 4, title: "Barcode Printer Hardware Setup", description: "Deployed thermal tag printer and verified test print", completed: true, completedAt: "Oct 18", assignedTo: "David" },
      { id: "tsk-e5", stepNumber: 5, title: "Staff Training on WhatsApp Pickup Alerts", description: "Train counter reception on triggering automated customer alerts", completed: false, assignedTo: "David" },
      { id: "tsk-e6", stepNumber: 6, title: "First Live Garment Dispatch", description: "Tag 20 live incoming suits and verify pickup scan", completed: false, assignedTo: "David" },
      { id: "tsk-e7", stepNumber: 7, title: "First Measurable Win Confirmation", description: "Verify zero garment disputes and customer WhatsApp confirmation", completed: false, assignedTo: "Ted" },
      { id: "tsk-e8", stepNumber: 8, title: "30-Day Health Check & Referral", description: "Review monthly garment volume and request referral", completed: false, assignedTo: "Mercy" },
    ],
  },
  {
    id: "proj-skyline",
    clientId: "cli-skyline",
    clientName: "Skyline Outdoor Media Ltd",
    name: "Adversoft Billboard & Signage Grid Provisioning",
    productSlug: "adversoft",
    productName: "Adversoft",
    status: "ACTIVE",
    leadArchitect: "Ted Khalwale (Lead)",
    targetGoLiveDate: "2026-11-05",
    progressPct: 37,
    hasBlocker: false,
    tasks: [
      { id: "tsk-s1", stepNumber: 1, title: "Agreement & Payment Instructions", description: "Dispatched MSA contract and setup invoice", completed: true, completedAt: "Oct 17", assignedTo: "Ted" },
      { id: "tsk-s2", stepNumber: 2, title: "Payment Confirmation", description: "Confirmed KES 45,000 setup fee receipt", completed: true, completedAt: "Oct 18", assignedTo: "Finance" },
      { id: "tsk-s3", stepNumber: 3, title: "Data Collection: 14 Billboard Locations", description: "Gather GPS coordinates, dimensions, and current client bookings", completed: false, assignedTo: "Ted" },
      { id: "tsk-s4", stepNumber: 4, title: "Grid Availability Setup", description: "Configure Adversoft digital availability calendar", completed: false, assignedTo: "Ted" },
      { id: "tsk-s5", stepNumber: 5, title: "Sales Team Proposal Mockup Training", description: "Train media sales agents on photo mockup generation", completed: false, assignedTo: "Mercy" },
      { id: "tsk-s6", stepNumber: 6, title: "First Live Booking & Proof-of-Posting", description: "Issue first digital booking certificate to an outdoor advertiser", completed: false, assignedTo: "David" },
      { id: "tsk-s7", stepNumber: 7, title: "First Measurable Win Confirmation", description: "Confirm elimination of double-booked billboard displays", completed: false, assignedTo: "Ted" },
      { id: "tsk-s8", stepNumber: 8, title: "Review & Client Referral", description: "Schedule 30-day executive review", completed: false, assignedTo: "Ted" },
    ],
  },
];
