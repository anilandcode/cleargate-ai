const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");

function includesAll(source, values, message) {
  values.forEach((value) => assert(source.includes(value), `${message}: ${value}`));
}

function main() {
  const vendorsBlock = app.match(/let vendors = \[([\s\S]*?)\n\];/);
  assert(vendorsBlock, "Expected seeded vendors array.");
  const seededIds = [...vendorsBlock[1].matchAll(/^\s{4}id: "([^"]+)",$/gm)].map((match) => match[1]);
  assert.strictEqual(new Set(seededIds).size, 11, "Expected exactly 11 deterministic seeded vendors.");
  includesAll(app, [
    'decision: "Approve"',
    'decision: "Approve with conditions"',
    'decision: "Escalate"',
    'decision: "Block pending review"',
  ], "Expected seeded decision variety");
  includesAll(app, [
    "function exportMemo(vendor)",
    "function renderEvidence(vendor)",
    "function renderPolicy(vendor)",
    "function renderAgentRoom(vendor)",
    "function startBandAgentReview(vendorId)",
    "function renderDecisionSidebar(vendor)",
    "function escalateVendor(vendorId)",
    "Band Agent Room",
    "Band Agent Finding",
    "snapshotSha256",
    "AI-extracted finding",
    "Rules-based finding",
  ], "Expected judge workflow contract");
  includesAll(index, ["Inbox", "Reviews", "Evidence", "Policies", "Reports", "Settings", "Agent Room"], "Expected primary navigation and review tabs");
  console.log("App contract tests passed.");
}

main();
