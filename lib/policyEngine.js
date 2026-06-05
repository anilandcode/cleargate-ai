const decisionOrder = ["approved", "conditional", "escalate", "blocked"];

export function scorePolicy(vendor) {
  const flags = vendor.evidenceFlags || {};
  let score = 20;
  const factors = [{ label: "Base intake risk", points: 20 }];

  const add = (condition, points, label) => {
    if (!condition) return;
    score += points;
    factors.push({ label, points });
  };

  add(vendor.dataExposure === "high" || vendor.dataExposure === "critical", 20, "High data exposure");
  add(flags.dpaMissing, 15, "DPA missing");
  add(flags.soc2Missing, 15, "SOC 2 or bridge letter missing");
  add(flags.aiTrainingUnclear, 10, "AI training policy unclear");
  add(flags.subprocessorsMissing, 10, "Subprocessors page missing");
  add(flags.ssoUnclear, 8, "SSO availability unclear");
  add(flags.duplicateToolRisk, 7, "Duplicate tool risk");
  add(flags.renewalRisk, 5, "Renewal risk");

  score = Math.min(score, 100);
  let decision = decisionFromScore(score);
  let override = null;

  if ((vendor.dataExposure === "high" || vendor.dataExposure === "critical") && flags.dpaMissing && flags.aiTrainingUnclear) {
    const updated = enforceMinimum(decision, "escalate");
    if (updated !== decision) {
      override = "High data exposure with missing DPA and unclear AI training requires escalation.";
      decision = updated;
    }
  }

  if ((vendor.dataExposure === "high" || vendor.dataExposure === "critical") && flags.noSecurityEvidence) {
    const updated = enforceMinimum(decision, "escalate");
    if (updated !== decision) {
      override = "High data exposure with no security evidence requires escalation.";
      decision = updated;
    }
  }

  if (vendor.dataExposure === "critical" && flags.missingPrivacyDocs) {
    const updated = enforceMinimum(decision, "blocked");
    if (updated !== decision) {
      override = "Critical sensitive data with missing privacy documentation requires blocking.";
      decision = updated;
    }
  }

  const riskLevel = riskLevelFromScore(score, decision);

  return {
    score,
    factors,
    decision,
    riskLevel,
    override,
    confidence: decision === "blocked" ? 0.92 : 0.89
  };
}

export function decisionFromScore(score) {
  if (score <= 29) return "approved";
  if (score <= 59) return "conditional";
  if (score <= 79) return "escalate";
  return "blocked";
}

export function riskLevelFromScore(score, decision) {
  if (decision === "blocked" || score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export function enforceMinimum(current, minimum) {
  return decisionOrder.indexOf(current) >= decisionOrder.indexOf(minimum) ? current : minimum;
}

export function displayDecision(decision) {
  return {
    approved: "Approved",
    conditional: "Conditionally Approved",
    escalate: "Escalate",
    blocked: "Block"
  }[decision] || decision;
}

export function buildFinalDecision(vendor, context = {}) {
  const policy = scorePolicy(vendor);
  const conditionalDecision = policy.decision === "blocked" ? "conditional" : policy.decision;
  const conditions = [
    "Upload latest SOC 2 report or bridge letter.",
    "Legal must review and approve DPA before rollout.",
    "Confirm customer data is not used for model training, or enable enterprise opt-out.",
    "Enable SSO, admin controls, and audit logging before department rollout.",
    "Set renewal reminder and duplicate-tool review before expansion.",
    "CISO approval required because customer data exposure is high."
  ];

  return {
    decision: conditionalDecision,
    riskLevel: policy.decision === "blocked" ? "high" : policy.riskLevel,
    confidence: policy.confidence,
    score: policy.score,
    summary:
      "Security and Legal both flagged missing evidence. Final recommendation is conditional approval with CISO and Legal approval required before production rollout.",
    requiredConditions: conditions,
    requiredApprovers: ["CISO", "Legal", "Procurement"],
    businessImpact:
      "Sales and Customer Success can save review time, but rollout should pause until customer-data controls and contractual terms are confirmed.",
    auditTrail: [
      "Discovery Agent mapped public evidence and missing documents.",
      "Security Agent flagged SOC 2, SSO, and admin-control gaps.",
      "Privacy & Legal Agent flagged DPA, subprocessors, and AI training uncertainty.",
      "Finance & Procurement Agent flagged duplicate tooling and renewal controls.",
      "Policy Gate Agent applied deterministic policy scoring and generated the decision."
    ],
    generatedAt: context.generatedAt || "2026-06-05T09:18:00.000Z",
    policyFactors: policy.factors,
    policyOverride: policy.override
  };
}
