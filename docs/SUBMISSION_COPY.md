# ClearGate AI Submission Copy

## Track

Security & Compliance

## Short Description - 160 Characters

ClearGate AI turns unapproved AI tools into audit-ready approvals using Band-powered agents for security, legal, finance, procurement, and compliance.

## Short Description - 300 Characters

ClearGate AI is a continuous approval gate for employee-adopted AI tools. Band-powered agents coordinate review, Bright Data retrieves public evidence, and deterministic policy rules produce audit-ready memos and escalation packages.

## Long Description

Employees adopt AI tools before security, privacy, procurement, and GRC teams approve them. That creates a Shadow AI review backlog involving source code, customer notes, recordings, contracts, and internal documents. Manual review is slow because vendor privacy pages, trust centers, subprocessor lists, enterprise documentation, and public risk signals are scattered across the web and can change.

ClearGate AI turns that fragmented review into an operational approval workflow:

**Shadow AI Inbox -> Band Agent Room -> Public Evidence Discovery -> Official Page Retrieval -> Evidence Provenance -> Deterministic Policy Gate -> AI Vendor Passport -> Reviewer-Triggered Re-Review -> Slack Escalation Or Draft**

The Band Agent Room coordinates Discovery, Security, Privacy & Legal, Finance & Procurement, Compliance, and Policy Gate agents. Each agent produces a finding, handoff, recommendation input, and audit artifact. Human reviewers still record the approval action explicitly.

Bright Data SERP API discovers canonical public sources. Web Unlocker retrieves selected official pages. A bounded Scraping Browser fallback is implemented for unusable JavaScript-heavy pages and is disabled until dedicated Browser API credentials are configured. Every final finding records its official URL, timestamp, origin, retrieval product, excerpt, extracted signals, and normalized-content SHA-256.

An optional AI/ML API layer can extract one grounded structured finding and draft concise memo prose. Its supporting quote must exist verbatim in retrieved evidence. It never determines the approval result. Final outcomes remain explainable deterministic rules with a human override.

The current product includes a reliable 11-tool judge workspace, CSV-style intake, risk queue, Band agent room, evidence ledger, policy board, reviewer notes, memo export, reviewer-triggered live snapshot drift comparison, and Slack escalation with downloadable draft fallback.

## Enterprise Buyer

Security, privacy, procurement, third-party risk management, AI governance, and GRC teams at organizations where employee AI adoption is moving faster than vendor review.

## Why Live Public Web Data Matters

Vendor policies, trust centers, subprocessors, security documentation, and public risk signals are distributed across changing public pages. A useful approval gate must cite current public evidence, preserve snapshots, and distinguish live retrieval from cached or seeded replay.

## Business Model

Enterprise SaaS priced by monitored AI vendors, reviewer seats, and live evidence review volume. Expansion paths include policy packs, scheduled re-review, workflow integrations, and database-backed audit retention.

## Technologies

- Vanilla HTML, CSS, and JavaScript
- Node.js HTTP server and Vercel Functions
- Browser-local Band Agent Room demo runtime
- Bright Data SERP API
- Bright Data Web Unlocker
- Bright Data Browser API fallback code path, credential verification pending
- AI/ML API grounded extraction code path, credential verification pending
- Slack incoming webhook delivery code path, webhook verification pending
- SHA-256 snapshot integrity using Node `crypto`
- Browser `localStorage`
- GitHub Actions

## Judging Criteria

### Application Of Technology

Bright Data is the retrieval infrastructure, not decoration: SERP discovery selects canonical public sources, Web Unlocker retrieves official pages, and Browser API is a selective bounded escalation path. Evidence is normalized, hashed, and mapped to deterministic governance rules.

### Presentation

The app opens directly into an 11-tool Shadow AI queue. Judges can open a blocked tool, run the Band agent room, run live verification, inspect provenance, view the policy explanation, export a memo, and generate an escalation package.

### Business Value

ClearGate AI reduces manual triage and makes review evidence reusable for procurement, GRC, legal, and audit workflows. The buyer is clear, and the workflow maps to an existing enterprise pain point.

### Originality

The product is not another general research agent. It converts shadow AI usage, agent collaboration, and changing public vendor evidence into an explainable approval gate for employee-adopted AI tools, with explicit provenance and deterministic controls.

## Honest Limitations

- Seeded workspace evidence is demo replay and is visibly labeled.
- Live Bright Data execution requires configured credentials.
- Browser API, AI/ML API, and Slack paths are implemented but must be credential-verified before being narrated as successful live integrations.
- Drift comparison occurs during reviewer-triggered re-verification, not through a background scheduler.
- Current persistence is browser `localStorage`, not a database-backed audit store.
- Authentication, tenancy, RBAC, and scheduled monitoring are roadmap items.
