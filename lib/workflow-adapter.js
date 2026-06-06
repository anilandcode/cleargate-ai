function workflowConfig() {
  return {
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || "",
  };
}

function workflowIntegrationStatus() {
  const config = workflowConfig();
  return {
    slack: config.slackWebhookUrl ? "configured" : "draft-only",
  };
}

function sanitizeText(value, fallback = "") {
  return String(value || fallback)
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 8000);
}

function sanitizeVendor(vendor = {}) {
  return {
    id: sanitizeText(vendor.id, "vendor").replace(/[^a-z0-9-]/gi, "-").toLowerCase(),
    name: sanitizeText(vendor.name, "Unknown vendor").slice(0, 140),
    domain: sanitizeText(vendor.domain, "example.com").replace(/^https?:\/\//, "").split("/")[0],
    decision: sanitizeText(vendor.decision, "Escalate"),
    riskScore: Math.max(0, Math.min(100, Number(vendor.riskScore || 0))),
    freshnessScore: Math.max(0, Math.min(100, Number(vendor.freshnessScore || 0))),
    gapIndex: Math.max(0, Math.min(100, Number(vendor.gapIndex || 0))),
    policyProfile: sanitizeText(vendor.policyProfile, "Standard SaaS Vendor"),
    dataExposure: sanitizeText(vendor.dataExposure, "Unknown"),
    department: sanitizeText(vendor.department, "Unassigned"),
    category: sanitizeText(vendor.category, "AI tool"),
  };
}

function safePublicUrl(value) {
  try {
    const url = new URL(String(value || ""));
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (url.username || url.password) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function evidenceSummary(evidence = []) {
  return evidence.slice(0, 8).map((item) => ({
    title: sanitizeText(item.title, "Evidence record").slice(0, 180),
    product: sanitizeText(item.product, "Unknown product").slice(0, 80),
    sourceType: sanitizeText(item.sourceType, "Source").slice(0, 80),
    url: safePublicUrl(item.officialSourceUrl || item.url).slice(0, 600),
    hash: sanitizeText(item.evidenceHash, "pending").slice(0, 80),
    claim: sanitizeText(item.claim, "").slice(0, 500),
    evidenceOrigin: sanitizeText(item.evidenceOrigin || "SEEDED_DEMO_DATA", "SEEDED_DEMO_DATA").slice(0, 80),
  }));
}

function evidenceLabel(evidence = []) {
  if (evidence.some((item) => item.evidenceOrigin === "LIVE_FETCH")) return "LIVE EVIDENCE";
  if (evidence.some((item) => item.evidenceOrigin === "CACHED_LIVE_SNAPSHOT")) return "CACHED LIVE SNAPSHOT";
  return "DEMO SCENARIO";
}

function buildEscalationPayload(input = {}) {
  const vendor = sanitizeVendor(input.vendor || {});
  const missingEvidence = Array.isArray(input.missingEvidence)
    ? input.missingEvidence.map((item) => sanitizeText(item).slice(0, 120)).filter(Boolean)
    : [];
  const requiredConditions = Array.isArray(input.requiredConditions)
    ? input.requiredConditions.map((item) => sanitizeText(item).slice(0, 400)).filter(Boolean)
    : [];
  const topFindings = Array.isArray(input.topFindings)
    ? input.topFindings.map((item) => sanitizeText(item).slice(0, 400)).filter(Boolean)
    : [];
  const payload = {
    workflowId: `CG-ESC-${vendor.id.toUpperCase()}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    vendor,
    missingEvidence,
    requiredConditions,
    topFindings,
    reviewerNotes: sanitizeText(input.reviewerNotes || "No reviewer notes supplied.").slice(0, 1200),
    triggerReason: sanitizeText(input.triggerReason || `${vendor.decision} requires human review.`, `${vendor.decision} requires human review.`).slice(0, 600),
    memoHash: sanitizeText(input.memoHash || `CG-${vendor.id.toUpperCase()}-${vendor.riskScore}${vendor.freshnessScore}${vendor.gapIndex}`).slice(0, 120),
    evidence: evidenceSummary(input.evidence || []),
  };
  payload.evidenceLabel = evidenceLabel(payload.evidence);
  payload.summary = `${vendor.name} requires ${vendor.decision} workflow action. Risk ${vendor.riskScore}; ${missingEvidence.length} open evidence gap${missingEvidence.length === 1 ? "" : "s"}.`;
  return payload;
}

function slackBlocks(payload) {
  const fields = [
    `*Decision:* ${payload.vendor.decision}`,
    `*Risk:* ${payload.vendor.riskScore}`,
    `*Freshness:* ${payload.vendor.freshnessScore}%`,
    `*Gap:* ${payload.vendor.gapIndex}%`,
    `*Department:* ${payload.vendor.department}`,
    `*Category:* ${payload.vendor.category}`,
    `*Exposure:* ${payload.vendor.dataExposure}`,
  ];
  return {
    text: `ClearGate AI escalation: ${payload.vendor.name}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `ClearGate AI: ${payload.vendor.name}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: payload.summary,
        },
      },
      {
        type: "section",
        fields: fields.map((text) => ({ type: "mrkdwn", text })),
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Evidence label:* ${payload.evidenceLabel}\n*Trigger:* ${payload.triggerReason}\n*Missing controls:* ${payload.missingEvidence.length ? payload.missingEvidence.join(", ") : "none"}\n*Memo hash:* ${payload.memoHash}`,
        },
      },
      ...(payload.evidence.filter((item) => item.url).slice(0, 3).length ? [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Evidence links:*\n${payload.evidence.filter((item) => item.url).slice(0, 3).map((item) => `- <${item.url}|${item.sourceType}>`).join("\n")}`,
        },
      }] : []),
    ],
  };
}

async function postJson(url, body, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = text;
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${typeof parsed === "string" ? parsed.slice(0, 240) : JSON.stringify(parsed).slice(0, 240)}`);
  }
  return parsed;
}

async function sendSlack(payload, config) {
  if (!config.slackWebhookUrl) return null;
  await postJson(config.slackWebhookUrl, slackBlocks(payload));
  return { target: "Slack", status: "sent" };
}

async function createEscalation(input = {}) {
  const config = workflowConfig();
  const payload = buildEscalationPayload(input);
  const deliveries = [];
  const errors = [];

  for (const sender of [sendSlack]) {
    try {
      const delivery = await sender(payload, config);
      if (delivery) deliveries.push(delivery);
    } catch (error) {
      errors.push(error.message || "Workflow delivery failed.");
    }
  }

  return {
    mode: deliveries.length ? "workflow-sent" : errors.length ? "workflow-failed" : "workflow-draft",
    provider: "ClearGate AI workflow adapter",
    generatedAt: new Date().toISOString(),
    deliveries,
    errors,
    draft: payload,
    adapterNotes: deliveries.length
      ? ["Escalation package was delivered through configured workflow integrations."]
      : errors.length
        ? ["External escalation delivery failed. An exportable escalation draft was returned for retry."]
        : ["No Slack webhook is configured, so an exportable escalation draft was returned."],
  };
}

module.exports = {
  buildEscalationPayload,
  slackBlocks,
  createEscalation,
  workflowIntegrationStatus,
};
