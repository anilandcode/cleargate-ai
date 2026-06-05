import { baseEvidenceLedger, getVendor } from "./demoData.js";
import { buildDemoRoom, buildInitialRoom } from "./agentRoomDemo.js";
import { startBandReview } from "./bandClient.js";
import { mapAgentEventsToEvidence, mergeEvidence, stableHash } from "./evidenceMapper.js";
import { buildDecisionPacket, buildMemoText } from "./memoBuilder.js";

export function createApiRuntime() {
  return {
    rooms: new Map(),
    evidenceLedger: [...baseEvidenceLedger]
  };
}

export async function handleApiRequest({ method, pathname, body = {}, env = {}, runtime }) {
  if (pathname === "/healthz" && method === "GET") {
    return ok({ ok: true, service: "cleargate-ai" });
  }

  if (pathname === "/api/review" && (method === "GET" || method === "POST")) {
    const vendor = getVendor(body.vendorId);
    const policy = {
      vendorId: vendor.id,
      status: vendor.reviewStatus,
      riskScore: vendor.riskScore,
      dataExposure: vendor.dataExposure,
      missingEvidence: Object.entries(vendor.evidenceFlags || {})
        .filter(([key, value]) => value && key.toLowerCase().includes("missing"))
        .map(([key]) => key)
    };
    return ok({ ok: true, review: policy });
  }

  if (pathname === "/api/agent-room/start" && method === "POST") {
    const vendor = getVendor(body.vendorId);
    const room = await startBandReview(vendor, { mode: body.mode || "demo", env });
    return saveRoom(runtime, vendor, room);
  }

  const match = pathname.match(/^\/api\/agent-room\/([^/]+)(?:\/([^/]+))?$/);
  if (!match) return notFound();

  const vendorId = decodeURIComponent(match[1]);
  const action = match[2] || "";
  const vendor = getVendor(vendorId);

  if (!action && method === "GET") {
    const room = runtime.rooms.get(vendor.id) || buildInitialRoom(vendor);
    return ok({
      room,
      events: room.events,
      sharedContext: room.sharedContext,
      finalDecision: room.finalDecision,
      evidenceLedger: runtime.evidenceLedger.filter((item) => item.vendorId === vendor.id)
    });
  }

  if (action === "replay" && method === "POST") {
    const room = buildDemoRoom(vendor);
    return saveRoom(runtime, vendor, room);
  }

  if (action === "human-action" && method === "POST") {
    const room = runtime.rooms.get(vendor.id) || buildDemoRoom(vendor);
    const timestamp = new Date().toISOString();
    const humanAction = {
      id: `human-${timestamp}`,
      action: body.action,
      notes: body.notes || "",
      timestamp
    };
    const updatedRoom = {
      ...room,
      humanActions: [...(room.humanActions || []), humanAction],
      finalDecision: room.finalDecision
        ? {
            ...room.finalDecision,
            humanOverrideStatus: body.action,
            humanOverrideNotes: body.notes || "",
            humanOverrideAt: timestamp
          }
        : room.finalDecision
    };
    runtime.rooms.set(vendor.id, updatedRoom);
    runtime.evidenceLedger = mergeEvidence(runtime.evidenceLedger, [
      {
        id: `ev-human-${vendor.id}-${timestamp.replace(/\W/g, "")}`,
        vendorId: vendor.id,
        source: "Human Reviewer",
        claim: `${humanActionLabel(body.action)}. ${body.notes || "No reviewer notes provided."}`,
        evidenceType: "human_action",
        confidence: 1,
        timestamp,
        hash: stableHash(`${vendor.id}|human|${body.action}|${body.notes || ""}|${timestamp}`),
        includeInMemo: true,
        policyMapping: "Human-in-the-loop approval",
        riskImpact: body.action?.includes("block") || body.action?.includes("escalate") ? "high" : "medium"
      }
    ]);
    return ok({
      room: updatedRoom,
      evidenceLedger: runtime.evidenceLedger.filter((item) => item.vendorId === vendor.id)
    });
  }

  if (action === "export" && method === "POST") {
    const room = runtime.rooms.get(vendor.id) || buildDemoRoom(vendor);
    const evidenceLedger = runtime.evidenceLedger.filter((item) => item.vendorId === vendor.id);
    return ok({
      packet: buildDecisionPacket(room, vendor, evidenceLedger),
      memo: buildMemoText(room, vendor, evidenceLedger)
    });
  }

  return notFound();
}

function saveRoom(runtime, vendor, room) {
  runtime.rooms.set(vendor.id, room);
  runtime.evidenceLedger = mergeEvidence(runtime.evidenceLedger, mapAgentEventsToEvidence(room, vendor));
  return ok({
    room,
    events: room.events,
    sharedContext: room.sharedContext,
    finalDecision: room.finalDecision,
    evidenceLedger: runtime.evidenceLedger.filter((item) => item.vendorId === vendor.id),
    warning: room.warning
  });
}

function humanActionLabel(action) {
  return {
    approve: "Approved by human reviewer",
    approve_with_conditions: "Approved with conditions by human reviewer",
    request_more_evidence: "Requested more evidence",
    escalate_security: "Escalated to Security",
    escalate_legal: "Escalated to Legal",
    block_tool: "Blocked by human reviewer"
  }[action] || "Human action recorded";
}

function ok(payload) {
  return { status: 200, payload };
}

function notFound() {
  return { status: 404, payload: { ok: false, error: "Not found" } };
}
