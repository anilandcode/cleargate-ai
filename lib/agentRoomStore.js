import { baseEvidenceLedger, DEMO_VENDOR_ID, getVendor, vendors } from "./demoData.js";
import { buildDemoRoom, buildInitialRoom } from "./agentRoomDemo.js";
import { mapAgentEventsToEvidence, mergeEvidence } from "./evidenceMapper.js";
import { buildDecisionPacket, buildMemoText } from "./memoBuilder.js";

const STORAGE_KEY = "cleargate-ai-state-v1";

export function createInitialState() {
  return {
    vendors,
    selectedVendorId: DEMO_VENDOR_ID,
    evidenceLedger: [...baseEvidenceLedger],
    rooms: {},
    reviewerNotes: "",
    activeTab: "overview"
  };
}

export function loadState() {
  if (typeof localStorage === "undefined") return createInitialState();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createInitialState();
    const parsed = JSON.parse(saved);
    return {
      ...createInitialState(),
      ...parsed,
      vendors,
      evidenceLedger: parsed.evidenceLedger?.length ? parsed.evidenceLedger : [...baseEvidenceLedger]
    };
  } catch (error) {
    console.warn("Unable to load ClearGate AI state", error);
    return createInitialState();
  }
}

export function saveState(state) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY);
  return createInitialState();
}

export function getRoomForVendor(state, vendorId) {
  const vendor = getVendor(vendorId);
  return state.rooms[vendorId] || buildInitialRoom(vendor);
}

export function startDemoReview(state, vendorId) {
  const vendor = getVendor(vendorId);
  const room = buildDemoRoom(vendor);
  const agentEvidence = mapAgentEventsToEvidence(room, vendor);
  return {
    ...state,
    selectedVendorId: vendorId,
    rooms: {
      ...state.rooms,
      [vendorId]: room
    },
    evidenceLedger: mergeEvidence(state.evidenceLedger, agentEvidence),
    activeTab: "agent-room"
  };
}

export function saveHumanAction(state, vendorId, action, notes) {
  const vendor = getVendor(vendorId);
  const existingRoom = getRoomForVendor(state, vendorId);
  const timestamp = new Date().toISOString();
  const humanAction = {
    id: `human-${timestamp}`,
    action,
    notes,
    timestamp
  };
  const room = {
    ...existingRoom,
    humanActions: [...(existingRoom.humanActions || []), humanAction],
    finalDecision: existingRoom.finalDecision
      ? {
          ...existingRoom.finalDecision,
          humanOverrideStatus: action,
          humanOverrideNotes: notes,
          humanOverrideAt: timestamp
        }
      : existingRoom.finalDecision
  };
  const evidence = {
    id: `ev-human-${vendor.id}-${timestamp.replace(/\W/g, "")}`,
    vendorId,
    source: "Human Reviewer",
    claim: `${formatHumanAction(action)}. ${notes || "No reviewer notes provided."}`,
    evidenceType: "human_action",
    confidence: 1,
    timestamp,
    hash: `ev_human_${timestamp.replace(/\W/g, "").slice(-8)}`,
    includeInMemo: true,
    policyMapping: "Human-in-the-loop approval",
    riskImpact: action.includes("block") || action.includes("escalate") ? "high" : "medium"
  };

  return {
    ...state,
    rooms: {
      ...state.rooms,
      [vendorId]: room
    },
    evidenceLedger: mergeEvidence(state.evidenceLedger, [evidence]),
    reviewerNotes: notes
  };
}

export function exportPacket(state, vendorId) {
  const vendor = getVendor(vendorId);
  const room = getRoomForVendor(state, vendorId);
  return {
    packet: buildDecisionPacket(room, vendor, state.evidenceLedger),
    memo: buildMemoText(room, vendor, state.evidenceLedger)
  };
}

export function formatHumanAction(action) {
  return {
    approve: "Approved by human reviewer",
    approve_with_conditions: "Approved with conditions by human reviewer",
    request_more_evidence: "Requested more evidence",
    escalate_security: "Escalated to Security",
    escalate_legal: "Escalated to Legal",
    block_tool: "Blocked by human reviewer"
  }[action] || action;
}
