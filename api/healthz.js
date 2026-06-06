const { integrationMode, reviewIntegrationStatus } = require("../lib/review-adapter");
const { workflowIntegrationStatus } = require("../lib/workflow-adapter");

module.exports = async function healthHandler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({
    ok: true,
    mode: integrationMode(),
    integrations: reviewIntegrationStatus(),
    workflow: workflowIntegrationStatus(),
  }));
};
