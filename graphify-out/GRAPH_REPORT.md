# Graph Report - Vendor Brand Edittion  (2026-06-05)

## Corpus Check
- 29 files · ~8,296 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 172 nodes · 363 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]

## God Nodes (most connected - your core abstractions)
1. `handleApiRequest()` - 27 edges
2. `ClearGate AI` - 15 edges
3. `escapeHtml()` - 14 edges
4. `getVendor()` - 13 edges
5. `buildDemoRoom()` - 12 edges
6. `getRoomForVendor()` - 11 edges
7. `buildMemoText()` - 11 edges
8. `render()` - 9 edges
9. `renderAgentRoom()` - 9 edges
10. `displayDecision()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `handleApi()` --calls--> `handleApiRequest()`  [EXTRACTED]
  server.js → lib/apiCore.js
- `handleAppClick()` --calls--> `startDemoReview()`  [EXTRACTED]
  app.js → lib/agentRoomStore.js
- `renderVendorCard()` --calls--> `formatCurrency()`  [EXTRACTED]
  app.js → lib/demoData.js
- `renderVendorSummary()` --calls--> `displayDecision()`  [EXTRACTED]
  app.js → lib/policyEngine.js
- `renderDecisionPacket()` --calls--> `displayDecision()`  [EXTRACTED]
  app.js → lib/policyEngine.js

## Communities (12 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (38): exportPacket(), getRoomForVendor(), saveHumanAction(), saveState(), getVendor(), agentInitials(), app, downloadMemo() (+30 more)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (16): handler(), startDemoReview(), createApiRuntime(), handleApiRequest(), humanActionLabel(), notFound(), ok(), saveRoom() (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (21): Agent Roles, API, Architecture, ClearGate AI, code:txt (index.html), code:bash (node server.js), code:txt (http://localhost:3000), code:bash (python3 -m http.server 3000) (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.19
Nodes (16): AGENT_DEFINITIONS, buildDemoEvents(), buildDemoRoom(), buildInitialRoom(), buildSharedContext(), deriveAgentState(), event(), requiredBandVars (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.19
Nodes (16): createInitialState(), formatHumanAction(), loadState(), resetState(), baseEvidenceLedger, dashboardKpis, formatCurrency(), policyRequirements (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (8): main(), main(), main(), main(), main(), base_payload(), emit_finding(), read_task()

### Community 6 - "Community 6"
Cohesion: 0.2
Nodes (9): ClearGate AI Band Agents, code:bash (cd agents), code:bash (cp .env.example .env), code:bash (BAND_API_BASE=), code:bash (python discovery_agent.py), Configure, Demo Fallback, Install (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (9): handleApi(), mimeType(), port, readJson(), root, runtime, sendJson(), server (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (3): server, sleep(), waitForServer()

## Knowledge Gaps
- **32 isolated node(s):** `root`, `runtime`, `port`, `server`, `state` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `handleApiRequest()` connect `Community 1` to `Community 0`, `Community 3`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `getVendor()` connect `Community 0` to `Community 1`, `Community 4`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `buildDemoRoom()` connect `Community 3` to `Community 1`, `Community 4`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `root`, `runtime`, `port` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._