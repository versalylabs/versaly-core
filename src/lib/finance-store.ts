"use client";

import { useState, useEffect } from "react";

// ============================================================================
// 1. INVOICES, CLIENT PAYMENTS & RECEIVABLES
// ============================================================================

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amountKES: number;
}

export interface PaymentRecord {
  id: string;
  referenceNumber: string;
  channel: "MPESA_PAYBILL" | "MPESA_TILL" | "MPESA_STK" | "BANK_TRANSFER" | "CASH" | "CHEQUE";
  amountKES: number;
  payerName: string;
  payerPhone?: string;
  receivedAt: string;
  notes?: string;
  accountId?: string; // target account receiving cash
}

export interface FinanceInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  productSlug: string;
  productName: string;
  status: "DRAFT" | "SENT" | "OVERDUE" | "PAID" | "VOID";
  subtotalKES: number;
  taxKES: number;
  totalKES: number;
  amountPaidKES: number;
  balanceKES: number;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  kraEtimsCode?: string;
  lineItems: InvoiceLineItem[];
  payments: PaymentRecord[];
  incomeType?:
    | "ONE_TIME_LICENSE"
    | "SAAS_SUBSCRIPTION"
    | "SETUP_IMPLEMENTATION"
    | "CUSTOM_DEVELOPMENT"
    | "MAINTENANCE_RETAINER"
    | "PARTNER_COMMISSION";
}

// ============================================================================
// 2. EXPENSES & OPERATIONAL COSTS
// ============================================================================

export type ExpenseCategoryType =
  | "INFRASTRUCTURE_CLOUD"
  | "AI_DEV_TOOLS"
  | "HARDWARE_DEVICES"
  | "MARKETING_ADS"
  | "SALES_OUTREACH"
  | "CLIENT_ONBOARDING"
  | "LEGAL_COMPLIANCE"
  | "BANK_FEES"
  | "OFFICE_OPERATIONS"
  | "SALARIES_COMMISSIONS"
  | "OTHER";

export interface FinanceExpense {
  id: string;
  category: ExpenseCategoryType | string;
  description: string;
  amountKES: number;
  vendor: string;
  expenseDate: string;
  paymentMethod: "MPESA" | "BANK_TRANSFER" | "CASH" | "CARD";
  productSlug?: string;
  status: "PAID" | "PENDING_APPROVAL" | "SCHEDULED" | "REJECTED";
  receiptUrl?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  accountId?: string; // source account paying cash
  isRecurring?: boolean;
}

// ============================================================================
// 3. MULTI-VAULT COMPANY ACCOUNTS
// ============================================================================

export interface CompanyAccount {
  id: string;
  name: string;
  accountType: "BANK_CHECKING" | "BANK_SAVINGS" | "MPESA_PAYBILL" | "MPESA_TILL" | "PETTY_CASH" | "RESERVE_ESCROW";
  accountNumber: string;
  institution: string;
  currency: string;
  balanceKES: number;
  isDefault: boolean;
  status: "ACTIVE" | "INACTIVE";
  notes?: string;
}

export const INITIAL_COMPANY_ACCOUNTS: CompanyAccount[] = [
  {
    id: "acc-kcb-corp",
    name: "KCB Corporate Checking",
    accountType: "BANK_CHECKING",
    accountNumber: "1284920491",
    institution: "KCB Bank Kenya",
    currency: "KES",
    balanceKES: 245000,
    isDefault: true,
    status: "ACTIVE",
    notes: "Main operating payroll, client wires & compliance payments",
  },
  {
    id: "acc-mpesa-paybill",
    name: "Safaricom M-Pesa Paybill (408221)",
    accountType: "MPESA_PAYBILL",
    accountNumber: "408221",
    institution: "Safaricom M-Pesa",
    currency: "KES",
    balanceKES: 184500,
    isDefault: false,
    status: "ACTIVE",
    notes: "Client SaaS automated collections & invoice clearing",
  },
  {
    id: "acc-mpesa-till",
    name: "Safaricom M-Pesa Buy Goods Till (892014)",
    accountType: "MPESA_TILL",
    accountNumber: "892014",
    institution: "Safaricom M-Pesa",
    currency: "KES",
    balanceKES: 62300,
    isDefault: false,
    status: "ACTIVE",
    notes: "Instant client setup deposits & walk-in software payments",
  },
  {
    id: "acc-ncba-usd",
    name: "NCBA USD Operating Account",
    accountType: "BANK_CHECKING",
    accountNumber: "6201948201",
    institution: "NCBA Bank Kenya",
    currency: "USD",
    balanceKES: 130000, // Equivalent (~$1,000 USD)
    isDefault: false,
    status: "ACTIVE",
    notes: "AWS, OpenAI & Vercel foreign cloud billing conversions",
  },
  {
    id: "acc-petty-cash",
    name: "Office Operational Petty Cash Vault",
    accountType: "PETTY_CASH",
    accountNumber: "VAULT-01",
    institution: "Versaly Head Office",
    currency: "KES",
    balanceKES: 15000,
    isDefault: false,
    status: "ACTIVE",
    notes: "Local transit, minor office utilities & courier dispatches",
  },
];

// ============================================================================
// 4. TRANSACTION LEDGER (AUDIT & RECONCILIATION)
// ============================================================================

export interface FinancialLedgerEntry {
  id: string;
  accountId: string;
  accountName: string;
  date: string;
  entryType: "DEBIT" | "CREDIT"; // Debit=Cash Out, Credit=Cash In
  amountKES: number;
  balanceAfterKES: number;
  category: string;
  description: string;
  reference?: string;
  reconciled: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  entityType?: "INVOICE" | "EXPENSE" | "CAPITAL" | "LOAN" | "COMPENSATION" | "RESERVE_TRANSFER";
  entityId?: string;
  notes?: string;
}

export const INITIAL_LEDGER_ENTRIES: FinancialLedgerEntry[] = [
  {
    id: "tx-init-01",
    accountId: "acc-kcb-corp",
    accountName: "KCB Corporate Checking",
    date: "2026-10-01",
    entryType: "CREDIT",
    amountKES: 200000,
    balanceAfterKES: 200000,
    category: "CAPITAL_CONTRIBUTION",
    description: "Founder initial seed capital deposit",
    reference: "KCB-DEP-9941",
    reconciled: true,
    reconciledBy: "Ted (CEO)",
    entityType: "CAPITAL",
  },
  {
    id: "tx-init-02",
    accountId: "acc-mpesa-paybill",
    accountName: "Safaricom M-Pesa Paybill (408221)",
    date: "2026-10-08",
    entryType: "CREDIT",
    amountKES: 80000,
    balanceAfterKES: 80000,
    category: "CLIENT_PAYMENT",
    description: "Semplo HR Annual Base Setup - Metro Health Care",
    reference: "QJK84920KL",
    reconciled: true,
    reconciledBy: "Ted (CEO)",
    entityType: "INVOICE",
  },
  {
    id: "tx-init-03",
    accountId: "acc-kcb-corp",
    accountName: "KCB Corporate Checking",
    date: "2026-10-10",
    entryType: "DEBIT",
    amountKES: 25000,
    balanceAfterKES: 175000,
    category: "LEGAL_COMPLIANCE",
    description: "Company legal registration & BRS filing fees",
    reference: "E-CITIZEN-BRS-40",
    reconciled: true,
    reconciledBy: "Finance Lead",
    entityType: "EXPENSE",
  },
  {
    id: "tx-init-04",
    accountId: "acc-ncba-usd",
    accountName: "NCBA USD Operating Account",
    date: "2026-10-15",
    entryType: "DEBIT",
    amountKES: 18000,
    balanceAfterKES: 130000,
    category: "INFRASTRUCTURE_CLOUD",
    description: "Vercel Enterprise & OpenAI API Platform usage",
    reference: "CARD-AUTH-6621",
    reconciled: true,
    reconciledBy: "Ted (CEO)",
    entityType: "EXPENSE",
  },
];

// ============================================================================
// 5. CAPITAL CONTRIBUTIONS & SHAREHOLDER FINANCING
// ============================================================================

export type CapitalType = "EQUITY_CAPITAL" | "SHAREHOLDER_LOAN" | "REIMBURSABLE_EXPENSE" | "GRANT_SUBSIDY" | "OTHER";

export interface CapitalContribution {
  id: string;
  contributorName: string;
  amountKES: number;
  contributionDate: string;
  type: CapitalType;
  status: "RECEIVED" | "PENDING" | "REIMBURSED";
  supportingDoc?: string;
  notes?: string;
  accountId?: string;
}

export interface ShareholderLoan {
  id: string;
  contributionId?: string;
  lenderName: string;
  principalAmountKES: number;
  interestRateAnnualPct: number;
  startDate: string;
  maturityDate?: string;
  repaymentTermMonths: number;
  amountRepaidKES: number;
  remainingBalanceKES: number;
  status: "ACTIVE" | "FULLY_REPAID" | "RENEGOTIATED";
  monthlyInstallmentKES: number;
  nextPaymentDate: string;
  notes?: string;
}

export const INITIAL_CAPITAL_CONTRIBUTIONS: CapitalContribution[] = [
  {
    id: "cap-01",
    contributorName: "Ted (Founder & CEO)",
    amountKES: 250000,
    contributionDate: "2026-09-15",
    type: "EQUITY_CAPITAL",
    status: "RECEIVED",
    supportingDoc: "Founders_Capital_Resolution_2026.pdf",
    notes: "Initial seed equity capitalization for Versaly Core development & infrastructure",
  },
  {
    id: "cap-02",
    contributorName: "Original Co-Founder",
    amountKES: 100000,
    contributionDate: "2026-09-20",
    type: "EQUITY_CAPITAL",
    status: "RECEIVED",
    supportingDoc: "CoFounder_Contribution_Agreement.pdf",
    notes: "Co-founding partner equity contribution",
  },
  {
    id: "cap-03",
    contributorName: "Ted (Founder)",
    amountKES: 150000,
    contributionDate: "2026-10-05",
    type: "SHAREHOLDER_LOAN",
    status: "RECEIVED",
    supportingDoc: "Shareholder_Loan_Agreement_01.pdf",
    notes: "Subordinated working capital shareholder loan to bridge sales pipeline ramp-up",
  },
  {
    id: "cap-04",
    contributorName: "Incoming Strategic Investor (Pledged)",
    amountKES: 500000,
    contributionDate: "2026-11-15",
    type: "EQUITY_CAPITAL",
    status: "PENDING",
    supportingDoc: "TermSheet_Draft_Nov2026.pdf",
    notes: "Proposed investment tranche contingent on legal execution & closing",
  },
];

export const INITIAL_SHAREHOLDER_LOANS: ShareholderLoan[] = [
  {
    id: "loan-01",
    contributionId: "cap-03",
    lenderName: "Ted (Founder)",
    principalAmountKES: 150000,
    interestRateAnnualPct: 6.0,
    startDate: "2026-10-05",
    maturityDate: "2027-10-05",
    repaymentTermMonths: 12,
    amountRepaidKES: 25000,
    remainingBalanceKES: 125000,
    monthlyInstallmentKES: 13250,
    nextPaymentDate: "2026-11-05",
    status: "ACTIVE",
    notes: "Repaid out of positive operational free cash flow post-tax commitments",
  },
];

// ============================================================================
// 6. OWNERSHIP & EQUITY REGISTER (PROPOSED VS. LEGALLY ISSUED)
// ============================================================================

export interface Shareholding {
  id: string;
  shareholderName: string;
  roleTitle: string;
  percentage: number;
  sharesCount: number;
  shareClass: "ORDINARY_A" | "ORDINARY_B" | "PREFERRED";
  vestingMonths: number;
  cliffMonths: number;
  vestingStartDate: string;
  isLegallyBinding: boolean;
  votingRights: boolean;
  notes?: string;
}

export interface EquityScenario {
  id: string;
  scenarioName: string;
  isLegallyIssued: boolean; // True only if filed with Kenyan Business Registration Service (BRS)
  totalAuthorizedShares: number;
  totalIssuedShares: number;
  notes: string;
  stakeholders: Shareholding[];
}

export const INITIAL_EQUITY_SCENARIO: EquityScenario = {
  id: "eq-proposed-seed",
  scenarioName: "Proposed Founding Ownership Scenario",
  isLegallyIssued: false, // Explicitly marked as proposed/unfinalized per instructions
  totalAuthorizedShares: 1000000,
  totalIssuedShares: 100000,
  notes:
    "PROPOSED UNFINALIZED SCENARIO: For governance modeling only. Legal share issuance requires formal board resolution, legal transfer instruments, and filing with the Business Registration Service (BRS).",
  stakeholders: [
    {
      id: "sh-01",
      shareholderName: "Ted (Founder & CEO)",
      roleTitle: "Founder & Chief Executive Officer",
      percentage: 51.0,
      sharesCount: 51000,
      shareClass: "ORDINARY_A",
      vestingMonths: 48,
      cliffMonths: 12,
      vestingStartDate: "2026-09-01",
      isLegallyBinding: false,
      votingRights: true,
      notes: "Controlling majority stake, operational executive leadership & vision",
    },
    {
      id: "sh-02",
      shareholderName: "Original Co-Founder",
      roleTitle: "Co-Founder & Technical Architect",
      percentage: 29.0,
      sharesCount: 29000,
      shareClass: "ORDINARY_A",
      vestingMonths: 48,
      cliffMonths: 12,
      vestingStartDate: "2026-09-01",
      isLegallyBinding: false,
      votingRights: true,
      notes: "Core engineering, product build & infrastructure stewardship",
    },
    {
      id: "sh-03",
      shareholderName: "Incoming Strategic Investor / Partner",
      roleTitle: "Commercial & Business Growth Partner",
      percentage: 20.0,
      sharesCount: 20000,
      shareClass: "ORDINARY_B",
      vestingMonths: 36,
      cliffMonths: 6,
      vestingStartDate: "2026-11-01",
      isLegallyBinding: false,
      votingRights: true,
      notes: "Proposed 20% growth allocation subject to formal closing and capital injection",
    },
  ],
};

// ============================================================================
// 7. BUDGETS & FINANCIAL PLANNING (90-DAY STARTUP SCENARIO)
// ============================================================================

export interface BudgetItem {
  id: string;
  category: string;
  allocatedKES: number;
  spentKES: number;
  department: "Executive" | "Legal" | "Engineering" | "Sales" | "Marketing" | "Customer Success" | "Admin" | "Reserves";
  notes?: string;
  isSampleScenario?: boolean;
}

export interface BudgetPlan {
  id: string;
  name: string;
  period: "MONTHLY" | "QUARTERLY" | "ANNUAL" | "NINETY_DAY_STARTUP";
  year: number;
  quarter?: number;
  totalBudgetKES: number;
  status: "APPROVED" | "DRAFT" | "REVISED";
  notes: string;
  items: BudgetItem[];
}

export const INITIAL_90_DAY_BUDGET: BudgetPlan = {
  id: "budget-90day-startup",
  name: "90-Day Initial Startup Budget (Planning Scenario)",
  period: "NINETY_DAY_STARTUP",
  year: 2026,
  totalBudgetKES: 120000,
  status: "APPROVED",
  notes:
    "Planning baseline scenario of KSh 120,000 for Versaly launch. Sample planning estimates designed for bootstrap operational discipline.",
  items: [
    {
      id: "b-01",
      category: "Registration and filing",
      allocatedKES: 12000,
      spentKES: 8500,
      department: "Legal",
      notes: "BRS company incorporation, eCitizen registration, tax pin & permits",
      isSampleScenario: true,
    },
    {
      id: "b-02",
      category: "Legal and accounting",
      allocatedKES: 25000,
      spentKES: 15000,
      department: "Legal",
      notes: "Client Master Service Agreement (MSA), NDAs, SLA contracts & initial tax filing setup",
      isSampleScenario: true,
    },
    {
      id: "b-03",
      category: "Hosting and software",
      allocatedKES: 18000,
      spentKES: 12400,
      department: "Engineering",
      notes: "Vercel Pro, AWS backup, OpenAI API tokens, domains & SSL certificates",
      isSampleScenario: true,
    },
    {
      id: "b-04",
      category: "Sales outreach",
      allocatedKES: 24000,
      spentKES: 16500,
      department: "Sales",
      notes: "Safaricom voice & data packages, WhatsApp Business CRM, cold outreach calling",
      isSampleScenario: true,
    },
    {
      id: "b-05",
      category: "Marketing",
      allocatedKES: 9000,
      spentKES: 5200,
      department: "Marketing",
      notes: "Targeted digital brochures, case study creative assets & localized social ads",
      isSampleScenario: true,
    },
    {
      id: "b-06",
      category: "Customer onboarding",
      allocatedKES: 9000,
      spentKES: 4500,
      department: "Customer Success",
      notes: "On-site bay visits, user training materials, laminated job card setup guides",
      isSampleScenario: true,
    },
    {
      id: "b-07",
      category: "Administration",
      allocatedKES: 3000,
      spentKES: 1800,
      department: "Admin",
      notes: "Office supplies, printing contracts, bank transaction ledger fees",
      isSampleScenario: true,
    },
    {
      id: "b-08",
      category: "Emergency reserve",
      allocatedKES: 20000,
      spentKES: 0,
      department: "Reserves",
      notes: "Unallocated liquidity buffer for unforeseen operational contingencies",
      isSampleScenario: true,
    },
  ],
};

// ============================================================================
// 8. OPERATIONAL SUBSCRIPTIONS & VENDOR COMMITMENTS
// ============================================================================

export interface OperationalSubscription {
  id: string;
  provider: string;
  serviceName: string;
  category: "CLOUD_HOSTING" | "AI_DEVELOPMENT" | "BUSINESS_TOOLS" | "TELECOM_INTERNET" | "DOMAINS_SECURITY";
  costAmount: number;
  currency: string;
  costKES: number;
  billingCycle: "MONTHLY" | "ANNUAL" | "QUARTERLY";
  renewalDate: string;
  paymentMethod: "CARD" | "MPESA" | "BANK_TRANSFER";
  responsiblePerson: string;
  status: "ACTIVE" | "REVIEW_FOR_CANCEL" | "CANCELLED";
  notes?: string;
}

export const INITIAL_OPERATIONAL_SUBSCRIPTIONS: OperationalSubscription[] = [
  {
    id: "ops-01",
    provider: "Vercel Inc.",
    serviceName: "Pro Hosting & Edge Functions",
    category: "CLOUD_HOSTING",
    costAmount: 20,
    currency: "USD",
    costKES: 2600,
    billingCycle: "MONTHLY",
    renewalDate: "2026-11-05",
    paymentMethod: "CARD",
    responsiblePerson: "Ted (CEO)",
    status: "ACTIVE",
    notes: "Hosts versaly-core production web application and APIs",
  },
  {
    id: "ops-02",
    provider: "OpenAI Platform",
    serviceName: "GPT-4o API & Token Ingestion",
    category: "AI_DEVELOPMENT",
    costAmount: 50,
    currency: "USD",
    costKES: 6500,
    billingCycle: "MONTHLY",
    renewalDate: "2026-11-01",
    paymentMethod: "CARD",
    responsiblePerson: "Ted (CEO)",
    status: "ACTIVE",
    notes: "Powers Versaly AI Copilot and Grounded Document Assistant",
  },
  {
    id: "ops-03",
    provider: "Google Workspace",
    serviceName: "Corporate Email & Google Cloud Drive",
    category: "BUSINESS_TOOLS",
    costAmount: 24,
    currency: "USD",
    costKES: 3120,
    billingCycle: "MONTHLY",
    renewalDate: "2026-11-12",
    paymentMethod: "CARD",
    responsiblePerson: "Ted (CEO)",
    status: "ACTIVE",
    notes: "team@versaly.co.ke and founder communications vault",
  },
  {
    id: "ops-04",
    provider: "Safaricom PLC",
    serviceName: "Safaricom 4G/5G Executive Data & Calling",
    category: "TELECOM_INTERNET",
    costAmount: 4500,
    currency: "KES",
    costKES: 4500,
    billingCycle: "MONTHLY",
    renewalDate: "2026-11-01",
    paymentMethod: "MPESA",
    responsiblePerson: "Ted (CEO)",
    status: "ACTIVE",
    notes: "High-speed mobile data for field visits & client support demos",
  },
  {
    id: "ops-05",
    provider: "GitHub Enterprise",
    serviceName: "GitHub Team & Actions CI/CD",
    category: "CLOUD_HOSTING",
    costAmount: 16,
    currency: "USD",
    costKES: 2080,
    billingCycle: "MONTHLY",
    renewalDate: "2026-11-18",
    paymentMethod: "CARD",
    responsiblePerson: "Tech Lead",
    status: "ACTIVE",
    notes: "Private repository code security & automated test suite runs",
  },
];

// ============================================================================
// 9. CASH RESERVES & SAVINGS (INTERNAL EARMARKS)
// ============================================================================

export interface CashReserveFund {
  id: string;
  fundName: string;
  purpose: string;
  targetKES: number;
  currentAllocatedKES: number;
  targetMonthsRunway: number;
  notes: string;
}

export const INITIAL_CASH_RESERVES: CashReserveFund[] = [
  {
    id: "res-01",
    fundName: "Emergency Operating Fund",
    purpose: "Ensures company can survive 3 full months of zero revenue while paying critical servers and skeleton operations",
    targetKES: 300000,
    currentAllocatedKES: 120000,
    targetMonthsRunway: 3,
    notes: "Untouchable except during existential company emergencies with founder authorization",
  },
  {
    id: "res-02",
    fundName: "KRA Tax & Compliance Provision",
    purpose: "Earmarked pool to cover KRA VAT eTIMS, SHIF, NSSF, Housing Levy, and Annual Corporate Tax",
    targetKES: 100000,
    currentAllocatedKES: 45000,
    targetMonthsRunway: 6,
    notes: "Automated 16% withholding on client license invoices to ensure zero audit penalties",
  },
  {
    id: "res-03",
    fundName: "Infrastructure & Maintenance Fund",
    purpose: "Buffer for emergency cloud server scaling, database migrations, hardware repairs, and SSL renewals",
    targetKES: 100000,
    currentAllocatedKES: 35000,
    targetMonthsRunway: 6,
    notes: "Prevents downtime if a client experiences sudden 10x traffic spikes",
  },
  {
    id: "res-04",
    fundName: "Marketing & Growth Fund",
    purpose: "Dedicated reserves for quarterly targeted sales campaigns, billboard showcases, and commercial PR pushes",
    targetKES: 150000,
    currentAllocatedKES: 40000,
    targetMonthsRunway: 3,
    notes: "Allocated strictly out of monthly operating surpluses",
  },
  {
    id: "res-05",
    fundName: "Future Product R&D Investment Fund",
    purpose: "Seed capital for prototyping next-generation SaaS vertical modules (e.g. Melio RMS hardware integrations)",
    targetKES: 500000,
    currentAllocatedKES: 50000,
    targetMonthsRunway: 12,
    notes: "Long-term innovation reserve funded from software setup fee surpluses",
  },
];

// ============================================================================
// 10. COMPENSATION, COMMISSIONS & DISTRIBUTIONS
// ============================================================================

export type CompensationCategory =
  | "SALARY"
  | "COMMISSION"
  | "CONTRACTOR_FEE"
  | "REIMBURSEMENT"
  | "SHAREHOLDER_LOAN_REPAYMENT"
  | "DIVIDEND_DISTRIBUTION";

export interface CompensationRecord {
  id: string;
  recipientName: string;
  roleTitle: string;
  type: CompensationCategory;
  amountKES: number;
  paymentDate: string;
  paymentMethod: "MPESA_B2C" | "BANK_TRANSFER" | "CASH";
  status: "PENDING_APPROVAL" | "APPROVED" | "PAID" | "REJECTED";
  approvedBy?: string;
  approvalDate?: string;
  periodCovered: string;
  referenceNumber?: string;
  notes?: string;
  accountId?: string;
}

export const INITIAL_COMPENSATION_RECORDS: CompensationRecord[] = [
  {
    id: "comp-01",
    recipientName: "Ted (Founder & CEO)",
    roleTitle: "Founder & Executive Director",
    type: "SALARY",
    amountKES: 45000,
    paymentDate: "2026-10-25",
    paymentMethod: "MPESA_B2C",
    status: "PAID",
    approvedBy: "Board Resolution #01",
    approvalDate: "2026-10-20",
    periodCovered: "October 2026",
    referenceNumber: "MPESA-B2C-99120",
    notes: "Founder base living stipend approved for startup launch phase",
  },
  {
    id: "comp-02",
    recipientName: "Sales Lead Specialist",
    roleTitle: "Outreach & Bay Closer",
    type: "COMMISSION",
    amountKES: 12000,
    paymentDate: "2026-10-22",
    paymentMethod: "MPESA_B2C",
    status: "PAID",
    approvedBy: "Ted (CEO)",
    approvalDate: "2026-10-21",
    periodCovered: "Commission: Semplo Deal #deal-metro-health",
    referenceNumber: "MPESA-B2C-98402",
    notes: "Standard 15% upfront commission on KES 80,000 collected setup fee",
  },
  {
    id: "comp-03",
    recipientName: "Field UI/UX Frontend Contractor",
    roleTitle: "Contractor Engineer",
    type: "CONTRACTOR_FEE",
    amountKES: 25000,
    paymentDate: "2026-10-18",
    paymentMethod: "BANK_TRANSFER",
    status: "PAID",
    approvedBy: "Ted (CEO)",
    approvalDate: "2026-10-17",
    periodCovered: "Vehisoft Job Card mobile responsive fixes",
    referenceNumber: "KCB-EFT-40291",
    notes: "Milestone completion sign-off on staging deployment",
  },
  {
    id: "comp-04",
    recipientName: "Ted (Founder)",
    roleTitle: "Lender / Shareholder",
    type: "SHAREHOLDER_LOAN_REPAYMENT",
    amountKES: 25000,
    paymentDate: "2026-10-12",
    paymentMethod: "BANK_TRANSFER",
    status: "PAID",
    approvedBy: "Finance Lead",
    approvalDate: "2026-10-11",
    periodCovered: "Shareholder Loan Tranche 1 Repayment",
    referenceNumber: "KCB-EFT-39912",
    notes: "Principal reduction on Loan #loan-01 following healthy October collections",
  },
  {
    id: "comp-05",
    recipientName: "Customer Success Lead",
    roleTitle: "Field Implementation",
    type: "REIMBURSEMENT",
    amountKES: 4200,
    paymentDate: "2026-10-24",
    paymentMethod: "MPESA_B2C",
    status: "APPROVED",
    approvedBy: "Ted (CEO)",
    approvalDate: "2026-10-24",
    periodCovered: "On-site bay visits taxi receipts & client lunch",
    referenceNumber: "PENDING_DISBURSEMENT",
    notes: "Verified against uploaded Uber and café digital receipts",
  },
];

// ============================================================================
// 11. FINANCIAL CONTROLS, ROLES & CURRENCY
// ============================================================================

export type FinanceRole = "CEO_ADMIN" | "FINANCE_MANAGER" | "SALES_LEAD" | "AUDITOR_READONLY";

export const FINANCE_ROLES: { id: FinanceRole; label: string; permissions: string[] }[] = [
  {
    id: "CEO_ADMIN",
    label: "CEO / Managing Director",
    permissions: ["FULL_ACCESS", "APPROVE_COMPENSATION", "MODIFY_EQUITY", "TRANSFER_RESERVES", "CREATE_LOANS"],
  },
  {
    id: "FINANCE_MANAGER",
    label: "Finance & Operations Manager",
    permissions: ["VIEW_ALL", "CREATE_INVOICES", "RECORD_EXPENSES", "RECONCILE_ACCOUNTS", "GENERATE_REPORTS"],
  },
  {
    id: "SALES_LEAD",
    label: "Sales & Commercial Lead",
    permissions: ["VIEW_INVOICES", "VIEW_PAYMENTS", "CREATE_INVOICE", "VIEW_COMMISSIONS"],
  },
  {
    id: "AUDITOR_READONLY",
    label: "External Auditor / Shareholder",
    permissions: ["READ_ONLY_REPORTS", "VIEW_LEDGER", "VIEW_EQUITY_SCENARIO", "EXPORT_CSV"],
  },
];

export interface ClientSubscription {
  id: string;
  clientName: string;
  productSlug: string;
  productName: string;
  planTier: string;
  monthlyFeeKES: number;
  billingCycle: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  status: "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELLED";
  startDate: string;
  nextBillingDate: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
}

export const INITIAL_SUBSCRIPTIONS: ClientSubscription[] = [];

// ============================================================================
// 12. STORAGE KEYS
// ============================================================================

export const STORAGE_INVOICES = "versaly_finance_invoices_v2";
export const STORAGE_EXPENSES = "versaly_finance_expenses_v2";
export const STORAGE_SUBSCRIPTIONS = "versaly_finance_subscriptions_v2";
export const STORAGE_ACCOUNTS = "versaly_finance_accounts_v2";
export const STORAGE_LEDGER = "versaly_finance_ledger_v2";
export const STORAGE_CAPITAL = "versaly_finance_capital_v2";
export const STORAGE_LOANS = "versaly_finance_loans_v2";
export const STORAGE_EQUITY = "versaly_finance_equity_v2";
export const STORAGE_BUDGETS = "versaly_finance_budgets_v2";
export const STORAGE_VENDOR_SUBS = "versaly_finance_vendor_subs_v2";
export const STORAGE_RESERVES = "versaly_finance_reserves_v2";
export const STORAGE_COMPENSATION = "versaly_finance_compensation_v2";
export const STORAGE_FINANCE_ROLE = "versaly_finance_current_role";

// Shared target launch baselines
export const SETUP_FEE_LAUNCH_TARGET = 520000;
export const MRR_LAUNCH_TARGET = 120000;

// ============================================================================
// 13. STORAGE LOADERS & SAVERS WITH EVENT BROADCASTING
// ============================================================================

function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      return parsed as T;
    }
  } catch {}
  return fallback;
}

function safeSetStorage<T>(key: string, value: T, eventName?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (eventName) {
      window.dispatchEvent(new CustomEvent(eventName));
    }
    window.dispatchEvent(new CustomEvent("versaly_finance_updated"));
  } catch {}
}

// Invoices
export function loadInvoicesFromStorage(): FinanceInvoice[] {
  return safeGetStorage<FinanceInvoice[]>(STORAGE_INVOICES, []);
}

export function saveInvoicesToStorage(invoices: FinanceInvoice[]): void {
  safeSetStorage(STORAGE_INVOICES, invoices, "versaly_invoices_updated");
}

// Expenses
export function loadExpensesFromStorage(): FinanceExpense[] {
  return safeGetStorage<FinanceExpense[]>(STORAGE_EXPENSES, []);
}

export function saveExpensesToStorage(expenses: FinanceExpense[]): void {
  safeSetStorage(STORAGE_EXPENSES, expenses, "versaly_expenses_updated");
}

// Subscriptions
export function loadSubscriptionsFromStorage(): ClientSubscription[] {
  const list = safeGetStorage<ClientSubscription[]>(STORAGE_SUBSCRIPTIONS, []);
  // Clean mock IDs if present
  const cleaned = list.filter(
    (s) =>
      s.id !== "sub-1" &&
      s.id !== "sub-2" &&
      s.id !== "sub-3" &&
      s.id !== "sub-4" &&
      s.id !== "sub-5" &&
      s.id !== "sub-semplo-1"
  );
  if (cleaned.length !== list.length) {
    saveSubscriptionsToStorage(cleaned);
  }
  return cleaned;
}

export function saveSubscriptionsToStorage(subs: ClientSubscription[]): void {
  safeSetStorage(STORAGE_SUBSCRIPTIONS, subs, "versaly_subscriptions_updated");
}

// Accounts
export function loadAccountsFromStorage(): CompanyAccount[] {
  const existing = safeGetStorage<CompanyAccount[]>(STORAGE_ACCOUNTS, INITIAL_COMPANY_ACCOUNTS);
  if (!existing || existing.length === 0) {
    saveAccountsToStorage(INITIAL_COMPANY_ACCOUNTS);
    return INITIAL_COMPANY_ACCOUNTS;
  }
  return existing;
}

export function saveAccountsToStorage(accounts: CompanyAccount[]): void {
  safeSetStorage(STORAGE_ACCOUNTS, accounts, "versaly_accounts_updated");
}

// Ledger
export function loadLedgerFromStorage(): FinancialLedgerEntry[] {
  const existing = safeGetStorage<FinancialLedgerEntry[]>(STORAGE_LEDGER, INITIAL_LEDGER_ENTRIES);
  if (!existing || existing.length === 0) {
    saveLedgerToStorage(INITIAL_LEDGER_ENTRIES);
    return INITIAL_LEDGER_ENTRIES;
  }
  return existing;
}

export function saveLedgerToStorage(ledger: FinancialLedgerEntry[]): void {
  safeSetStorage(STORAGE_LEDGER, ledger, "versaly_ledger_updated");
}

// Capital Contributions
export function loadCapitalContributions(): CapitalContribution[] {
  const existing = safeGetStorage<CapitalContribution[]>(STORAGE_CAPITAL, INITIAL_CAPITAL_CONTRIBUTIONS);
  if (!existing || existing.length === 0) {
    saveCapitalContributions(INITIAL_CAPITAL_CONTRIBUTIONS);
    return INITIAL_CAPITAL_CONTRIBUTIONS;
  }
  return existing;
}

export function saveCapitalContributions(caps: CapitalContribution[]): void {
  safeSetStorage(STORAGE_CAPITAL, caps, "versaly_capital_updated");
}

// Shareholder Loans
export function loadShareholderLoans(): ShareholderLoan[] {
  const existing = safeGetStorage<ShareholderLoan[]>(STORAGE_LOANS, INITIAL_SHAREHOLDER_LOANS);
  if (!existing || existing.length === 0) {
    saveShareholderLoans(INITIAL_SHAREHOLDER_LOANS);
    return INITIAL_SHAREHOLDER_LOANS;
  }
  return existing;
}

export function saveShareholderLoans(loans: ShareholderLoan[]): void {
  safeSetStorage(STORAGE_LOANS, loans, "versaly_loans_updated");
}

// Equity Scenarios
export function loadEquityScenarios(): EquityScenario[] {
  const existing = safeGetStorage<EquityScenario[]>(STORAGE_EQUITY, [INITIAL_EQUITY_SCENARIO]);
  if (!existing || existing.length === 0) {
    saveEquityScenarios([INITIAL_EQUITY_SCENARIO]);
    return [INITIAL_EQUITY_SCENARIO];
  }
  return existing;
}

export function saveEquityScenarios(scenarios: EquityScenario[]): void {
  safeSetStorage(STORAGE_EQUITY, scenarios, "versaly_equity_updated");
}

// Budgets
export function loadBudgetsFromStorage(): BudgetPlan[] {
  const existing = safeGetStorage<BudgetPlan[]>(STORAGE_BUDGETS, [INITIAL_90_DAY_BUDGET]);
  if (!existing || existing.length === 0) {
    saveBudgetsToStorage([INITIAL_90_DAY_BUDGET]);
    return [INITIAL_90_DAY_BUDGET];
  }
  return existing;
}

export function saveBudgetsToStorage(budgets: BudgetPlan[]): void {
  safeSetStorage(STORAGE_BUDGETS, budgets, "versaly_budgets_updated");
}

// Operational Vendor Subscriptions
export function loadOperationalSubscriptions(): OperationalSubscription[] {
  const existing = safeGetStorage<OperationalSubscription[]>(
    STORAGE_VENDOR_SUBS,
    INITIAL_OPERATIONAL_SUBSCRIPTIONS
  );
  if (!existing || existing.length === 0) {
    saveOperationalSubscriptions(INITIAL_OPERATIONAL_SUBSCRIPTIONS);
    return INITIAL_OPERATIONAL_SUBSCRIPTIONS;
  }
  return existing;
}

export function saveOperationalSubscriptions(subs: OperationalSubscription[]): void {
  safeSetStorage(STORAGE_VENDOR_SUBS, subs, "versaly_vendor_subs_updated");
}

// Cash Reserves
export function loadReservesFromStorage(): CashReserveFund[] {
  const existing = safeGetStorage<CashReserveFund[]>(STORAGE_RESERVES, INITIAL_CASH_RESERVES);
  if (!existing || existing.length === 0) {
    saveReservesToStorage(INITIAL_CASH_RESERVES);
    return INITIAL_CASH_RESERVES;
  }
  return existing;
}

export function saveReservesToStorage(reserves: CashReserveFund[]): void {
  safeSetStorage(STORAGE_RESERVES, reserves, "versaly_reserves_updated");
}

// Compensation Records
export function loadCompensationRecords(): CompensationRecord[] {
  const existing = safeGetStorage<CompensationRecord[]>(STORAGE_COMPENSATION, INITIAL_COMPENSATION_RECORDS);
  if (!existing || existing.length === 0) {
    saveCompensationRecords(INITIAL_COMPENSATION_RECORDS);
    return INITIAL_COMPENSATION_RECORDS;
  }
  return existing;
}

export function saveCompensationRecords(comps: CompensationRecord[]): void {
  safeSetStorage(STORAGE_COMPENSATION, comps, "versaly_compensation_updated");
}

// Role Settings
export function loadFinanceRole(): FinanceRole {
  if (typeof window === "undefined") return "CEO_ADMIN";
  const stored = localStorage.getItem(STORAGE_FINANCE_ROLE);
  if (stored && ["CEO_ADMIN", "FINANCE_MANAGER", "SALES_LEAD", "AUDITOR_READONLY"].includes(stored)) {
    return stored as FinanceRole;
  }
  return "CEO_ADMIN";
}

export function saveFinanceRole(role: FinanceRole): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_FINANCE_ROLE, role);
  window.dispatchEvent(new CustomEvent("versaly_finance_role_updated"));
}

// ============================================================================
// 14. COMPREHENSIVE FINANCE SUMMARY COMPUTATION
// ============================================================================

export function computeFinanceSummary(
  invoices: FinanceInvoice[],
  expenses: FinanceExpense[],
  subscriptions?: ClientSubscription[]
) {
  const accounts = typeof window !== "undefined" ? loadAccountsFromStorage() : INITIAL_COMPANY_ACCOUNTS;
  const reserves = typeof window !== "undefined" ? loadReservesFromStorage() : INITIAL_CASH_RESERVES;
  const vendorSubs = typeof window !== "undefined" ? loadOperationalSubscriptions() : INITIAL_OPERATIONAL_SUBSCRIPTIONS;
  const budgets = typeof window !== "undefined" ? loadBudgetsFromStorage() : [INITIAL_90_DAY_BUDGET];

  // Total cash across real company accounts
  const totalAccountCash = accounts.reduce((sum, a) => sum + (a.balanceKES || 0), 0);

  // Total internal reserve allocations (Earmarks - NOT double counted as separate cash)
  const totalReservesAllocated = reserves.reduce((sum, r) => sum + (r.currentAllocatedKES || 0), 0);

  // Free uncommitted operating cash
  const availableOperatingCash = Math.max(0, totalAccountCash - totalReservesAllocated);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalKES || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.amountPaidKES || 0), 0);

  const outstandingInvoices = invoices.filter(
    (inv) => inv.status === "SENT" || inv.status === "OVERDUE"
  );
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + (inv.balanceKES || 0), 0);

  const overdueInvoices = invoices.filter((inv) => inv.status === "OVERDUE");
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.balanceKES || 0), 0);

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amountKES || 0), 0);
  const netProfit = totalCollected - totalExpenses;
  const netMarginPct = totalCollected > 0 ? Math.round((netProfit / totalCollected) * 100) : 0;

  // Active subscriptions calculation
  const subsList = subscriptions ?? (typeof window !== "undefined" ? loadSubscriptionsFromStorage() : INITIAL_SUBSCRIPTIONS);
  const activeSubs = subsList.filter((s) => s.status === "ACTIVE");
  const contractedMRR = activeSubs.reduce((sum, s) => sum + (s.monthlyFeeKES || 0), 0);
  const contractedARR = contractedMRR * 12;

  // Monthly vendor SaaS commitment
  const monthlyVendorBurn = vendorSubs
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => {
      if (s.billingCycle === "ANNUAL") return sum + s.costKES / 12;
      return sum + s.costKES;
    }, 0);

  // Overall monthly burn rate (estimated operational expenses + recurring vendor tools)
  const estimatedMonthlyBurn = Math.max(totalExpenses > 0 ? totalExpenses : 45000, monthlyVendorBurn + 35000);

  // Cash runway in months
  const estimatedRunwayMonths = estimatedMonthlyBurn > 0 ? Number((totalAccountCash / estimatedMonthlyBurn).toFixed(1)) : 12;

  // Budget tracking for primary active budget
  const activeBudget = budgets[0] || INITIAL_90_DAY_BUDGET;
  const budgetAllocated = activeBudget.items.reduce((sum, b) => sum + b.allocatedKES, 0);
  const budgetSpent = activeBudget.items.reduce((sum, b) => sum + b.spentKES, 0);
  const budgetUtilizationPct = budgetAllocated > 0 ? Math.round((budgetSpent / budgetAllocated) * 100) : 0;

  // Compute MRR & Setup fees from invoice line items
  let setupFeesCollected = 0;
  let recurringCollected = 0;

  invoices.forEach((inv) => {
    if (inv.status === "PAID" || inv.amountPaidKES > 0) {
      inv.lineItems?.forEach((item) => {
        const desc = item.description.toLowerCase();
        if (desc.includes("setup") || desc.includes("installation") || desc.includes("onboarding")) {
          setupFeesCollected += item.amountKES;
        } else if (desc.includes("monthly") || desc.includes("subscription") || desc.includes("mrr") || desc.includes("license")) {
          recurringCollected += item.amountKES;
        }
      });
    }
  });

  const effectiveMRR = contractedMRR > 0 ? contractedMRR : recurringCollected;
  const effectiveARR = effectiveMRR * 12;

  // Product splits
  const productRevenue: Record<string, number> = {};
  invoices.forEach((inv) => {
    const paid = inv.amountPaidKES || 0;
    const key = inv.productName || inv.productSlug || "Other";
    productRevenue[key] = (productRevenue[key] || 0) + paid;
  });

  const productMRR: Record<string, number> = {};
  activeSubs.forEach((s) => {
    const key = s.productName || s.productSlug || "Other";
    productMRR[key] = (productMRR[key] || 0) + s.monthlyFeeKES;
  });

  // Extract all payment transactions
  const allPayments: (PaymentRecord & { invoiceNumber: string; clientName: string; product: string })[] = [];
  invoices.forEach((inv) => {
    inv.payments?.forEach((p) => {
      allPayments.push({
        ...p,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName,
        product: inv.productName,
      });
    });
  });

  allPayments.sort((a, b) => (b.receivedAt > a.receivedAt ? 1 : -1));

  return {
    totalAccountCash,
    totalReservesAllocated,
    availableOperatingCash,
    estimatedMonthlyBurn,
    estimatedRunwayMonths,
    budgetAllocated,
    budgetSpent,
    budgetUtilizationPct,
    monthlyVendorBurn,
    totalInvoiced,
    totalCollected,
    totalOutstanding,
    outstandingCount: outstandingInvoices.length,
    totalOverdue,
    overdueCount: overdueInvoices.length,
    totalExpenses,
    netProfit,
    netMarginPct,
    setupFeesCollected,
    recurringCollected,
    effectiveMRR,
    effectiveARR,
    activeSubscriptionsCount: activeSubs.length,
    productRevenue,
    productMRR,
    allPayments,
  };
}

// Currency formatting helper
export function formatKES(amount: number, currency: "KES" | "USD" = "KES"): string {
  if (currency === "USD") {
    const usd = amount / 130;
    return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `KES ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
