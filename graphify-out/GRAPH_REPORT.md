# Graph Report - Vendor Brand Edittion  (2026-06-07)

## Corpus Check
- 25 files · ~30,037 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 770 nodes · 1685 edges · 36 communities (31 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b7cc3f2f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]

## God Nodes (most connected - your core abstractions)
1. `qs()` - 32 edges
2. `qs()` - 28 edges
3. `buildReview()` - 21 edges
4. `ClearGate AI` - 19 edges
5. `renderReview()` - 18 edges
6. `fetchSelectedSourceLive()` - 18 edges
7. `missingEvidenceTypes()` - 16 edges
8. `normalizeEvidenceRecord()` - 16 edges
9. `ClearGate AI` - 16 edges
10. `missingEvidenceTypes()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `retrieveWithBrowserApi()` --calls--> `browserSessionRequest()`  [EXTRACTED]
  /Users/apple/Documents/Codex/2026-05-21/https-lablab-ai-ai-hackathons-brightdata/lib/review-adapter.js → lib/review-adapter.js
- `testPayloadAndSlackBlocks()` --calls--> `buildEscalationPayload()`  [EXTRACTED]
  scripts/test-workflow-adapter.js → lib/workflow-adapter.js
- `testPayloadAndSlackBlocks()` --calls--> `slackBlocks()`  [EXTRACTED]
  scripts/test-workflow-adapter.js → lib/workflow-adapter.js
- `testMissingWebhookFallback()` --calls--> `createEscalation()`  [EXTRACTED]
  scripts/test-workflow-adapter.js → lib/workflow-adapter.js
- `testSlackErrorHandlingWithoutSecretLeak()` --calls--> `createEscalation()`  [EXTRACTED]
  scripts/test-workflow-adapter.js → lib/workflow-adapter.js

## Communities (36 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (85): addEvidenceRecords(), analyzeVendor(), analyzeVendorWithBackend(), applyDecisionAction(), applyReviewEvidence(), backendReviewEnabled(), bindModuleActions(), bindSourceDetailButtons() (+77 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (34): activityLog, appSettings, controlsByVendor, DECISION_RULES, DECISIONS, evidenceByVendor, PIPELINE_STAGE_LABELS, policyProfiles (+26 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (34): 1. Shadow AI Inbox, 2. Vendor Review Detail, 3. Evidence Ledger, 4. Policy Gate, 5. AI Vendor Passport / Approval Memo, 6. ROI Panel, Accessibility and UX Quality, App Structure (+26 more)

### Community 3 - "Community 3"
Cohesion: 0.27
Nodes (17): AIML_TIMEOUT_MS, aimlConfig(), chatCompletion(), cleanText(), draftGroundedMemo(), extractGroundedFinding(), policyQuestionsFor(), safeJson() (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (34): 1. Shadow AI Inbox, 2. Vendor Review Detail, 3. Evidence Ledger, 4. Policy Gate, 5. AI Vendor Passport / Approval Memo, 6. ROI Panel, Accessibility and UX Quality, App Structure (+26 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (40): brightDataConfig(), brightDataQueries(), brightDataRequest(), buildReview(), { buildReview, integrationMode }, { buildReview, integrationMode, reviewIntegrationStatus }, canUseBrightDataLive(), { createEscalation } (+32 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (28): Architecture, Bright Data Integration, ClearGate AI, code:mermaid (flowchart LR), code:bash (python3 -m http.server 3000), code:txt (http://localhost:3000), code:bash (node server.js), code:txt (GET  http://localhost:3000/healthz) (+20 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (26): addEvidenceRecords(), analyzeVendor(), analyzeVendorWithBackend(), applyBandHumanAction(), applyDecisionAction(), applyReviewEvidence(), bandEvidenceRecords(), brightDataQueries() (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.19
Nodes (16): Application Of Technology, Business Model, Business Value, ClearGate AI Submission Copy, ClearGate AI Submission Copy, Enterprise Buyer, Honest Limitations, Judging Criteria (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (91): { buildReview }, readBody(), requestPayload(), canUseAimlApi(), brightDataConfig(), brightDataQueries(), brightDataRequest(), browserFallbackReady() (+83 more)

### Community 10 - "Community 10"
Cohesion: 0.61
Nodes (6): assert(), main(), request(), { spawn }, wait(), waitForServer()

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (34): { createEscalation }, readBody(), requestPayload(), { integrationMode, reviewIntegrationStatus }, { workflowIntegrationStatus }, buildEscalationPayload(), createEscalation(), evidenceLabel() (+26 more)

### Community 12 - "Community 12"
Cohesion: 0.26
Nodes (12): AI/ML API Use, Band Agent Room, Bright Data Use, ClearGate AI Architecture, ClearGate AI Architecture, code:mermaid (flowchart TD), Evidence Normalization, Guardrails (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (26): bindModuleActions(), bindSourceDetailButtons(), clearQueueProgressBanner(), closeDetailDrawer(), closeDrawer(), filteredVendors(), goInbox(), importTools() (+18 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (16): 1. Open the Shadow AI Inbox, 2. Open Otter.ai, 3. Run Live Verification, 3. Run The Band Agent Room, 4. Inspect Evidence And Policy, 4. Run Live Verification, 5. Export The AI Vendor Passport, 5. Inspect Evidence And Policy (+8 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (13): code:txt (BRIGHTDATA_LIVE=1), code:txt (BRIGHTDATA_BROWSER_ENABLED=1), code:txt (AIMLAPI_ENABLED=1), code:txt (SLACK_WEBHOOK_URL), Deployment Checklist, Incognito Verification, Optional AI/ML API Extraction, Optional Scraping Browser Fallback (+5 more)

### Community 16 - "Community 16"
Cohesion: 0.37
Nodes (14): assert, { buildReview, __test }, crypto, main(), testAimlFailureFallsBackToRules(), testAssociatedTrustDomainRanking(), testBrowserFallbackIsSelectiveAndBounded(), testFallbackDemoMode() (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (19): cleanSnapshotText(), excerptFromContent(), fetchSource(), findingExcerpt(), findingMethodLabel(), hashEvidence(), isDiscoveryRecord(), isFinalSupportingEvidence() (+11 more)

### Community 18 - "Community 18"
Cohesion: 0.19
Nodes (12): 0:00-0:35 - Shadow AI Problem, 0:35-1:10 - Seeded Judge Workspace, 1:10-2:35 - Highest-Risk Review, 2:35-3:35 - Evidence Provenance And Policy, 3:35-4:15 - AI Vendor Passport, 4:15-4:40 - Optional Verified Action, 4:40-5:00 - Enterprise Value, ClearGate AI Video Recording Plan (+4 more)

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (10): 1. Problem, 2. Product Thesis, 3. Workflow, 4. Bright Data Infrastructure, 5. Live Demo Proof, 6. Differentiation, 7. Market And Business Value, 8. Closing (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.08
Nodes (24): Architecture, Band Agent Room, Bright Data Integration, ClearGate AI, code:mermaid (flowchart LR), code:bash (python3 -m http.server 3000), code:txt (http://localhost:3000), code:bash (node local-server.js) (+16 more)

### Community 21 - "Community 21"
Cohesion: 0.28
Nodes (8): app, assert, fs, includesAll(), index, main(), path, root

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (5): checks, fs, path, root, { spawnSync }

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (24): bandRoomLines(), buildBandRoom(), buildEscalationRequest(), decisionColor(), decisionExplanation(), downloadJson(), ensureBandRoom(), evidenceReviewSummary() (+16 more)

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (14): bandAgentFinding(), bandAgentState(), buildRequiredConditions(), clamp(), controlsFor(), decisionFromVendor(), exposureWeight(), mapPolicyFindings() (+6 more)

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (12): findingExcerpt(), findingMethodLabel(), isDiscoveryRecord(), isFinalSupportingEvidence(), openDetailDrawer(), openEscalationDetail(), openSourceDetail(), sourceActionLabel() (+4 more)

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (10): cleanSnapshotText(), excerptFromContent(), fetchSource(), generatedEvidence(), hashEvidence(), normalizeEvidenceRecord(), provenanceFor(), provenanceLabel() (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (7): copyDirectory(), dist, fs, main(), path, requiredFiles, root

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (7): cleanImportValue(), ensureImportedVendor(), inferCategory(), inferPolicyProfile(), initials(), normalizeDomainInput(), parseImportedTool()

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (7): backendReviewEnabled(), fetchServerStatus(), renderSettingsHub(), requestBackendReview(), requestWorkflowEscalation(), reviewModeColor(), settingsModeLabel()

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (7): cleanImportValue(), ensureImportedVendor(), inferCategory(), inferPolicyProfile(), initials(), normalizeDomainInput(), parseImportedTool()

## Knowledge Gaps
- **198 isolated node(s):** `reviewSteps`, `vendors`, `evidenceByVendor`, `bandRoomsByVendor`, `policyProfiles` (+193 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildReview()` connect `Community 9` to `Community 16`, `Community 11`, `Community 5`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `createEscalation()` connect `Community 11` to `Community 5`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `extractGroundedFinding()` connect `Community 3` to `Community 9`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `reviewSteps`, `vendors`, `evidenceByVendor` to the rest of the system?**
  _198 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._