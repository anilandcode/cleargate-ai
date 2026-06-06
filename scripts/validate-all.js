const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const checks = [
  ["node", ["--check", "app.js"]],
  ["node", ["--check", "server.js"]],
  ["node", ["--check", "api/review.js"]],
  ["node", ["--check", "api/escalate.js"]],
  ["node", ["--check", "api/healthz.js"]],
  ["node", ["--check", "lib/review-adapter.js"]],
  ["node", ["--check", "lib/aiml-adapter.js"]],
  ["node", ["--check", "lib/workflow-adapter.js"]],
  ["node", ["scripts/test-app-contract.js"]],
  ["node", ["scripts/test-review-adapter.js"]],
  ["node", ["scripts/test-aiml-adapter.js"]],
  ["node", ["scripts/test-workflow-adapter.js"]],
  ["node", ["scripts/smoke-server.js"]],
];

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", env: process.env });
  if (result.status !== 0) process.exit(result.status || 1);
}

function scanSecrets() {
  const files = [
    ".env.example",
    "README.md",
    "app.js",
    "server.js",
    "lib/review-adapter.js",
    "lib/aiml-adapter.js",
    "lib/workflow-adapter.js",
    "api/review.js",
    "api/escalate.js",
  ];
  const forbidden = [
    /gho_[A-Za-z0-9_]{16,}/,
    /sk-[A-Za-z0-9_-]{20,}/,
    /hooks\.slack\.com\/services\/(?!your\/webhook\/path)[A-Za-z0-9/_-]{20,}/,
  ];
  files.forEach((file) => {
    const content = fs.readFileSync(path.join(root, file), "utf8");
    forbidden.forEach((pattern) => {
      if (pattern.test(content)) throw new Error(`Potential committed secret detected in ${file}.`);
    });
  });
  console.log("Secret scan passed.");
}

scanSecrets();
checks.forEach(([command, args]) => run(command, args));
console.log("All ClearGate AI validation checks passed.");
