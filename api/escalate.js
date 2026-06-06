const { createEscalation } = require("../lib/workflow-adapter");

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function requestPayload(req) {
  if (req.body && typeof req.body === "object") {
    if (JSON.stringify(req.body).length > 1_000_000) throw new Error("Request body too large");
    return req.body;
  }
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const body = await readBody(req);
  return body ? JSON.parse(body) : {};
}

module.exports = async function escalationHandler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const payload = await requestPayload(req);
    const response = await createEscalation(payload);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(response));
  } catch (error) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: error.message || "Invalid escalation request" }));
  }
};
