const fs = require("fs/promises");
const http = require("http");
const path = require("path");
const { buildReview, integrationMode, reviewIntegrationStatus } = require("./lib/review-adapter");
const { createEscalation, workflowIntegrationStatus } = require("./lib/workflow-adapter");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

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

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname);
  const filePath = path.normalize(path.join(ROOT, pathname));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const body = await fs.readFile(filePath);
    const type = MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Content-Length": body.length });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (error) {
    res.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(error.code === "ENOENT" ? "Not found" : "Server error");
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && ["/healthz", "/api/healthz"].includes(req.url)) {
    json(res, 200, { ok: true, mode: integrationMode(), integrations: reviewIntegrationStatus(), workflow: workflowIntegrationStatus() });
    return;
  }

  if (req.method === "POST" && req.url === "/api/review") {
    try {
      const body = await readBody(req);
      const payload = body ? JSON.parse(body) : {};
      json(res, 200, await buildReview(payload));
    } catch (error) {
      json(res, 400, { error: error.message || "Invalid review request" });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/api/escalate") {
    try {
      const body = await readBody(req);
      const payload = body ? JSON.parse(body) : {};
      json(res, 200, await createEscalation(payload));
    } catch (error) {
      json(res, 400, { error: error.message || "Invalid escalation request" });
    }
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    await serveStatic(req, res);
    return;
  }

  json(res, 405, { error: "Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`ClearGate AI server running at http://localhost:${PORT}`);
});
