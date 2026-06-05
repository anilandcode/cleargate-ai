# ClearGate AI

ClearGate AI turns unapproved AI tools into audit-ready approval decisions using Band-powered agents for security, legal, finance, procurement, and compliance.

ClearGate AI turns unapproved AI tools into structured review rooms where Discovery, Security, Privacy & Legal, Finance & Procurement, Policy Gate, and Human Reviewer roles collaborate on an audit-ready decision packet.

## Problem

Employees adopt AI tools before security, legal, finance, procurement, and compliance teams can approve them. Vendor evidence is scattered across policies, trust centers, contracts, spend systems, and internal risk rules.

## Solution

ClearGate AI gives each risky tool a decision room. Specialist agents gather evidence, hand off findings, update shared context, and produce an explainable approve, conditional approval, escalation, or block decision.

## Why Band

Band is central because this workflow is multi-agent collaboration, not a single chatbot. The demo shows visible handoffs, agent mentions, shared context, evidence hashes, and a final Policy Gate decision with human override support.

## Judge Demo Path

1. Run the app.
2. Click `Judge Demo`.
3. Open SynthNote AI from the Shadow AI Inbox.
4. Click `Agent Room`.
5. Click `Start Band Agent Review`.
6. Watch agents collaborate and hand off findings.
7. Open `Evidence Ledger`.
8. Export the AI Vendor Passport.
9. Use a human action such as `Approve with Conditions`.

## Agent Roles

- Discovery Agent: maps privacy, trust, pricing, DPA, subprocessors, and public risk signals.
- Security Agent: reviews SOC 2, SSO, admin controls, audit logs, encryption, and data retention.
- Privacy & Legal Agent: reviews DPA, subprocessors, AI training, privacy terms, and legal exposure.
- Finance & Procurement Agent: reviews spend, duplicate tools, ROI, procurement thresholds, and renewal risk.
- Policy Gate Agent: combines findings, applies deterministic policy scoring, and generates the final decision.
- Human Reviewer: approves, approves with conditions, requests evidence, escalates, blocks, or records notes.

## Architecture

```txt
index.html
styles.css
app.js
server.js
api/
lib/
  agentRoomDemo.js
  agentRoomStore.js
  apiCore.js
  bandClient.js
  demoData.js
  evidenceMapper.js
  llmClient.js
  memoBuilder.js
  policyEngine.js
scripts/
agents/
```

The browser uses localStorage so the judge demo works from static hosting. `server.js` provides the same deterministic API contracts for local and Vercel-style deployment.

## Run Locally

```bash
node server.js
```

Open:

```txt
http://localhost:3000
```

Static fallback also works:

```bash
python3 -m http.server 3000
```

In static mode the browser uses deterministic local demo state instead of server API calls.

## Demo Mode

Demo mode is the default. No API keys are required. The Agent Room returns a deterministic review for SynthNote AI with 6 participants, 15 events, handoffs, shared context, ledger entries, and an AI Vendor Passport memo.

## Live Band Mode

Set these server-side environment variables to attempt live Band integration:

```bash
BAND_LIVE=1
BAND_API_BASE=
BAND_WORKSPACE_ID=
BAND_ROOM_ID=
BAND_AGENT_DISCOVERY_ID=
BAND_AGENT_SECURITY_ID=
BAND_AGENT_LEGAL_ID=
BAND_AGENT_FINANCE_ID=
BAND_AGENT_POLICY_ID=
BAND_API_KEY=
OPENAI_API_KEY=
AIML_API_KEY=
FEATHERLESS_API_KEY=
```

If any required Band credential is missing, invalid, or the live request fails, the server returns the deterministic demo room with a warning.

## API

- `GET /healthz`
- `GET|POST /api/review`
- `POST /api/agent-room/start`
- `GET /api/agent-room/:vendorId`
- `POST /api/agent-room/:vendorId/replay`
- `POST /api/agent-room/:vendorId/human-action`
- `POST /api/agent-room/:vendorId/export`

## Smoke Test

```bash
node scripts/smoke-agent-room.js
```

The smoke test verifies app load, health, review API, room start, 5+ agents, 10+ events, final decision, evidence ledger agent findings, human action, and memo export.

## Submission Checklist

- Agent Room tab exists.
- Judge Demo path is obvious.
- At least 5 agents are visible.
- At least 3 agents collaborate through handoffs.
- Evidence Ledger includes agent-generated findings.
- AI Vendor Passport includes the Band Agent Room summary.
- Demo works without external API keys.
- Live Band mode is optional and safely falls back.
- No secrets are committed.

## Known Limitations

- Live Band integration is a safe adapter scaffold until final Band SDK/event details are available.
- LLM provider hooks currently return deterministic findings unless provider-specific extraction is implemented.
- In-memory server state resets when the Node process restarts; browser demo state persists in localStorage.

## Future Roadmap

- Replace the live Band HTTP placeholder with the official Band SDK event stream.
- Add provider-backed evidence summarization.
- Persist rooms and ledgers in a database for production audit retention.
- Add SSO-backed reviewer identity and approval routing.
