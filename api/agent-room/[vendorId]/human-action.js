import { handleApiRequest } from "../../../lib/apiCore.js";
import { runtime } from "../../../lib/apiRuntime.js";

export default async function handler(req, res) {
  const vendorId = req.query?.vendorId || "";
  const result = await handleApiRequest({
    method: req.method,
    pathname: `/api/agent-room/${vendorId}/human-action`,
    body: req.body || {},
    env: process.env,
    runtime
  });
  res.status(result.status).json(result.payload);
}
