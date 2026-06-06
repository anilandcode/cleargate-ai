const assert = require("assert");
const { buildEscalationPayload, slackBlocks, createEscalation } = require("../lib/workflow-adapter");

const input = {
  vendor: {
    id: "otter",
    name: "Otter.ai",
    domain: "otter.ai",
    category: "Meeting AI",
    department: "Sales",
    dataExposure: "Call recordings",
    decision: "Block pending review",
    riskScore: 91,
    freshnessScore: 62,
    gapIndex: 70,
  },
  triggerReason: "Retention evidence is missing.",
  missingEvidence: ["Subprocessors", "Retention controls"],
  memoHash: "CG-OTTER-916270",
  evidence: [
    { title: "Otter privacy", sourceType: "Privacy Policy", officialSourceUrl: "https://otter.ai/privacy", evidenceOrigin: "LIVE_FETCH", evidenceHash: "EV-1" },
    { title: "Otter trust", sourceType: "Trust Center", officialSourceUrl: "https://otter.ai/trust", evidenceOrigin: "LIVE_FETCH", evidenceHash: "EV-2" },
    { title: "Otter docs", sourceType: "Documentation", officialSourceUrl: "https://otter.ai/docs", evidenceOrigin: "LIVE_FETCH", evidenceHash: "EV-3" },
    { title: "Extra", sourceType: "News", officialSourceUrl: "https://example.com/news", evidenceOrigin: "LIVE_FETCH", evidenceHash: "EV-4" },
  ],
};

function clearWorkflowEnv() {
  delete process.env.SLACK_WEBHOOK_URL;
  delete process.env.JIRA_BASE_URL;
  delete process.env.JIRA_EMAIL;
  delete process.env.JIRA_API_TOKEN;
  delete process.env.JIRA_PROJECT_KEY;
}

function testPayloadAndSlackBlocks() {
  const payload = buildEscalationPayload(input);
  assert.strictEqual(payload.evidenceLabel, "LIVE EVIDENCE");
  assert.strictEqual(payload.vendor.category, "Meeting AI");
  const blocks = slackBlocks(payload);
  const serialized = JSON.stringify(blocks);
  assert(serialized.includes("Retention evidence is missing."));
  assert(serialized.includes("LIVE EVIDENCE"));
  assert.strictEqual(serialized.split("https://").length - 1, 3, "Slack message should contain no more than three evidence links.");
}

async function testMissingWebhookFallback() {
  clearWorkflowEnv();
  const result = await createEscalation(input);
  assert.strictEqual(result.mode, "workflow-draft");
  assert.strictEqual(result.deliveries.length, 0);
}

async function testSlackErrorHandlingWithoutSecretLeak() {
  clearWorkflowEnv();
  const originalFetch = global.fetch;
  const secret = "https://hooks.slack.test/services/secret-value";
  process.env.SLACK_WEBHOOK_URL = secret;
  global.fetch = async () => ({ ok: false, status: 500, text: async () => "delivery unavailable" });
  try {
    const result = await createEscalation(input);
    assert.strictEqual(result.mode, "workflow-failed");
    assert(result.errors.length > 0);
    assert(!JSON.stringify(result).includes(secret), "Slack webhook secret must not appear in returned payload or logs.");
  } finally {
    global.fetch = originalFetch;
    clearWorkflowEnv();
  }
}

async function main() {
  testPayloadAndSlackBlocks();
  await testMissingWebhookFallback();
  await testSlackErrorHandlingWithoutSecretLeak();
  console.log("Workflow adapter tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
