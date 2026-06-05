export async function generateAgentFinding({ agentRole, vendor, task }) {
  const hasProvider =
    typeof process !== "undefined" &&
    (process.env.OPENAI_API_KEY || process.env.AIML_API_KEY || process.env.FEATHERLESS_API_KEY);

  if (!hasProvider) {
    return deterministicFinding(agentRole, vendor, task);
  }

  return deterministicFinding(agentRole, vendor, task);
}

export function deterministicFinding(agentRole, vendor, task = "review") {
  return {
    agentRole,
    vendorId: vendor.id,
    vendorName: vendor.name,
    task,
    confidence: 0.84,
    finding:
      `${agentRole} deterministic fallback finding for ${vendor.name}: complete the required evidence checklist before rollout.`,
    status: "demo_fallback"
  };
}
