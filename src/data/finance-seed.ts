export interface InvoiceSeed {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  clientName: string;
  productSlug: string;
  productName: string;
  status: "DRAFT" | "SENT" | "OVERDUE" | "PAID" | "VOID";
  subtotalKES: number;
  taxKES: number;
  totalKES: number;
  amountPaidKES: number;
  balanceKES: number;
  dueDate: string;
  issueDate: string;
  paidAt?: string;
  notes?: string;
  kraEtimsQrCode?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amountKES: number;
  }[];
  payments: {
    referenceNumber: string;
    channel: "MPESA_PAYBILL" | "MPESA_TILL" | "MPESA_STK" | "BANK_TRANSFER" | "CASH";
    amountKES: number;
    payerName: string;
    payerPhone?: string;
    receivedAt: string;
  }[];
}

export interface BusinessExpenseSeed {
  id: string;
  category: "INFRASTRUCTURE_CLOUD" | "HARDWARE_DEVICES" | "FIELD_CREW_TRANSPORT" | "OFFICE_UTILITIES" | "MARKETING_ADS" | "LEGAL_COMPLIANCE" | "SALARIES_COMMISSIONS";
  description: string;
  amountKES: number;
  vendor: string;
  expenseDate: string;
  productSlug?: string;
  productName?: string;
}

export const INVOICES_SEED: InvoiceSeed[] = [
  {
    id: "inv-2026-001",
    invoiceNumber: "INV-2026-0041",
    organizationId: "org-1",
    clientName: "Express Wash Kilimani",
    productSlug: "versandry",
    productName: "Versandry",
    status: "PAID",
    subtotalKES: 30000,
    taxKES: 4800,
    totalKES: 34800,
    amountPaidKES: 34800,
    balanceKES: 0,
    issueDate: "2026-10-14",
    dueDate: "2026-10-17",
    paidAt: "2026-10-15 08:34 AM",
    kraEtimsQrCode: "01010041KRAETIMSVSCU#EXPRESSWASH#34800#KES#SIG7849",
    notes: "Setup fee & thermal barcode printer configuration.",
    lineItems: [
      {
        description: "Versandry Core Setup & Laundry Poly-Tag Configuration",
        quantity: 1,
        unitPrice: 30000,
        amountKES: 30000,
      },
    ],
    payments: [
      {
        referenceNumber: "SJK48910LM",
        channel: "MPESA_PAYBILL",
        amountKES: 34800,
        payerName: "David Gitonga",
        payerPhone: "+254 722 890 123",
        receivedAt: "2026-10-15 08:34 AM",
      },
    ],
  },
  {
    id: "inv-2026-002",
    invoiceNumber: "INV-2026-0042",
    organizationId: "org-2",
    clientName: "Mama Rocks Gourmet Burgers",
    productSlug: "melio-rms",
    productName: "Melio RMS",
    status: "OVERDUE",
    subtotalKES: 18000,
    taxKES: 2880,
    totalKES: 20880,
    amountPaidKES: 0,
    balanceKES: 20880,
    issueDate: "2026-10-01",
    dueDate: "2026-10-15",
    kraEtimsQrCode: "01010042KRAETIMSVSCU#MAMAROCKS#20880#KES#SIG8910",
    notes: "Melio RMS Monthly Multi-Terminal SaaS Subscription (Kilimani Branch).",
    lineItems: [
      {
        description: "Melio RMS SaaS Subscription (Oct 2026) - 3 POS Terminals",
        quantity: 1,
        unitPrice: 18000,
        amountKES: 18000,
      },
    ],
    payments: [],
  },
  {
    id: "inv-2026-003",
    invoiceNumber: "INV-2026-0043",
    organizationId: "org-3",
    clientName: "Skyline Outdoor Media Ltd",
    productSlug: "adversoft",
    productName: "Adversoft",
    status: "PAID",
    subtotalKES: 45000,
    taxKES: 7200,
    totalKES: 52200,
    amountPaidKES: 52200,
    balanceKES: 0,
    issueDate: "2026-10-10",
    dueDate: "2026-10-14",
    paidAt: "2026-10-12 04:22 PM",
    kraEtimsQrCode: "01010043KRAETIMSVSCU#SKYLINETRAFFIC#52200#KES#SIG9923",
    notes: "Adversoft Founding Client Setup Fee & Billboard Audit Sync.",
    lineItems: [
      {
        description: "Adversoft Onboarding, Site Grid Migration & Rigger Mobile App",
        quantity: 1,
        unitPrice: 45000,
        amountKES: 45000,
      },
    ],
    payments: [
      {
        referenceNumber: "BK-NCBA-90184",
        channel: "BANK_TRANSFER",
        amountKES: 52200,
        payerName: "Skyline Outdoor Media Accounts",
        receivedAt: "2026-10-12 04:22 PM",
      },
    ],
  },
  {
    id: "inv-2026-004",
    invoiceNumber: "INV-2026-0044",
    organizationId: "org-4",
    clientName: "Safari Auto Clinic Ltd",
    productSlug: "vehisoft",
    productName: "Vehisoft",
    status: "PAID",
    subtotalKES: 35000,
    taxKES: 5600,
    totalKES: 40600,
    amountPaidKES: 40600,
    balanceKES: 0,
    issueDate: "2026-10-08",
    dueDate: "2026-10-12",
    paidAt: "2026-10-10 11:18 AM",
    kraEtimsQrCode: "01010044KRAETIMSVSCU#SAFARIAUTO#40600#KES#SIG1245",
    notes: "Vehisoft Garage Operations Onboarding & Parts Database Import.",
    lineItems: [
      {
        description: "Vehisoft Core Deployment & Workshop Bay Terminal Setup",
        quantity: 1,
        unitPrice: 35000,
        amountKES: 35000,
      },
    ],
    payments: [
      {
        referenceNumber: "QKL84910KP",
        channel: "MPESA_PAYBILL",
        amountKES: 40600,
        payerName: "Francis Mwangi",
        payerPhone: "+254 711 234 567",
        receivedAt: "2026-10-10 11:18 AM",
      },
    ],
  },
  {
    id: "inv-2026-005",
    invoiceNumber: "INV-2026-0045",
    organizationId: "org-5",
    clientName: "Bora Logistics Kenya",
    productSlug: "lipatim",
    productName: "LipaTim",
    status: "SENT",
    subtotalKES: 50000,
    taxKES: 8000,
    totalKES: 58000,
    amountPaidKES: 0,
    balanceKES: 58000,
    issueDate: "2026-10-17",
    dueDate: "2026-10-24",
    kraEtimsQrCode: "01010045KRAETIMSVSCU#BORALOGISTICS#58000#KES#SIG3345",
    notes: "LipaTim B2C Automated Payout Integration & Daraja Escrow API Keys.",
    lineItems: [
      {
        description: "LipaTim Dedicated Daraja B2C Integration & Multi-Tier Authorization",
        quantity: 1,
        unitPrice: 50000,
        amountKES: 50000,
      },
    ],
    payments: [],
  },
  {
    id: "inv-2026-006",
    invoiceNumber: "INV-2026-0046",
    organizationId: "org-6",
    clientName: "Prime Logistics Eldoret",
    productSlug: "vehisoft",
    productName: "Vehisoft",
    status: "OVERDUE",
    subtotalKES: 45000,
    taxKES: 7200,
    totalKES: 52200,
    amountPaidKES: 0,
    balanceKES: 52200,
    issueDate: "2026-10-03",
    dueDate: "2026-10-17",
    kraEtimsQrCode: "01010046KRAETIMSVSCU#PRIMELOGISTICS#52200#KES#SIG8829",
    notes: "15 Fleet Telematics GPS Trackers & APN SIM Activation.",
    lineItems: [
      {
        description: "Teltonika 4G Telematics Devices (15 units @ KES 3,000)",
        quantity: 15,
        unitPrice: 3000,
        amountKES: 45000,
      },
    ],
    payments: [],
  },
];

export const BUSINESS_EXPENSES_SEED: BusinessExpenseSeed[] = [
  {
    id: "exp-1",
    category: "INFRASTRUCTURE_CLOUD",
    description: "AWS & Supabase PostgreSQL Multi-AZ Production Database Hosting",
    amountKES: 14500,
    vendor: "Amazon Web Services",
    expenseDate: "2026-10-02",
  },
  {
    id: "exp-2",
    category: "HARDWARE_DEVICES",
    description: "Concox & Teltonika 4G Telematics Units Batch Import (20 devices)",
    amountKES: 42000,
    vendor: "AutoTrack Supplies Nairobi",
    expenseDate: "2026-10-05",
    productSlug: "vehisoft",
    productName: "Vehisoft",
  },
  {
    id: "exp-3",
    category: "HARDWARE_DEVICES",
    description: "80mm Thermal Receipt Printers for Melio RMS Client Implementations (4 units)",
    amountKES: 26000,
    vendor: "CompTech Africa Ltd",
    expenseDate: "2026-10-09",
    productSlug: "melio-rms",
    productName: "Melio RMS",
  },
  {
    id: "exp-4",
    category: "FIELD_CREW_TRANSPORT",
    description: "Field technician transit & fuel for billboard inspection audits & garage setups",
    amountKES: 8500,
    vendor: "Total Energies Kenya",
    expenseDate: "2026-10-14",
  },
  {
    id: "exp-5",
    category: "LEGAL_COMPLIANCE",
    description: "KRA eTIMS VSCU Developer Sandbox Recertification & API Token Renewals",
    amountKES: 12000,
    vendor: "KRA Compliance Advisory",
    expenseDate: "2026-10-16",
    productSlug: "melio-rms",
    productName: "Melio RMS",
  },
];
