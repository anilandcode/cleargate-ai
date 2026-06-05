import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createApiRuntime, handleApiRequest } from "./lib/apiCore.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const runtime = createApiRuntime();
const port = Number(process.env.PORT || 3000);

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/healthz" || url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url.pathname);
    return;
  }

  serveStatic(url.pathname, res);
});

server.listen(port, () => {
  console.log(`ClearGate AI listening on http://localhost:${port}`);
});

async function handleApi(req, res, pathname) {
  try {
    const body = await readJson(req);
    const result = await handleApiRequest({
      method: req.method || "GET",
      pathname,
      body,
      env: process.env,
      runtime
    });
    sendJson(res, result.status, result.payload);
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

async function readJson(req) {
  if (!["POST", "PUT", "PATCH"].includes(req.method || "")) return {};
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

function serveStatic(pathname, res) {
  const requestPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);

  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    const fallback = join(root, "index.html");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    createReadStream(fallback).pipe(res);
    return;
  }

  res.writeHead(200, { "content-type": mimeType(extname(filePath)) });
  createReadStream(filePath).pipe(res);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

function mimeType(extension) {
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp"
  }[extension] || "application/octet-stream";
}
