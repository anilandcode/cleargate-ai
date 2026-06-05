import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const port = await findPort();
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["server.js"], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"]
});

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

try {
  await waitForServer(baseUrl);

  const appHtml = await fetchText(`${baseUrl}/`);
  assert.match(appHtml, /ClearGate AI/);

  const health = await fetchJson(`${baseUrl}/healthz`);
  assert.equal(health.ok, true);

  const review = await fetchJson(`${baseUrl}/api/review`, {
    method: "POST",
    body: JSON.stringify({ vendorId: "synthnote-ai" })
  });
  assert.equal(review.ok, true);
  assert.equal(review.review.vendorId, "synthnote-ai");

  const started = await fetchJson(`${baseUrl}/api/agent-room/start`, {
    method: "POST",
    body: JSON.stringify({ vendorId: "synthnote-ai", mode: "demo" })
  });
  assert.ok(started.room);
  assert.ok(started.room.agents.length >= 5);
  assert.ok(started.events.length >= 10);
  assert.ok(started.finalDecision);
  assert.ok(started.evidenceLedger.some((item) => item.source.includes("Agent Room")));

  const action = await fetchJson(`${baseUrl}/api/agent-room/synthnote-ai/human-action`, {
    method: "POST",
    body: JSON.stringify({
      action: "approve_with_conditions",
      notes: "Approved only after DPA, SOC 2 bridge letter, and SSO confirmation."
    })
  });
  assert.ok(action.room.humanActions.length >= 1);
  assert.ok(action.evidenceLedger.some((item) => item.source === "Human Reviewer"));

  const exported = await fetchJson(`${baseUrl}/api/agent-room/synthnote-ai/export`, {
    method: "POST",
    body: JSON.stringify({})
  });
  assert.match(exported.memo, /AI Vendor Passport - Agent Review Packet/);
  assert.match(exported.memo, /Band Collaboration Proof/);
  assert.match(exported.memo, /DPA/);

  console.log("Smoke checks passed");
} finally {
  server.kill("SIGTERM");
  await new Promise((resolve) => server.once("exit", resolve));
}

async function findPort() {
  const net = await import("node:net");
  return await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => resolve(address.port));
    });
  });
}

async function waitForServer(url) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${url}/healthz`);
      if (response.ok) return;
    } catch {
      await sleep(100);
    }
  }
  throw new Error(`Server did not start. Output:\n${serverOutput}`);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json();
  assert.equal(response.ok, true, JSON.stringify(payload));
  return payload;
}

async function fetchText(url) {
  const response = await fetch(url);
  assert.equal(response.ok, true);
  return response.text();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
