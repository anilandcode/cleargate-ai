import { displayDecision } from "./policyEngine.js";
import { formatCurrency } from "./demoData.js";

export function buildDecisionPacket(room, vendor, evidenceLedger = []) {
  const finalDecision = room.finalDecision || {};
  const agentFindings = evidenceLedger.filter(
    (item) => item.vendorId === vendor.id && item.source?.startsWith("Agent Room")
  );
  const handoffCount = (room.events || []).filter((event) => event.type === "handoff").length;

  return {
    title: "AI Vendor Passport - Agent Review Packet",
    vendorSummary: {
      name: vendor.name,
      domain: vendor.domain,
      category: vendor.category,
      department: vendor.department,
      users: vendor.users,
      annualSpend: vendor.annualSpend,
      status: vendor.status
    },
    shadowAiDiscoverySource: vendor.trigger,
    dataExposure: {
      level: vendor.dataExposure,
      sensitiveData: vendor.sensitiveData
    },
    bandCollaborationProof: {
      agentsInvolved: (room.agents || []).length,
      handoffs: handoffCount,
      findings: agentFindings.length,
      timeToDecision: "4m 12s",
      finalStatus: displayDecision(finalDecision.decision)
    },
    agentCollaborationSummary:
      "Discovery, Security, Privacy & Legal, Finance & Procurement, and Policy Gate agents collaborated through a shared room, handed off evidence gaps, and generated an audit-ready decision trace.",
    discoveryFindings: filterFindings(agentFindings, "Discovery Agent"),
    securityFindings: filterFindings(agentFindings, "Security Agent"),
    privacyLegalFindings: filterFindings(agentFindings, "Privacy & Legal Agent"),
    financeProcurementFindings: filterFindings(agentFindings, "Finance & Procurement Agent"),
    policyGateDecision: finalDecision,
    requiredConditions: finalDecision.requiredConditions || [],
    requiredApprovers: finalDecision.requiredApprovers || [],
    evidenceLedger: evidenceLedger.filter((item) => item.vendorId === vendor.id),
    humanReviewerNotes: room.humanActions || [],
    auditTrail: finalDecision.auditTrail || [],
    finalDecision: displayDecision(finalDecision.decision)
  };
}

export function buildMemoText(room, vendor, evidenceLedger = []) {
  const packet = buildDecisionPacket(room, vendor, evidenceLedger);
  const lines = [
    "# AI Vendor Passport - Agent Review Packet",
    "",
    "## 1. Vendor Summary",
    `${vendor.name} (${vendor.domain}) is a ${vendor.category} tool used by ${vendor.department}. It has ${vendor.users} users and ${formatCurrency(vendor.annualSpend)} annual spend.`,
    "",
    "## 2. Shadow AI Discovery Source",
    vendor.trigger,
    "",
    "## 3. Data Exposure",
    `${vendor.dataExposure.toUpperCase()} exposure: ${vendor.sensitiveData.join(", ")}.`,
    "",
    "## 4. Agent Collaboration Summary",
    packet.agentCollaborationSummary,
    "",
    "## Band Collaboration Proof",
    `Agents involved: ${packet.bandCollaborationProof.agentsInvolved}`,
    `Handoffs: ${packet.bandCollaborationProof.handoffs}`,
    `Findings: ${packet.bandCollaborationProof.findings}`,
    `Time to decision: ${packet.bandCollaborationProof.timeToDecision}`,
    `Final status: ${packet.bandCollaborationProof.finalStatus}`,
    "",
    "## 5. Discovery Findings",
    formatFindingLines(packet.discoveryFindings),
    "",
    "## 6. Security Findings",
    formatFindingLines(packet.securityFindings),
    "",
    "## 7. Privacy & Legal Findings",
    formatFindingLines(packet.privacyLegalFindings),
    "",
    "## 8. Finance & Procurement Findings",
    formatFindingLines(packet.financeProcurementFindings),
    "",
    "## 9. Policy Gate Decision",
    `${packet.finalDecision}. ${packet.policyGateDecision.summary || ""}`,
    "",
    "## 10. Required Conditions",
    formatList(packet.requiredConditions),
    "",
    "## 11. Required Approvers",
    formatList(packet.requiredApprovers),
    "",
    "## 12. Evidence Ledger",
    formatEvidence(packet.evidenceLedger),
    "",
    "## 13. Human Reviewer Notes",
    formatHumanActions(packet.humanReviewerNotes),
    "",
    "## 14. Audit Trail",
    formatList(packet.auditTrail),
    "",
    "## 15. Final Decision",
    packet.finalDecision
  ];

  return lines.join("\n");
}

function filterFindings(items, agentName) {
  return items.filter((item) => item.source?.includes(agentName));
}

function formatFindingLines(items) {
  if (!items.length) return "- No findings recorded.";
  return items.map((item) => `- ${item.claim}`).join("\n");
}

function formatList(items = []) {
  if (!items.length) return "- None";
  return items.map((item) => `- ${item}`).join("\n");
}

function formatEvidence(items = []) {
  if (!items.length) return "- No evidence records.";
  return items
    .map((item) => `- [${item.hash}] ${item.source}: ${item.claim} (${item.riskImpact})`)
    .join("\n");
}

function formatHumanActions(actions = []) {
  if (!actions.length) return "- No human reviewer action recorded.";
  return actions.map((action) => `- ${action.action}: ${action.notes || "No notes"} (${action.timestamp})`).join("\n");
}
