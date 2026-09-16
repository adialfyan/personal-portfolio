import type { Writing } from "@/lib/queries/types";

export const CURATED_WRITINGS: Writing[] = [
  {
    id: "w-00000000-0000-0000-0000-000000000001",
    title: "On Deterministic Ledgers in Multi-Entity ERPs",
    slug: "deterministic-ledgers-multi-entity-erp",
    subtitle: "Architecture patterns for double-entry invariants across distributed institutions.",
    summary:
      "A technical examination of double-entry ledger design, atomicity guarantees, and audit trail immutability in multi-tenant financial software.",
    category: "architecture",
    reading_time_minutes: 7,
    status: "published",
    is_featured: true,
    sort_order: 1,
    cover_image_path: null,
    published_at: "2025-02-15T00:00:00Z",
    created_at: "2025-02-15T00:00:00Z",
    updated_at: "2025-02-15T00:00:00Z",
    tags: ["Distributed Systems", "Accounting Systems", "PostgreSQL", "Architecture"],
    content: `
## 01 — The Invariant of Zero-Sum Balance

In enterprise financial engineering, the primary guarantee of an accounting engine is simple yet unforgiving: every transaction must balance to zero. 

\`\`\`sql
-- Mathematical invariant check
SELECT transaction_id, SUM(amount) AS net_balance
FROM journal_entries
GROUP BY transaction_id
HAVING SUM(amount) <> 0;
\`\`\`

If this query ever returns a single row in production, the system has failed. Deterministic ledgers require that entries are append-only. Modifying or deleting a past entry is strictly prohibited; corrections are applied solely through reversing journal vouchers.

## 02 — Multi-Entity Isolation vs Shared Clearing

When designing ERP platforms spanning universities, foundations, or subsidiaries, accounts must maintain cryptographic isolation while allowing automated inter-company clearing. 

We address this by separating **Tenant Boundary Keys** from the **Consolidation Pipeline**, ensuring that operational autonomy never compromises centralized financial compliance.
    `.trim(),
  },
  {
    id: "w-00000000-0000-0000-0000-000000000002",
    title: "Host-to-Host Banking Clearing: Zero-Tolerance Settlement",
    slug: "host-to-host-banking-clearing",
    subtitle: "Engineering real-time automated clearing pipelines with national banking APIs.",
    summary:
      "Lessons learned building direct Host-to-Host banking clearing infrastructure handling student tuition and high-volume institutional disbursements.",
    category: "paper",
    reading_time_minutes: 9,
    status: "published",
    is_featured: true,
    sort_order: 2,
    cover_image_path: null,
    published_at: "2025-01-20T00:00:00Z",
    created_at: "2025-01-20T00:00:00Z",
    updated_at: "2025-01-20T00:00:00Z",
    tags: ["Banking", "API Security", "Idempotency", "Payment Gateways"],
    content: `
## 01 — Idempotency Under Network Partitions

When executing bank clearing transactions over public or leased infrastructure, network timeouts are inevitable. The golden rule of Host-to-Host integration is that a timeout does not mean failure—it means state uncertainty.

Every outbound clearing request must embed a cryptographically deterministic **Idempotency Key** composed of:
1. Originating transaction UUID
2. Ledger sequence counter
3. Unix epoch millisecond timestamp

## 02 — State Machine Reconciliation

Automated background workers poll banking status endpoints using exponential backoff with jitter. Once confirmed, the invoice state transitions deterministically from \`pending_clearing\` to \`settled\`, generating automated push notifications and updating real-time treasury balances.
    `.trim(),
  },
  {
    id: "w-00000000-0000-0000-0000-000000000003",
    title: "Systems Over Tools: Building Software for Long-Term Operation",
    slug: "systems-over-tools",
    subtitle: "Reflections on software longevity, architectural restraint, and boring technology.",
    summary:
      "Why durable business systems prioritize relational stability, explicit data modeling, and minimal dependency trees over fleeting frontend trends.",
    category: "essay",
    reading_time_minutes: 5,
    status: "published",
    is_featured: true,
    sort_order: 3,
    cover_image_path: null,
    published_at: "2024-11-10T00:00:00Z",
    created_at: "2024-11-10T00:00:00Z",
    updated_at: "2024-11-10T00:00:00Z",
    tags: ["Philosophy", "Software Engineering", "Reliability"],
    content: `
## 01 — The Fallacy of Novelty

In modern software development, there is immense pressure to rewrite infrastructure every two years following whatever framework tops Hacker News. 

Yet, when you build software that organizations depend on for their daily financial survival—payroll, tuition clearing, budgeting—the most valuable attribute of code is not novelty; it is predictability.

## 02 — The Power of Relational Constraints

A well-modeled relational database schema with foreign keys, check constraints, and indexed join tables will outlive five generations of frontend state management libraries. Invest heavily in your data model first.
    `.trim(),
  },
];
