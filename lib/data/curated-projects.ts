import type { ProjectDetail } from "@/lib/queries/types";

export const CURATED_PROJECTS: ProjectDetail[] = [
  {
    id: "proj-01-simman",
    title: "SIMMAN E-Budgeting",
    slug: "simman-e-budgeting",
    summary:
      "Institution-grade financial infrastructure with real-time Host-to-Host bank clearing and automated RKA budget enforcement.",
    project_type: "Enterprise ERP",
    role: "Lead Full-Stack Engineer & ERP Architect",
    client: "MAN 1 Kota Semarang",
    year: "2025 - Now",
    duration: "Active Production",
    status: "published",
    is_featured: true,
    sort_order: 1,
    cover_image_path: "/projects/simman.jpg",
    live_url: null,
    repository_url: null,
    overview:
      "SIMMAN E-Budgeting is a centralized institutional financial ERP engineered for MAN 1 Kota Semarang. It unifies high-throughput student education fee transactions, automated Host-to-Host (H2H) banking reconciliation, and rigorous division-level budget allocations under a single real-time general ledger.",
    problem:
      "Managing the cash flow of a state educational institution with thousands of students carries a massive administrative overhead. The legacy workflow relied on manual bank statement verifications for education fees, paper-based budget requests by Vice Principals, and error-prone end-of-month reconciliations. The institution required an absolute, automated general ledger to replace manual bookkeeping.",
    approach:
      "Institution-grade financial infrastructure. We engineered a centralized ERP handling everything from department-level RKA (Work Plan & Budget) allocation to the automated, real-time clearing of student education fees via Host-to-Host (H2H) bank integration.",
    technical_decisions:
      `01 — Key Features:

01. Host-to-Host (H2H) Bank Integration
Secure webhook layer communicating directly with the partner bank's core system. Each student is assigned a static Virtual Account. Transactions clear invoices and update the ledger in milliseconds without human intervention.

02. Strict RKA Budgeting Engine
Total digitization of the institution's Work Plan and Budget. The system hard-locks operational expenditures for each Vice Principal division, preventing disbursements that exceed approved budget ceilings. Every fund movement is logged into the Chart of Accounts.

03. Automated Bank Reconciliation
Smart comparison module that automatically balances internal system transactions against daily external Bank Statements, isolating financial anomalies instantly.

04. Dynamic Financial Reporting
Programmatic report generator for cash flow mutations, RKA realization, and large-scale arrear summaries with multi-tier authorization and dynamically injected digital signatures.

05. CI/CD Pipeline via GitHub Actions
Every code push automatically passes through build and deployment stages, distributing updates directly to the institution's independent VPS with zero downtime.`,
    outcome:
      `01 — Objectives & Impact:

01. Eliminate manual payment verification through direct Host-to-Host bank integration.
02. Digitize the full RKA (Work Plan & Budget) lifecycle with hard-locked spending ceilings per division.
03. Automate daily bank reconciliation against internal cash transaction records.
04. Deliver dynamic, multi-signature financial reports for institutional compliance.
05. Implement a CI/CD pipeline via GitHub Actions for zero-downtime continuous deployment.`,
    reflection:
      "Architecting financial infrastructure for a public institution demands an uncompromising stance on data integrity and transactional atomicity. Designing strict programmatic constraints around budget ceilings and banking webhooks eliminates human error entirely, transforming bureaucratic friction into effortless auditability.",
    published_at: "2025-01-01T00:00:00Z",
    technologies: [
      { id: "tech-laravel", name: "Laravel", slug: "laravel" },
      { id: "tech-psql", name: "PostgreSQL", slug: "postgresql" },
      { id: "tech-redis", name: "Redis", slug: "redis" },
      { id: "tech-bank", name: "Bank H2H API", slug: "bank-h2h" },
      { id: "tech-ghactions", name: "GitHub Actions", slug: "github-actions" },
      { id: "tech-tailwind", name: "Tailwind CSS", slug: "tailwind" },
    ],
    links: [],
    media: [
      {
        id: "media-simman-01",
        project_id: "proj-01-simman",
        image_path: "/projects/simman.jpg",
        caption: "Centralized financial operations dashboard with real-time clearance streams and budget telemetry.",
        sort_order: 1,
      },
    ],
  },
  {
    id: "proj-02-event-erp",
    title: "ERP System for Event Organizers",
    slug: "erp-event-organizers",
    summary:
      "Enterprise operations platform coordinating high-volume vendor logistics, multi-stage scheduling, and live budget realization for commercial events.",
    project_type: "Enterprise ERP",
    role: "Lead Full-Stack Engineer",
    client: "Event Production & Management",
    year: "2024 - 2025",
    duration: "Production Deployed",
    status: "published",
    is_featured: true,
    sort_order: 2,
    cover_image_path: "/projects/kanso.jpg",
    live_url: null,
    repository_url: null,
    overview:
      "A comprehensive ERP solution designed to streamline the operational workflows of commercial event organizers, orchestrating live talent contracting, vendor invoicing, and on-site event execution.",
    problem:
      "Event organizers frequently deal with fractured communications across spreadsheets, unmonitored budget creeps during live operations, and delayed vendor reconciliations.",
    approach:
      "Engineered an event-centric ERP combining automated contract workflows, division-specific expenditure caps, and real-time vendor clearance.",
    technical_decisions:
      "Optimized for high-concurrency check-in and on-site ticketing synchronization with offline-resilient local caching.",
    outcome:
      "Successfully deployed across major regional productions with zero billing discrepancy and instant post-event auditing.",
    reflection:
      "Live event operations require systems that are bulletproof under stress, where sub-second latency and absolute clarity make or break the execution.",
    published_at: "2024-09-01T00:00:00Z",
    technologies: [
      { id: "tech-laravel", name: "Laravel", slug: "laravel" },
      { id: "tech-vue", name: "Inertia / Vue", slug: "vue" },
      { id: "tech-mysql", name: "MySQL", slug: "mysql" },
      { id: "tech-tailwind", name: "Tailwind CSS", slug: "tailwind" },
    ],
    links: [],
    media: [
      {
        id: "media-event-01",
        project_id: "proj-02-event-erp",
        image_path: "/projects/kanso.jpg",
        caption: "Production schedule management and vendor invoice clearance console.",
        sort_order: 1,
      },
    ],
  },
  {
    id: "proj-03-deployed",
    title: "Vespera Telemetry & Analytics",
    slug: "deployed-project-03",
    summary:
      "Enterprise telemetry console with real-time distributed stream ingestion and high-concurrency event processing.",
    project_type: "Enterprise Cloud Platform",
    role: "Lead Full-Stack Engineer",
    client: "Enterprise Client",
    year: "2024",
    duration: "Production Deployed",
    status: "published",
    is_featured: true,
    sort_order: 3,
    cover_image_path: "/projects/vespera.jpg",
    live_url: null,
    repository_url: null,
    overview:
      "High-throughput enterprise analytics engine coordinating real-time metric streams, automated anomaly alarms, and historical performance breakdowns.",
    problem:
      "Monitoring large-scale distributed operations required an unified telemetry cockpit capable of ingesting high-frequency time-series events without database lockups.",
    approach:
      "Designed an asynchronous event-driven architecture with partitioned time-series storage and sub-50ms query responses for operational teams.",
    technical_decisions:
      "Implemented columnar indexing and real-time WebSocket fanout, decoupling ingestion from analytical reporting.",
    outcome:
      "Achieved 99.99% ingestion reliability under stress-test loads of 15,000 events/second.",
    reflection:
      "Simplicity in data modeling always outperforms complex workarounds under high throughput.",
    published_at: "2024-04-01T00:00:00Z",
    technologies: [
      { id: "tech-next", name: "Next.js", slug: "nextjs" },
      { id: "tech-ts", name: "TypeScript", slug: "typescript" },
      { id: "tech-pg", name: "PostgreSQL", slug: "postgresql" },
    ],
    links: [],
    media: [],
  },
  {
    id: "proj-04-deployed",
    title: "Aethel Variable Font Studio",
    slug: "deployed-project-04",
    summary:
      "Interactive typographic design tool featuring real-time glyph bezier manipulation and multi-axis variable font interpolation.",
    project_type: "Creative Technology",
    role: "Full-Stack & Systems Engineer",
    client: "Digital Type Foundry",
    year: "2023 - 2024",
    duration: "Production Deployed",
    status: "published",
    is_featured: true,
    sort_order: 4,
    cover_image_path: "/projects/aethel.jpg",
    live_url: null,
    repository_url: null,
    overview:
      "Production-grade platform designed for resilience, automated compliance, and real-time operations.",
    problem:
      "Case study specifications in preparation.",
    approach:
      "Detailed approach coming soon.",
    technical_decisions:
      "Technical decisions coming soon.",
    outcome:
      "Deployed to production.",
    reflection:
      "Documentation in progress.",
    published_at: "2023-10-01T00:00:00Z",
    technologies: [
      { id: "tech-next", name: "Next.js", slug: "nextjs" },
      { id: "tech-ts", name: "TypeScript", slug: "typescript" },
      { id: "tech-tailwind", name: "Tailwind CSS", slug: "tailwind" },
    ],
    links: [],
    media: [],
  },
];
