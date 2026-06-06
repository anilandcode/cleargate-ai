# ClearGate AI Demo Script

## Goal

Show judges a working Shadow AI approval gate: seeded intake, Band agent collaboration, live public evidence verification, policy decisioning, and exportable audit memo.

## Five-Minute Flow

### 1. Open the Shadow AI Inbox

Open the live app:

https://cleargate-ai.vercel.app/

Point out:

- 11 seeded AI tools load immediately.
- Decisions are already varied across approve, approve with conditions, escalate, and block pending review.
- The banner says: `Judge workspace loaded · Run live verification on any vendor.`
- Seeded evidence is not presented as live evidence.

### 2. Open Otter.ai

Click **Open review** for **Otter.ai**.

Talk track:

- Otter.ai is a meeting AI tool.
- It can touch call recordings and transcripts.
- The seeded policy state blocks it pending legal/privacy review.

### 3. Run The Band Agent Room

Open **Agent Room** and click **Run Band review**.

Talk track:

- ClearGate AI turns one shadow AI intake into coordinated agent findings.
- Discovery, security, privacy/legal, finance/procurement, compliance, and policy gate agents share the same packet.
- The room creates a handoff timeline, recommendation, audit hash, and memo-ready Band Agent Finding evidence.
- The human reviewer can approve with conditions, escalate, or block explicitly.

### 4. Run Live Verification

On the vendor review page, click **Run live verification**.

Talk track:

- `/api/review` runs server-side.
- Bright Data credentials stay off the browser.
- SERP API discovers official sources and risk signals.
- Web Unlocker retrieves official vendor pages.
- If an official page is dynamic or unusable and Browser API credentials are configured, one bounded Scraping Browser fallback may render the page. Only mention this in the live presentation after verifying a real successful run.
- If live credentials are absent or a request fails, the demo remains reliable through clearly labeled seeded fallback data.

### 5. Inspect Evidence And Policy

Open the **Evidence** tab and inspect a source row.

Point out:

- source URL
- retrieval product
- fetched timestamp
- provenance label: `LIVE FETCH`, `CACHED LIVE SNAPSHOT`, `SEEDED DEMO DATA`, or `PLANNED QUERY`
- extracted claim
- `AI-extracted finding` only if a real AI/ML API response succeeded; otherwise `Rules-based finding`
- SHA-256 snapshot hash
- policy clause
- confidence score

Then open **Policy Gate**.

Talk track:

- The final decision is deterministic and explainable.
- An LLM is not making approve/block decisions.
- Missing privacy, subprocessor, security, documentation, or public-risk evidence is treated as a risk signal.

### 6. Export The AI Vendor Passport

Open the **Memo** tab and click **Export memo** from the decision sidebar.

Talk track:

- The memo is designed for security, procurement, GRC, Jira, ServiceNow, Zip, Coupa, or audit handoff.
- Reviewer notes and decision overrides persist locally and appear in the export.
- The Band collaboration proof appears in the memo with room ID, recommendation, audit hash, findings, and handoffs.

### Optional Verified Partner Moment

Use this only after deployed credential verification:

1. Open a live-fetched evidence row.
2. Show the official URL, grounded excerpt, full SHA-256, and `AI-extracted finding`.
3. State: “AI/ML API extracts cited evidence language, but deterministic rules still produce the approval outcome.”
4. Click **Send escalation package** on an escalated or blocked vendor.
5. Show `Sent to Slack` only if the drawer confirms Slack delivery. Otherwise show the honest draft-only fallback.

## Optional Scraping Browser Segment

Use **Cursor** as the single seeded dynamic-page fallback candidate only after a real credentialed review has been verified. Open Cursor, run live verification, and show the `Dynamic page detected -> Scraping Browser fallback executed.` event only if the returned evidence row says `Scraping Browser`.

If a real Browser API retrieval has not been verified, describe the fallback as implemented but unverified and skip this segment.

## Closing Line

ClearGate AI turns unapproved AI tools into audit-ready approval decisions using Band-powered agents for security, legal, finance, procurement, and compliance.
