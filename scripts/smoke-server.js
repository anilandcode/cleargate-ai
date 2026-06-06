const { spawn } = require("child_process");

const PORT = 3210;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(pathname, options = {}) {
  const response = await fetch(`${BASE_URL}${pathname}`, options);
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = text;
  }
  return { response, body };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const { response } = await request("/healthz");
      if (response.ok) return;
    } catch {
      await wait(150);
    }
  }
  throw new Error("Server did not become ready.");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(PORT),
      BRIGHTDATA_LIVE: "",
      BRIGHTDATA_API_TOKEN: "",
      BRIGHTDATA_TOKEN: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();
    const health = await request("/healthz");
    assert(health.response.ok, "Expected /healthz to return 200.");
    assert(health.body.mode === "demo-fallback", "Expected demo fallback mode without credentials.");
    assert(health.body.integrations?.aimlApi === "disabled", "Expected AI/ML API to be disabled without credentials.");
    assert(health.body.workflow?.slack === "draft-only", "Expected Slack workflow to be draft-only without a webhook.");
    assert(!JSON.stringify(health.body).includes("token"), "Health response must not expose token fields.");

    const review = await request("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor: {
          id: "otter",
          name: "Otter.ai",
          domain: "otter.ai",
          policyProfile: "High Risk Regulated Vendor",
        },
        missingEvidence: ["Privacy Policy", "Trust Center", "Subprocessors", "Documentation", "News"],
      }),
    });
    assert(review.response.ok, "Expected /api/review to return 200.");
    assert(Array.isArray(review.body.evidence), "Expected evidence array.");
    assert(review.body.evidence.length >= 5, "Expected at least five evidence records.");
    assert(review.body.evidence.some((item) => item.product === "Web Unlocker"), "Expected Web Unlocker evidence.");
    assert(review.body.evidence.some((item) => item.product === "SERP API"), "Expected SERP API evidence.");
    assert(review.body.evidence.every((item) => item.provenance === "seeded_demo_data"), "Expected fallback evidence to be labeled as seeded demo data.");
    assert(!review.body.evidence.some((item) => item.provenance === "live_fetch"), "Fallback mode must not label evidence as live fetch.");
    assert(review.body.reviewMeta?.costEstimate?.totalRequests >= 5, "Expected review cost estimate metadata.");

    const escalation = await request("/api/escalate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor: {
          id: "otter",
          name: "Otter.ai",
          domain: "otter.ai",
          decision: "Escalate",
          riskScore: 88,
        },
        missingEvidence: ["Subprocessors"],
        evidence: review.body.evidence.slice(0, 2),
      }),
    });
    assert(escalation.response.ok, "Expected /api/escalate to return 200.");
    assert(escalation.body.mode === "workflow-draft", "Expected workflow draft mode without integration credentials.");
    assert(escalation.body.draft?.workflowId, "Expected escalation draft workflow ID.");
    console.log("Server smoke test passed.");
  } finally {
    child.kill("SIGINT");
    if (stderr.trim()) process.stderr.write(stderr);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
