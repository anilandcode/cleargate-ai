import { dashboardKpis, DEMO_VENDOR_ID, formatCurrency, getVendor } from "./lib/demoData.js";
import {
  exportPacket,
  getRoomForVendor,
  loadState,
  resetState,
  saveHumanAction,
  saveState,
  startDemoReview
} from "./lib/agentRoomStore.js";
import { displayDecision, scorePolicy } from "./lib/policyEngine.js";

let state = loadState();
let currentView = "dashboard";
let animationState = null;
let animationTimer = null;

const app = document.querySelector("#app");
const navButtons = Array.from(document.querySelectorAll(".nav-item"));

wireChrome();
render();

function wireChrome() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentView = button.dataset.view;
      render();
    });
  });

  document.querySelector("#judge-demo").addEventListener("click", () => {
    state = {
      ...state,
      selectedVendorId: DEMO_VENDOR_ID,
      activeTab: "agent-room"
    };
    currentView = "vendor";
    saveState(state);
    render();
  });

  document.querySelector("#reset-demo").addEventListener("click", () => {
    stopAnimation();
    state = resetState();
    currentView = "dashboard";
    render();
  });

  app.addEventListener("click", handleAppClick);
  app.addEventListener("input", handleAppInput);
}

function handleAppClick(event) {
  const target = event.target.closest("[data-action], [data-select-vendor], [data-tab]");
  if (!target) return;

  if (target.dataset.selectVendor) {
    state = { ...state, selectedVendorId: target.dataset.selectVendor };
    currentView = "vendor";
    saveState(state);
    render();
    return;
  }

  if (target.dataset.tab) {
    state = { ...state, activeTab: target.dataset.tab };
    saveState(state);
    render();
    return;
  }

  const vendorId = state.selectedVendorId;
  const action = target.dataset.action;

  if (action === "start-room" || action === "replay-room") {
    state = startDemoReview(state, vendorId);
    saveState(state);
    startTimelineAnimation(vendorId);
    return;
  }

  if (action === "export-packet") {
    downloadMemo(vendorId);
    return;
  }

  if (action === "show-reports") {
    currentView = "reports";
    render();
    return;
  }

  if (action?.startsWith("human:")) {
    const notes = document.querySelector("#reviewer-notes")?.value || "";
    state = saveHumanAction(state, vendorId, action.replace("human:", ""), notes);
    saveState(state);
    render();
  }
}

function handleAppInput(event) {
  if (event.target.id === "reviewer-notes") {
    state = { ...state, reviewerNotes: event.target.value };
    saveState(state);
  }
}

function startTimelineAnimation(vendorId) {
  stopAnimation();
  animationState = { vendorId, visibleCount: 1 };
  render();
  animationTimer = setInterval(() => {
    const room = getRoomForVendor(state, vendorId);
    animationState.visibleCount += 1;
    if (animationState.visibleCount >= room.events.length) {
      animationState.visibleCount = room.events.length;
      stopAnimation(false);
      render();
      return;
    }
    render();
  }, 520);
}

function stopAnimation(renderAfter = true) {
  if (animationTimer) clearInterval(animationTimer);
  animationTimer = null;
  animationState = null;
  if (renderAfter) render();
}

function render() {
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === currentView);
  });

  const room = getRoomForVendor(state, state.selectedVendorId);
  const sidebarStatus = document.querySelector("#sidebar-room-status");
  const sidebarCaption = document.querySelector("#sidebar-room-caption");
  sidebarStatus.textContent = room.status === "complete" ? "Decision packet ready" : "Demo ready";
  sidebarCaption.textContent = `${room.agents.length} agents configured`;

  if (currentView === "dashboard") app.innerHTML = renderDashboard();
  if (currentView === "vendor") app.innerHTML = renderVendorView();
  if (currentView === "ledger") app.innerHTML = renderLedgerView();
  if (currentView === "reports") app.innerHTML = renderReportsView();
}

function renderDashboard() {
  const selectedVendor = getVendor(state.selectedVendorId);
  return `
    <section class="section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Live posture</p>
          <h3>Shadow AI approval queue</h3>
        </div>
        <button class="button primary" data-select-vendor="${DEMO_VENDOR_ID}" type="button">Open SynthNote AI</button>
      </div>
      <div class="grid kpi-grid">
        ${dashboardKpis
          .map(
            (item) => `
              <article class="kpi-card">
                <span>${escapeHtml(item.label)}</span>
                <p class="kpi-value">${escapeHtml(item.value)}</p>
                <span>${escapeHtml(item.delta)}</span>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
    <section class="section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Shadow AI Inbox</p>
          <h3>Unapproved AI tools</h3>
        </div>
        <span class="status-pill demo">Judge path: ${escapeHtml(selectedVendor.name)}</span>
      </div>
      <div class="grid vendor-grid">
        ${state.vendors.map((vendor) => renderVendorCard(vendor)).join("")}
      </div>
    </section>
  `;
}

function renderVendorCard(vendor) {
  const selected = vendor.id === state.selectedVendorId ? "selected" : "";
  return `
    <article class="vendor-card ${selected}">
      <header>
        <div>
          <p class="eyebrow">${escapeHtml(vendor.department)}</p>
          <h4>${escapeHtml(vendor.name)}</h4>
          <span class="muted">${escapeHtml(vendor.category)}</span>
        </div>
        <span class="risk-pill ${riskClass(vendor.riskScore)}">${vendor.riskScore}</span>
      </header>
      <p>${escapeHtml(vendor.description)}</p>
      <div class="metric-row">
        <div><span>Users</span><strong>${vendor.users}</strong></div>
        <div><span>Spend</span><strong>${formatCurrency(vendor.annualSpend)}</strong></div>
        <div><span>Exposure</span><strong>${escapeHtml(vendor.dataExposure)}</strong></div>
      </div>
      <button class="button secondary" data-select-vendor="${vendor.id}" type="button">Open Review</button>
    </article>
  `;
}

function renderVendorView() {
  const vendor = getVendor(state.selectedVendorId);
  const activeTab = state.activeTab || "overview";
  return `
    <section class="section">
      ${renderVendorSummary(vendor)}
      <div class="tab-list" role="tablist" aria-label="Vendor review tabs">
        ${[
          ["overview", "Overview"],
          ["agent-room", "Agent Room"],
          ["evidence", "Evidence"],
          ["policy", "Policy"],
          ["reports", "Reports"]
        ]
          .map(
            ([id, label]) => `
              <button class="tab-button ${activeTab === id ? "active" : ""}" data-tab="${id}" type="button">${label}</button>
            `
          )
          .join("")}
      </div>
      ${renderActiveVendorTab(vendor, activeTab)}
    </section>
  `;
}

function renderVendorSummary(vendor) {
  const room = getRoomForVendor(state, vendor.id);
  const decision = room.finalDecision?.decision;
  return `
    <div class="panel vendor-summary">
      <div>
        <p class="eyebrow">${escapeHtml(vendor.status)}</p>
        <h3>${escapeHtml(vendor.name)}</h3>
        <p>${escapeHtml(vendor.description)}</p>
        <div class="badge-row">
          <span>${escapeHtml(vendor.domain)}</span>
          <span>${escapeHtml(vendor.department)}</span>
          <span>${escapeHtml(vendor.dataExposure)} exposure</span>
          <span>${escapeHtml(room.mode === "live" ? "Live Band Room" : "Demo Band Room")}</span>
        </div>
      </div>
      <ul class="summary-list">
        <li><span>Risk score</span><strong>${vendor.riskScore}</strong></li>
        <li><span>Band review</span><strong>${escapeHtml(room.status)}</strong></li>
        <li><span>Decision</span><strong>${decision ? displayDecision(decision) : "Pending"}</strong></li>
        <li><span>Memo export</span><strong>${room.finalDecision ? "Ready" : "Waiting"}</strong></li>
      </ul>
    </div>
  `;
}

function renderActiveVendorTab(vendor, tab) {
  if (tab === "agent-room") return renderAgentRoom(vendor);
  if (tab === "evidence") return renderEvidencePanel(vendor);
  if (tab === "policy") return renderPolicyPanel(vendor);
  if (tab === "reports") return renderReportsView(vendor.id);
  return renderOverviewPanel(vendor);
}

function renderOverviewPanel(vendor) {
  const room = getRoomForVendor(state, vendor.id);
  const missing = room.sharedContext?.missingEvidence || [];
  return `
    <div class="detail-layout">
      <div class="panel">
        <div class="section-header">
          <div>
            <p class="eyebrow">Review enhancements</p>
            <h3>Vendor risk snapshot</h3>
          </div>
          <button class="button primary" data-tab="agent-room" type="button">Open Agent Room</button>
        </div>
        <div class="metric-row">
          <div><span>Risk score</span><strong>${vendor.riskScore}</strong></div>
          <div><span>Agent status</span><strong>${escapeHtml(room.status)}</strong></div>
          <div><span>Ledger rows</span><strong>${vendorEvidence(vendor.id).length}</strong></div>
        </div>
        <h4>Missing evidence</h4>
        <ul class="context-list">${missing.map((item) => `<li><span>${escapeHtml(item)}</span><strong>Required</strong></li>`).join("")}</ul>
      </div>
      <aside class="decision-panel">
        <p class="eyebrow">Pitch</p>
        <h3>Band makes this a room, not a chatbot</h3>
        <p class="muted">Specialized agents hand off work, update shared context, and produce a decision trace that lands in the Evidence Ledger and AI Vendor Passport.</p>
        <button class="button primary" data-action="start-room" type="button">Start Band Agent Review</button>
      </aside>
    </div>
  `;
}

function renderAgentRoom(vendor) {
  const baseRoom = getRoomForVendor(state, vendor.id);
  const visibleEvents = getVisibleEvents(baseRoom);
  const isRunning = animationState?.vendorId === vendor.id;
  const decisionVisible = visibleEvents.some((event) => event.type === "decision" || event.type === "tool_result");
  const room = {
    ...baseRoom,
    status: isRunning ? "running" : baseRoom.status,
    events: visibleEvents,
    finalDecision: decisionVisible ? baseRoom.finalDecision : null
  };

  return `
    <div class="panel">
      <div class="room-header">
        <div>
          <p class="eyebrow">Agent Room</p>
          <h3>${escapeHtml(vendor.name)} review room</h3>
          <div class="badge-row">
            <span class="status-pill ${room.mode}">${room.mode === "live" ? "Live Band Room" : "Demo Band Room"}</span>
            <span class="risk-pill ${riskClass(room.sharedContext.riskScore)}">Risk ${room.sharedContext.riskScore}</span>
            <span class="status-pill ${room.status}">${escapeHtml(room.status)}</span>
          </div>
        </div>
        <div class="room-actions">
          <button class="button primary" data-action="start-room" type="button">Start Band Agent Review</button>
          <button class="button secondary" data-action="replay-room" type="button">Replay Demo Review</button>
          <button class="button secondary" data-action="export-packet" type="button">Export Decision Packet</button>
        </div>
      </div>
      ${baseRoom.warning ? `<p class="status-pill escalate">${escapeHtml(baseRoom.warning)}</p>` : ""}
      <div class="grid agent-roster">
        ${baseRoom.agents.map((agent) => renderAgentCard(agent, visibleEvents, isRunning)).join("")}
      </div>
    </div>
    <div class="agent-room-grid section">
      <div class="panel">
        <div class="section-header">
          <div>
            <p class="eyebrow">Live collaboration timeline</p>
            <h3>Agent handoffs and findings</h3>
          </div>
          <span class="muted">${visibleEvents.length} of ${baseRoom.events.length} events visible</span>
        </div>
        <div class="timeline">
          ${
            visibleEvents.length
              ? visibleEvents.map((event) => renderTimelineEvent(event, baseRoom)).join("")
              : `<div class="empty-state">Start the Band Agent Review to create the collaboration trace.</div>`
          }
        </div>
      </div>
      <aside class="context-grid">
        ${renderSharedContext(room, vendor)}
        ${renderDecisionPacket(room)}
        ${renderHumanActions()}
      </aside>
    </div>
  `;
}

function renderAgentCard(agent, visibleEvents, isRunning) {
  const ownVisible = visibleEvents.filter((event) => event.fromAgentId === agent.id || event.toAgentId === agent.id);
  const latest = ownVisible.at(-1);
  const hasCompleted = visibleEvents.some((event) => event.fromAgentId === agent.id && ["finding", "decision", "tool_result"].includes(event.type));
  const status = isRunning && ownVisible.length && !hasCompleted ? "working" : agent.status;
  return `
    <article class="agent-card">
      <header>
        <div class="avatar">${agentInitials(agent.name)}</div>
        <div>
          <h4>${escapeHtml(agent.name)}</h4>
          <span class="muted">${escapeHtml(agent.role)}</span>
        </div>
      </header>
      <span class="status-pill ${status}">${escapeHtml(status)}</span>
      <p class="muted">${escapeHtml(latest?.title || agent.lastAction)}</p>
      <div class="agent-meta">
        <div><span>Confidence</span><strong>${Math.round(agent.confidence * 100)}%</strong></div>
        <div><span>Findings</span><strong>${agent.findingsCount}</strong></div>
      </div>
    </article>
  `;
}

function renderTimelineEvent(event, room) {
  const from = room.agents.find((agent) => agent.id === event.fromAgentId) || { name: "System" };
  const to = room.agents.find((agent) => agent.id === event.toAgentId);
  return `
    <article class="timeline-event">
      <div class="avatar">${agentInitials(from.name)}</div>
      <div>
        <header>
          <div>
            <h4>${escapeHtml(event.title)}</h4>
            <span class="muted">${escapeHtml(from.name)}${to ? ` to ${escapeHtml(to.name)}` : ""}</span>
          </div>
          <span class="risk-pill ${event.riskImpact}">${escapeHtml(event.riskImpact)}</span>
        </header>
        <p>${escapeHtml(event.body)}</p>
        <div class="timeline-meta">
          <span>${formatTime(event.timestamp)}</span>
          <span class="event-type">${escapeHtml(event.type)}</span>
          <span>${Math.round(event.confidence * 100)}% confidence</span>
          ${event.evidenceIds.map((id) => `<span class="evidence-badge">${escapeHtml(id)}</span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderSharedContext(room, vendor) {
  const context = room.sharedContext || {};
  return `
    <section class="decision-panel">
      <div>
        <p class="eyebrow">Shared context</p>
        <h3>Accumulated review state</h3>
      </div>
      ${renderContextBlock("Vendor summary", [context.vendorSummary || vendor.description])}
      ${renderContextBlock("Evidence discovered", context.evidenceDiscovered || [])}
      ${renderContextBlock("Missing evidence", context.missingEvidence || [])}
      ${renderContextBlock("Security controls", context.securityFindings || [])}
      ${renderContextBlock("Privacy/legal issues", context.legalFindings || [])}
      ${renderContextBlock("Finance/procurement issues", context.financeFindings || [])}
      ${renderContextBlock("Policy requirements", context.policyRequirements || [])}
    </section>
  `;
}

function renderContextBlock(title, items = []) {
  return `
    <div class="context-block">
      <h4>${escapeHtml(title)}</h4>
      <ul class="context-list">
        ${(items.length ? items : ["Pending"]).map((item) => `<li><span>${escapeHtml(item)}</span></li>`).join("")}
      </ul>
    </div>
  `;
}

function renderDecisionPacket(room) {
  if (!room.finalDecision) {
    return `
      <section class="decision-panel">
        <p class="eyebrow">Decision packet</p>
        <h3>Waiting for Policy Gate Agent</h3>
        <p class="muted">The final decision appears after specialist handoffs are complete.</p>
      </section>
    `;
  }

  const decision = room.finalDecision;
  return `
    <section class="decision-panel">
      <div>
        <p class="eyebrow">Decision packet</p>
        <h3>${displayDecision(decision.decision)}</h3>
      </div>
      <div class="decision-score">
        <div>
          <span>Policy score</span>
          <strong>${decision.score}</strong>
        </div>
        <span class="status-pill ${decision.decision}">${escapeHtml(decision.riskLevel)}</span>
      </div>
      <p>${escapeHtml(decision.summary)}</p>
      ${renderContextBlock("Required conditions", decision.requiredConditions)}
      ${renderContextBlock("Required approvers", decision.requiredApprovers)}
      ${renderContextBlock("Audit summary", decision.auditTrail)}
      ${
        decision.humanOverrideStatus
          ? `<p class="status-pill conditional">Human override: ${escapeHtml(decision.humanOverrideStatus)}</p>`
          : ""
      }
    </section>
  `;
}

function renderHumanActions() {
  return `
    <section class="decision-panel">
      <div>
        <p class="eyebrow">Human actions</p>
        <h3>Reviewer decision</h3>
      </div>
      <textarea class="notes-box" id="reviewer-notes" placeholder="Reviewer notes">${escapeHtml(state.reviewerNotes || "")}</textarea>
      <div class="human-actions">
        <button class="button secondary" data-action="human:approve" type="button">Approve</button>
        <button class="button primary" data-action="human:approve_with_conditions" type="button">Approve with Conditions</button>
        <button class="button secondary" data-action="human:request_more_evidence" type="button">Request More Evidence</button>
        <button class="button warning" data-action="human:escalate_security" type="button">Escalate to Security</button>
        <button class="button warning" data-action="human:escalate_legal" type="button">Escalate to Legal</button>
        <button class="button danger" data-action="human:block_tool" type="button">Block Tool</button>
      </div>
    </section>
  `;
}

function renderEvidencePanel(vendor) {
  return `
    <div class="panel">
      <div class="section-header">
        <div>
          <p class="eyebrow">Evidence Ledger</p>
          <h3>${escapeHtml(vendor.name)} evidence records</h3>
        </div>
        <button class="button primary" data-action="start-room" type="button">Refresh Agent Findings</button>
      </div>
      ${renderLedgerTable(vendorEvidence(vendor.id))}
    </div>
  `;
}

function renderPolicyPanel(vendor) {
  const policy = scorePolicy(vendor);
  return `
    <div class="detail-layout">
      <div class="panel">
        <div class="section-header">
          <div>
            <p class="eyebrow">Policy Gate Logic</p>
            <h3>Deterministic decision score</h3>
          </div>
          <span class="status-pill ${policy.decision}">${displayDecision(policy.decision)}</span>
        </div>
        <div class="decision-score">
          <div>
            <span>Risk score</span>
            <strong>${policy.score}</strong>
          </div>
          <span class="risk-pill ${policy.riskLevel}">${escapeHtml(policy.riskLevel)}</span>
        </div>
        <ul class="context-list">
          ${policy.factors.map((factor) => `<li><span>${escapeHtml(factor.label)}</span><strong>+${factor.points}</strong></li>`).join("")}
        </ul>
      </div>
      <aside class="decision-panel">
        <p class="eyebrow">Overrides</p>
        <h3>${policy.override ? "Escalation floor applied" : "No override needed"}</h3>
        <p class="muted">${escapeHtml(policy.override || "Score band determines the current recommendation.")}</p>
      </aside>
    </div>
  `;
}

function renderLedgerView() {
  return `
    <section class="section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Audit trail</p>
          <h3>Evidence Ledger</h3>
        </div>
        <button class="button primary" data-select-vendor="${DEMO_VENDOR_ID}" type="button">Open SynthNote AI</button>
      </div>
      ${renderLedgerTable(state.evidenceLedger)}
    </section>
  `;
}

function renderReportsView(vendorId = state.selectedVendorId) {
  const vendor = getVendor(vendorId);
  const room = getRoomForVendor(state, vendorId);
  const exported = exportPacket(state, vendorId);
  return `
    <section class="section">
      <div class="section-header">
        <div>
          <p class="eyebrow">AI Vendor Passport</p>
          <h3>${escapeHtml(vendor.name)} decision packet</h3>
          <p>${room.finalDecision ? "Agent-backed memo is ready." : "Start the Agent Room review to populate the final packet."}</p>
        </div>
        <div class="room-actions">
          <button class="button primary" data-action="start-room" type="button">Start Band Agent Review</button>
          <button class="button secondary" data-action="export-packet" type="button">Download Memo</button>
        </div>
      </div>
      <textarea class="memo-output" readonly>${escapeHtml(exported.memo)}</textarea>
    </section>
  `;
}

function renderLedgerTable(rows) {
  if (!rows.length) return `<div class="empty-state">No evidence records yet.</div>`;
  return `
    <table class="ledger-table">
      <thead>
        <tr>
          <th>Source</th>
          <th>Claim</th>
          <th>Policy</th>
          <th>Confidence</th>
          <th>Hash</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.source)}</td>
                <td>${escapeHtml(row.claim)}</td>
                <td>${escapeHtml(row.policyMapping)}</td>
                <td>${Math.round(row.confidence * 100)}%</td>
                <td><code>${escapeHtml(row.hash)}</code></td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function getVisibleEvents(room) {
  if (animationState?.vendorId !== room.vendorId) return room.events || [];
  return (room.events || []).slice(0, animationState.visibleCount);
}

function vendorEvidence(vendorId) {
  return state.evidenceLedger.filter((item) => item.vendorId === vendorId);
}

function downloadMemo(vendorId) {
  const vendor = getVendor(vendorId);
  const { memo } = exportPacket(state, vendorId);
  const blob = new Blob([memo], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${vendor.id}-ai-vendor-passport.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function riskClass(scoreOrLevel) {
  if (typeof scoreOrLevel === "string") return scoreOrLevel;
  if (scoreOrLevel >= 80) return "critical";
  if (scoreOrLevel >= 60) return "high";
  if (scoreOrLevel >= 30) return "medium";
  return "low";
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(timestamp));
}

function agentInitials(name) {
  if (name === "System") return "SY";
  return name
    .replace("&", "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
