# Versaly Core — Complete System Overview & Capabilities Reference

Versaly Core is an all-in-one **Business Operating System (BOS)** built specifically for high-velocity B2B service and vertical SaaS operations (including the four-product launch suite: **Adversoft**, **Vehisoft**, **Versandry**, and **LipaTim**).

Unlike generic CRMs or isolated project management tools, Versaly Core unifies sales outreach, client relationship management, project onboarding, automated daily execution rhythms, multichannel communications, financial tracking, digital and offline marketing, and AI-grounded operational intelligence into a single platform.

---

## Architecture & Technology Stack

- **Framework**: Next.js 15 (App Router, Server & Client Components)
- **Styling**: Tailwind CSS, Radix UI primitives, Lucide Icons, Glassmorphism design system
- **State & Persistence**: Local-first architecture with automatic schema initialization, persistent local state storage, and resilient zero-state handling (cleared/empty states are never overwritten by demo seeds).
- **Deployment**: Vercel Serverless Production ([versaly-core.vercel.app](https://versaly-core.vercel.app))
- **Live Routes**: 41 distinct production routes.

---

## 1. Operations Domain

### [Company Dashboard](src/app/dashboard/page.tsx)
- **Executive Metric Cockpit**: Real-time business telemetry grouped into 4 primary views:
  1. **Money & Revenue**: Month-to-date collected cash, Setup Fees vs Launch Target (KES 520,000), MRR vs Launch Target (KES 120,000), ARR projection, Outstanding Invoices, Overdue Balances, Average Revenue Per Client (ARPU), and Product-wise breakdown.
  2. **Daily Sales Activity**: Daily outreach counter, weekly volume, new leads captured, outreach conversion rates, demos booked vs completed, proposals sent, and win/loss counts.
  3. **Pipeline Health**: Total pipeline value, probability-weighted deal value, pipeline velocity, stage distribution, and product distribution.
  4. **Client & Delivery Health**: Active onboarding projects, delivery bottleneck alerts, churn risk signals, SLA health, and customer satisfaction index.
- **Actionable Alerts**: Immediate visibility into overdue follow-ups, pending invoices, and stalled client handoffs.

### [My Workspace](src/app/workspace/page.tsx)
- Personal command center focused on today's priorities.
- Quick-action dials for logging prospect calls, creating quick notes, booking demos, and recording incoming cash.
- Personal streak counter and daily completion badge.

### [Daily Tasks & Outreach](src/app/tasks/page.tsx)
- **Automated 5:00 AM Reset Rhythm**: Configured with automated midnight/5:00 AM recurring triggers that reset daily checklist actions while maintaining lifetime completion statistics and active streaks.
- **Customizable Card Management**: Full CRUD support to add, edit, or delete any task card, recurring routine, or ad-hoc operational requirement.
- **Pre-loaded Launch Rhythms**:
  - Morning cold-calling & outreach blocks (30 calls/messages per session).
  - Outbound phone pitches and virtual demo slots for car dealerships, estate laundries, retail merchants, and billboard agencies.
  - Afternoon demos, onboarding walkthroughs, and weekly financial reconciliation.

### [Business Calendar](src/app/calendar/page.tsx)
- **Interactive Multi-view Calendar**: Full month, week, and day grid views rendered underneath the executive briefing.
- **Unified Schedule Aggregation**: Synchronizes walk-ins, phone pitches, product demos, onboarding milestones, contract renewals, and payment due dates.
- **Event Management**: Create, reschedule, edit, and filter appointments by category (Sales, Delivery, Finance, Operations).

### [Activity Timeline](src/app/activity/page.tsx)
- **Universal Business History Ledger**: Chronological stream of all operational events across the company.
- Real-time event tagging across 6 domains: Lead contact, proposal issuance, contract signature, project milestone, invoice payment, and client note.
- Filterable by entity, date range, and importance level.

---

## 2. Relationships Domain (CRM & Communications)

### [Leads & Pipeline](src/app/leads/page.tsx)
- **Visual Kanban Board with Drag-and-Drop**: Interactive deal board allowing drag-and-drop progression of prospects across deal stages:
  - `Prospect` → `Contacted` → `Demo Scheduled` → `Proposal Sent` → `Negotiation` → `Won` / `Lost`.
- **Dual View**: Toggle between the high-touch Kanban pipeline and tabular data view.
- **Full Lead CRUD**: Add, inspect, edit deal size, update product association, assign probability, or archive records.

### [Clients & Renewals](src/app/clients/page.tsx)
- Central directory of all active paying accounts.
- Tracks contract start dates, renewal windows, assigned account managers, current subscription tier, and health status (Healthy, At Risk, Churned).
- Client drill-down view showing historical activities, active projects, and associated invoices.

### [People & Network](src/app/people/page.tsx)
- Stakeholder relationship manager covering client decision-makers, internal team members, external vendors, and integration partners (e.g., KRA eTIMS integrators).
- Direct CRUD interface to add, edit, or delete contacts with role, phone, email, and company affiliations.

### [Directory (Organizations)](src/app/directory/page.tsx)
- Company and account-level directory grouping multiple stakeholders and contacts under single corporate umbrellas.
- Tracks company size, industry classification, physical location, and commercial account tier.

### [Omnichannel Communications](src/app/communications/page.tsx)
- Unified inbox capturing outreach across WhatsApp, Phone Calls, Email, and In-Person Visits.
- Message logging, quick-reply templates for launch scripts, and communication summaries by client.

---

## 3. Marketing Engine Domain

### [Marketing Dashboard](src/app/marketing/page.tsx)
- High-level marketing intelligence dashboard tracking:
  - Total Spend vs Return on Ad Spend (ROAS).
  - Customer Acquisition Cost (CAC) and Cost per Lead (CPL).
  - Blended attribution across Meta Ads, Google Search, LinkedIn, and Local Billboard activations.
- Campaign conversion funnel from impression to closed customer.

### [Campaigns](src/app/marketing/campaigns/page.tsx)
- Campaign lifecycle manager (Draft, Active, Paused, Completed).
- Tracks individual campaign budgets, channels, objective types (Lead Gen, Awareness, Conversions), and actual ROI.
- Comprehensive modal to launch new campaigns, tweak flight dates, or terminate underperforming ads.

### [Ad Spend & Budget Tracking](src/app/marketing/spend/page.tsx)
- Detailed financial ledger for every marketing expense.
- Segregates digital platforms (Meta, Google, TikTok, LinkedIn) from offline advertising (billboards, print fliers, local sponsorships).
- Live currency conversions, invoice attachment reference, and real-time variance against monthly marketing budget caps.

### [Content & Social Media](src/app/marketing/content/page.tsx)
- Content publishing editorial schedule with platform tagging (LinkedIn, X / Twitter, Instagram, TikTok, YouTube).
- Tracks publishing status (Draft, Scheduled, Published), target copy, asset links, and post engagement analytics.

### [Creative & Media Assets](src/app/marketing/creatives/page.tsx)
- Digital asset library storing marketing creatives, pitch decks, video scripts, ad banners, and one-pagers.
- Search and filter by product line (Vehisoft, Adversoft, Versandry, LipaTim), media format, and status.

### [Marketing Reports & Attribution](src/app/marketing/reports/page.tsx)
- Deep-dive unit economics and performance analytics.
- Channel breakdown comparing acquisition efficiency, lead velocity, and payback periods across inbound and outbound channels.

---

## 4. Delivery & Fulfillment Domain

### [Projects & Onboarding](src/app/projects/page.tsx)
- Client onboarding and implementation tracker.
- Milestone checkpoints, onboarding timelines, technical blockers, and target go-live dates.

### [Products & Offers](src/app/products/page.tsx)
- Interactive catalog of all company products and commercial packaging.
- Supports complete CRUD: Add new software products, edit setup fees, configure monthly subscription pricing, specify feature lists, or archive sunsetted packages.
- Pre-configured with the core launch suite:
  - **Adversoft**: Billboard & Digital Screen Management Suite.
  - **Vehisoft**: Automotive Dealership DMS & Inventory Management.
  - **Versandry**: Commercial Laundry POS & Order Tracking.
  - **LipaTim**: Retail & POS Cashier with direct KRA eTIMS compliance.

### [Support & Issues](src/app/support/page.tsx)
- Central ticket queue for customer bugs, configuration requests, and feature inquiries.
- Priority scoring (Low, Medium, High, Urgent), SLA timers, and client assignment.

---

## 5. Knowledge & Strategy Domain

### [Documents & Templates](src/app/documents/page.tsx)
- Repository for client agreements, non-disclosure agreements (NDAs), sales pitch decks, and standard proposal templates.
- One-click document preview and metadata tagging.

### [Knowledge Base & SOPs](src/app/knowledge/page.tsx)
- Internal standard operating procedures (SOPs), sales playbooks, objection-handling scripts, and technical deployment guides.

### [Notes & Scratchpad](src/app/notes/page.tsx)
- Quick-capture scratchpad for call minutes, strategy brainstorming, and impromptu client notes.
- Rich-text markdown support and tag-based organization.

---

## 6. Financial Management Domain

### [Finance & Invoicing](src/app/finance/page.tsx)
- **Cash Flow Tracking**: Invoices issued, cash collected, and outstanding balances.
- **Payment Method Support**: M-Pesa Till / Paybill reconciliation, bank transfer matching, and manual cash receipts.
- **Status Workflows**: Draft, Sent, Paid, Overdue, or Voided with PDF generation capabilities.

---

## 7. AI & Intelligence Domain

### [AI Grounded Assistant](src/app/assistant/page.tsx)
- Context-aware natural language assistant indexed against the live business database.
- Answer queries such as:
  - *"Which invoices are currently overdue?"*
  - *"Summarize our sales pipeline for Vehisoft this month."*
  - *"Draft a follow-up WhatsApp message for leads who attended demos yesterday."*

### [AI Supervised Co-Pilot](src/app/assistant/copilot/page.tsx)
- Autonomous operational co-pilot capable of preparing morning briefings, auditing stalled deals, drafting cold outreach scripts, and highlighting high-risk accounts.

### [Attention & Approvals](src/app/attention/page.tsx)
- High-priority inbox for items requiring executive decision-making: large discount approvals, contract signing authorizations, and urgent SLA breaches.

### [Insights & Reports](src/app/reports/page.tsx)
- Automated cross-system business reporting analyzing MRR growth, sales cycle length, deal conversion bottlenecks, and team velocity.

---

## 8. System Administration & Automations

### [Workspace Settings](src/app/settings/page.tsx)
- Global company metadata, currency settings (KES default), working hours, and branding configurations.

### [Automations & Rules](src/app/settings/automations/page.tsx)
- Event-driven rule builder:
  - Automatically create onboarding projects when a deal is marked "Won".
  - Trigger follow-up reminders 48 hours after a demo is completed.
  - Trigger payment reminders 3 days before an invoice due date.

### [Integrations & Health](src/app/settings/integrations/page.tsx)
- Health check and connection statuses for external webhooks, KRA eTIMS API bridges, WhatsApp Business Cloud, and M-Pesa Daraja APIs.

### [Audit Log & Events](src/app/settings/audit/page.tsx)
- Immutable system ledger recording all database mutations, user logins, data exports, and configuration changes.
