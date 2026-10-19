# Versaly Core

> **The operating system for Versaly.**

Versaly Core is a centralized business operations platform designed to become the single source of truth for everything related to Versaly.

It brings together company knowledge, documents, templates, leads, clients, contacts, projects, tasks, accounts, financial information, workflows, and operational history into one connected system.

The long-term goal is not simply to build another CRM or project-management tool.

**Versaly Core should become the digital operating layer of the company.**

---

## 1. Vision

Versaly Core should allow someone with the appropriate permissions to answer:

- What is happening in Versaly right now?
- What needs my attention?
- Who are our leads and clients?
- What projects are active?
- What work is overdue or at risk?
- What agreements and documents exist?
- What happened with a particular client?
- What processes does Versaly follow?
- Where is the latest version of a document or template?
- What financial obligations or opportunities exist?
- What decisions have previously been made?
- What should happen next?

The system should make this information accessible without requiring users to understand the underlying database structure.

### Core principle

> **The database stores the truth. The interface organizes it. The AI helps people understand and act on it.**

---

# 2. Product Goals

## Primary goals

1. Create a single source of truth for Versaly.
2. Connect related business information rather than storing isolated records.
3. Make important company information easy to discover.
4. Standardize recurring business processes.
5. Reduce manual administrative work.
6. Give leadership a clear operational overview.
7. Provide an AI assistant capable of answering questions using Versaly's actual data.
8. Create a foundation that can scale as Versaly grows.

## Secondary goals

- Improve consistency.
- Reduce duplicated information.
- Preserve institutional knowledge.
- Make onboarding easier.
- Improve client and project visibility.
- Create repeatable workflows.
- Make reporting easier.
- Eventually automate appropriate operational tasks.

---

# 3. Product Principles

### 3.1 One source of truth

Important information should have one canonical location.

Avoid creating duplicate records merely because multiple parts of the application need the information.

### 3.2 Everything should connect

A client should connect to their contacts, leads, projects, documents, contracts, invoices, tasks, meetings, and history.

A project should connect to its client, team, tasks, deliverables, documents, financial information, and activity.

### 3.3 Simple before sophisticated

Build the smallest useful version first.

Do not introduce complexity simply because a feature may eventually be useful.

### 3.4 AI should assist, not invent

AI responses should be grounded in Versaly Core data whenever they concern company information.

The assistant must clearly distinguish:

- Known information
- Inferred information
- Recommendations
- Missing information

### 3.5 Human approval for consequential actions

Actions involving financial transactions, external communications, deletion, permissions, contracts, or other consequential changes should require appropriate confirmation unless explicitly configured otherwise.

### 3.6 Auditability

Important changes should be traceable.

Users should be able to understand who changed important information and when.

### 3.7 Designed for growth

The initial system should be simple but should not make future expansion unnecessarily difficult.

---

# 4. High-Level System

Versaly Core consists of five major layers.

```text
                    VERSALY CORE
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     BUSINESS         KNOWLEDGE         WORK
       DATA             DATA            FLOWS
        │                │                │
   CRM / Clients     Documents         Tasks
   Leads             Templates         Projects
   Projects          SOPs              Activities
   Accounts          Decisions         Automations
        │                │                │
        └────────────────┼────────────────┘
                         │
                   CORE SERVICES
                         │
              Search / Permissions
              Notifications / Audit
              Files / Integrations
                         │
                         ▼
                  AI ASSISTANT
                         │
             Understand / Search /
             Analyze / Create /
                    Recommend
```

---

# 5. Core Modules

## 5.1 Dashboard

The default operational view.

It should provide:

- Important metrics
- Open tasks
- Upcoming deadlines
- Overdue work
- Active projects
- Pipeline summary
- Recent activity
- Items requiring attention
- Relevant alerts
- Quick actions

The dashboard should be configurable by role where appropriate.

---

# 5.2 Company

Central information about Versaly itself.

Possible information:

- Company profile
- Legal information
- Company contacts
- Business objectives
- Strategic plans
- Policies
- Important dates
- Internal notes
- Organizational information

---

# 5.3 People & Contacts

Central directory for people connected to Versaly.

A person may be associated with:

- Leads
- Clients
- Projects
- Organizations
- Meetings
- Communications
- Tasks

Avoid duplicating people when the same individual appears in multiple contexts.

---

# 5.4 Organizations

Organizations may represent:

- Prospective clients
- Clients
- Partners
- Vendors
- Other business relationships

An organization can contain multiple contacts and multiple related records.

---

# 5.5 Leads & CRM

The CRM should track the journey from prospect to client.

Suggested lifecycle:

```text
New
  ↓
Qualified
  ↓
Contacted
  ↓
Opportunity
  ↓
Proposal
  ↓
Negotiation
  ↓
Won / Lost
```

Each lead/opportunity should support:

- Organization
- Contact
- Source
- Owner
- Status
- Value
- Probability
- Expected close date
- Notes
- Activities
- Follow-up date
- Related documents
- Related projects

---

# 5.6 Clients

A client record should provide a complete relationship view.

Example:

```text
CLIENT
├── Organization
├── Contacts
├── Projects
├── Contracts
├── Documents
├── Invoices
├── Payments
├── Tasks
├── Meetings
├── Notes
└── Activity History
```

The client page should become the primary operational view of the relationship.

---

# 5.7 Projects

Projects are the primary unit of delivery.

Each project should support:

- Client
- Project owner
- Team
- Status
- Start date
- Target completion date
- Description
- Scope
- Tasks
- Milestones
- Deliverables
- Documents
- Meetings
- Financial information
- Activity history

Suggested statuses:

```text
Planning
Active
Blocked
On Hold
Completed
Cancelled
```

---

# 5.8 Tasks

Tasks should be usable independently but should normally connect to relevant business objects.

A task may belong to:

- Project
- Client
- Lead
- Internal initiative
- Document workflow
- Other entity

Each task should support:

- Title
- Description
- Assignee
- Due date
- Priority
- Status
- Related entity
- Dependencies where needed
- Activity history

---

# 5.9 Documents

Documents are a major part of Versaly Core.

The system should support:

- Document metadata
- Categories
- Tags
- Related entities
- Version information
- Ownership
- Permissions
- Status
- Search
- File storage
- Preview where supported

Important categories may include:

- Contracts
- Proposals
- Agreements
- Reports
- Client documents
- Internal documents
- Financial documents
- Legal documents
- Templates
- SOPs

---

# 5.10 Templates

Templates should be treated as reusable business assets.

Examples:

- Proposal templates
- Contract templates
- Email templates
- Client onboarding templates
- Project briefs
- Reports
- Meeting agendas
- Statements
- Internal documents

Templates should support versioning and ownership.

---

# 5.11 SOPs & Knowledge

Versaly Core should preserve institutional knowledge.

Examples:

- How to onboard a client
- How to create a proposal
- How to start a project
- How to close a project
- How invoices are handled
- How leads are qualified
- How recurring processes are performed

SOPs should be searchable by the AI assistant.

---

# 5.12 Meetings & Activity

Capture operational history.

Potential records:

- Meetings
- Notes
- Decisions
- Follow-up actions
- Important communications
- Activity events

The goal is to answer:

> "What happened with this client/project?"

without manually reconstructing the history.

---

# 5.13 Finance & Accounts

The initial version should provide operational financial visibility without attempting to replace a full accounting platform unless explicitly required later.

Potential capabilities:

- Accounts
- Invoices
- Payments
- Expenses
- Revenue
- Outstanding balances
- Project financial summaries
- Financial documents

Future integrations may connect external accounting or banking systems.

---

# 5.14 Search

Search is a foundational feature.

Users should be able to search across:

- Clients
- People
- Organizations
- Projects
- Leads
- Tasks
- Documents
- Templates
- SOPs
- Meetings
- Notes

Search should eventually support natural-language queries.

Example:

> "Find all active projects for clients acquired this year."

---

# 5.15 Notifications & Reminders

The system should surface important events.

Examples:

- Task due
- Task overdue
- Follow-up required
- Project approaching deadline
- Proposal awaiting action
- Contract expiring
- Payment outstanding
- Important document requiring review

Notifications should be useful rather than noisy.

---

# 6. AI Assistant

The AI assistant is a major part of Versaly Core but should be built progressively.

## Phase 1

Read-only assistance:

- Search company information
- Answer questions
- Summarize records
- Summarize clients
- Summarize projects
- Find documents
- Explain SOPs

## Phase 2

Assisted creation:

- Draft emails
- Draft proposals
- Create project briefs
- Create meeting agendas
- Generate summaries
- Create tasks from notes

## Phase 3

Controlled actions:

- Create records
- Update records
- Create tasks
- Generate documents
- Trigger workflows

Actions should show the user what will happen before consequential changes occur.

## Phase 4

Operational intelligence:

Examples:

> "What needs my attention?"

> "Which projects are at risk?"

> "Which leads need follow-up?"

> "What changed this week?"

> "Prepare me for my meeting with Client X."

> "Show me everything we know about Client X."

> "What similar proposals have we used?"

---

# 7. AI Grounding

The assistant should use retrieval from Versaly Core data.

Conceptually:

```text
User Question
     ↓
Intent Detection
     ↓
Permission Check
     ↓
Relevant Data Retrieval
     ↓
Context Assembly
     ↓
AI Reasoning
     ↓
Response
     ↓
Optional Action
```

The assistant must respect user permissions.

A user should never receive information merely because the AI can technically retrieve it.

---

# 8. Relationships

Relationships are fundamental.

Important relationships include:

```text
Organization
 ├── Contacts
 ├── Leads
 ├── Client
 │    ├── Projects
 │    │    ├── Tasks
 │    │    ├── Documents
 │    │    └── Activities
 │    ├── Contracts
 │    └── Invoices
 └── Activity
```

The exact data model may evolve, but the implementation should preserve these relationships.

---

# 9. Permissions & Security

The system should support role-based access.

Potential roles:

- Owner
- Administrator
- Manager
- Staff
- Read-only

Permissions should eventually be available at:

- Module level
- Record level where necessary
- Document level where necessary

Sensitive operations should require appropriate authorization.

Important events should be logged.

---

# 10. Audit Log

Track meaningful system changes.

Examples:

- Record created
- Record updated
- Record deleted
- Status changed
- Permission changed
- Document uploaded
- Document replaced
- AI action executed

Each event should include relevant metadata such as:

- User
- Timestamp
- Action
- Entity
- Previous value where appropriate
- New value where appropriate

---

# 11. UX Principles

The interface should feel like a modern internal business platform rather than an enterprise administration system.

Priorities:

1. Fast navigation
2. Clear hierarchy
3. Minimal unnecessary clicks
4. Strong global search
5. Useful dashboards
6. Consistent forms
7. Clear status indicators
8. Excellent empty states
9. Responsive design
10. Keyboard-friendly workflows where practical

The user should rarely need to think:

> "Which database does this belong to?"

Instead, the system should guide them toward the correct context.

---

# 12. Global Command Interface

A future command interface should allow users to quickly:

- Search
- Create
- Navigate
- Ask AI
- Trigger actions

Example:

```text
> Create a project for Acme from the signed proposal.
```

or:

```text
> Show me overdue work.
```

or:

```text
> Find the latest client onboarding template.
```

This should become one of the primary interaction mechanisms over time.

---

# 13. Integrations

Integrations should be added incrementally.

Potential future integrations:

- Email
- Calendar
- Cloud storage
- Accounting
- Banking/financial systems
- Messaging
- E-signature
- Communication platforms
- External CRM systems

Integrations should never compromise the internal source of truth.

---

# 14. Implementation Strategy

Build Versaly Core in vertical slices.

Do not build every backend table first and postpone the user experience.

Each phase should produce something usable.

Every phase should include:

1. Data model
2. Backend/API
3. UI
4. Validation
5. Error handling
6. Permissions where relevant
7. Tests
8. Documentation
9. Seed/demo data where useful

---

# 15. Recommended Development Phases

The development roadmap is structured into 13 progressive, production-ready phases (Phase 0 through Phase 12). Rather than postponing core requirements like permissions, file storage, or deployment until the end, these phases are strategically ordered to minimize technical debt, establish security from day one, and deliver testable vertical slices at every step.

---

## Phase 0 — Engineering Foundation, Architecture & CI/CD

Establish the core technical platform and automated delivery pipeline:

- **Repository & Workspace**: Monorepo/project structure, TypeScript strict mode, formatting, and linting standards.
- **Technology Stack**: Web framework (Next.js App Router / React), UI component library (Tailwind CSS, Radix UI / shadcn/ui), and ORM/database toolkit (PostgreSQL with Prisma/Drizzle).
- **Database & Migrations**: Relational database provisioning, migration workflows, schema seeding utilities.
- **Authentication & Base RBAC**: Secure authentication (session/JWT, multi-factor support), user entity definition, and initial system roles (`Owner`, `Administrator`, `Manager`, `Staff`, `Read-only`).
- **Core Architecture & Error Handling**: Global error boundary, standard API response wrappers, logging infrastructure (structured JSON logs), and environment variable validation.
- **CI/CD & DevOps Pipeline**: Automated GitHub Actions / GitLab CI for linting, type-checking, automated testing, and preview deployments. Staging environment setup.

### Exit criteria
The application builds cleanly, passes automated CI checks, deploys automatically to a staging environment, and allows a user to register and log in with verified sessions.

---

## Phase 1 — Core Workspace, Navigation & Command Palette (`Cmd+K`)

Build the central operating shell and system-wide administration controls:

- **Application Shell**: Responsive multi-device layout (collapsible sidebar, breadcrumbs, top navigation bar, mobile drawer).
- **Global Command Interface (`Cmd+K`)**: Keyboard-first command palette shell supporting fast navigation, quick actions, and deep search routing.
- **Company Workspace & Profile**: Central Versaly profile configuration, operating settings, business hours, and company metadata.
- **User Management & Role Assignment**: Team directory, user invitation flow, role assignment, and access-control administration.
- **Audit Log & Event Dispatcher**: Centralized audit log schema and internal event bus to automatically record system mutations (`who`, `what`, `when`, `entity`, `changes`).

### Exit criteria
Authenticated users can navigate the application smoothly, access their user profiles, trigger the `Cmd+K` command palette, and administrators can manage users and roles with audit logging verified.

---

## Phase 2 — Core Directory: Organizations & People

Establish the relational foundation for all business entities:

- **People Directory**: Unified contact entity handling clients, prospects, team members, external partners, and contractors without record duplication.
- **Organization Directory**: Hierarchical organization records representing clients, prospective accounts, partners, and vendors.
- **Relationship Graph**: Bidirectional linking between people and organizations (job titles, primary contacts, department tags).
- **Entity Views**: Detail pages, quick-edit side panels, advanced filtering, full-text directory search, and tag taxonomy.
- **Activity Timeline**: Chronological activity feed on organization and contact profiles (notes, call logs, emails, status changes).

### Exit criteria
Team members can create, update, search, and interlink organizations and people, with every change tracked on a chronological activity timeline.

---

## Phase 3 — Document Management, Templates & File Storage Engine

Build the reusable file storage and template engine before CRM and project workflows:

- **Cloud Object Storage Engine**: S3-compatible cloud storage integration (AWS S3 / Cloudflare R2), signed secure URLs, mime-type verification, and file-size constraints.
- **Polymorphic Entity Attachments**: Central attachment service allowing files to be connected to any record (organizations, people, leads, projects, tasks, invoices).
- **Document Hub**: Central document library featuring categorization (Contracts, Proposals, Agreements, Reports, Internal Docs), tags, and version history.
- **Business Template Engine**: Reusable document templates supporting variable substitution (client name, date, address, budget) and versioning.
- **Document Preview & Search**: File preview engine (PDF, text, images) and metadata-driven search.

### Exit criteria
Users can upload, version, categorize, preview, and attach files to directory entities, as well as define and generate documents from reusable templates.

---

## Phase 4 — Sales Pipeline & CRM (Leads to Clients)

Manage the complete commercial journey from initial inquiry to signed contract:

- **Lead & Opportunity Tracking**: Lead capture forms, source attribution, estimated deal values, win probabilities, and expected close dates.
- **Pipeline Visualizer**: Multi-stage Kanban pipeline and table views with drag-and-drop status progression (`New` → `Qualified` → `Proposal` → `Negotiation` → `Won` / `Lost`).
- **Commercial Activities & Follow-ups**: Follow-up reminders, lead notes, meeting summaries, and pipeline stage velocity metrics.
- **Proposal Generation**: Direct assembly of client proposals utilizing Phase 3 templates populated with lead and organization data.
- **One-Click Client Conversion**: Automated conversion workflow: winning a lead automatically promotes the organization to an active Client, links contacts, and provisions an initial project workspace.

### Exit criteria
A prospect can enter the pipeline, receive a generated proposal, progress through stages, and be converted into an active client record with all history preserved.

---

## Phase 5 — Client Workspace & Project Operations

Deliver the central delivery vehicle connecting clients, projects, tasks, and deliverables:

- **360° Client Workspace**: Consolidated client command center aggregating linked projects, contacts, contracts, invoices, tasks, and operational history.
- **Project Management**: Project lifecycles (`Planning`, `Active`, `Blocked`, `On Hold`, `Completed`), milestones, deliverables, owners, and assigned team members.
- **Connected Task Engine**: Tasks with assignees, due dates, priority tiers (`Urgent`, `High`, `Medium`, `Low`), dependencies, subtasks, and rich-text descriptions.
- **Operational Views**: Multiple task and project views (Kanban board, List view, and Timeline/Milestone view).
- **Operational Notes & Meetings**: Native meeting agenda builder, action item generation directly into tasks, and project-level file repositories.

### Exit criteria
Teams can execute end-to-end client projects with interconnected milestones, tasks, documents, and meetings, providing full visibility to leadership.

---

## Phase 6 — Operational Knowledge Base & SOPs

Preserve Versaly’s institutional memory, operational standards, and decision histories:

- **Knowledge Repository**: Structured SOPs, company policies, operational playbooks, and strategic documents.
- **Rich Collaborative Editor**: Markdown / Block editor supporting code snippets, tables, callouts, and inline media.
- **Version Control & Verification**: Document revision history, change diffs, document ownership, and periodic review reminders (e.g., "Review SOP every 6 months").
- **Actionable SOPs**: Ability to convert SOP checklists directly into actionable project or onboarding task templates.
- **Decision Registry**: Documented architectural, business, and operational decisions linked to relevant projects or company milestones.

### Exit criteria
All critical operational SOPs, playbooks, and decisions are documented in a centralized, versioned, searchable knowledge base with direct task-template generation.

---

## Phase 7 — Operational Finance & Invoicing

Provide direct financial visibility linked to clients and project deliverables:

- **Financial Accounts & Ledger**: High-level chart of accounts, operational revenue tracking, and business expense logging.
- **Invoice Management**: Professional invoice creation linked to project milestones, deliverables, or ad-hoc services, with PDF export.
- **Payment Lifecycle**: Tracking payment status (`Draft`, `Sent`, `Overdue`, `Paid`, `Partially Paid`, `Void`), recording transaction dates and payment methods.
- **Project Financial Health**: Real-time project profitability metrics (budget vs. actual, invoiced to date, outstanding receivables).
- **Financial Document Hub**: Secure vault for receipts, tax documents, and supplier agreements connected to financial records.

### Exit criteria
Leadership can view real-time revenue, outstanding invoices, and project margins, with invoices generated and connected to clients and milestones.

---

## Phase 8 — Central Notification Engine & Operational Automations

Surface critical operational signals and eliminate repetitive manual workflows:

- **Notification Hub**: Real-time in-app notification center, user notification preferences, and transactional email dispatch.
- **Operational Event Triggers**: Automated alerts for overdue tasks, approaching project deadlines, expiring agreements, and unpaid invoices.
- **Workflow Automation Engine**: Configurable event-driven rules (e.g., *When invoice is marked paid → notify project owner*; *When lead status changes to proposal → create follow-up task*).
- **Proactive Dashboard**: Executive and role-specific dashboard surfacing "Items Requiring Attention", team workloads, and pipeline health.

### Exit criteria
The system proactively alerts users to impending deadlines, overdue deliverables, and critical milestones, executing basic operational automations autonomously.

---

## Phase 9 — AI Assistant: Grounded Knowledge & Search (Read-Only RAG)

Introduce an AI assistant strictly grounded in authorized Versaly Core data:

- **Data Indexing & Embedding Pipeline**: Secure vector embeddings (pgvector) and hybrid full-text indexing across clients, projects, tasks, documents, and SOPs.
- **Permission-Aware Retrieval (RLS / ACL Grounding)**: Rigorous pre-retrieval authorization filters ensuring users can only query information they have explicit permission to read.
- **Unified Query Interface**: Natural-language query interface integrated into the sidebar and the `Cmd+K` command palette.
- **Intelligent Summarization**: Instant summarization of client history, active project health, overdue deliverables, and SOP answers with explicit source citations.
- **Anti-Hallucination Safeguards**: Strict system prompting that distinguishes verified company facts from recommendations and explicitly flags missing data.

### Exit criteria
Users can query the AI assistant using natural language and receive accurate, permission-compliant answers and summaries citing internal Versaly data.

---

## Phase 10 — AI Co-Pilot & Supervised Action Engine

Empower the AI assistant to perform operational tasks with human-in-the-loop safeguards:

- **Assisted Content Generation**: Draft client emails, generate proposal scopes, build project briefs, and draft meeting agendas grounded in company templates and records.
- **Interactive Action Execution**: Controlled mutation workflows (e.g., *“Create a follow-up task for Client X for next Tuesday”* or *“Draft a project from the signed contract”*).
- **Review & Approval Gateways**: Strict preview UI showing pending changes, diffs, and confirmation prompts prior to executing any database mutation.
- **Proactive Operational Intelligence**: Automated weekly leadership summaries, project risk detection, and meeting prep dossiers (e.g., *“Prepare me for my 2 PM meeting with Acme”*).

### Exit criteria
The AI assistant can draft documents, propose record updates, and execute operational workflows under explicit user review and confirmation.

---

## Phase 11 — Security Hardening, Performance & Reliability Audit

Ensure enterprise-grade resilience, data protection, and performance optimization:

- **Security & Authorization Audit**: Penetration testing, role-based boundary validation, SQL injection / XSS prevention, and strict Content Security Policies.
- **Performance Optimization**: Database query indexing, pagination stress-testing, API caching (Redis), bundle size reduction, and asset CDN optimization.
- **Automated Backup & Disaster Recovery**: Point-in-time recovery (PITR) for PostgreSQL, automated encrypted cloud backups, and disaster recovery recovery-time objective (RTO) drills.
- **Comprehensive Test Suite**: Automated end-to-end (E2E) regression testing using Playwright, integration tests for financial workflows, and unit test coverage.
- **Observability & Health Monitoring**: Error logging and tracing (Sentry / OpenTelemetry), server performance monitoring, and uptime health check endpoints.

### Exit criteria
The system passes all security audits, maintains sub-200ms API response times under load, passes comprehensive E2E test suites, and has verified automated backups.

---

## Phase 12 — Production Deployment, Data Migration & Go-Live

Execute the smooth transition into Versaly’s live operational single source of truth:

- **Production Infrastructure Provisioning**: High-availability cloud deployment (managed database, containerized compute, CDN, SSL, DNS).
- **Legacy Data Migration**: Data migration scripts and import tools to ingest historical clients, contacts, active projects, and documents from spreadsheets/legacy systems.
- **Operational Runbook & Documentation**: Administrator operations manual, disaster recovery runbook, and team onboarding guides.
- **Staged Rollout**: Internal dogfooding → pilot team deployment → full company cutover.
- **Post-Launch Hypercare**: Live operational monitoring, rapid bug triaging, and user feedback collection.

### Exit criteria
Versaly Core is running live in production, historical data is migrated, the Versaly team conducts daily operations within Core, and legacy disparate tools are decommissioned.

---

# 16. Definition of Done

A feature is not complete merely because it works in the happy path.

A feature is complete when:

- The UI works.
- The underlying data model is correct.
- Validation exists.
- Errors are handled.
- Permissions are considered.
- Related entities work correctly.
- Search behaves correctly where applicable.
- Tests exist for important behavior.
- The feature works on supported screen sizes.
- Documentation is updated.
- No known critical regression exists.

---

# 17. Definition of Versaly Core Ready

Versaly Core is ready for operational use when:

- Core business data has a clear home.
- Clients, leads, projects and documents are connected.
- Users can quickly find information.
- Important workflows are standardized.
- Permissions are reliable.
- Changes are auditable.
- The system is backed up.
- The application is stable.
- The AI assistant can retrieve authorized company knowledge.
- AI actions are controlled and reviewable.
- The system is sufficiently documented that another person can operate it.

---

# 18. Guiding Principle for the Entire Project

Do not optimize for the number of features.

Optimize for this:

> **Can Versaly run better because Versaly Core exists?**

Every feature should either:

1. Make information easier to understand,
2. Make work easier to perform,
3. Make decisions easier to make, or
4. Reduce repetitive operational work.

If it does none of these, it probably does not belong in the current version.