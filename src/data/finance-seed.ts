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

export const INVOICES_SEED: InvoiceSeed[] = [];

export const BUSINESS_EXPENSES_SEED: BusinessExpenseSeed[] = [];
