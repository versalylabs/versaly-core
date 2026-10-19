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

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "sup-1",
    ticketNumber: "TICK-204",
    clientId: "cli-mama-rocks",
    clientName: "Mama Rocks Cafe (Westlands)",
    contactName: "Chef Dennis / Cashier Faith",
    contactPhone: "+254 711 902 345",
    product: "Melio RMS",
    issueType: "Bug",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assignedOwner: "Ted Mwangi (Ops Lead)",
    businessImpact: "Orders taking 4 seconds to route to kitchen printer during lunch rush.",
    firstResponseTime: "8 minutes",
    resolutionTarget: "Today 3:00 PM",
    title: "Kitchen Order Printer Buffer Delay on 2.4GHz WiFi",
    description: "During peak lunch rush between 1:00 PM and 1:45 PM, tickets printed with a 3-minute delay. Resetting the subnet IP pool and assigning static IP 192.168.1.150 to the Epson POS printer.",
    createdAt: "2026-10-19T10:15:00Z",
    updatedAt: "2026-10-19T11:40:00Z",
  },
  {
    id: "sup-2",
    ticketNumber: "TICK-203",
    clientId: "cli-safari",
    clientName: "Safari Auto Clinic",
    contactName: "Dan Omondi",
    contactPhone: "+254 722 100 200",
    product: "Vehisoft",
    issueType: "How-To",
    priority: "MEDIUM",
    status: "OPEN",
    assignedOwner: "David Kariuki",
    businessImpact: "Counter technician unsure how to split customer labor invoice between insurance and cash payment.",
    firstResponseTime: "14 minutes",
    resolutionTarget: "Today 5:00 PM",
    title: "Split Insurance / M-Pesa Invoice Guidance Request",
    description: "Customer bringing insured vehicle with KES 15,000 excess deductible. Guided Dan on Vehisoft's dual-tender split checkout feature.",
    createdAt: "2026-10-19T12:00:00Z",
    updatedAt: "2026-10-19T12:15:00Z",
  },
  {
    id: "sup-3",
    ticketNumber: "TICK-201",
    clientId: "cli-express",
    clientName: "Express Wash Kilimani",
    contactName: "Grace Wanjiku",
    contactPhone: "+254 722 990 123",
    product: "Versandry",
    issueType: "Feature Request",
    priority: "LOW",
    status: "RESOLVED",
    assignedOwner: "Ted Mwangi",
    businessImpact: "Requested automated SMS notification in Swahili for elderly laundromat patrons.",
    firstResponseTime: "25 minutes",
    resolutionTarget: "Resolved",
    title: "Add Swahili SMS Notification Template for Garment Pickup",
    description: "Added template: 'Nguo zako ziko tayari kuchukuliwa Express Wash Kilimani. Bili KES {amount}. Karibu tena!' Client verified and tested.",
    createdAt: "2026-10-17T09:00:00Z",
    updatedAt: "2026-10-18T14:30:00Z",
  },
  {
    id: "sup-4",
    ticketNumber: "TICK-198",
    clientId: "cli-skyline",
    clientName: "Skyline Outdoor Media Ltd",
    contactName: "Peter Ochieng",
    contactPhone: "+254 701 555 777",
    product: "Adversoft",
    issueType: "Incident",
    priority: "MEDIUM",
    status: "RESOLVED",
    assignedOwner: "System Architecture",
    businessImpact: "KRA eTIMS API sandbox sync returned error code 401 during credential refresh.",
    firstResponseTime: "5 minutes",
    resolutionTarget: "Resolved",
    title: "KRA eTIMS Sandbox Token Renewal Key Rotation",
    description: "Renewed bearer token for electronic tax compliance generator. Backlogged test receipts reconciled successfully.",
    createdAt: "2026-10-16T15:20:00Z",
    updatedAt: "2026-10-16T15:45:00Z",
  },
];
