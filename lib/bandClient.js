import { buildDemoRoom } from "./agentRoomDemo.js";

export async function startBandReview(vendor, options = {}) {
  const env = options.env || {};
  const requestedMode = options.mode || "demo";

  if (requestedMode !== "live" && env.BAND_LIVE !== "1") {
    return buildDemoRoom(vendor, { mode: "demo" });
  }

  const missing = requiredBandVars.filter((key) => !env[key]);
  if (missing.length) {
    return buildDemoRoom(vendor, {
      mode: "demo",
      warning: `Live Band credentials missing: ${missing.join(", ")}. Demo fallback used.`
    });
  }

  try {
    const response = await fetch(`${env.BAND_API_BASE.replace(/\/$/, "")}/rooms/${env.BAND_ROOM_ID}/reviews`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.BAND_API_KEY}`
      },
      body: JSON.stringify({
        workspaceId: env.BAND_WORKSPACE_ID,
        vendor,
        agents: {
          discovery: env.BAND_AGENT_DISCOVERY_ID,
          security: env.BAND_AGENT_SECURITY_ID,
          legal: env.BAND_AGENT_LEGAL_ID,
          finance: env.BAND_AGENT_FINANCE_ID,
          policy: env.BAND_AGENT_POLICY_ID
        }
      })
    });

    if (!response.ok) throw new Error(`Band request failed with ${response.status}`);
    const payload = await response.json();
    return {
      ...buildDemoRoom(vendor, { mode: "live", bandRoomId: payload.roomId || env.BAND_ROOM_ID }),
      livePayload: payload
    };
  } catch (error) {
    return buildDemoRoom(vendor, {
      mode: "demo",
      warning: `Live Band request failed: ${error.message}. Demo fallback used.`
    });
  }
}

const requiredBandVars = [
  "BAND_API_BASE",
  "BAND_WORKSPACE_ID",
  "BAND_ROOM_ID",
  "BAND_AGENT_DISCOVERY_ID",
  "BAND_AGENT_SECURITY_ID",
  "BAND_AGENT_LEGAL_ID",
  "BAND_AGENT_FINANCE_ID",
  "BAND_AGENT_POLICY_ID",
  "BAND_API_KEY"
];
