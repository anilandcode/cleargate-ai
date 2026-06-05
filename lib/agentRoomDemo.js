import { buildFinalDecision, displayDecision } from "./policyEngine.js";
import { policyRequirements } from "./demoData.js";

export const AGENT_DEFINITIONS = [
  {
    id: "discovery-agent",
    name: "Discovery Agent",
    role: "Evidence discovery and source mapping",
    avatar: "search",
    status: "idle",
    confidence: 0.87,
    findingsCount: 0,
    lastAction: "Waiting for review start"
  },
  {
    id: "security-agent",
    name: "Security Agent",
    role: "Security controls, SOC 2, SSO, audit logs",
    avatar: "shield",
    status: "idle",
    confidence: 0.84,
    findingsCount: 0,
    lastAction: "Waiting for evidence handoff"
  },
  {
    id: "privacy-legal-agent",
    name: "Privacy & Legal Agent",
    role: "DPA, privacy policy, training terms, subprocessors",
    avatar: "scale",
    status: "idle",
    confidence: 0.86,
    findingsCount: 0,
    lastAction: "Waiting for legal evidence"
  },
  {
    id: "finance-agent",
    name: "Finance & Procurement Agent",
    role: "Spend, duplicates, ROI, renewal risk",
    avatar: "wallet",
    status: "idle",
    confidence: 0.83,
    findingsCount: 0,
    lastAction: "Waiting for cost context"
  },
  {
    id: "policy-gate-agent",
    name: "Policy Gate Agent",
    role: "Coordinates findings and final approval decision",
    avatar: "gate",
    status: "idle",
    confidence: 0.89,
    findingsCount: 0,
    lastAction: "Waiting for specialist recommendations"
  },
  {
    id: "human-reviewer",
    name: "Human Reviewer",
    role: "Human-in-the-loop approval and override owner",
    avatar: "user",
    status: "idle",
    confidence: 1,
    findingsCount: 0,
    lastAction: "Review queue opened"
  }
];

export function buildDemoRoom(vendor, options = {}) {
  const startedAt = options.startedAt || "2026-06-05T09:14:00.000Z";
  const completedAt = options.completedAt || "2026-06-05T09:18:12.000Z";
  const roomId = `room-vendor-${vendor.id}`;
  const events = buildDemoEvents(vendor, startedAt).map((eventItem) => ({
    ...eventItem,
    roomId
  }));
  const sharedContext = buildSharedContext(vendor);
  const finalDecision = buildFinalDecision(vendor, { generatedAt: completedAt });
  const agents = deriveAgentState(events);

  return {
    id: roomId,
    vendorId: vendor.id,
    mode: options.mode || "demo",
    status: "complete",
    startedAt,
    completedAt,
    bandRoomId: options.bandRoomId || `demo-band-${vendor.id}`,
    agents,
    events,
    sharedContext: {
      ...sharedContext,
      riskScore: finalDecision.score,
      finalRecommendation: displayDecision(finalDecision.decision)
    },
    finalDecision,
    humanActions: options.humanActions || [],
    warning: options.warning || null
  };
}

export function buildInitialRoom(vendor, options = {}) {
  return {
    id: `room-vendor-${vendor.id}`,
    vendorId: vendor.id,
    mode: options.mode || "demo",
    status: "idle",
    startedAt: "",
    completedAt: "",
    bandRoomId: options.bandRoomId || "",
    agents: AGENT_DEFINITIONS.map((agent) => ({ ...agent })),
    events: [],
    sharedContext: buildSharedContext(vendor, true),
    finalDecision: null,
    humanActions: []
  };
}

function buildDemoEvents(vendor, startedAt) {
  const timestamps = [
    0, 18, 42, 58, 74, 101, 128, 154, 181, 210, 238, 268, 291, 312, 336
  ].map((seconds) => new Date(new Date(startedAt).getTime() + seconds * 1000).toISOString());

  return [
    event("evt-001", timestamps[0], "message", "human-reviewer", null, "Shadow AI review opened", `New Shadow AI review opened for ${vendor.name}. @Discovery Agent start evidence discovery.`, [], "medium", 0.98),
    event("evt-002", timestamps[1], "tool_call", "discovery-agent", null, "Public evidence search started", "Searching public privacy, trust, pricing, terms, subprocessors, and admin-control pages.", [], "medium", 0.86),
    event("evt-003", timestamps[2], "finding", "discovery-agent", null, "Privacy policy and trust center found", "I found privacy policy, trust center, and pricing page. I cannot verify DPA or subprocessors yet.", ["ev-public-privacy", "ev-public-trust"], "medium", 0.91),
    event("evt-004", timestamps[3], "handoff", "discovery-agent", "security-agent", "Security docs handoff", "@Security Agent please review trust center and controls for customer data exposure.", ["ev-public-trust"], "high", 0.9),
    event("evt-005", timestamps[4], "handoff", "discovery-agent", "privacy-legal-agent", "DPA and subprocessors gap", "@Privacy & Legal Agent DPA and subprocessors are missing. AI training language is unclear.", ["ev-public-privacy"], "high", 0.92),
    event("evt-006", timestamps[5], "handoff", "discovery-agent", "finance-agent", "Spend and duplicate review", `@Finance & Procurement Agent annual spend is $${vendor.annualSpend.toLocaleString("en-US")} for ${vendor.users} users. Possible duplicate vendor exists.`, ["ev-base-001"], "medium", 0.88),
    event("evt-007", timestamps[6], "finding", "security-agent", null, "SOC 2 and SSO unclear", "Security review started. SOC 2 is mentioned but latest report is not attached. SSO availability is unclear.", ["ev-public-trust"], "high", 0.84),
    event("evt-008", timestamps[7], "finding", "privacy-legal-agent", null, "DPA required before approval", "High privacy risk: customer notes may be processed. DPA is required before approval.", ["ev-public-privacy"], "high", 0.87),
    event("evt-009", timestamps[8], "finding", "finance-agent", null, "Duplicate tooling and ROI threshold", "Spend is within threshold, but duplicate tooling risk exists. ROI is positive only if adoption reaches 30+ active users.", ["ev-base-001"], "medium", 0.83),
    event("evt-010", timestamps[9], "handoff", "security-agent", "policy-gate-agent", "Security recommendation sent", "@Policy Gate Agent security recommendation is conditional approval with SOC 2, SSO, and admin-control confirmation.", ["ev-public-trust"], "high", 0.86),
    event("evt-011", timestamps[10], "handoff", "privacy-legal-agent", "policy-gate-agent", "Legal recommendation sent", "@Policy Gate Agent legal recommendation is escalate until DPA and AI-training opt-out are confirmed.", ["ev-public-privacy"], "high", 0.88),
    event("evt-012", timestamps[11], "handoff", "finance-agent", "policy-gate-agent", "Procurement recommendation sent", "@Policy Gate Agent procurement recommendation is conditional approval with renewal reminder and duplicate-tool review.", ["ev-base-001"], "medium", 0.84),
    event("evt-013", timestamps[12], "decision", "policy-gate-agent", null, "Final recommendation produced", "I have combined findings. Final recommendation: Conditionally Approved with CISO and Legal approval required.", ["ev-public-trust", "ev-public-privacy", "ev-base-001"], "high", 0.89),
    event("evt-014", timestamps[13], "tool_result", "policy-gate-agent", null, "Decision packet generated", "AI Vendor Passport decision packet generated with agent handoffs, evidence hashes, conditions, and approvers.", ["ev-packet-001"], "low", 0.93),
    event("evt-015", timestamps[14], "tool_result", "system", null, "Evidence Ledger updated", "Evidence Ledger updated. AI Vendor Passport memo ready for export.", ["ev-packet-001"], "low", 0.95)
  ];
}

function buildSharedContext(vendor, initial = false) {
  return {
    vendorSummary: `${vendor.name} is an unapproved ${vendor.category} tool used by ${vendor.department}.`,
    dataExposure: vendor.dataExposure,
    evidenceDiscovered: initial
      ? []
      : [
          "Privacy policy found",
          "Trust center found",
          "Pricing page found",
          "Expense and extension usage signals captured"
        ],
    missingEvidence: initial
      ? ["DPA", "SOC 2 report", "Subprocessors", "AI training opt-out", "SSO confirmation"]
      : [
          "Latest SOC 2 or bridge letter",
          "DPA",
          "Subprocessors page",
          "AI training opt-out confirmation",
          "SSO and admin-control confirmation"
        ],
    securityFindings: initial
      ? []
      : ["SOC 2 is mentioned but not attached", "SSO availability is unclear", "Admin controls need confirmation"],
    legalFindings: initial
      ? []
      : ["DPA is missing", "AI training policy is unclear", "Subprocessors documentation is missing"],
    financeFindings: initial
      ? []
      : ["Annual spend is $18,000", "Duplicate tool risk exists", "Renewal reminder required"],
    policyRequirements,
    riskScore: vendor.riskScore,
    finalRecommendation: initial ? "Pending agent review" : "Conditionally Approved"
  };
}

function event(id, timestamp, type, fromAgentId, toAgentId, title, body, evidenceIds, riskImpact, confidence) {
  return {
    id,
    roomId: "",
    timestamp,
    type,
    fromAgentId,
    toAgentId,
    title,
    body,
    evidenceIds,
    riskImpact,
    confidence,
    status: "complete"
  };
}

function deriveAgentState(events) {
  return AGENT_DEFINITIONS.map((agent) => {
    if (agent.id === "system") return agent;
    const ownEvents = events.filter((eventItem) => eventItem.fromAgentId === agent.id);
    const targetedEvents = events.filter((eventItem) => eventItem.toAgentId === agent.id);
    const findingsCount = ownEvents.filter((eventItem) => ["finding", "decision", "tool_result"].includes(eventItem.type)).length;
    const last = [...ownEvents, ...targetedEvents].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).at(-1);
    return {
      ...agent,
      status: agent.id === "human-reviewer" ? "waiting" : "complete",
      findingsCount,
      lastAction: last?.title || agent.lastAction,
      confidence: agent.confidence
    };
  });
}
