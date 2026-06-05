export function stableHash(input) {
  let hash = 2166136261;
  const text = String(input);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `ev_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function mapAgentEventsToEvidence(room, vendor) {
  const events = room.events || [];
  return events
    .filter((event) => ["finding", "tool_result", "decision", "escalation"].includes(event.type))
    .map((event, index) => {
      const agent = (room.agents || []).find((candidate) => candidate.id === event.fromAgentId);
      const claim = event.body || event.title;
      return {
        id: `ev-agent-${vendor.id}-${String(index + 1).padStart(3, "0")}`,
        vendorId: vendor.id,
        source: agent ? `Agent Room / ${agent.name}` : "Agent Room / System",
        claim,
        evidenceType: event.type === "decision" ? "policy_decision" : "agent_finding",
        confidence: event.confidence || 0.82,
        timestamp: event.timestamp,
        hash: stableHash(`${vendor.id}|${event.id}|${claim}`),
        includeInMemo: true,
        policyMapping: event.policyMapping || policyMappingForEvent(event),
        riskImpact: event.riskImpact || "medium"
      };
    });
}

export function mergeEvidence(existing, additions) {
  const byId = new Map();
  [...existing, ...additions].forEach((item) => {
    byId.set(item.id, item);
  });
  return Array.from(byId.values());
}

function policyMappingForEvent(event) {
  if (event.title?.toLowerCase().includes("dpa")) return "Privacy and legal review";
  if (event.title?.toLowerCase().includes("soc")) return "Security evidence";
  if (event.title?.toLowerCase().includes("decision")) return "Policy Gate decision";
  if (event.fromAgentId === "finance-agent") return "Procurement approval";
  return "Vendor risk governance";
}
