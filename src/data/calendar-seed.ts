export interface CalendarEvent {
  id: string;
  title: string;
  type: "Meeting" | "Demo" | "Call" | "Follow-up" | "Project" | "Renewal" | "Payment" | "Internal";
  date: string; // YYYY-MM-DD
  time: string;
  duration: string;
  entityName: string;
  contactName?: string;
  location: string;
  status: "SCHEDULED" | "COMPLETED" | "RESCHEDULED";
  priority: "HIGH" | "MEDIUM" | "LOW";
  briefing: string;
}

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "cal-1",
    title: "Walk-in Garage Demo: Digital Job Cards & Parts Control",
    type: "Demo",
    date: "2026-10-19",
    time: "10:30 AM",
    duration: "45 min",
    entityName: "Apex Auto Garage (Industrial Area)",
    contactName: "James Mwangi (Owner)",
    location: "On-site: Commercial St, Industrial Area",
    status: "COMPLETED",
    priority: "HIGH",
    briefing: "Show mechanic parts leak mitigation and rapid vehicle check-in on rugged Samsung tablet.",
  },
  {
    id: "cal-2",
    title: "Client Technical Review & Normalization",
    type: "Project",
    date: "2026-10-19",
    time: "12:00 PM",
    duration: "30 min",
    entityName: "Safari Auto Clinic",
    contactName: "Dan Omondi",
    location: "Internal Ops Desk (Google Meet)",
    status: "COMPLETED",
    priority: "HIGH",
    briefing: "Review 240 inventory spare parts CSV; confirm category taxonomy before database import.",
  },
  {
    id: "cal-3",
    title: "Melio RMS Table Ordering Live Demo",
    type: "Demo",
    date: "2026-10-19",
    time: "02:00 PM",
    duration: "40 min",
    entityName: "Urban Plate Bistro (Westlands)",
    contactName: "Chef Dennis",
    location: "On-site: Mpaka Road, Westlands",
    status: "SCHEDULED",
    priority: "HIGH",
    briefing: "Demonstrate shockproof Android waiter tablets, instant kitchen display sync, and split-bill M-Pesa push.",
  },
  {
    id: "cal-4",
    title: "Thermal Barcode Printer Hardware Handover",
    type: "Project",
    date: "2026-10-19",
    time: "04:30 PM",
    duration: "60 min",
    entityName: "Express Wash Kilimani",
    contactName: "Grace Wanjiku",
    location: "On-site: Argwings Kodhek Rd, Kilimani",
    status: "SCHEDULED",
    priority: "MEDIUM",
    briefing: "Install Xprinter XP-420B thermal printer, calibrate 50x30mm water-resistant laundry tags, test dispatch alert.",
  },
  {
    id: "cal-5",
    title: "LipaTim Tenant Billing Decision Follow-up",
    type: "Follow-up",
    date: "2026-10-20",
    time: "09:30 AM",
    duration: "20 min",
    entityName: "Grandview Luxury Apartments",
    contactName: "Faith Kimani",
    location: "Phone / WhatsApp Audio",
    status: "SCHEDULED",
    priority: "HIGH",
    briefing: "Answer board question regarding automated M-Pesa Paybill reconciliation fees and SLA support.",
  },
  {
    id: "cal-6",
    title: "Skyline Outdoor Media KRA/eTIMS Invoice Follow-up",
    type: "Payment",
    date: "2026-10-20",
    time: "11:00 AM",
    duration: "15 min",
    entityName: "Skyline Outdoor Media Ltd",
    contactName: "Peter Ochieng",
    location: "WhatsApp Direct",
    status: "SCHEDULED",
    priority: "HIGH",
    briefing: "Confirm receipt of electronic tax invoice #1042 for KES 45,000 setup fee due Friday.",
  },
  {
    id: "cal-7",
    title: "Friday 20-Minute Operational Executive Review",
    type: "Internal",
    date: "2026-10-23",
    time: "04:00 PM",
    duration: "20 min",
    entityName: "Versaly Leadership Core",
    contactName: "Founders & Ops Team",
    location: "War Room & Dashboard Screen",
    status: "SCHEDULED",
    priority: "HIGH",
    briefing: "Weekly scorecard review: check uncontacted lead conversions, resolve onboarding blockers, audit collected MRR.",
  },
  {
    id: "cal-8",
    title: "Crown Motors SaaS Subscription Renewal",
    type: "Renewal",
    date: "2026-10-26",
    time: "09:00 AM",
    duration: "All Day",
    entityName: "Crown Motors Body Shop",
    contactName: "George Maina",
    location: "Automated Paybill standing order",
    status: "SCHEDULED",
    priority: "MEDIUM",
    briefing: "Auto-renew monthly subscription KES 9,500; trigger system health health check & usage report.",
  },
];
