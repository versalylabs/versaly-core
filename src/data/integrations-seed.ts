export interface SystemIntegrationItem {
  id: string;
  name: string;
  category: "Payments" | "Messaging" | "Compliance" | "Storage" | "Database" | "Automation";
  status: "HEALTHY" | "DEGRADED" | "NEEDS_ATTENTION";
  latencyMs: number;
  lastSuccessfulSync: string;
  failedRecordsCount: number;
  description: string;
  endpointOrId: string;
}

export const INITIAL_SYSTEM_INTEGRATIONS: SystemIntegrationItem[] = [
  {
    id: "int-mpesa",
    name: "Safaricom M-Pesa Daraja 3.0 API",
    category: "Payments",
    status: "HEALTHY",
    latencyMs: 142,
    lastSuccessfulSync: "2 minutes ago (Auto-poll)",
    failedRecordsCount: 0,
    description: "C2B Paybill #884920 real-time transaction webhook & STK push payment gateway.",
    endpointOrId: "https://api.safaricom.co.ke/mpesa/c2b/v1",
  },
  {
    id: "int-etims",
    name: "KRA eTIMS Electronic Tax Engine",
    category: "Compliance",
    status: "HEALTHY",
    latencyMs: 310,
    lastSuccessfulSync: "14 minutes ago",
    failedRecordsCount: 0,
    description: "Real-time fiscal invoice signing, QR code generation, and tax compliance validation.",
    endpointOrId: "https://etims.kra.go.ke/api/v2/invoice",
  },
  {
    id: "int-whatsapp",
    name: "Meta WhatsApp Cloud Business API",
    category: "Messaging",
    status: "HEALTHY",
    latencyMs: 95,
    lastSuccessfulSync: "1 minute ago",
    failedRecordsCount: 0,
    description: "Automated customer pickup alerts, invoice notifications, and 2-way client support threads.",
    endpointOrId: "graph.facebook.com/v19.0/versaly-biz",
  },
  {
    id: "int-storage",
    name: "Encrypted Document & Asset Storage",
    category: "Storage",
    status: "HEALTHY",
    latencyMs: 45,
    lastSuccessfulSync: "Live (Sync on upload)",
    failedRecordsCount: 0,
    description: "Signed contracts, sales collateral PDFs, and hardware photos with AES-256 at-rest encryption.",
    endpointOrId: "s3.af-south-1.amazonaws.com/versaly-core-docs",
  },
  {
    id: "int-db",
    name: "PostgreSQL Production Core Database",
    category: "Database",
    status: "HEALTHY",
    latencyMs: 12,
    lastSuccessfulSync: "Continuous streaming",
    failedRecordsCount: 0,
    description: "Relational storage for 34 organizations, 51 leads, 6 projects, invoices, and timeline history.",
    endpointOrId: "pg-primary.versaly-core.internal:5432",
  },
  {
    id: "int-cron",
    name: "Operational Background Automations & Cron",
    category: "Automation",
    status: "HEALTHY",
    latencyMs: 8,
    lastSuccessfulSync: "5 minutes ago",
    failedRecordsCount: 0,
    description: "Scheduled daily action queues, overdue invoice alerts, and Friday review triggers.",
    endpointOrId: "worker-cron-cluster.versaly-core",
  },
];
