export interface SeedDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number; // in bytes
  fileSizeFormatted: string;
  mimeType: string;
  category: "CONTRACT" | "PROPOSAL" | "SALES_SHEET" | "ONBOARDING_KIT" | "TECHNICAL_SPEC" | "FINANCIAL";
  productSlug: string;
  productName: string;
  entityName?: string;
  tags: string[];
  version: number;
  updatedAt: string;
}

export interface SeedTemplate {
  id: string;
  slug: string;
  title: string;
  category: "CONTRACT" | "PROPOSAL" | "OUTREACH" | "ONBOARDING" | "FINANCIAL";
  productSlug?: string;
  productName?: string;
  description: string;
  variables: { key: string; label: string; defaultValue: string }[];
  content: string;
}

export const SEED_TEMPLATES: SeedTemplate[] = [
  {
    id: "tpl-msa",
    slug: "master-services-agreement",
    title: "Master Services Agreement (MSA) & SLA",
    category: "CONTRACT",
    description: "Standard commercial contract governing setup, monthly SaaS, data protection, and founding-client guarantees.",
    variables: [
      { key: "client_name", label: "Client Organization", defaultValue: "Safari Auto Clinic" },
      { key: "client_pin", label: "KRA Tax PIN", defaultValue: "P051239841Z" },
      { key: "product_name", label: "Subscribed Solution", defaultValue: "Vehisoft Automotive Management" },
      { key: "setup_fee", label: "Setup & Implementation Fee (KES)", defaultValue: "35,000" },
      { key: "monthly_fee", label: "Monthly Recurring Fee (KES)", defaultValue: "12,500" },
      { key: "effective_date", label: "Effective Start Date", defaultValue: "November 1, 2026" },
      { key: "guarantee_term", label: "Founding Guarantee", defaultValue: "14-Day Live Workshop Go-Live Guarantee" },
    ],
    content: `# MASTER SERVICES AGREEMENT (MSA)

**Effective Date:** {{effective_date}}
**Between:** Versaly Operations Ltd ("Versaly")
**And:** {{client_name}} ("Client"), KRA PIN: {{client_pin}}

---

### 1. Scope of Services & Software Subscription
Versaly grants the Client a non-exclusive subscription to **{{product_name}}**, including software provisioning, cloud hosting, automated data backups, and technical support.

### 2. Fees & Commercial Terms
- **Implementation & Setup Fee:** KES {{setup_fee}} (one-time payment upon contract signing)
- **Monthly Subscription (MRR):** KES {{monthly_fee}} per month, payable via M-Pesa Paybill or Bank Transfer within 7 days of invoice.

### 3. Founding Client Guarantee
Versaly extends the **{{guarantee_term}}**. If the Client's operations team is not fully onboarded and live within the agreed timeline, Versaly will refund the implementation fee in full.

### 4. Data Ownership & Security
All operational records, client databases, job cards, and financial transactions generated within {{product_name}} remain the exclusive property of {{client_name}}.

**Signatures:**

_________________________
**Ted Khalwale**
Founder, Versaly Operations Ltd

_________________________
**Authorized Signatory**
{{client_name}}
`,
  },
  {
    id: "tpl-proposal",
    slug: "commercial-proposal",
    title: "Executive Commercial Proposal & ROI Brief",
    category: "PROPOSAL",
    description: "High-converting proposal tailored to client bottlenecks, pricing tiers, and timeline to first result.",
    variables: [
      { key: "client_name", label: "Client Organization", defaultValue: "Apex Auto Clinic" },
      { key: "contact_name", label: "Decision Maker Name", defaultValue: "James Mwangi" },
      { key: "product_name", label: "Recommended Product", defaultValue: "Vehisoft" },
      { key: "primary_pain_point", label: "Primary Bottleneck", defaultValue: "Parts leakage and manual paper job cards" },
      { key: "setup_fee", label: "Setup Fee (KES)", defaultValue: "35,000" },
      { key: "monthly_fee", label: "Monthly SaaS (KES)", defaultValue: "12,500" },
      { key: "onboarding_days", label: "Timeline to Go-Live", defaultValue: "5 business days" },
    ],
    content: `# EXECUTIVE COMMERCIAL PROPOSAL

**Prepared For:** {{contact_name}}, {{client_name}}
**Prepared By:** Versaly Operations
**Product Solution:** {{product_name}}

---

### Executive Summary
Following our consultation, Versaly is pleased to propose deploying **{{product_name}}** to eliminate {{primary_pain_point}} at {{client_name}}.

### The Solution: What Changes
1. **Intake to Delivery in Minutes:** Every vehicle/order is assigned a digital barcode job card.
2. **Accountability:** Mechanics/operators log parts depletion in real time, preventing unauthorized inventory leakage.
3. **Automated Customer Communication:** Automated WhatsApp & SMS notifications sent upon completion with instant M-Pesa prompt.

### Investment Structure
- **Setup & Bay Configuration:** KES {{setup_fee}} (Includes database import, parts price setup & staff training)
- **Ongoing Cloud Subscription:** KES {{monthly_fee}} / month

### Implementation Timeline
- **Day 1–2:** Account provisioning & inventory parts list import.
- **Day 3–4:** Hands-on staff training during live shift.
- **Day 5:** First live transaction & system go-live.
`,
  },
  {
    id: "tpl-whatsapp-outreach",
    slug: "whatsapp-cold-sequence",
    title: "WhatsApp 3-Stage Outreach Script",
    category: "OUTREACH",
    description: "Battle-tested WhatsApp conversational sequence designed for local Kenyan business owners.",
    variables: [
      { key: "contact_name", label: "Owner First Name", defaultValue: "Grace" },
      { key: "business_name", label: "Business Name", defaultValue: "Prime Clean Laundromat" },
      { key: "product_name", label: "Product Offering", defaultValue: "Versandry" },
      { key: "key_benefit", label: "Core Business Win", defaultValue: "notifying customers on WhatsApp when clothes are ready so bags don't pile up" },
    ],
    content: `*Stage 1: Friendly Introduction*
"Hi {{contact_name}}, hope you're having a productive week! I run Versaly and work with dry cleaners and laundromats in Nairobi. 

We built {{product_name}} specifically for {{key_benefit}} and stopping lost clothes disputes with barcode tags. 

Could I pass by {{business_name}} for 7 minutes on Tuesday to show you a quick demo on your phone? No pressure at all."

*Stage 2: 48-Hour Soft Follow-up*
"Hi {{contact_name}}, just checking if you saw my note above! Even if you currently use paper tickets, I can send a 90-second video demo showing how {{business_name}} can save 2 hours of admin daily."

*Stage 3: Referral / Closing Door*
"Hi {{contact_name}}, completely understand if you're fully sorted right now! I'll hold off following up. If you ever need to automate client pickup reminders or M-Pesa reconciliation, feel free to reach back out anytime."
`,
  },
  {
    id: "tpl-onboarding-brief",
    slug: "8-step-onboarding-brief",
    title: "Client 8-Step Onboarding Charter",
    category: "ONBOARDING",
    description: "Standard project charter tracking agreement, payment, technical configuration, and first measurable win.",
    variables: [
      { key: "client_name", label: "Client Organization", defaultValue: "Safari Auto Clinic" },
      { key: "product_name", label: "Deployed Solution", defaultValue: "Vehisoft" },
      { key: "lead_architect", label: "Assigned Lead", defaultValue: "Ted Khalwale" },
      { key: "go_live_target", label: "Target Go-Live Date", defaultValue: "October 25, 2026" },
    ],
    content: `# CLIENT 8-STEP ONBOARDING CHARTER

**Client:** {{client_name}} | **Solution:** {{product_name}} | **Lead:** {{lead_architect}}
**Target Go-Live:** {{go_live_target}}

---

### The 8 Milestone Deliverables
- [x] **Step 1:** Agreement & Payment instructions dispatched
- [x] **Step 2:** Setup fee payment confirmed via M-Pesa / Bank
- [ ] **Step 3:** Collect client business data & user lists
- [ ] **Step 4:** Product deployment & environment configuration
- [ ] **Step 5:** Staff and owner operational training session
- [ ] **Step 6:** Supervise first live transaction on {{product_name}}
- [ ] **Step 7:** Confirm first measurable business win
- [ ] **Step 8:** 30-Day health check & business referral request
`,
  },
];

export const SEED_DOCUMENTS: SeedDocument[] = [
  {
    id: "doc-1",
    title: "Adversoft 1-Page Signage & Billboard Executive Sheet",
    fileName: "Adversoft_Executive_Sales_Sheet_v1.pdf",
    fileSize: 420000,
    fileSizeFormatted: "420 KB",
    mimeType: "application/pdf",
    category: "SALES_SHEET",
    productSlug: "adversoft",
    productName: "Adversoft",
    tags: ["Sales Sheet", "ROI", "Billboard Operators"],
    version: 2,
    updatedAt: "Today 08:35 AM",
  },
  {
    id: "doc-2",
    title: "Vehisoft Automotive Workshop 1-Page Pitch Brief",
    fileName: "Vehisoft_Workshop_Pitch_v2.pdf",
    fileSize: 380000,
    fileSizeFormatted: "380 KB",
    mimeType: "application/pdf",
    category: "SALES_SHEET",
    productSlug: "vehisoft",
    productName: "Vehisoft",
    tags: ["Sales Sheet", "Garages", "Parts Management"],
    version: 3,
    updatedAt: "Oct 18, 2026",
  },
  {
    id: "doc-3",
    title: "Versandry Laundry Enterprise Workflow Sheet",
    fileName: "Versandry_Laundry_Overview_v1.pdf",
    fileSize: 310000,
    fileSizeFormatted: "310 KB",
    mimeType: "application/pdf",
    category: "SALES_SHEET",
    productSlug: "versandry",
    productName: "Versandry",
    tags: ["Sales Sheet", "Laundromats", "Dry Cleaners"],
    version: 1,
    updatedAt: "Oct 17, 2026",
  },
  {
    id: "doc-4",
    title: "LipaTim Fintech & M-Pesa Invoicing Technical Primer",
    fileName: "LipaTim_Technical_Architecture_Spec.pdf",
    fileSize: 650000,
    fileSizeFormatted: "650 KB",
    mimeType: "application/pdf",
    category: "TECHNICAL_SPEC",
    productSlug: "lipatim",
    productName: "LipaTim",
    tags: ["KRA eTIMS", "M-Pesa API", "Billing"],
    version: 4,
    updatedAt: "Oct 15, 2026",
  },
  {
    id: "doc-5",
    title: "Melio RMS Touchscreen POS & KDS Sales Brief",
    fileName: "Melio_RMS_Restaurant_Brief.pdf",
    fileSize: 490000,
    fileSizeFormatted: "490 KB",
    mimeType: "application/pdf",
    category: "SALES_SHEET",
    productSlug: "melio-rms",
    productName: "Melio RMS",
    tags: ["POS", "Restaurants", "KDS"],
    version: 2,
    updatedAt: "Oct 14, 2026",
  },
  {
    id: "doc-7",
    title: "KRA eTIMS API Sandbox & Electronic Invoicing Reference",
    fileName: "KRA_eTIMS_Technical_Integration_Guide.pdf",
    fileSize: 1200000,
    fileSizeFormatted: "1.2 MB",
    mimeType: "application/pdf",
    category: "TECHNICAL_SPEC",
    productSlug: "lipatim",
    productName: "LipaTim",
    tags: ["KRA Compliance", "Tax Clearance"],
    version: 1,
    updatedAt: "Oct 10, 2026",
  },
];
