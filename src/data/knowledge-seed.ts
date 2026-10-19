export interface KnowledgeArticleSeed {
  id: string;
  slug: string;
  title: string;
  category: "SOP_PLAYBOOK" | "TECHNICAL_RUNBOOK" | "OBJECTION_PLAYBOOK" | "PRODUCT_FAQ" | "DECISION_RECORD" | "COMPETITOR_INTEL";
  productSlug?: string;
  productName?: string;
  summary: string;
  authorName: string;
  version: number;
  tags: string[];
  isVerified: boolean;
  nextReviewDate: string;
  updatedAt: string;
  contentMarkdown: string;
  checklists?: {
    stepOrder: number;
    title: string;
    description: string;
    roleScope: string;
  }[];
}

export interface DecisionRecordSeed {
  id: string;
  adrNumber: number;
  title: string;
  status: "ACCEPTED" | "PROPOSED" | "SUPERSEDED" | "REJECTED";
  context: string;
  decision: string;
  consequences: string;
  productSlug?: string;
  productName?: string;
  decidedBy: string;
  decidedAt: string;
}

export const KNOWLEDGE_ARTICLES: KnowledgeArticleSeed[] = [
  {
    id: "kb-etims-melio",
    slug: "melio-etims-integration-runbook",
    title: "Melio RMS: KRA eTIMS VSCU Integration & Sign-off Runbook",
    category: "TECHNICAL_RUNBOOK",
    productSlug: "melio-rms",
    productName: "Melio RMS",
    summary: "Complete technical protocol for onboarding hospitality clients to KRA eTIMS compliance via Melio RMS Virtual Sales Control Unit.",
    authorName: "Ted (Ops & Tech)",
    version: 3,
    tags: ["Melio RMS", "eTIMS", "KRA", "Hospitality", "Fiscalization", "Hardware"],
    isVerified: true,
    nextReviewDate: "2026-12-15",
    updatedAt: "2026-10-18",
    contentMarkdown: `### Overview
Melio RMS comes pre-integrated with KRA eTIMS (Virtual Sales Control Unit - VSCU) to ensure every restaurant order, bar chit, and room folio is automatically fiscalized at settlement with a valid QR code printed on thermal receipts.

### Pre-Requisites
1. Client KRA PIN certificate with active VAT registration (if turnover > KES 5M) or standard income tax registration.
2. Verified physical address, business trade license, and branch code (usually \`00\` for primary location).
3. Stable broadband connection at the POS terminal or Ethernet-enabled thermal printer.

### Technical Architecture
- **Control Unit Endpoint**: KRA Sandbox (\`https://timsinv.kra.go.ke\`) transitioned to Production once validated.
- **Payload Format**: JSON payload containing item tax rates (A=16%, B=0%, E=Exempt), PIN, Buyer PIN (if invoice > KES 10,000 or upon request), and invoice sequential counter.
- **Fallback Mode**: Offline queueing buffer supporting up to 500 sales receipts during ISP downtime, auto-syncing upon reconnection.`,
    checklists: [
      {
        stepOrder: 1,
        title: "Collect Client KRA eTIMS Credentials",
        description: "Obtain client PIN, eTIMS branch code, and generate API device certificate through the KRA taxpayer portal.",
        roleScope: "Operations Lead",
      },
      {
        stepOrder: 2,
        title: "Configure Melio RMS Fiscal Parameters",
        description: "Input Branch ID, VSCU Serial, and Tax Classification Codes (Food=16%, Alcoholic Beverages=16%, Water=16%) in Settings > Compliance.",
        roleScope: "Field Engineer",
      },
      {
        stepOrder: 3,
        title: "Run Dry-Run Test Receipt in Sandbox",
        description: "Execute a KES 10 test transaction, verify invoice QR code decodes to KRA validator URL, and confirm signature is cryptographically valid.",
        roleScope: "Technical Lead",
      },
      {
        stepOrder: 4,
        title: "Thermal Printer Alignment Check",
        description: "Test 80mm ESC/POS thermal printer to confirm QR code is dark, unclipped, and scans within 1.5 seconds on smartphone camera.",
        roleScope: "Field Engineer",
      },
      {
        stepOrder: 5,
        title: "Staff Cashier SOP Sign-Off",
        description: "Train head cashier and floor manager on handling voids, split bills, and what to do if the KRA offline indicator turns orange.",
        roleScope: "Client Success",
      },
    ],
  },
  {
    id: "kb-vehisoft-gps",
    slug: "vehisoft-fleet-gps-hardware-installation",
    title: "Vehisoft: Telematics & OBD-II GPS Hardware Installation Protocol",
    category: "TECHNICAL_RUNBOOK",
    productSlug: "vehisoft",
    productName: "Vehisoft",
    summary: "Standard procedure for physical tracker hardware installation, wiring, APN configuration, and live map telemetry verification.",
    authorName: "Ken (Telematics Tech)",
    version: 2,
    tags: ["Vehisoft", "Telematics", "GPS", "Fleet", "Hardware", "Wiring"],
    isVerified: true,
    nextReviewDate: "2026-11-30",
    updatedAt: "2026-10-14",
    contentMarkdown: `### Objectives
Ensure reliable 10-second ping telemetry for fleet clients using Vehisoft GPS tracking, engine immobilization relays, and fuel-sensor monitoring.

### Hardware Kit Checklist
- Teltonika / Concox 4G Telematics Unit
- Safaricom M2M Data SIM (with at least 500MB monthly APN package)
- 12V/24V 40A Automotive Relay for remote cutoff
- In-line fuse holder (2A)
- Heat shrink tubing and automotive electrical tape

### Critical Safety Precautions
- Always disconnect the vehicle negative battery terminal prior to splicing ignition circuits.
- Solder all connections; do not use quick-splice tap connectors which corrode under vehicle vibration.
- Position the GPS ceramic antenna facing upward toward the sky under non-metallic dashboard trim.`,
    checklists: [
      {
        stepOrder: 1,
        title: "Pre-Installation SIM & APN Activation",
        description: "Verify M2M SIM has active Safaricom data bundles and set APN to 'safaricom' with ping interval at 10s moving / 300s parked.",
        roleScope: "Field Engineer",
      },
      {
        stepOrder: 2,
        title: "Vehicle Pre-Inspection & Battery Check",
        description: "Measure resting battery voltage (>12.4V) and document any existing dashboard warning lights with the garage supervisor.",
        roleScope: "Field Technician",
      },
      {
        stepOrder: 3,
        title: "Ignition Sense & Cutoff Relay Wiring",
        description: "Tap into genuine IGN line (must hold 12V while cranking) and solder starter motor interrupt relay in series.",
        roleScope: "Auto Electrician",
      },
      {
        stepOrder: 4,
        title: "Live Cloud Telemetry Verification in Vehisoft Core",
        description: "Confirm vehicle coordinates show accurate position on Nairobi map, ignition toggle reflects live key turn, and battery voltage reports correctly.",
        roleScope: "Technical Lead",
      },
      {
        stepOrder: 5,
        title: "Client Fleet Manager Onboarding Walkthrough",
        description: "Walk client through speed-limit alert geofencing, daily trip log playback, and SMS command authorization.",
        roleScope: "Client Success",
      },
    ],
  },
  {
    id: "kb-adversoft-sop",
    slug: "adversoft-billboard-site-audit-and-proof-of-posting",
    title: "Adversoft: Billboard Site Audit & Proof-of-Posting SOP",
    category: "SOP_PLAYBOOK",
    productSlug: "adversoft",
    productName: "Adversoft",
    summary: "Operational standard for capturing high-resolution installation proofs, lighting audits, and auto-dispatching proof-of-posting PDF certificates.",
    authorName: "Ted (Ops & Tech)",
    version: 4,
    tags: ["Adversoft", "Signage", "Proof of Posting", "SOP", "Site Audit", "Outdoor"],
    isVerified: true,
    nextReviewDate: "2027-01-10",
    updatedAt: "2026-10-16",
    contentMarkdown: `### Standard Operating Procedure
Clients who invest in premium static or digital billboards require absolute proof that their vinyl print was mounted on time, illuminated throughout the contract period, and maintained without tear or graffiti.

### Photo Capture Specifications
1. **Wide Shot**: 50 meters away showing traffic visibility, street context, and lack of visual obstructions (trees, utility poles).
2. **Close-Up Shot**: Showing tensioning quality, seam alignment, and clean edge finishing.
3. **Night Illumination Shot**: Captured between 7:30 PM - 9:00 PM demonstrating functional floodlights and even spread.
4. **Metadata Requirement**: GPS coordinates and timestamp watermarked directly on image file via Adversoft Mobile Field App.`,
    checklists: [
      {
        stepOrder: 1,
        title: "Rigger Flight Crew Check-In",
        description: "Rigger logs arrival at site location via mobile link; verifies vinyl matches approved client artwork proof number.",
        roleScope: "Field Crew Lead",
      },
      {
        stepOrder: 2,
        title: "Installation & Safety Tension Inspection",
        description: "Mount vinyl using ratchet straps or perimeter eyelets; inspect for wind wrinkles and mechanical security.",
        roleScope: "Field Crew Lead",
      },
      {
        stepOrder: 3,
        title: "Upload Daylight & Night Photographs",
        description: "Submit 3 high-res photos into Adversoft Site Job portal with geotag and timestamp validation.",
        roleScope: "Field Crew Lead",
      },
      {
        stepOrder: 4,
        title: "Generate Proof-of-Posting Certificate",
        description: "Click 'Generate POP Certificate' in Adversoft; verify client contact email and campaign duration dates.",
        roleScope: "Operations Coordinator",
      },
      {
        stepOrder: 5,
        title: "Deliver WhatsApp & Email Notification to Brand Manager",
        description: "Auto-send the certificate link and notification message to the client media buyer within 4 hours of job completion.",
        roleScope: "Client Success",
      },
    ],
  },
  {
    id: "kb-objection-excel",
    slug: "sales-objection-playbook-we-already-use-excel",
    title: "Sales Objection Playbook: 'We Already Run Everything on Excel / Notebooks'",
    category: "OBJECTION_PLAYBOOK",
    summary: "Tactical, empathetic, and revenue-focused responses when prospects claim their current spreadsheet or paper ledger is 'good enough'.",
    authorName: "Ted (Sales & Strategy)",
    version: 2,
    tags: ["Sales", "Objection Handling", "Playbook", "Pricing", "Conversion", "All Products"],
    isVerified: true,
    nextReviewDate: "2026-12-01",
    updatedAt: "2026-10-15",
    contentMarkdown: `### The Root Concern
When a Kenyan SME owner says *"Tuko sawa na Excel"* or *"We have a book we write in"*, they are rarely defending Excel's features. They are really saying:
1. *"I don't want to spend money on another complicated software that my staff won't use."*
2. *"I don't have time to spend weeks learning a new system."*
3. *"I'm afraid of changing something that is currently working without breaking my shop."*

### The Winning Reframe: The 3 'Leaky Bucket' Tests
Do not attack Excel. Validate that Excel was the right tool when they started, then guide them through the three things Excel cannot do:

#### 1. The Mobile Blindspot Test
> *"Excel is fantastic when you're sitting behind your laptop at 9:00 PM. But when a customer calls you while you are in traffic or away from the shop, can your phone show you in 3 seconds whether that vehicle parts order was dispatched or if that room is booked without calling 3 staff members?"*

#### 2. The Staff Theft & Audit Test
> *"In Excel, anyone who has edit access can change yesterday's payment from KES 4,500 to KES 2,500 and pocket the KES 2,000 cash difference without leaving any audit trace. With Versaly Core systems, every M-Pesa code and cash entry is cryptographically matched and tamper-proof."*

#### 3. The Auto-Client Follow-Up Test
> *"Does your Excel spreadsheet automatically send an M-Pesa payment reminder to 15 overdue clients on Friday morning at 8:00 AM? Or does that require 2 hours of manual WhatsApp typing?"*

### The Risk-Free Close (Founding Guarantee)
> *"Let us set you up for 14 days alongside your notebook. If your staff don't find it 10x easier and you don't catch at least KES 15,000 in saved time or unpaid balances, we refund 100% of your setup fee immediately. You risk zero shillings."*`,
    checklists: [
      {
        stepOrder: 1,
        title: "Acknowledge and Validate",
        description: "Praise their operational discipline for maintaining records in Excel to build rapport.",
        roleScope: "Sales Rep",
      },
      {
        stepOrder: 2,
        title: "Ask the Staff Dependency Question",
        description: "Ask: 'If your head cashier or mechanic is away sick tomorrow, can someone else operate with 100% accuracy?'",
        roleScope: "Sales Rep",
      },
      {
        stepOrder: 3,
        title: "Demonstrate 30-Second Mobile Flow",
        description: "Show a live transaction flow on a smartphone during the demo to prove speed.",
        roleScope: "Sales Rep",
      },
      {
        stepOrder: 4,
        title: "Present the 14-Day Founding Client Guarantee",
        description: "Offer the zero-risk pilot guarantee in the written proposal summary.",
        roleScope: "Sales Rep",
      },
    ],
  },
  {
    id: "kb-versandry-sop",
    slug: "versandry-dry-cleaning-tagging-and-barcode-workflow",
    title: "Versandry: Garment Tagging, Barcode Tracking & Express Dispatch SOP",
    category: "SOP_PLAYBOOK",
    productSlug: "versandry",
    productName: "Versandry",
    summary: "Step-by-step workflow for garment intake, stain classification, heat-seal barcode tagging, wash-cycle tracking, and automated client SMS pickup alerts.",
    authorName: "Sarah (Operations Consultant)",
    version: 3,
    tags: ["Versandry", "Laundry", "Dry Cleaning", "Barcoding", "SMS", "Intake"],
    isVerified: true,
    nextReviewDate: "2026-11-20",
    updatedAt: "2026-10-12",
    contentMarkdown: `### Intake Standards
Garment loss, missing buttons, and disputed tears represent 80% of customer dissatisfaction in commercial dry cleaning. Versandry solves this with intake photo logging and heat-seal thermal poly-tags.

### Workflow Sequence
1. **Counter Inspection**: Check pockets, note fabric composition (Silk, Wool, Linen, Cotton), and mark pre-existing damage.
2. **Tagging**: Affix waterproof thermal barcode tag to garment label or buttonhole.
3. **Service Tier Routing**: Tag automatically assigns route: Normal Wash (48h), Express Dry Clean (24h), or VIP Same-Day (8h).
4. **Completion Alert**: System triggers automated SMS with M-Pesa paybill instructions when tagged items hit the packing bay.`,
    checklists: [
      {
        stepOrder: 1,
        title: "Pocket Check & Pre-Damage Documentation",
        description: "Inspect garment with customer present; log any tear or stain photo into Versandry Intake Tablet.",
        roleScope: "Front Desk Cashier",
      },
      {
        stepOrder: 2,
        title: "Affix Thermal Waterproof Barcode Tag",
        description: "Print thermal tag and attach firmly to garment care label; scan barcode to bind to customer account.",
        roleScope: "Front Desk Cashier",
      },
      {
        stepOrder: 3,
        title: "Sort into Color & Fabric Hamper Bins",
        description: "Route tagged items to respective sorting bays (Whites, Dark Woolens, Delicates, Industrial).",
        roleScope: "Plant Operator",
      },
      {
        stepOrder: 4,
        title: "Quality Check & Steam Finish Scan",
        description: "Perform post-clean inspection; scan item barcode at packaging station to trigger automated Ready SMS.",
        roleScope: "Finishing Specialist",
      },
      {
        stepOrder: 5,
        title: "M-Pesa Settlement at Collection",
        description: "Scan customer collection QR code from their SMS; accept M-Pesa STK push and hand over packaged garments.",
        roleScope: "Front Desk Cashier",
      },
    ],
  },
  {
    id: "kb-lipatim-playbook",
    slug: "lipatim-mpesa-disbursement-and-escrow-security",
    title: "LipaTim: B2C M-Pesa Disbursement & Dual-Authorization Security Playbook",
    category: "TECHNICAL_RUNBOOK",
    productSlug: "lipatim",
    productName: "LipaTim",
    summary: "Security protocols and limits for corporate multi-tier approval, Safaricom Daraja B2C payout keys, and daily liquidity reconciliation.",
    authorName: "Ted (Ops & Tech)",
    version: 2,
    tags: ["LipaTim", "M-Pesa", "Fintech", "Daraja API", "Security", "Escrow"],
    isVerified: true,
    nextReviewDate: "2026-12-30",
    updatedAt: "2026-10-17",
    contentMarkdown: `### Purpose
LipaTim handles high-velocity payroll, supplier payouts, and commission disbursements via Safaricom Daraja B2C APIs. Strict dual-authorization prevents unauthorized withdrawals and rogue batch transactions.

### Key Security Policies
- **Maker-Checker Rule**: Any batch payout exceeding KES 50,000 requires initiation by an Operations Manager ('Maker') and cryptographic approval by the Finance Director ('Checker').
- **IP Whitelisting**: Daraja API credentials will only accept requests originating from Versaly's dedicated static production IPs.
- **Velocity Throttling**: Maximum 100 transactions per minute with automatic kill-switch if failure rate exceeds 5%.`,
    checklists: [
      {
        stepOrder: 1,
        title: "Maker Batch Compilation",
        description: "Upload verified CSV containing recipient Phone Numbers, Full Names, Amounts, and Reference Codes.",
        roleScope: "Payroll / Operations Manager",
      },
      {
        stepOrder: 2,
        title: "KYC & Phone Number Format Validation",
        description: "Run automated Safaricom Daraja Name Inquiry check to confirm recipient phone matches account name.",
        roleScope: "LipaTim Automated Engine",
      },
      {
        stepOrder: 3,
        title: "Checker Multi-Factor SMS / TOTP Sign-Off",
        description: "Authorized Finance Director reviews disbursement total and signs off via 6-digit TOTP hardware token.",
        roleScope: "Finance Director",
      },
      {
        stepOrder: 4,
        title: "Execute Daraja B2C Payout Queue",
        description: "Dispatch payload to Safaricom B2C endpoint with 3-second pacing between batches.",
        roleScope: "LipaTim Engine",
      },
      {
        stepOrder: 5,
        title: "Immediate Bank & M-Pesa Float Balance Reconciliation",
        description: "Download Safaricom settlement statement and confirm closing float balance matches ledger within 15 minutes.",
        roleScope: "Finance Accountant",
      },
    ],
  },
];

export const ARCHITECTURAL_DECISIONS: DecisionRecordSeed[] = [
  {
    id: "adr-001",
    adrNumber: 1,
    title: "ADR 001: Unified Relational Core Database over Distributed Micro-Databases",
    status: "ACCEPTED",
    context:
      "Versaly operates 5 vertical software products (Adversoft, Vehisoft, Versandry, LipaTim, Melio RMS) alongside CRM and internal operations. We needed to choose between separate isolated databases per product vs. a single interconnected relational schema.",
    decision:
      "We adopted a unified PostgreSQL relational core using Prisma ORM with strict multi-tenancy tags and product slugs ('adversoft', 'vehisoft', etc.). One canonical Organization and Person record anchors all subscriptions, deals, onboarding projects, and invoices.",
    consequences:
      "Eliminates data duplication, enables cross-selling insights across products, and permits instant client history viewing from first contact to renewal without distributed sync latency.",
    productSlug: undefined,
    productName: "Versaly Core Architecture",
    decidedBy: "Ted (Founder & Architect)",
    decidedAt: "2026-09-15",
  },
  {
    id: "adr-002",
    adrNumber: 2,
    title: "ADR 002: Two-Tier Sales Pipeline Architecture (Raw Leads vs. Active Deals)",
    status: "ACCEPTED",
    context:
      "Mass outreach lead lists (walk-in surveys, business directories, social scraping) previously polluted active CRM pipelines with hundreds of uncontacted, low-intent records, corrupting sales velocity metrics.",
    decision:
      "We split sales tracking into two distinct tiers: Tier 1 is an uncontacted Raw Leads pool. Tier 2 is an active 6-stage Kanban Pipeline. Leads enter the active pipeline ONLY after a verified first contact (call, in-person visit, or email).",
    consequences:
      "Sales conversion rates remain mathematically rigorous, daily follow-up lists are uncluttered, and sales reps can qualify raw lists without skewing revenue forecasting.",
    productSlug: undefined,
    productName: "Versaly Sales & CRM",
    decidedBy: "Ted (Founder)",
    decidedAt: "2026-10-02",
  },
  {
    id: "adr-003",
    adrNumber: 3,
    title: "ADR 003: Standardized 8-Step Client Onboarding System for Won Deals",
    status: "ACCEPTED",
    context:
      "Customer onboarding was prone to inconsistent delivery times, delayed payment confirmations, and slow training handoffs, delaying client 'First Measurable Win'.",
    decision:
      "Automated creation of an 8-step standardized Onboarding Project upon marking any deal 'WON'. All 5 products follow the same structured milestones from Agreement -> Payment -> Hardware/Config -> Training -> First Live Win -> 30-Day Referral Review.",
    consequences:
      "Average time-to-value drops from 21 days to under 5 days, customer satisfaction increases, and renewal health starts on day 1 with explicit blocker tracking.",
    productSlug: undefined,
    productName: "Client Operations",
    decidedBy: "Ted (Ops & Client Success)",
    decidedAt: "2026-10-10",
  },
  {
    id: "adr-004",
    adrNumber: 4,
    title: "ADR 004: Direct KRA eTIMS VSCU Integration in Melio RMS",
    status: "ACCEPTED",
    context:
      "Kenya Revenue Authority (KRA) mandates electronic tax invoice management (eTIMS) for all VAT and income tax registered businesses. Third-party fiscal box hardware is expensive and prone to physical breakdown.",
    decision:
      "Build a software-based Virtual Sales Control Unit (VSCU) direct integration into Melio RMS with offline queueing buffers rather than relying on external physical hardware boxes.",
    consequences:
      "Reduces hardware setup costs for restaurant and bar clients by KES 45,000, provides instant cryptographic QR codes on 80mm thermal printers, and positions Melio as the most compliant hospitality POS in Kenya.",
    productSlug: "melio-rms",
    productName: "Melio RMS",
    decidedBy: "Ted & Technical Advisory",
    decidedAt: "2026-10-12",
  },
];
