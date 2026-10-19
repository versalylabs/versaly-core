export interface DirectoryPerson {
  id: string;
  organizationId?: string;
  organizationName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  jobTitle: string;
  contactType: "PRIMARY" | "DECISION_MAKER" | "BILLING" | "TECHNICAL" | "OPERATIONAL";
  notes?: string;
}

export interface DirectoryActivity {
  id: string;
  type: "CALL" | "VISIT" | "WHATSAPP" | "EMAIL" | "MEETING" | "NOTE";
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface DirectoryOrganization {
  id: string;
  name: string;
  type: "CLIENT" | "PROSPECT" | "PARTNER" | "VENDOR";
  industry: string;
  productFit: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  taxPin?: string;
  status: "ACTIVE" | "PENDING_SETUP" | "ENGAGED";
  contacts: DirectoryPerson[];
  activities: DirectoryActivity[];
}

export const DIRECTORY_ORGANIZATIONS: DirectoryOrganization[] = [
  {
    id: "org-1",
    name: "Safari Auto Clinic",
    type: "CLIENT",
    industry: "Automotive Services",
    productFit: "Vehisoft",
    city: "Nairobi",
    address: "Enterprise Rd, Industrial Area",
    phone: "+254 722 100 200",
    email: "service@safariauto.co.ke",
    taxPin: "P051239841Z",
    status: "ACTIVE",
    contacts: [
      {
        id: "per-1",
        organizationId: "org-1",
        organizationName: "Safari Auto Clinic",
        firstName: "Dan",
        lastName: "Omondi",
        email: "dan@safariauto.co.ke",
        phone: "+254 722 100 201",
        whatsapp: "+254 722 100 201",
        jobTitle: "Managing Director",
        contactType: "DECISION_MAKER",
        notes: "Requested spare parts barcode scanning capability.",
      },
    ],
    activities: [
      {
        id: "act-1",
        type: "NOTE",
        title: "Spare Parts Import Pending",
        description: "Dan provided 180 out of 240 part SKUs. Awaiting revised price list.",
        timestamp: "Yesterday 3:30 PM",
        actor: "Ted (Ops Lead)",
      },
      {
        id: "act-2",
        type: "VISIT",
        title: "On-site Garage Intake Inspection",
        description: "Verified mechanic tablet connectivity across all 4 service bays.",
        timestamp: "Oct 15, 2026",
        actor: "David (Field Tech)",
      },
    ],
  },
  {
    id: "org-2",
    name: "Apex Auto Clinic",
    type: "PROSPECT",
    industry: "Automotive Services",
    productFit: "Vehisoft",
    city: "Nairobi",
    address: "Commercial St, Industrial Area",
    phone: "+254 733 456 789",
    email: "james@apexautoclinic.com",
    taxPin: "P051982341M",
    status: "ENGAGED",
    contacts: [
      {
        id: "per-2",
        organizationId: "org-2",
        organizationName: "Apex Auto Clinic",
        firstName: "James",
        lastName: "Mwangi",
        email: "james@apexautoclinic.com",
        phone: "+254 733 456 789",
        whatsapp: "+254 733 456 789",
        jobTitle: "Founder & Master Mechanic",
        contactType: "PRIMARY",
        notes: "Experienced parts leakage last month; highly receptive to digital job cards.",
      },
    ],
    activities: [
      {
        id: "act-3",
        type: "CALL",
        title: "Initial Qualification Call",
        description: "Confirmed garage handles 12-15 vehicles daily. Scheduled in-person demo.",
        timestamp: "Oct 17, 2026",
        actor: "Ted (Ops Lead)",
      },
    ],
  },
  {
    id: "org-3",
    name: "Mama Rocks Gourmet Burgers",
    type: "CLIENT",
    industry: "Hospitality & Dining",
    productFit: "Melio RMS",
    city: "Nairobi",
    address: "Woodvale Grove, Westlands",
    phone: "+254 711 987 654",
    email: "info@mamarocksburgers.com",
    taxPin: "P051662198K",
    status: "ACTIVE",
    contacts: [
      {
        id: "per-3",
        organizationId: "org-3",
        organizationName: "Mama Rocks Gourmet Burgers",
        firstName: "Samantha",
        lastName: "Lee",
        email: "samantha@mamarocksburgers.com",
        phone: "+254 711 987 654",
        whatsapp: "+254 711 987 654",
        jobTitle: "Operations General Manager",
        contactType: "DECISION_MAKER",
      },
    ],
    activities: [
      {
        id: "act-4",
        type: "MEETING",
        title: "Monthly Operations Review",
        description: "Confirmed table order turnover increased by 14% with waiter tablet orders.",
        timestamp: "Oct 12, 2026",
        actor: "Mercy (Success)",
      },
    ],
  },
  {
    id: "org-4",
    name: "Express Wash Kilimani",
    type: "CLIENT",
    industry: "Laundry & Dry Cleaning",
    productFit: "Versandry",
    city: "Nairobi",
    address: "Argwings Kodhek Rd, Kilimani",
    phone: "+254 720 555 444",
    email: "orders@expresswash.co.ke",
    taxPin: "P051443219T",
    status: "ACTIVE",
    contacts: [
      {
        id: "per-4",
        organizationId: "org-4",
        organizationName: "Express Wash Kilimani",
        firstName: "George",
        lastName: "Kariuki",
        email: "george@expresswash.co.ke",
        phone: "+254 720 555 444",
        whatsapp: "+254 720 555 444",
        jobTitle: "Owner",
        contactType: "PRIMARY",
      },
    ],
    activities: [
      {
        id: "act-5",
        type: "NOTE",
        title: "M-Pesa Setup Fee Confirmed",
        description: "Received KES 30,000 setup fee via Paybill transaction #QJ49102X.",
        timestamp: "Today 08:15 AM",
        actor: "System Audit",
      },
    ],
  },
  {
    id: "org-5",
    name: "Greenfield Residential Society",
    type: "CLIENT",
    industry: "Property & Resident Management",
    productFit: "LipaTim",
    city: "Nairobi",
    address: "Off Thika Rd, Roysambu",
    phone: "+254 701 333 222",
    email: "society@greenfield.co.ke",
    taxPin: "P051888777R",
    status: "ACTIVE",
    contacts: [
      {
        id: "per-5",
        organizationId: "org-5",
        organizationName: "Greenfield Residential Society",
        firstName: "Treasurer",
        lastName: "Mbugua",
        email: "mbugua@greenfield.co.ke",
        phone: "+254 701 333 222",
        whatsapp: "+254 701 333 222",
        jobTitle: "Society Treasurer",
        contactType: "BILLING",
      },
    ],
    activities: [
      {
        id: "act-6",
        type: "CALL",
        title: "STK Push Validation",
        description: "Confirmed 48 tenants received automated STK Push prompt successfully.",
        timestamp: "Oct 14, 2026",
        actor: "Ted (Ops Lead)",
      },
    ],
  },
  {
    id: "org-6",
    name: "Safaricom Business Kenya",
    type: "PARTNER",
    industry: "Telecommunications & Payments",
    productFit: "LipaTim Ecosystem",
    city: "Nairobi",
    address: "Safaricom HQ, Waiyaki Way",
    phone: "+254 722 000 000",
    email: "business@safaricom.co.ke",
    taxPin: "P051000000A",
    status: "ACTIVE",
    contacts: [
      {
        id: "per-6",
        organizationId: "org-6",
        organizationName: "Safaricom Business Kenya",
        firstName: "Brian",
        lastName: "Kamau",
        email: "bkamau@safaricom.co.ke",
        phone: "+254 722 000 111",
        whatsapp: "+254 722 000 111",
        jobTitle: "Fintech Partner Solutions Lead",
        contactType: "TECHNICAL",
      },
    ],
    activities: [
      {
        id: "act-7",
        type: "NOTE",
        title: "Daraja 3.0 API Key Renewal",
        description: "Verified B2C and C2B certificate rotation for production webhook endpoint.",
        timestamp: "Oct 10, 2026",
        actor: "Ted (Ops Lead)",
      },
    ],
  },
];
