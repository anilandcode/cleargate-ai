const reviewSteps = [
  "Discovering Sources",
  "Unlocking Pages",
  "Extracting Evidence",
  "Mapping Controls",
  "Generating Memo",
];

const STORAGE_KEY = "cleargate-ai-state-v3";
const SEEDED_WORKSPACE_VERSION = "judge-v1";

let vendors = [
  {
    id: "chatgpt",
    name: "ChatGPT Team",
    domain: "openai.com",
    initials: "CG",
    category: "AI assistant",
    department: "Product",
    users: 184,
    dataExposure: "Customer notes",
    riskLevel: "Medium",
    riskScore: 68,
    freshnessScore: 91,
    gapIndex: 21,
    decision: "Escalate",
    seededWorkspace: true,
    lastReviewed: "Today",
    detectedFrom: "Browser logs",
    reviewHours: 9,
    policyProfile: "AI Tool With Customer Data",
    requiredConditions: [
      "Confirm enterprise workspace is enforced before customer data use.",
      "Require admin controls, SSO, and retention settings review.",
      "Document approved use cases in the AI policy register.",
    ],
    topFindings: [
      "Public security and privacy evidence is available and fresh.",
      "Customer data handling depends on selected plan and workspace settings.",
      "Subprocessor and retention review should be attached before approval.",
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    domain: "perplexity.ai",
    initials: "PX",
    category: "AI research",
    department: "Sales",
    users: 96,
    dataExposure: "Prospect data",
    riskLevel: "Medium",
    riskScore: 58,
    freshnessScore: 84,
    gapIndex: 20,
    decision: "Approve with conditions",
    seededWorkspace: true,
    lastReviewed: "3h ago",
    detectedFrom: "Expense report",
    reviewHours: 8,
    policyProfile: "AI Tool With Customer Data",
    requiredConditions: [
      "Confirm data retention and training controls for sales research use.",
      "Restrict account notes and confidential prospect data until policy review completes.",
      "Document approved sales research scope in the AI policy register.",
    ],
    topFindings: [
      "Sales research use is defined and contained to prospect prospecting workflows.",
      "Evidence is sufficient for conditional approval; confirm retention and training controls.",
      "No confidential customer data identified in the current use case.",
    ],
  },
  {
    id: "fireflies",
    name: "Fireflies",
    domain: "fireflies.ai",
    initials: "FF",
    category: "Meeting AI",
    department: "Customer Success",
    users: 73,
    dataExposure: "Call recordings",
    riskLevel: "High",
    riskScore: 85,
    freshnessScore: 79,
    gapIndex: 42,
    decision: "Block pending review",
    seededWorkspace: true,
    lastReviewed: "Yesterday",
    detectedFrom: "Calendar app",
    reviewHours: 16,
    policyProfile: "High Risk Regulated Vendor",
    requiredConditions: [
      "Restrict until call-recording consent and retention policy are approved.",
      "Require DPA, subprocessor, and recording controls review.",
      "Confirm deletion workflow for customer calls.",
    ],
    topFindings: [
      "Tool can process high-sensitivity meeting content.",
      "Evidence gaps are material for regulated customer calls.",
      "Requires privacy and legal review before approval.",
    ],
  },
  {
    id: "notion-ai",
    name: "Notion AI",
    domain: "notion.so",
    initials: "NA",
    category: "Workspace AI",
    department: "Operations",
    users: 141,
    dataExposure: "Internal docs",
    riskLevel: "Medium",
    riskScore: 63,
    freshnessScore: 88,
    gapIndex: 18,
    decision: "Approve with conditions",
    seededWorkspace: true,
    lastReviewed: "Today",
    detectedFrom: "SSO app list",
    reviewHours: 9,
    policyProfile: "Standard SaaS Vendor",
    requiredConditions: [
      "Limit AI access to approved workspaces.",
      "Require workspace admin review of sharing settings.",
    ],
    topFindings: [
      "Trust and security pages are discoverable.",
      "Main residual risk is internal document sensitivity.",
      "Approval can proceed with workspace guardrails.",
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    domain: "cursor.com",
    initials: "CR",
    category: "AI coding",
    department: "Engineering",
    users: 58,
    dataExposure: "Source code",
    riskLevel: "High",
    riskScore: 79,
    freshnessScore: 86,
    gapIndex: 29,
    decision: "Escalate",
    seededWorkspace: true,
    lastReviewed: "2d ago",
    detectedFrom: "Device inventory",
    reviewHours: 10,
    policyProfile: "AI Agent With Tool Access",
    browserFallbackDemoCandidate: true,
    requiredConditions: [
      "Review source-code retention and telemetry controls.",
      "Require engineering policy for repository access.",
      "Confirm enterprise controls before broad rollout.",
    ],
    topFindings: [
      "Source code exposure makes this a high-impact AI tool.",
      "Evidence should be mapped to internal secure development policy.",
      "Approval requires engineering and security sign-off.",
    ],
  },
  {
    id: "glean",
    name: "Glean",
    domain: "glean.com",
    initials: "GL",
    category: "Enterprise search",
    department: "IT",
    users: 22,
    dataExposure: "Knowledge base",
    riskLevel: "Medium",
    riskScore: 60,
    freshnessScore: 93,
    gapIndex: 16,
    decision: "Escalate",
    seededWorkspace: true,
    lastReviewed: "Today",
    detectedFrom: "Manual intake",
    reviewHours: 6,
    policyProfile: "AI Tool With Customer Data",
    requiredConditions: [
      "Keep connector permissions aligned with least privilege.",
    ],
    topFindings: [
      "Enterprise security evidence is strong and recent.",
      "Main risk is connector permission scope.",
      "Approval is reasonable with access controls.",
    ],
  },
  {
    id: "gamma",
    name: "Gamma",
    domain: "gamma.app",
    initials: "GA",
    category: "Presentation AI",
    department: "Marketing",
    users: 64,
    dataExposure: "Campaign plans",
    riskLevel: "Low",
    riskScore: 38,
    freshnessScore: 92,
    gapIndex: 10,
    decision: "Approve",
    seededWorkspace: true,
    lastReviewed: "Today",
    detectedFrom: "Browser logs",
    reviewHours: 7,
    policyProfile: "Standard SaaS Vendor",
    requiredConditions: [
      "Restrict confidential roadmap and customer data uploads.",
      "Require review of retention terms before customer-facing use.",
    ],
    topFindings: [
      "Usage appears broad but lower sensitivity than code or call recordings.",
      "Evidence freshness is acceptable but not complete.",
      "Approval fits marketing-only use with standard monitoring.",
    ],
  },
  {
    id: "midjourney",
    name: "Midjourney",
    domain: "midjourney.com",
    initials: "MJ",
    category: "Image AI",
    department: "Design",
    users: 39,
    dataExposure: "Brand assets",
    riskLevel: "Low",
    riskScore: 42,
    freshnessScore: 68,
    gapIndex: 27,
    decision: "Approve with conditions",
    seededWorkspace: true,
    lastReviewed: "6d ago",
    detectedFrom: "Expense report",
    reviewHours: 5,
    policyProfile: "Standard SaaS Vendor",
    requiredConditions: [
      "Restrict regulated customer materials and unreleased product imagery.",
    ],
    topFindings: [
      "Primary risk is content governance rather than sensitive data processing.",
      "Approval can be limited to non-confidential creative work.",
      "Evidence gaps remain on enterprise controls.",
    ],
  },
  {
    id: "otter-ai",
    name: "Otter.ai",
    domain: "otter.ai",
    initials: "O",
    category: "Meeting AI",
    department: "Sales",
    users: 42,
    dataExposure: "Call recordings",
    riskLevel: "High",
    riskScore: 86,
    freshnessScore: 71,
    gapIndex: 49,
    decision: "Block pending review",
    seededWorkspace: true,
    lastReviewed: "Yesterday",
    detectedFrom: "Calendar app",
    reviewHours: 14,
    policyProfile: "High Risk Regulated Vendor",
    requiredConditions: [
      "Restrict use until call recording consent, retention, and deletion controls are approved.",
      "Attach DPA, subprocessor, and customer-call handling evidence.",
      "Require legal and privacy sign-off before customer meeting ingestion.",
    ],
    topFindings: [
      "Tool can process customer call recordings and transcripts.",
      "Privacy, retention, and subprocessor evidence must be verified before approval.",
      "Legal/privacy review is required before continued usage.",
    ],
  },
  {
    id: "replit-agent",
    name: "Replit Agent",
    domain: "replit.com",
    initials: "RA",
    category: "AI coding",
    department: "Engineering",
    users: 24,
    dataExposure: "Source code",
    riskLevel: "High",
    riskScore: 81,
    freshnessScore: 68,
    gapIndex: 36,
    decision: "Escalate",
    seededWorkspace: true,
    lastReviewed: "2d ago",
    detectedFrom: "Device inventory",
    reviewHours: 11,
    policyProfile: "AI Agent With Tool Access",
    requiredConditions: [
      "Confirm repository access boundaries and code retention controls.",
      "Require engineering security sign-off before production code use.",
    ],
    topFindings: [
      "Agentic coding workflow can touch source code and developer environments.",
      "Tool access boundaries require security review.",
      "Policy gate escalates until repository controls are verified.",
    ],
  },
  {
    id: "writer",
    name: "Writer",
    domain: "writer.com",
    initials: "WR",
    category: "Content AI",
    department: "Legal",
    users: 18,
    dataExposure: "Customer contracts",
    riskLevel: "Medium",
    riskScore: 62,
    freshnessScore: 82,
    gapIndex: 22,
    decision: "Escalate",
    seededWorkspace: true,
    lastReviewed: "Today",
    detectedFrom: "SSO app list",
    reviewHours: 8,
    policyProfile: "High Risk Regulated Vendor",
    requiredConditions: [
      "Verify DPA, retention controls, and contract data handling terms.",
      "Restrict confidential legal documents until privacy review completes.",
    ],
    topFindings: [
      "Legal-team usage may include confidential customer contracts.",
      "Data handling and retention evidence needs privacy review.",
      "Escalation is required before regulated document processing.",
    ],
  },
];

let evidenceByVendor = {};
let activeVendorId = vendors[0].id;
let activeTab = "overview";
let activeModule = "inbox";
let liveReviewInFlight = false;
let bandRoomsByVendor = {};

const policyProfiles = [
  {
    name: "AI Tool With Customer Data",
    controls: 7,
    threshold: "Escalate at high data exposure or missing retention evidence",
    framework: "NIST AI RMF, NIST AI 600-1, OWASP LLM",
  },
  {
    name: "AI Agent With Tool Access",
    controls: 8,
    threshold: "Escalate if source code, repositories, or autonomous tool access are in scope",
    framework: "OWASP Agentic AI, NIST AI RMF",
  },
  {
    name: "High Risk Regulated Vendor",
    controls: 9,
    threshold: "Block pending review until privacy, legal, DPA, retention, and subprocessor evidence are complete",
    framework: "NIST AI RMF, CSA AI Controls, internal privacy policy",
  },
  {
    name: "Standard SaaS Vendor",
    controls: 5,
    threshold: "Approve with conditions when evidence is fresh and data exposure is low or medium",
    framework: "TPRM baseline, security controls, privacy controls",
  },
];

let activityLog = [
  ["SERP API", "Discovered current trust, privacy, and documentation sources for ChatGPT."],
  ["Web Unlocker", "Fetched Notion AI trust center evidence and mapped it to enterprise security controls."],
  ["Policy Gate", "Escalated Cursor because source-code exposure needs engineering security sign-off."],
  ["Memo", "Generated AI Vendor Passport draft for Glean with one required connector condition."],
];

let appSettings = {
  demoMode: true,
  cacheReplay: true,
  workspaceMode: "seeded-workspace",
  workspaceVersion: SEEDED_WORKSPACE_VERSION,
  reviewApiEndpoint: "/api/review",
  workflowApiEndpoint: "/api/escalate",
  reviewApiMode: "Seeded workspace opens immediately; server API verifies selected vendors when available",
  lastReviewMode: "demo-fallback",
  lastFallbackReason: "",
  lastReviewMeta: null,
  lastWorkflowMode: "workflow-draft",
  lastWorkflowId: "",
  maxReviewCostUsd: 1,
  browserFallbackBudgetUsd: 2.5,
  cacheTtlMinutes: 10,
  backendStatus: null,
  brightDataProducts: {
    "SERP API": "Ready",
    "Web Unlocker": "Ready",
    "Browser API": "Disabled",
    "Web Scraper API": "Planned",
  },
};

const trendSignals = [
  ["AI governance", "+255%", "Static Google Trends CSV snapshot, US, May 2025-May 2026"],
  ["Shadow AI", "+191%", "Static Google Trends CSV snapshot, US, May 2025-May 2026"],
  ["AI risk management", "+175%", "Static Google Trends CSV snapshot, US, May 2025-May 2026"],
  ["AI compliance", "+75%", "Static Google Trends CSV snapshot, US, May 2025-May 2026"],
];

const sourcePlaybook = [
  ["Trust center", "security trust center SOC 2 ISO 27001"],
  ["Privacy", "privacy policy data retention customer data training"],
  ["Subprocessors", "subprocessors data processors vendors"],
  ["Docs", "enterprise admin SSO audit logs data controls"],
  ["News", "security incident lawsuit breach outage"],
];

const REQUIRED_EVIDENCE_TYPES = {
  "Standard SaaS Vendor": ["Privacy Policy", "Trust Center", "Documentation", "News"],
  "AI Tool With Customer Data": ["Privacy Policy", "Trust Center", "Subprocessors", "Documentation", "News"],
  "AI Agent With Tool Access": ["Privacy Policy", "Trust Center", "Subprocessors", "Documentation", "News"],
  "High Risk Regulated Vendor": ["Privacy Policy", "Trust Center", "Subprocessors", "Documentation", "News"],
};

const DECISION_RULES = [
  "Block pending review when evidence gaps are severe or high-risk data exposure has missing privacy/subprocessor evidence.",
  "Escalate when source code, call recordings, customer data, or agentic access require human review.",
  "Approve with conditions when evidence is mostly present but controls or retention settings need confirmation.",
  "Approve only when risk is low, evidence is fresh, and no blocking gaps remain.",
];

const BAND_AGENTS = [
  {
    id: "discovery",
    name: "Discovery Agent",
    owner: "Intake",
    color: "blue",
    clause: "Source discovery completeness",
    charter: "Turns shadow AI signals into a review packet with vendor, usage, data exposure, and required evidence.",
  },
  {
    id: "security",
    name: "Security Agent",
    owner: "Security",
    color: "amber",
    clause: "Enterprise security evidence",
    charter: "Checks trust, SOC 2, ISO, SSO, audit logs, encryption, and source-code exposure.",
  },
  {
    id: "privacy-legal",
    name: "Privacy & Legal Agent",
    owner: "Legal",
    color: "red",
    clause: "Privacy and retention clarity",
    charter: "Reviews privacy policy, DPA, subprocessors, retention, training use, consent, and regulated data handling.",
  },
  {
    id: "finance-procurement",
    name: "Finance & Procurement Agent",
    owner: "Procurement",
    color: "green",
    clause: "Procurement readiness",
    charter: "Maps usage, contract path, renewal risk, approval conditions, and business-owner accountability.",
  },
  {
    id: "compliance",
    name: "Compliance Agent",
    owner: "GRC",
    color: "blue",
    clause: "Compliance and trust",
    charter: "Maps findings to AI policy, evidence completeness, audit memo requirements, and control ownership.",
  },
  {
    id: "policy-gate",
    name: "Policy Gate Agent",
    owner: "AI Governance",
    color: "amber",
    clause: "Approval decision",
    charter: "Combines agent findings into one explainable approval decision with human-reviewable actions.",
  },
];

const PIPELINE_STAGE_LABELS = {
  discovery: "Source discovery",
  fetch: "Page fetch",
  extraction: "Claim extraction",
  mapping: "Policy mapping",
  memo: "Memo inclusion",
};

const PROVENANCE_LABELS = {
  live_fetch: "LIVE",
  cached_live_snapshot: "CACHED SNAPSHOT",
  seeded_demo_data: "SEEDED",
  planned_query: "PLANNED QUERY",
};

const PROVENANCE_COLORS = {
  live_fetch: "green",
  cached_live_snapshot: "blue",
  seeded_demo_data: "gray",
  planned_query: "amber",
};

const DECISIONS = ["Approve", "Approve with conditions", "Escalate", "Block pending review"];
const CONDITIONAL_DECISION = "Approve with conditions";
const BLOCK_DECISION = "Block pending review";

const DEMO_DECISION_OVERRIDES = {
  gamma:          { decision: "Approve",                 riskLevel: "Low" },
  midjourney:     { decision: "Approve with conditions", riskLevel: "Low" },
  "notion-ai":    { decision: "Approve with conditions", riskLevel: "Medium" },
  perplexity:     { decision: "Approve with conditions", riskLevel: "Medium" },
  chatgpt:        { decision: "Escalate",                riskLevel: "Medium" },
  cursor:         { decision: "Escalate",                riskLevel: "High" },
  "replit-agent": { decision: "Escalate",                riskLevel: "High" },
  writer:         { decision: "Escalate",                riskLevel: "Medium" },
  glean:          { decision: "Escalate",                riskLevel: "Medium" },
  "otter-ai":     { decision: "Block pending review",    riskLevel: "High" },
  fireflies:      { decision: "Block pending review",    riskLevel: "High" },
};

function vendorHasLiveOrManualDecision(vendor) {
  if (vendor.manualDecision) return true;
  if (vendor.liveReviewApplied) return true;
  const records = evidenceByVendor[vendor.id] || [];
  return records.some((r) => r.evidenceOrigin === "LIVE_FETCH" || r.provenance === "live_fetch");
}

function applyDemoDecisionOverrides() {
  vendors.forEach((vendor) => {
    const override = DEMO_DECISION_OVERRIDES[vendor.id];
    if (!override) return;
    if (vendorHasLiveOrManualDecision(vendor)) return;
    vendor.decision = normalizeDecision(override.decision);
    vendor.riskLevel = override.riskLevel;
  });
}

const REQUEST_COST_USD = 1.5 / 1000;
const BROWSER_FALLBACK_ESTIMATE_USD = 0.8;

function estimateReviewCost(vendor, options = {}) {
  const missing = options.missing || missingEvidenceTypes(vendor);
  const discoveryRequests = sourcePlaybook.length;
  const sourceFetches = missing.length;
  const totalRequests = discoveryRequests + sourceFetches;
  const browserFallbacks = options.browserFallbacks || 0;
  const estimatedCostUsd = totalRequests * REQUEST_COST_USD + browserFallbacks * BROWSER_FALLBACK_ESTIMATE_USD;
  return {
    discoveryRequests,
    sourceFetches,
    totalRequests,
    browserFallbacks,
    estimatedCostUsd: Number(estimatedCostUsd.toFixed(4)),
    missing,
  };
}

function formatUsd(value) {
  return `$${Number(value || 0).toFixed(4)}`;
}

function seedEvidence() {
  vendors.forEach((vendor) => {
    const records = [
      normalizeEvidenceRecord(vendor, {
        id: `${vendor.id}-serp`,
        title: `${vendor.name} trust and security sources`,
        url: `https://www.google.com/search?q=${encodeURIComponent(vendor.name + " security trust privacy")}`,
        sourceType: "Search Result",
        product: "SERP API",
        fetchedAt: "2 min ago",
        claim: "Seeded demo search result represents the privacy, security, documentation, and policy sources expected during review.",
        confidence: 91,
        clause: "Source discovery completeness",
        freshness: "Seeded Demo Data",
        status: "Seeded Demo Data",
        provenance: "seeded_demo_data",
      }, "discovery"),
      normalizeEvidenceRecord(vendor, {
        id: `${vendor.id}-privacy`,
        title: `${vendor.name} privacy policy`,
        url: `https://${vendor.domain}/privacy`,
        sourceType: "Privacy Policy",
        product: "Web Unlocker",
        fetchedAt: "2 min ago",
        claim: "Seeded demo privacy evidence requires data handling review before sensitive company data is approved.",
        confidence: 84,
        clause: "Privacy and retention clarity",
        freshness: "Seeded Demo Data",
        status: vendor.gapIndex > 30 ? "Needs Review" : "Seeded Demo Data",
        provenance: "seeded_demo_data",
      }, "fetch"),
      normalizeEvidenceRecord(vendor, {
        id: `${vendor.id}-trust`,
        title: `${vendor.name} trust center`,
        url: `https://${vendor.domain}/trust`,
        sourceType: "Trust Center",
        product: "Web Unlocker",
        fetchedAt: vendor.freshnessScore > 80 ? "4 min ago" : "5 days ago",
        claim: "Seeded demo trust or security evidence is available but must be mapped to policy requirements.",
        confidence: vendor.freshnessScore > 80 ? 86 : 68,
        clause: "Enterprise security evidence",
        freshness: vendor.freshnessScore > 80 ? "Seeded Demo Data" : "Stale Source",
        status: vendor.freshnessScore > 80 ? "Seeded Demo Data" : "Stale Source",
        provenance: "seeded_demo_data",
      }, "fetch"),
    ];

    if (["gamma", "notion-ai", "midjourney"].includes(vendor.id)) {
      records.push(
        normalizeEvidenceRecord(vendor, {
          id: `${vendor.id}-docs-seeded`,
          title: `${vendor.name} enterprise documentation`,
          url: `https://${vendor.domain}/docs`,
          sourceType: "Documentation",
          product: "Web Unlocker",
          fetchedAt: "6 min ago",
          claim: "Seeded demo documentation evidence is present for admin control and access-governance review.",
          confidence: 80,
          clause: "Documentation evidence",
          freshness: "Seeded Demo Data",
          status: "Seeded Demo Data",
          provenance: "seeded_demo_data",
        }, "fetch"),
        normalizeEvidenceRecord(vendor, {
          id: `${vendor.id}-news-seeded`,
          title: `${vendor.name} public risk search`,
          url: `https://www.google.com/search?q=${encodeURIComponent(vendor.name + " security privacy risk news")}`,
          sourceType: "News",
          product: "SERP API",
          fetchedAt: "6 min ago",
          claim: "Seeded demo public-risk search evidence is present for incident and reputation review.",
          confidence: 78,
          clause: "News evidence",
          freshness: "Seeded Demo Data",
          status: "Seeded Demo Data",
          provenance: "seeded_demo_data",
        }, "discovery"),
      );
    }

    evidenceByVendor[vendor.id] = records;
  });
}

seedEvidence();

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      vendors,
      evidenceByVendor,
      bandRoomsByVendor,
      activityLog,
      appSettings,
    }),
  );
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return;
    if (!Array.isArray(saved.vendors) || !saved.vendors.length) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    vendors = saved.vendors;
    evidenceByVendor = saved.evidenceByVendor || evidenceByVendor;
    bandRoomsByVendor = saved.bandRoomsByVendor && typeof saved.bandRoomsByVendor === "object" ? saved.bandRoomsByVendor : {};
    activityLog = Array.isArray(saved.activityLog) ? saved.activityLog : activityLog;
    appSettings = {
      ...appSettings,
      ...(saved.appSettings || {}),
      workspaceMode: saved.appSettings?.workspaceMode || "seeded-workspace",
      workspaceVersion: saved.appSettings?.workspaceVersion || SEEDED_WORKSPACE_VERSION,
      brightDataProducts: {
        ...appSettings.brightDataProducts,
        ...((saved.appSettings || {}).brightDataProducts || {}),
      },
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

loadState();
fetchServerStatus();

const controlsByVendor = {
  chatgpt: [
    ["Data Handling", "Needs Review", "Customer-data controls depend on workspace and plan configuration."],
    ["Privacy and Retention", "Needs Review", "Retention and training settings require enterprise confirmation."],
    ["Enterprise Security", "Pass", "Public trust and security evidence is available."],
    ["Compliance and Trust", "Pass", "Compliance evidence is discoverable and recent."],
    ["Agent / Tool Access", "Unknown", "Tool access boundaries should be verified for approved use cases."],
    ["Public Risk Signals", "Pass", "No blocking public risk signal in this demo review."],
  ],
  perplexity: [
    ["Data Handling", "Needs Review", "Prospect and account notes require retention clarity."],
    ["Privacy and Retention", "Unknown", "Some policy details require manual verification."],
    ["Enterprise Security", "Needs Review", "Enterprise controls should be confirmed before approval."],
    ["Compliance and Trust", "Unknown", "Compliance evidence is incomplete in the current ledger."],
    ["Agent / Tool Access", "Pass", "No tool access risk identified for current use case."],
    ["Public Risk Signals", "Pass", "No blocking public risk signal in this demo review."],
  ],
  fireflies: [
    ["Data Handling", "Fail", "Call recordings can include regulated customer and employee content."],
    ["Privacy and Retention", "Fail", "Recording retention and consent controls require legal approval."],
    ["Enterprise Security", "Needs Review", "Security evidence must be attached before approval."],
    ["Compliance and Trust", "Unknown", "DPA and subprocessors need confirmation."],
    ["Agent / Tool Access", "Pass", "No autonomous tool access identified."],
    ["Public Risk Signals", "Needs Review", "High-sensitivity use case requires privacy review."],
  ],
  "notion-ai": [
    ["Data Handling", "Needs Review", "Internal document boundaries need workspace guardrails."],
    ["Privacy and Retention", "Pass", "Public policy pages are discoverable."],
    ["Enterprise Security", "Pass", "Trust and security evidence is available."],
    ["Compliance and Trust", "Pass", "Compliance evidence is sufficient for conditional approval."],
    ["Agent / Tool Access", "Unknown", "Automation scope should be verified."],
    ["Public Risk Signals", "Pass", "No blocking public risk signal in this demo review."],
  ],
  cursor: [
    ["Data Handling", "Fail", "Source code is high-sensitivity company data."],
    ["Privacy and Retention", "Needs Review", "Retention and telemetry controls require review."],
    ["Enterprise Security", "Needs Review", "Enterprise plan controls must be confirmed."],
    ["Compliance and Trust", "Unknown", "Compliance evidence is incomplete."],
    ["Agent / Tool Access", "Needs Review", "Repository and tool access can create agentic risk."],
    ["Public Risk Signals", "Pass", "No blocking public risk signal in this demo review."],
  ],
  glean: [
    ["Data Handling", "Pass", "Knowledge access can be controlled through connectors."],
    ["Privacy and Retention", "Pass", "Public privacy evidence is current."],
    ["Enterprise Security", "Pass", "Enterprise security posture is well documented."],
    ["Compliance and Trust", "Pass", "Trust evidence is sufficient for approval."],
    ["Agent / Tool Access", "Needs Review", "Connector scope should follow least privilege."],
    ["Public Risk Signals", "Pass", "No blocking public risk signal in this demo review."],
  ],
};

function controlsFor(vendor) {
  return controlsByVendor[vendor.id] || [
    ["Data Handling", vendor.riskScore > 70 ? "Needs Review" : "Pass", "Review use-case data sensitivity before approval."],
    ["Privacy and Retention", vendor.gapIndex > 30 ? "Unknown" : "Pass", "Missing or stale privacy evidence should be escalated."],
    ["Enterprise Security", vendor.freshnessScore > 80 ? "Pass" : "Needs Review", "Trust evidence freshness controls approval confidence."],
    ["Compliance and Trust", vendor.gapIndex > 28 ? "Needs Review" : "Pass", "Compliance evidence should be attached to the memo."],
    ["Agent / Tool Access", "Unknown", "No direct tool access evidence in current review."],
    ["Public Risk Signals", "Pass", "No blocking public risk signal in this demo review."],
  ];
}

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function vendorById(id) {
  return vendors.find((vendor) => vendor.id === id) || vendors[0];
}

function normalizeDecision(decision) {
  const value = String(decision || "").trim().toLowerCase();
  if (value === "approve") return "Approve";
  if (value === "approve with conditions" || value === "conditional") return CONDITIONAL_DECISION;
  if (value === "escalate") return "Escalate";
  if (value === "block" || value === "blocked" || value === "restrict pending legal/privacy review" || value === "block pending review") return BLOCK_DECISION;
  return "Escalate";
}

function riskColor(value) {
  const normalized = String(value || "").toLowerCase();
  if (["critical", BLOCK_DECISION.toLowerCase(), "blocked", "fail", "failed"].includes(normalized)) return "red";
  if (["high", "escalate", CONDITIONAL_DECISION.toLowerCase(), "needs review", "unknown", "stale source", "planned query", "missing", "manual_review_required"].includes(normalized)) return "amber";
  if (["approve", "approved", "pass", "fresh evidence", "live fetch", "success", "cached"].includes(normalized)) return "green";
  return "gray";
}

function decisionColor(decision) {
  if (decision === BLOCK_DECISION) return "red";
  if (decision === "Escalate" || decision === CONDITIONAL_DECISION) return "amber";
  if (decision === "Approve") return "green";
  return "gray";
}

function pill(label, color = "gray") {
  return `<span class="pill ${safeText(color)}">${safeText(label)}</span>`;
}

function provenanceFor(source = {}) {
  if (source.provenance) return source.provenance;
  if (source.evidenceOrigin === "CACHED_LIVE_SNAPSHOT") return "cached_live_snapshot";
  if (source.evidenceOrigin === "LIVE_FETCH") return "live_fetch";
  if (source.evidenceOrigin === "SEEDED_DEMO_DATA") return "seeded_demo_data";
  if (source.cacheStatus) return "cached_live_snapshot";
  if (source.brightDataStatus) return "live_fetch";
  if (source.fetchedAt === "planned" || source.status === "Missing Evidence") return "planned_query";
  return "seeded_demo_data";
}

function provenanceLabel(source = {}) {
  return PROVENANCE_LABELS[provenanceFor(source)] || "SEEDED DEMO DATA";
}

function provenancePill(source = {}) {
  const provenance = provenanceFor(source);
  return pill(PROVENANCE_LABELS[provenance] || "SEEDED", PROVENANCE_COLORS[provenance] || "gray");
}

function sourceDisplayUrl(source = {}) {
  return source.officialSourceUrl || source.url || source.discoverySearchUrl || "";
}

function sourceDisplayTitle(source = {}) {
  return source.sourceTitle || source.title || sourceDisplayUrl(source) || "Evidence source";
}

function abbreviatedHash(hash = "") {
  return hash ? `${hash.slice(0, 12)}...${hash.slice(-8)}` : "pending";
}

function isDiscoveryRecord(source = {}) {
  return String(source.sourceType || "").includes("Discovery") || source.pipelineStage === "discovery";
}

function isFinalSupportingEvidence(source = {}) {
  return source.includedInMemo === true && !isDiscoveryRecord(source) && source.retrievalStatus !== "missing" && source.retrievalStatus !== "failed";
}

function sourceActionLabel(source = {}) {
  if (isFinalSupportingEvidence(source)) return "View finding";
  if (String(source.sourceType || "").includes("Missing") || ["missing", "failed"].includes(source.retrievalStatus)) return "View gap";
  return "View activity";
}

function findingExcerpt(source = {}) {
  const raw = source.excerpt || source.readablePreview || source.claim;
  const str = typeof raw === "string" ? raw.trim() : (raw && typeof raw === "object") ? "" : String(raw || "").trim();
  return str === "{}" || str === "[]" ? "" : str;
}

function findingMethodLabel(source = {}) {
  return source.extractionMethod === "AI/ML API" && source.aiExtraction ? "AI-extracted finding" : "Rules-based finding";
}

function supportedFinding(source = {}) {
  const raw = source.aiExtraction?.supportedFinding || source.rulesBasedFinding?.supportedFinding || source.claim || "";
  const str = String(raw || "").trim();
  return str === "{}" || str === "[]" ? "" : str;
}

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function cleanImportValue(value, maxLength = 120) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

function normalizeDomainInput(value, fallbackId) {
  const cleaned = cleanImportValue(value, 160).replace(/^https?:\/\//, "");
  const host = cleaned.split("/")[0];
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) return host.toLowerCase();
  return `${fallbackId}.com`;
}

function safeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function exposureWeight(exposure) {
  const normalized = exposure.toLowerCase();
  if (normalized.includes("call") || normalized.includes("source code")) return 30;
  if (normalized.includes("customer") || normalized.includes("internal docs")) return 24;
  if (normalized.includes("prospect") || normalized.includes("knowledge")) return 18;
  if (normalized.includes("brand") || normalized.includes("campaign")) return 10;
  return 16;
}

function riskLevelFromScore(score) {
  if (score >= 85) return "Critical";
  if (score >= 70) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

function decisionFromVendor(vendor) {
  const missing = missingEvidenceTypes(vendor);
  const highSensitivity = exposureWeight(vendor.dataExposure) >= 24;
  const missingCritical = missing.includes("Privacy Policy") || missing.includes("Subprocessors");
  if (vendor.riskScore >= 88 || vendor.gapIndex >= 58 || (highSensitivity && missingCritical)) return BLOCK_DECISION;
  if (vendor.riskScore >= 72 || vendor.gapIndex >= 34 || missing.length >= 2) return "Escalate";
  if (vendor.riskScore >= 50 || vendor.gapIndex >= 18) return CONDITIONAL_DECISION;
  return "Approve";
}

function inferCategory(name) {
  const normalized = name.toLowerCase();
  if (normalized.includes("otter") || normalized.includes("fireflies") || normalized.includes("meeting")) return "Meeting AI";
  if (normalized.includes("cursor") || normalized.includes("code") || normalized.includes("dev")) return "AI coding";
  if (normalized.includes("runway") || normalized.includes("midjourney") || normalized.includes("image")) return "Creative AI";
  if (normalized.includes("writer") || normalized.includes("jasper")) return "Content AI";
  return "AI tool";
}

function inferPolicyProfile(exposure) {
  const normalized = exposure.toLowerCase();
  if (normalized.includes("source code")) return "AI Agent With Tool Access";
  if (normalized.includes("call") || normalized.includes("recording") || normalized.includes("contract")) return "High Risk Regulated Vendor";
  if (normalized.includes("customer") || normalized.includes("prospect")) return "AI Tool With Customer Data";
  return "Standard SaaS Vendor";
}

function requiredEvidenceTypes(vendor) {
  return REQUIRED_EVIDENCE_TYPES[vendor.policyProfile] || REQUIRED_EVIDENCE_TYPES["Standard SaaS Vendor"];
}

function evidenceTypesFor(vendor) {
  return new Set((evidenceByVendor[vendor.id] || []).map((source) => source.sourceType));
}

function missingEvidenceTypes(vendor) {
  const present = evidenceTypesFor(vendor);
  return requiredEvidenceTypes(vendor).filter((type) => !present.has(type));
}

function cleanSnapshotText(value, limit = 20000) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\b(skip to main content|cookie policy|accept all cookies|privacy preferences|all rights reserved)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function sha256(value) {
  const bytes = new TextEncoder().encode(cleanSnapshotText(value).toLowerCase());
  const words = [];
  const bitLength = bytes.length * 8;
  for (let index = 0; index < bytes.length; index += 1) {
    words[index >> 2] |= bytes[index] << (24 - (index % 4) * 8);
  }
  words[bitLength >> 5] |= 0x80 << (24 - bitLength % 32);
  words[(((bitLength + 64) >> 9) << 4) + 15] = bitLength;
  const constants = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  const rotate = (value, amount) => (value >>> amount) | (value << (32 - amount));
  for (let block = 0; block < words.length; block += 16) {
    const w = [];
    for (let index = 0; index < 64; index += 1) {
      if (index < 16) w[index] = words[block + index] | 0;
      else {
        const s0 = rotate(w[index - 15], 7) ^ rotate(w[index - 15], 18) ^ (w[index - 15] >>> 3);
        const s1 = rotate(w[index - 2], 17) ^ rotate(w[index - 2], 19) ^ (w[index - 2] >>> 10);
        w[index] = (w[index - 16] + s0 + w[index - 7] + s1) | 0;
      }
    }
    let a = h0; let b = h1; let c = h2; let d = h3; let e = h4; let f = h5; let g = h6; let h = h7;
    for (let index = 0; index < 64; index += 1) {
      const s1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + constants[index] + w[index]) | 0;
      const s0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;
      h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((part) => (part >>> 0).toString(16).padStart(8, "0")).join("");
}

function excerptFromContent(value, limit = 280) {
  const text = cleanSnapshotText(value, 20000);
  if (!text) return "";
  const lower = text.toLowerCase();
  const terms = ["retention", "training", "customer data", "subprocessor", "soc 2", "iso 27001", "sso", "audit logs", "encryption", "incident"];
  const term = terms.find((candidate) => lower.includes(candidate));
  if (!term) return text.slice(0, limit);
  const index = lower.indexOf(term);
  const start = Math.max(0, index - 80);
  const end = Math.min(text.length, start + limit);
  return `${start > 0 ? "..." : ""}${text.slice(start, end).trim()}${end < text.length ? "..." : ""}`;
}

function normalizeEvidenceRecord(vendor, source, stage = "fetch") {
  const provenance = provenanceFor(source);
  const url = source.url || source.officialSourceUrl || source.discoverySearchUrl || "";
  const title = source.title || source.sourceTitle || "";
  const snapshotSource = source.snapshotContent || source.rawContent || source.rawPreview || source.readablePreview || source.excerpt || source.claim || `${title} ${url}`;
  const snapshotSha256 = source.snapshotSha256 || sha256(snapshotSource);
  const excerpt = source.excerpt || excerptFromContent(snapshotSource);
  const evidenceId = source.evidenceId || `EV-${snapshotSha256.slice(0, 10).toUpperCase()}`;
  return {
    ...source,
    pipelineStage: source.pipelineStage || stage,
    includedInMemo: source.includedInMemo ?? true,
    evidenceId,
    evidenceHash: evidenceId,
    snapshotSha256,
    snapshotPreviewSha256: source.snapshotPreviewSha256 || (excerpt ? sha256(excerpt) : ""),
    excerpt,
    evidenceOrigin: source.evidenceOrigin || (provenance === "live_fetch" ? "LIVE_FETCH" : provenance === "cached_live_snapshot" ? "CACHED_LIVE_SNAPSHOT" : "SEEDED_DEMO_DATA"),
    retrievalStatus: source.retrievalStatus || (source.status === "Missing Evidence" ? "missing" : source.needsManualInspection ? "manual_review_required" : "success"),
    extractionMethod: source.extractionMethod || "Rules-based",
    url,
    title,
    provenance,
  };
}

function hashEvidence(value) {
  return `EV-${sha256(value).slice(0, 10).toUpperCase()}`;
}

function policyStateFor(group, vendor, missing) {
  const highExposure = exposureWeight(vendor.dataExposure) >= 24;
  if (group === "Data Handling") {
    if (highExposure && missing.includes("Privacy Policy")) return "Fail";
    if (highExposure) return "Needs Review";
    return "Pass";
  }
  if (group === "Privacy and Retention") {
    if (missing.includes("Privacy Policy")) return "Fail";
    if (vendor.gapIndex > 30) return "Needs Review";
    return "Pass";
  }
  if (group === "Enterprise Security") {
    if (missing.includes("Trust Center") || missing.includes("Documentation")) return "Needs Review";
    return "Pass";
  }
  if (group === "Compliance and Trust") {
    if (vendor.policyProfile === "High Risk Regulated Vendor" && missing.length > 0) return "Needs Review";
    return vendor.freshnessScore > 75 ? "Pass" : "Needs Review";
  }
  if (group === "Agent / Tool Access") {
    if (vendor.policyProfile === "AI Agent With Tool Access") return "Needs Review";
    return "Pass";
  }
  if (group === "Public Risk Signals") {
    return missing.includes("News") ? "Unknown" : "Pass";
  }
  return "Unknown";
}

function refreshPolicyFindings(vendor) {
  const missing = missingEvidenceTypes(vendor);
  const recommendation = normalizeDecision(vendor.recommendedDecision || decisionFromVendor(vendor));
  vendor.decision = normalizeDecision(vendor.decision);
  const baseFindings = controlsFor(vendor).map(([group, _state, copy]) => {
    const state = policyStateFor(group, vendor, missing);
    return {
      group,
      state,
      copy,
      evidenceCount: (evidenceByVendor[vendor.id] || []).filter((source) => source.clause.toLowerCase().includes(group.split(" ")[0].toLowerCase())).length,
    };
  });
  vendor.policyFindings = baseFindings;
  vendor.missingEvidence = missing;
  if (!vendor.seededWorkspace) {
    vendor.topFindings = [
      missing.length ? `Missing evidence: ${missing.join(", ")}.` : "Required evidence is present for the selected policy profile.",
      vendor.manualDecision ? `Reviewer override: ${vendor.decision}. Scoring recommendation: ${recommendation}.` : `Decision rule applied: ${vendor.decision}.`,
      `Freshness ${vendor.freshnessScore}% and evidence gap ${vendor.gapIndex}% drive the current review state.`,
    ];
  }
  vendor.requiredConditions = buildRequiredConditions(vendor, missing);
}

function buildRequiredConditions(vendor, missing) {
  const conditions = [];
  if (missing.includes("Privacy Policy")) conditions.push("Attach current privacy and retention evidence before approval.");
  if (missing.includes("Subprocessors")) conditions.push("Attach subprocessors or data processor evidence.");
  if (missing.includes("Trust Center")) conditions.push("Confirm enterprise trust center, SOC 2, ISO, or equivalent controls.");
  if (missing.includes("Documentation")) conditions.push("Review admin, SSO, audit log, and data-control documentation.");
  if (vendor.policyProfile === "AI Agent With Tool Access") conditions.push("Confirm tool access boundaries and repository or workspace permissions.");
  if (vendor.decision === "Approve") conditions.push("Keep the tool in the approved AI register and monitor for public changes.");
  if (vendor.decision === BLOCK_DECISION) conditions.push("Restrict use until legal, privacy, and security owners approve the review package.");
  return conditions.length ? conditions : ["Maintain continuous monitoring and re-review if usage or data exposure changes."];
}

function scoreVendor(vendor) {
  if (vendor.seededWorkspace) { refreshPolicyFindings(vendor); return vendor; }
  const evidenceCount = (evidenceByVendor[vendor.id] || []).length;
  const missingCount = missingEvidenceTypes(vendor).length;
  const evidenceBonus = Math.min(18, evidenceCount * 3);
  const gap = clamp(76 - evidenceBonus - Math.round(vendor.freshnessScore / 5) + missingCount * 7, 8, 88);
  const usageWeight = Math.min(18, Math.round(vendor.users / 14));
  const base = 18 + exposureWeight(vendor.dataExposure) + usageWeight + Math.round(gap / 3) + missingCount * 3;
  vendor.gapIndex = gap;
  vendor.riskScore = clamp(base, 28, 96);
  vendor.riskLevel = riskLevelFromScore(vendor.riskScore);
  vendor.recommendedDecision = decisionFromVendor(vendor);
  if (!vendor.manualDecision && !vendor.seededWorkspace) vendor.decision = normalizeDecision(vendor.recommendedDecision);
  vendor.seededWorkspace = false;
  vendor.lastReviewed = "just now";
  refreshPolicyFindings(vendor);
  return vendor;
}

function generatedEvidence(vendor) {
  const now = Date.now();
  return [
    normalizeEvidenceRecord(vendor, {
      id: `${vendor.id}-subprocessors-${now}`,
      title: `${vendor.name} subprocessors page`,
      url: `https://${vendor.domain}/subprocessors`,
      sourceType: "Subprocessors",
      product: "Web Unlocker",
      fetchedAt: "just now",
      claim: "Seeded demo subprocessor evidence was attached for AI governance review.",
      confidence: 82,
      clause: "Subprocessor transparency",
      freshness: "Seeded Demo Data",
      status: "Seeded Demo Data",
      provenance: "seeded_demo_data",
    }, "fetch"),
    normalizeEvidenceRecord(vendor, {
      id: `${vendor.id}-docs-${now}`,
      title: `${vendor.name} enterprise documentation`,
      url: `https://${vendor.domain}/docs`,
      sourceType: "Documentation",
      product: "Seeded replay",
      retrievalProduct: "",
      fetchedAt: "just now",
      claim: "Seeded demo enterprise control documentation was attached and should be mapped to access requirements.",
      confidence: 78,
      clause: "Admin and access controls",
      freshness: "Seeded Demo Data",
      status: "Needs Review",
      provenance: "seeded_demo_data",
    }, "extraction"),
    normalizeEvidenceRecord(vendor, {
      id: `${vendor.id}-news-${now}`,
      title: `${vendor.name} recent public risk signals`,
      url: `https://www.google.com/search?q=${encodeURIComponent(vendor.name + " AI security privacy news")}`,
      sourceType: "News",
      product: "SERP API",
      fetchedAt: "just now",
      claim: "Seeded demo public-web search results were attached to check reputation, incidents, and governance changes.",
      confidence: 74,
      clause: "Public risk signals",
      freshness: "Seeded Demo Data",
      status: "Seeded Demo Data",
      provenance: "seeded_demo_data",
    }, "discovery"),
  ];
}

function discoverSources(vendor) {
  return brightDataQueries(vendor).map((item, index) =>
    normalizeEvidenceRecord(vendor, {
      id: `${vendor.id}-discovery-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: `${vendor.name} ${item.label} discovery query`,
      url: `https://www.google.com/search?q=${encodeURIComponent(item.query)}`,
      sourceType: `${item.label} Discovery`,
      product: item.product,
      fetchedAt: "planned",
      claim: `Discovery query prepared for ${item.label.toLowerCase()} evidence.`,
      confidence: 70 + index,
      clause: `${item.label} source discovery`,
      freshness: "Missing Evidence",
      status: "Missing Evidence",
      provenance: "planned_query",
      includedInMemo: false,
    }, "discovery"),
  );
}

function fetchSource(vendor, sourceType) {
  const pathByType = {
    "Privacy Policy": "privacy",
    "Trust Center": "trust",
    Subprocessors: "subprocessors",
    Documentation: "docs",
    News: "news",
  };
  const path = pathByType[sourceType] || sourceType.toLowerCase().replace(/\s+/g, "-");
  return normalizeEvidenceRecord(vendor, {
    id: `${vendor.id}-${path}-${Date.now()}`,
    title: `${vendor.name} ${sourceType.toLowerCase()}`,
    url: sourceType === "News" ? `https://www.google.com/search?q=${encodeURIComponent(vendor.name + " risk security privacy news")}` : `https://${vendor.domain}/${path}`,
    sourceType,
    product: sourceType === "News" ? "SERP API" : "Web Unlocker",
    fetchedAt: "just now",
    claim: `${sourceType} seeded demo evidence was attached through the Bright Data-ready adapter path without a live fetch.`,
    confidence: sourceType === "News" ? 74 : 82,
    clause: `${sourceType} evidence`,
    freshness: "Seeded Demo Data",
    status: sourceType === "Documentation" ? "Needs Review" : "Seeded Demo Data",
    provenance: "seeded_demo_data",
  }, "fetch");
}

function extractClaims(vendor, sources) {
  return sources.map((source) => ({
    sourceId: source.id,
    claim: source.claim,
    confidence: source.confidence,
    clause: source.clause,
    vendorId: vendor.id,
  }));
}

function mapPolicyFindings(vendor) {
  refreshPolicyFindings(vendor);
  return vendor.policyFindings || [];
}

function brightDataQueries(vendor) {
  return sourcePlaybook.map(([label, query]) => ({
    label,
    product: label === "Trust center" || label === "Docs" ? "Web Unlocker" : "SERP API",
    query: `${vendor.name} ${query}`,
  }));
}

function sourceById(vendorId, sourceId) {
  return (evidenceByVendor[vendorId] || []).find((source) => source.id === sourceId);
}

function evidenceKey(source) {
  return `${source.sourceType}:${source.url}`;
}

function unseenEvidence(existing, candidates) {
  const seen = new Set(existing.map(evidenceKey));
  return candidates.filter((candidate) => {
    const key = evidenceKey(candidate);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectReviewEvidence(vendor) {
  const missing = missingEvidenceTypes(vendor);
  const discoveryRecords = discoverSources(vendor);
  const fetchedMissing = missing.map((sourceType) => fetchSource(vendor, sourceType));
  const demoRecords = generatedEvidence(vendor);
  return {
    missing,
    candidates: discoveryRecords.concat(fetchedMissing, demoRecords),
  };
}

function addEvidenceRecords(vendor, candidates) {
  const existing = evidenceByVendor[vendor.id] || [];
  const normalized = candidates.map((candidate) =>
    normalizeEvidenceRecord(vendor, candidate, candidate.pipelineStage || "fetch"),
  );
  const additions = unseenEvidence(existing, normalized);
  evidenceByVendor[vendor.id] = existing.concat(additions);
  return additions;
}

function backendReviewEnabled() {
  return window.location.protocol === "http:" || window.location.protocol === "https:";
}

async function requestBackendReview(vendor, missing, options = {}) {
  if (!backendReviewEnabled() || typeof fetch !== "function") return null;
  try {
    const response = await fetch(appSettings.reviewApiEndpoint || "/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor,
        missingEvidence: missing,
        existingEvidence: evidenceByVendor[vendor.id] || [],
        forceRefresh: Boolean(options.forceRefresh),
      }),
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function applyReviewEvidence(vendor, missing, candidates, options = {}) {
  const additions = addEvidenceRecords(vendor, candidates);
  vendor.freshnessScore = clamp(vendor.freshnessScore + additions.length * 4, 40, 99);
  if (options.source === "bright-data-live") {
    vendor.seededWorkspace = false;
    vendor.liveReviewApplied = true;
  }
  scoreVendor(vendor);
  extractClaims(vendor, additions);
  mapPolicyFindings(vendor);
  const mode = options.batch ? "Queue Review" : "Live Review";
  const source = options.source || "local demo fallback";
  appSettings.lastReviewMode = source;
  appSettings.lastFallbackReason = options.fallbackReason || "";
  appSettings.lastReviewMeta = options.reviewMeta || {
    costEstimate: estimateReviewCost(vendor, { missing }),
    cacheHit: false,
    durationMs: 0,
  };
  const driftChanges = options.reviewMeta?.driftChanges || [];
  vendor.driftReason = driftChanges.length
    ? `${driftChanges.length} public evidence snapshot${driftChanges.length === 1 ? "" : "s"} changed since the prior live review.`
    : "";
  if (driftChanges.length) {
    activityLog.unshift(["EVIDENCE_DRIFT_DETECTED", `${new Date().toISOString()} · ${vendor.name}: ${vendor.driftReason}`]);
  }
  activityLog.unshift([mode, `${vendor.name} reviewed through ${source} with ${additions.length} new evidence records. Started with ${missing.length} gap${missing.length === 1 ? "" : "s"}; now missing ${missingEvidenceTypes(vendor).length}. Decision: ${vendor.decision}.`]);
  activityLog = activityLog.slice(0, 12);
  saveState();
  return { vendor, additions, source };
}

function analyzeVendor(vendorId, options = {}) {
  const vendor = vendorById(vendorId);
  const { missing, candidates } = collectReviewEvidence(vendor);
  return applyReviewEvidence(vendor, missing, candidates, {
    ...options,
    source: "local demo fallback",
  });
}

async function analyzeVendorWithBackend(vendorId, options = {}) {
  const vendor = vendorById(vendorId);
  const local = collectReviewEvidence(vendor);
  const backend = await requestBackendReview(vendor, local.missing, options);
  const backendEvidence = Array.isArray(backend?.evidence) ? backend.evidence : [];
  if (backendEvidence.length) {
    vendor.memoDraft = backend.memoDraft || null;
    vendor.memoDraftError = backend.memoDraftError || "";
    return applyReviewEvidence(vendor, local.missing, backendEvidence, {
      ...options,
      source: backend.mode || "server adapter",
      fallbackReason: backend.fallbackReason || "",
      reviewMeta: backend.reviewMeta || null,
    });
  }
  return analyzeVendor(vendorId, options);
}

function reviewModeLabel() {
  if (appSettings.lastReviewMode === "bright-data-live") return "Live evidence available";
  return "Judge workspace ready";
}

function settingsModeLabel() {
  if (appSettings.lastReviewMode === "bright-data-live") return "LIVE CONNECTED";
  if (appSettings.lastReviewMeta?.cacheHit || appSettings.lastReviewMode === "cached_live_snapshot") return "CACHED REPLAY";
  return "SEEDED WORKSPACE";
}

function reviewModeColor() {
  return appSettings.lastReviewMode === "bright-data-live" ? "green" : "blue";
}

function updateConnectionMode() {
  const target = qs("#connectionMode");
  if (!target) return;
  target.textContent = reviewModeLabel();
  target.className = `status-badge ${reviewModeColor()}`;
}

function renderKpis() {
  const total = vendors.length;
  const highRisk = vendors.filter((vendor) => ["High", "Critical"].includes(vendor.riskLevel)).length;
  const pending = vendors.filter((vendor) => ["Escalate", BLOCK_DECISION].includes(vendor.decision)).length;
  const blocked = vendors.filter((vendor) => vendor.decision === BLOCK_DECISION).length;
  const hours = vendors.reduce((sum, vendor) => sum + vendor.reviewHours, 0);
  const kpis = [
    ["Total AI tools", total, "Detected across browser, SSO, and expenses", "neutral"],
    ["High-risk tools", highRisk, "Require security or legal review", highRisk ? "warning" : "neutral"],
    ["Pending reviews", pending, "Tools awaiting active human reviewer decision", pending ? "warning" : "neutral"],
    ["Blocked tools", blocked, "Restricted pending legal/privacy review", blocked ? "danger" : "neutral"],
    ["Review hours saved", hours, "Estimated manual triage avoided", "success"],
  ];

  qs("#kpiGrid").innerHTML = kpis
    .map(
      ([label, value, note, tone]) => `
        <article class="kpi-card ${tone}">
          <p class="metric-label">${label}</p>
          <div class="metric-value">${value}</div>
          <p class="metric-note">${note}</p>
        </article>
      `,
    )
    .join("");
}

function filteredVendors() {
  const query = qs("#globalSearch").value.trim().toLowerCase();
  const risk = qs("#riskFilter").value;
  return vendors.filter((vendor) => {
    const matchesQuery = [vendor.name, vendor.domain, vendor.category, vendor.department, vendor.dataExposure]
      .join(" ")
      .toLowerCase()
      .includes(query);
    const matchesRisk = risk === "all" || vendor.riskLevel === risk;
    return matchesQuery && matchesRisk;
  });
}

function renderRiskQueue() {
  const rows = filteredVendors();
  const tbody = qs("#riskQueue");
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="10">${qs("#emptyStateTemplate").innerHTML}</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .sort((a, b) => b.riskScore - a.riskScore)
    .map(
      (vendor) => `
        <tr>
          <td>
            <div class="vendor-cell">
              <div class="vendor-logo">${vendor.initials}</div>
              <div class="vendor-title">
                <strong>${vendor.name}</strong>
                <span>${vendor.domain}</span>
              </div>
            </div>
          </td>
          <td>${vendor.category}</td>
          <td>${vendor.department}</td>
          <td>${vendor.users}</td>
          <td>${vendor.dataExposure}</td>
          <td>${pill(vendor.riskLevel, riskColor(vendor.riskLevel))}</td>
          <td>${pill(`${vendor.freshnessScore}% fresh`, vendor.freshnessScore > 85 ? "green" : vendor.freshnessScore > 70 ? "amber" : "red")}</td>
          <td>${pill(vendor.decision, decisionColor(vendor.decision))}</td>
          <td>${vendor.lastReviewed}</td>
          <td><button class="button secondary review-button" type="button" data-review-id="${vendor.id}">Open review</button></td>
        </tr>
      `,
    )
    .join("");

  qsa(".review-button").forEach((button) => {
    button.addEventListener("click", () => openReview(button.dataset.reviewId));
  });
}

function renderActivity() {
  qs("#activityFeed").innerHTML = activityLog
    .map(
      ([title, copy]) => `
        <article class="activity-item">
          <strong><span class="activity-dot"></span>${title}</strong>
          <p>${copy}</p>
        </article>
      `,
    )
    .join("");
}

function renderReviewHeader(vendor) {
  const missing = missingEvidenceTypes(vendor);
  qs("#reviewHeader").innerHTML = `
    <div class="review-identity">
      <div class="vendor-logo">${vendor.initials}</div>
      <div>
        <p class="eyebrow">Vendor Review</p>
        <div class="review-title-row">
          <h1 id="reviewTitle">${vendor.name}</h1>
          ${pill(vendor.decision, decisionColor(vendor.decision))}
        </div>
        <div class="review-meta">
          <span>${vendor.domain}</span>
          <span>${vendor.category}</span>
          <span>${vendor.department}</span>
          <span>${vendor.users} detected users</span>
          <span>${vendor.policyProfile}</span>
          ${vendor.browserFallbackDemoCandidate ? `<span>${pill("Dynamic-page fallback candidate", "amber")}</span>` : ""}
        </div>
        <p class="metric-note">Detected from ${vendor.detectedFrom}. Last reviewed ${vendor.lastReviewed}.</p>
      </div>
    </div>
    <div class="review-score-grid">
      <div class="score-card"><span>Risk score</span><strong>${vendor.riskScore}</strong></div>
      <div class="score-card"><span>Freshness</span><strong>${vendor.freshnessScore}%</strong></div>
      <div class="score-card"><span>Evidence gap</span><strong>${vendor.gapIndex}%</strong></div>
      <div class="score-card"><span>Missing evidence</span><strong>${missing.length}</strong></div>
    </div>
  `;
}

function renderOverview(vendor) {
  const missing = missingEvidenceTypes(vendor);
  qs("#overviewTab").innerHTML = `
    <div class="overview-grid">
      <article class="overview-card">
        <p class="metric-label">Current decision</p>
        <div class="metric-value">${vendor.decision}</div>
        <p class="metric-note">Based on public evidence, data exposure, and policy mapping.</p>
      </article>
      <article class="overview-card">
        <p class="metric-label">Detected source</p>
        <div class="metric-value">${vendor.detectedFrom}</div>
        <p class="metric-note">${vendor.users} employees observed or reported usage.</p>
      </article>
      <article class="overview-card">
        <p class="metric-label">Data exposure</p>
        <div class="metric-value">${vendor.dataExposure}</div>
        <p class="metric-note">Primary sensitivity driving review priority.</p>
      </article>
      <article class="overview-card">
        <p class="metric-label">Missing evidence</p>
        <div class="metric-value">${missing.length}</div>
        <p class="metric-note">${missing.length ? missing.join(", ") : "Required evidence is attached."}</p>
      </article>
      <article class="overview-card full">
        <div class="panel-header compact">
          <div>
            <h2>Top findings</h2>
            <p>Decision-grade summary for security and procurement.</p>
          </div>
          ${pill(vendor.riskLevel, riskColor(vendor.riskLevel))}
        </div>
        <ul class="mini-list">
          ${vendor.topFindings.map((finding) => `<li><span>${finding}</span></li>`).join("")}
        </ul>
      </article>
      <article class="overview-card full">
        <div class="panel-header compact">
          <div>
            <h2>Decision rules</h2>
            <p>Transparent local rules used by the deterministic policy engine.</p>
          </div>
        </div>
        <ul class="mini-list">
          ${DECISION_RULES.map((rule) => `<li><span>${rule}</span></li>`).join("")}
        </ul>
      </article>
    </div>
  `;
}

function renderEvidence(vendor) {
  const evidence = evidenceByVendor[vendor.id] || [];
  const memoIncluded = evidence.filter(isFinalSupportingEvidence).length;
  const productCount = new Set(evidence.map((item) => item.retrievalProduct || item.discoveryProduct || item.product).filter(Boolean)).size;
  const localEstimate = estimateReviewCost(vendor);
  const lastMeta = appSettings.lastReviewMeta || {};
  const serverEstimate = lastMeta.costEstimate;
  const estimate = serverEstimate || localEstimate;
  const browserFallback = lastMeta.browserFallback || {};
  const browserEvent = Array.isArray(browserFallback.events)
    ? browserFallback.events.find((event) => String(event).includes("fallback executed"))
    : "";
  const budgetColor = estimate.estimatedCostUsd <= appSettings.maxReviewCostUsd ? "green" : "red";
  qs("#evidenceTab").innerHTML = `
    <div class="progress-panel">
      <div class="panel-header compact">
        <div>
          <h2>Evidence Ledger</h2>
          <p>Every finding is tied to a source, timestamp, provenance label, and Bright Data product path.</p>
        </div>
        <button id="runVendorReview" class="button primary" type="button">Run live verification</button>
      </div>
      <div class="ledger-summary">
        <div><strong>${evidence.length}</strong><span>Total records</span></div>
        <div><strong>${memoIncluded}</strong><span>Memo included</span></div>
        <div><strong>${productCount}</strong><span>Data products</span></div>
        <div><strong>${missingEvidenceTypes(vendor).length}</strong><span>Open gaps</span></div>
      </div>
      <div class="cost-guardrail">
        <div>
          <p class="metric-label">Review request guardrail</p>
          <strong>${formatUsd(estimate.estimatedCostUsd)}</strong>
          <span>${estimate.totalRequests} planned Bright Data request${estimate.totalRequests === 1 ? "" : "s"} · ${estimate.browserFallbackRequests || 0}/${estimate.browserFallbackMaxPerReview ?? 1} Browser fallback used · budget ${formatUsd(appSettings.maxReviewCostUsd)}</span>
        </div>
        <div>
          ${pill(estimate.estimatedCostUsd <= appSettings.maxReviewCostUsd ? "Within budget" : "Over budget", budgetColor)}
          ${pill(lastMeta.cacheHit ? "Cache reused" : "Fresh run", lastMeta.cacheHit ? "blue" : "green")}
        </div>
      </div>
      ${browserEvent ? `<div class="note-box">Dynamic page detected &rarr; Scraping Browser fallback executed.</div>` : ""}
      <div class="progress-track" aria-label="Investigation progress">
        <div id="reviewProgress" class="progress-fill"></div>
      </div>
      <div id="stepList" class="step-list">
        ${reviewSteps.map((step) => `<div class="step">${step}</div>`).join("")}
      </div>
      <div class="query-plan">
        ${brightDataQueries(vendor)
          .map(
            (item) => `
              <div class="query-row">
                ${pill(item.product, "blue")}
                <code>${safeText(item.query)}</code>
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
    <section class="panel">
      <div class="table-wrap">
        <table class="ledger-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Bright Data</th>
              <th>Origin</th>
              <th>Fetched</th>
              <th>Finding</th>
              <th>Confidence</th>
              <th>Policy</th>
              <th>Status</th>
              <th>Stage</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${evidence
              .map(
                (item) => `
                  <tr class="${isFinalSupportingEvidence(item) ? "" : "discovery-row"}">
                    <td>
                      <span class="source-title">${safeText(sourceDisplayTitle(item))}</span>
                      <span class="source-url">${safeText(sourceDisplayUrl(item))}</span>
                    </td>
                    <td>${safeText(item.sourceType)}</td>
                    <td>${pill(item.retrievalProduct || item.discoveryProduct || item.product || "Recorded", "blue")}</td>
                    <td>${provenancePill(item)}</td>
                    <td>${safeText(item.fetchedAt)}</td>
                    <td><span class="claim-text">${safeText(
                      (isFinalSupportingEvidence(item) ? findingExcerpt(item)
                        : (typeof item.claim === "string" && item.claim.trim() !== "{}" ? item.claim.trim() : ""))
                      || "Source retrieved; detailed finding requires manual review."
                    )}</span></td>
                    <td>${Number(item.confidence || 0)}%</td>
                    <td>${safeText(item.clause || "Policy mapping pending")}</td>
                    <td>${pill(item.retrievalStatus || item.status || "recorded", riskColor(item.status || item.retrievalStatus))}</td>
                    <td>${safeText(PIPELINE_STAGE_LABELS[item.pipelineStage] || item.pipelineStage || "Evidence")}</td>
                    <td><button class="button ghost source-detail-button" type="button" data-source-vendor="${vendor.id}" data-source-id="${item.id}">${sourceActionLabel(item)}</button></td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;

  qs("#runVendorReview").addEventListener("click", () => runLiveReview(vendor.id));
  bindSourceDetailButtons();
}

function renderEvidenceHub() {
  const sources = vendors.flatMap((vendor) =>
    (evidenceByVendor[vendor.id] || []).map((source) => ({
      ...source,
      vendorName: vendor.name,
      vendorId: vendor.id,
    })),
  );
  const productCounts = sources.reduce((acc, source) => {
    const product = source.retrievalProduct || source.discoveryProduct || source.product || "Recorded";
    acc[product] = (acc[product] || 0) + 1;
    return acc;
  }, {});

  return `
    <div class="toolbar-row">
      <div>
        <h2>Evidence Ledger Hub</h2>
        <p class="page-description">Central source ledger across all Shadow AI reviews.</p>
      </div>
      <button class="button primary" type="button" data-action="run-batch">Refresh queue evidence</button>
    </div>
    <div class="module-grid">
      ${Object.entries(productCounts)
        .map(
          ([product, count]) => `
            <article class="module-card">
              <p class="metric-label">${product}</p>
              <div class="metric-value">${count}</div>
              <p>Evidence records attached through this Bright Data path.</p>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="source-list" style="margin-top: 14px">
      ${sources
        .map(
          (source) => `
            <article class="source-card">
              <header>
                <div>
                  <h3>${safeText(source.vendorName)}: ${safeText(sourceDisplayTitle(source))}</h3>
                  <div class="source-meta">
                <span>${safeText(source.sourceType)}</span>
                <span>${safeText(source.fetchedAt)}</span>
                <span>${safeText(provenanceLabel(source))}</span>
                <span>${safeText(PIPELINE_STAGE_LABELS[source.pipelineStage] || source.pipelineStage || "Evidence")}</span>
                <span>${safeText(sourceDisplayUrl(source))}</span>
                  </div>
                </div>
                <div class="source-card-badges">
                  ${pill(source.retrievalProduct || source.discoveryProduct || source.product || "Recorded", "blue")}
                  ${provenancePill(source)}
                </div>
              </header>
              <p>${safeText(
                (isFinalSupportingEvidence(source) ? findingExcerpt(source)
                  : (typeof source.claim === "string" && source.claim.trim() !== "{}" ? source.claim.trim() : ""))
                || "Source retrieved; detailed finding requires manual review."
              )}</p>
              <div class="source-meta">
                <span>Confidence ${source.confidence}%</span>
                <span>Policy: ${safeText(source.clause)}</span>
                <span>ID: ${safeText(source.evidenceId || source.evidenceHash || "pending")}</span>
                <span>SHA-256: ${safeText(abbreviatedHash(source.snapshotSha256))}</span>
                ${pill(source.status, riskColor(source.status))}
              </div>
              <div class="drawer-actions">
                <button class="button secondary source-detail-button" type="button" data-source-vendor="${source.vendorId}" data-source-id="${source.id}">${sourceActionLabel(source)}</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderReportsHub() {
  return `
    <div class="toolbar-row">
      <div>
        <h2>AI Vendor Passports</h2>
        <p class="page-description">Exportable approval memos ranked by risk and evidence quality.</p>
      </div>
      <button class="button secondary" type="button" data-action="export-all">Export queue summary</button>
    </div>
    <div class="module-grid" style="margin-bottom: 14px">
      ${trendSignals
        .map(
          ([term, growth, note]) => `
            <article class="module-card">
              <p class="metric-label">${term}</p>
              <div class="metric-value">${growth}</div>
              <p>${note}</p>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="source-list">
      ${[...vendors]
        .sort((a, b) => b.riskScore - a.riskScore)
        .map(
          (vendor) => `
            <article class="report-card">
              <header>
                <div>
                  <h3>${vendor.name} approval memo</h3>
                  <div class="report-meta">
                    <span>${vendor.domain}</span>
                    <span>${vendor.policyProfile}</span>
                    <span>${(evidenceByVendor[vendor.id] || []).length} evidence records</span>
                  </div>
                </div>
                ${pill(vendor.decision, decisionColor(vendor.decision))}
              </header>
              <p>${vendor.topFindings[0]}</p>
              <div class="header-actions">
                <button class="button secondary" type="button" data-open-review="${vendor.id}">Open review</button>
                <button class="button primary" type="button" data-export-id="${vendor.id}">Export memo</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderPoliciesHub() {
  return `
    <div class="toolbar-row">
      <div>
        <h2>Policy profiles</h2>
        <p class="page-description">Control sets used by the Policy Gate to produce approve, escalate, or block decisions.</p>
      </div>
      ${pill("Framework mapped", "blue")}
    </div>
    <div class="module-grid two">
      ${policyProfiles
        .map(
          (profile) => `
            <article class="policy-row">
              <header>
                <div>
                  <h3>${profile.name}</h3>
                  <div class="source-meta">
                    <span>${profile.controls} controls</span>
                    <span>${profile.framework}</span>
                  </div>
                </div>
                ${pill("Active", "green")}
              </header>
              <p>${profile.threshold}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function browserApiUiStatus() {
  const browser = appSettings.lastReviewMeta?.browserFallback;
  if (browser?.successes > 0) return "Used for this finding";
  if (browser?.enabled) return "Ready but unused";
  return "Disabled";
}

function productUiStatus(product, status) {
  return product === "Browser API" ? browserApiUiStatus() : status;
}

function renderSettingsHub() {
  return `
    <div class="module-grid two">
      <section class="module-card">
        <h2>Bright Data readiness</h2>
        <div class="source-list" style="margin-top: 12px">
          ${Object.entries(appSettings.brightDataProducts)
            .map(
              ([product, status]) => `
                <article class="setting-row">
                  <header>
                    <h3>${product}</h3>
                    ${pill(productUiStatus(product, status), productUiStatus(product, status) === "Used for this finding" ? "green" : productUiStatus(product, status) === "Ready but unused" ? "amber" : status === "Ready" ? "green" : "gray")}
                  </header>
                  <p>${product === "SERP API" ? "Used for source discovery and public risk signals." : product === "Web Unlocker" ? "Default retrieval path for privacy, trust, subprocessor, and security pages." : product === "Browser API" ? "Selective managed-browser escalation for unusable JS-heavy or app-shell evidence pages. Disabled unless server-side zone credentials are configured." : "Planned structured enrichment path."}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
      <section class="module-card">
        <h2>Demo controls</h2>
        <p>The judge workspace is deterministic. Use live verification on a vendor to replace seeded records with server-side public evidence.</p>
        <div class="query-chip-grid">
          ${pill("SEEDED WORKSPACE", "blue")}
          ${pill(appSettings.cacheReplay ? "CACHED REPLAY" : "CACHE DISABLED", appSettings.cacheReplay ? "green" : "gray")}
        </div>
        <div class="drawer-actions">
          <button class="button secondary" type="button" data-action="reset-demo">Reset demo data</button>
        </div>
      </section>
      <section class="module-card">
        <h2>Server adapter</h2>
        <p>The review workflow calls ${appSettings.reviewApiEndpoint || "/api/review"} when served over HTTP. Seeded workspace records remain clearly labeled until a server-side live request succeeds.</p>
        <div class="query-chip-grid">
          ${pill(backendReviewEnabled() ? "HTTP app" : "Static file", backendReviewEnabled() ? "green" : "amber")}
          ${pill(settingsModeLabel(), reviewModeColor())}
        </div>
        <p class="metric-note">${appSettings.reviewApiMode}</p>
        ${appSettings.lastFallbackReason ? `<p class="metric-note">Last fallback: ${safeText(appSettings.lastFallbackReason)}</p>` : ""}
      </section>
      <section class="module-card">
        <h2>Cost guardrails</h2>
        <p>Live reviews estimate Bright Data request count before execution and reuse cached server evidence within the review TTL.</p>
        <div class="query-chip-grid">
          ${pill(`Review budget ${formatUsd(appSettings.maxReviewCostUsd)}`, "green")}
          ${pill(`Browser fallback ${formatUsd(appSettings.browserFallbackBudgetUsd)}`, "amber")}
          ${pill(`Browser max ${appSettings.lastReviewMeta?.browserFallback?.maxPerReview ?? 1}/review`, "amber")}
          ${pill(`${appSettings.cacheTtlMinutes}m cache TTL`, "blue")}
        </div>
        <p class="metric-note">Last review ${appSettings.lastReviewMeta?.durationMs ? `${appSettings.lastReviewMeta.durationMs}ms` : "not measured"} · ${appSettings.lastReviewMeta?.cacheHit ? "cache reused" : "fresh or local run"} · Browser fallback attempts ${appSettings.lastReviewMeta?.browserFallback?.attempts || 0}.</p>
      </section>
      <section class="module-card">
        <h2>Workflow output</h2>
        <p>Escalation packages are delivered to Slack only after a configured webhook succeeds. Otherwise the reviewer receives a downloadable draft.</p>
        <div class="query-chip-grid">
          ${pill(appSettings.lastWorkflowMode === "workflow-sent" ? "Sent to Slack" : appSettings.lastWorkflowMode === "workflow-failed" ? "Delivery failed" : "Draft-only fallback", appSettings.lastWorkflowMode === "workflow-sent" ? "green" : appSettings.lastWorkflowMode === "workflow-failed" ? "red" : "blue")}
        </div>
        <p class="metric-note">Endpoint: ${safeText(appSettings.workflowApiEndpoint || "/api/escalate")}${appSettings.lastWorkflowId ? ` · Last package ${safeText(appSettings.lastWorkflowId)}` : ""}</p>
      </section>
      <section class="module-card">
        <h2>AI/ML API intelligence</h2>
        <p>Optional grounded claim extraction and memo drafting. AI output is cited and non-authoritative; deterministic rules still calculate the decision.</p>
        ${(() => {
          const aimlFindings = appSettings.lastReviewMeta?.aimlApi?.extractedFindings;
          const aimlConfigured = appSettings.lastReviewMeta?.aimlApi?.enabled || appSettings.backendStatus?.aimlApiConfigured;
          const aimlLabel = aimlFindings ? "Active" : aimlConfigured ? "Configured" : "Disabled";
          const aimlColor = aimlLabel === "Active" ? "green" : aimlLabel === "Configured" ? "amber" : "gray";
          const aimlNote = aimlFindings
            ? `${aimlFindings} grounded findings`
            : aimlConfigured
            ? "Awaiting grounded findings"
            : "No API key configured";
          const aimlNoteColor = aimlFindings ? "green" : aimlConfigured ? "amber" : "gray";
          return `<div class="query-chip-grid">${pill(aimlLabel, aimlColor)}${pill(aimlNote, aimlNoteColor)}</div>`;
        })()}
      </section>
      <section class="module-card">
        <h2>Bright Data query playbook</h2>
        <p>These query families drive source discovery before policy mapping.</p>
        <div class="query-plan" style="margin-top: 12px">
          ${sourcePlaybook
            .map(
              ([label, query]) => `
                <div class="query-row">
                  ${pill(label, "blue")}
                  <code>${query}</code>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderReviewsHub() {
  const buckets = [
    [BLOCK_DECISION, vendors.filter((vendor) => vendor.decision === BLOCK_DECISION)],
    ["Escalate", vendors.filter((vendor) => vendor.decision === "Escalate")],
    [CONDITIONAL_DECISION, vendors.filter((vendor) => vendor.decision === CONDITIONAL_DECISION)],
    ["Approve", vendors.filter((vendor) => vendor.decision === "Approve")],
  ];

  return `
    <div class="toolbar-row">
      <div>
        <h2>Review board</h2>
        <p class="page-description">Operational view of approval decisions across the Shadow AI queue.</p>
      </div>
      <button class="button primary" type="button" data-action="run-batch">Run policy triage</button>
    </div>
    <div class="module-grid">
      ${buckets
        .map(
          ([bucket, bucketVendors]) => `
            <section class="module-card">
              <h3>${bucket}</h3>
              <p>${bucketVendors.length} tools</p>
              <div class="source-list" style="margin-top: 12px">
                ${bucketVendors
                  .map(
                    (vendor) => `
                      <article class="source-card">
                        <header>
                          <div>
                            <h3>${vendor.name}</h3>
                            <div class="source-meta"><span>${vendor.dataExposure}</span><span>Risk ${vendor.riskScore}</span></div>
                          </div>
                          ${pill(vendor.riskLevel, riskColor(vendor.riskLevel))}
                        </header>
                        <button class="button secondary" type="button" data-open-review="${vendor.id}">Open review</button>
                      </article>
                    `,
                  )
                  .join("") || "<p>No tools in this lane.</p>"}
              </div>
            </section>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderModule(moduleName) {
  activeModule = moduleName;
  updateConnectionMode();
  const titles = {
    reviews: ["Review Board", "Track approval state across the Shadow AI queue."],
    evidence: ["Evidence Ledger", "Centralized Bright Data source ledger for every AI tool review."],
    policies: ["Policy Gate Profiles", "Framework-mapped controls for Shadow AI governance decisions."],
    reports: ["AI Vendor Passports", "Approval memos ready for security, GRC, procurement, and audit workflows."],
    settings: ["Tool Settings", "Demo reliability, Bright Data readiness, and reset controls."],
  };
  const [title, copy] = titles[moduleName] || titles.reviews;
  showView("moduleView");
  setActiveNav(moduleName);
  qs("#moduleHeader").innerHTML = `
    <div>
      <p class="eyebrow">ClearGate AI</p>
      <h1 id="moduleTitle">${title}</h1>
      <p class="page-description">${copy}</p>
    </div>
    <div class="header-actions">
      <button class="button secondary" type="button" data-action="go-inbox">Back to inbox</button>
      <button class="button primary" type="button" data-action="run-batch">Run queue review</button>
    </div>
  `;
  const renderers = {
    reviews: renderReviewsHub,
    evidence: renderEvidenceHub,
    policies: renderPoliciesHub,
    reports: renderReportsHub,
    settings: renderSettingsHub,
  };
  qs("#moduleContent").innerHTML = (renderers[moduleName] || renderReviewsHub)();
  bindModuleActions();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindModuleActions() {
  qsa("[data-open-review]").forEach((button) => {
    button.addEventListener("click", () => openReview(button.dataset.openReview));
  });
  qsa("[data-export-id]").forEach((button) => {
    button.addEventListener("click", () => exportMemo(vendorById(button.dataset.exportId)));
  });
  qsa("[data-action='go-inbox']").forEach((button) => button.addEventListener("click", goInbox));
  qsa("[data-action='run-batch']").forEach((button) => button.addEventListener("click", runQueueReview));
  qsa("[data-action='export-all']").forEach((button) => button.addEventListener("click", exportQueueSummary));
  qsa("[data-action='reset-demo']").forEach((button) => button.addEventListener("click", resetDemoData));
  bindSourceDetailButtons();
}

function bindSourceDetailButtons() {
  qsa(".source-detail-button").forEach((button) => {
    button.addEventListener("click", () => openSourceDetail(button.dataset.sourceVendor, button.dataset.sourceId));
  });
}

function openSourceDetail(vendorId, sourceId) {
  const vendor = vendorById(vendorId);
  const source = sourceById(vendorId, sourceId);
  if (!source) return;
  const signals = Array.isArray(source.extractedSignals) ? source.extractedSignals : [];
  const signalHtml = signals.length
    ? signals.map((signal) => `<span>${safeText(signal)}</span>`).join("")
    : "<span>No explicit signals detected</span>";
  const readablePreview = source.readablePreview || "";
  const rawPreview = source.rawPreview || "";
  const productUsed = source.retrievalProduct || source.discoveryProduct || source.product || "Recorded";
  const sourceTitle = sourceDisplayTitle(source);
  const sourceUrl = sourceDisplayUrl(source);
  const excerpt = findingExcerpt(source);
  const fullHash = source.snapshotSha256 || "pending";
  const previewHash = source.snapshotPreviewSha256 || "pending";
  const previewSections = `
      <section class="detail-card full">
        <h3>Evidence excerpt</h3>
        <p>${safeText(excerpt || "No supporting excerpt was returned for this source.")}</p>
      </section>
      <section class="detail-card full">
        <h3>Readable preview</h3>
        <p>${safeText(readablePreview || "No cleaned preview was returned for this source.")}</p>
      </section>
      ${rawPreview ? `
        <section class="detail-card full">
          <h3>Raw Bright Data preview</h3>
          <pre class="raw-preview">${safeText(rawPreview)}</pre>
        </section>
      ` : ""}
  `;
  qs("#detailEyebrow").textContent = isFinalSupportingEvidence(source) ? "Evidence finding" : "Evidence activity";
  qs("#detailTitle").textContent = sourceTitle;
  qs("#detailDrawerContent").innerHTML = `
    <div class="detail-grid">
      <section class="detail-card">
        <h3>Vendor</h3>
        <p>${safeText(vendor.name)} · ${safeText(vendor.domain)}</p>
      </section>
      <section class="detail-card">
        <h3>Bright Data product</h3>
        <p>${safeText(productUsed)}</p>
      </section>
      <section class="detail-card">
        <h3>Origin</h3>
        <p>${provenanceLabel(source)}</p>
      </section>
      <section class="detail-card">
        <h3>Source type</h3>
        <p>${safeText(source.sourceType)}</p>
      </section>
      <section class="detail-card">
        <h3>Fetched timestamp</h3>
        <p>${safeText(source.fetchedAt || "Not fetched")}</p>
      </section>
      <section class="detail-card">
        <h3>Pipeline stage</h3>
        <p>${PIPELINE_STAGE_LABELS[source.pipelineStage] || source.pipelineStage || "Evidence"}</p>
      </section>
      <section class="detail-card">
        <h3>Evidence ID</h3>
        <p>${safeText(source.evidenceId || source.evidenceHash || "pending")}</p>
      </section>
      <section class="detail-card">
        <h3>Memo inclusion</h3>
        <p>${isFinalSupportingEvidence(source) ? "Included as supporting evidence" : "Not included in memo"}</p>
      </section>
      <section class="detail-card">
        <h3>Retrieval status</h3>
        <p>${safeText(source.retrievalStatus || source.status || "recorded")}</p>
      </section>
      <section class="detail-card">
        <h3>Manual inspection</h3>
        <p>${source.aiExtraction?.requiresHumanReview || source.needsManualInspection ? "Recommended" : "Not flagged"}</p>
      </section>
      <section class="detail-card">
        <h3>Finding method</h3>
        <p>${safeText(findingMethodLabel(source))}</p>
      </section>
      ${source.fallbackReason ? `
        <section class="detail-card full">
          <h3>Fallback reason</h3>
          <p>${safeText(source.fallbackReason)}</p>
        </section>
      ` : ""}
      <section class="detail-card full">
        <h3>Official source URL</h3>
        <code>${safeText(sourceUrl || "No official URL attached")}</code>
      </section>
      <section class="detail-card full">
        <h3>Extracted finding</h3>
        <p>${safeText(supportedFinding(source))}</p>
      </section>
      <section class="detail-card full">
        <h3>Grounded source excerpt</h3>
        <p>${safeText(source.aiExtraction?.supportingQuote || excerpt || "No grounded excerpt was returned.")}</p>
      </section>
      <section class="detail-card full">
        <h3>Extraction signals</h3>
        <div class="signal-list">${signalHtml}</div>
      </section>
      ${previewSections}
      <section class="detail-card">
        <h3>Mapped policy clause</h3>
        <p>${safeText(source.clause)}</p>
      </section>
      <section class="detail-card">
        <h3>Confidence</h3>
        <p>${Number(source.aiExtraction?.confidence ?? source.confidence ?? 0)}%</p>
      </section>
      <section class="detail-card full">
        <h3>Snapshot SHA-256</h3>
        <code>${safeText(fullHash)}</code>
      </section>
      <section class="detail-card full">
        <h3>Excerpt SHA-256</h3>
        <code>${safeText(previewHash)}</code>
      </section>
    </div>
  `;
  openDetailDrawer();
}

function openDetailDrawer() {
  qs("#detailDrawer").classList.add("open");
  qs("#detailDrawer").setAttribute("aria-hidden", "false");
}

function closeDetailDrawer() {
  qs("#detailDrawer").classList.remove("open");
  qs("#detailDrawer").setAttribute("aria-hidden", "true");
}

function renderPolicy(vendor) {
  const findings = vendor.policyFindings || controlsFor(vendor).map(([group, state, copy]) => ({ group, state, copy, evidenceCount: 0 }));
  qs("#policyTab").innerHTML = `
    <div class="control-grid">
      ${findings
        .map(
          ({ group, state, copy, evidenceCount }) => `
            <article class="control-card">
              <header>
                <h3>${group}</h3>
                ${pill(state, riskColor(state))}
              </header>
              <p>${copy}</p>
              <div class="source-meta" style="margin-top: 10px">
                <span>${evidenceCount} mapped evidence records</span>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderMemo(vendor) {
  const hashId = `CG-${vendor.id.toUpperCase()}-${vendor.riskScore}${vendor.freshnessScore}${vendor.gapIndex}`;
  const missing = missingEvidenceTypes(vendor);
  const memoEvidence = (evidenceByVendor[vendor.id] || []).filter(isFinalSupportingEvidence);
  const bandRoom = bandRoomsByVendor[vendor.id];
  qs("#memoTab").innerHTML = `
    <article class="memo-document">
      <div class="memo-header">
        <div>
          <p class="eyebrow">AI Vendor Passport</p>
          <h2>${vendor.name} approval memo</h2>
          <p class="review-meta">Generated for Acme Security Review. Evidence hash chain: ${hashId}</p>
        </div>
        ${pill(vendor.decision, decisionColor(vendor.decision))}
      </div>
      <div class="memo-grid">
        <section class="memo-section">
          <h3>Vendor summary</h3>
          <p>${vendor.name} is categorized as ${vendor.category}. It was detected through ${vendor.detectedFrom.toLowerCase()} with ${vendor.users} active users.</p>
        </section>
        <section class="memo-section">
          <h3>Data exposure</h3>
          <p>Primary exposure is ${vendor.dataExposure.toLowerCase()}. Current policy profile is ${vendor.policyProfile}.</p>
        </section>
        <section class="memo-section full">
          <h3>Decision rationale</h3>
          <p>${vendor.topFindings.join(" ")}</p>
        </section>
        ${vendor.memoDraft ? `
          <section class="memo-section full">
            <h3>AI/ML API grounded draft</h3>
            <p>${safeText(vendor.memoDraft.executiveSummary || "No executive summary returned.")}</p>
            <p class="metric-note">Non-authoritative memo language. The policy outcome above remains deterministic.</p>
          </section>
        ` : ""}
        <section class="memo-section">
          <h3>Required conditions</h3>
          <p>${vendor.requiredConditions.join(" ")}</p>
        </section>
        <section class="memo-section">
          <h3>Evidence status</h3>
          <p>Freshness score is ${vendor.freshnessScore}%. Evidence gap index is ${vendor.gapIndex}%. ${memoEvidence.length} evidence records are included. Missing evidence: ${missing.length ? missing.join(", ") : "none"}.</p>
          <p>Evidence provenance: ${memoEvidence.length ? [...new Set(memoEvidence.map(provenanceLabel))].join(", ") : "none"}.</p>
        </section>
        <section class="memo-section full">
          <h3>Policy findings</h3>
          <p>${(vendor.policyFindings || []).map((finding) => `${finding.group}: ${finding.state}`).join(" · ") || "Policy findings will populate after review."}</p>
        </section>
        <section class="memo-section full">
          <h3>Band collaboration proof</h3>
          <p>${safeText(bandRoomLines(bandRoom).join(" "))}</p>
        </section>
        <section class="memo-section full">
          <h3>Included evidence</h3>
          <div class="memo-evidence-list">
            ${memoEvidence.length
              ? memoEvidence
                .map(
                  (source) => `
                    <article>
                      <strong>${safeText(source.sourceType)}</strong>
                      <p>${safeText(sourceDisplayUrl(source))}</p>
                      <p>${safeText(source.fetchedAt)} · ${safeText(provenanceLabel(source))} · ${safeText(abbreviatedHash(source.snapshotSha256))}</p>
                      <p>${safeText(findingMethodLabel(source))}: ${safeText(supportedFinding(source))}</p>
                      <p>${safeText(source.aiExtraction?.supportingQuote || findingExcerpt(source))}</p>
                    </article>
                  `,
                )
                .join("")
              : "<p>No final supporting evidence is currently included.</p>"}
          </div>
        </section>
        <section class="memo-section full">
          <h3>Reviewer notes</h3>
          <p>${safeText(vendor.reviewerNotes || "No reviewer notes added yet.")}</p>
        </section>
      </div>
    </article>
  `;
}

function renderRoi(vendor) {
  qs("#roiTab").innerHTML = `
    <div class="roi-grid">
      <section class="roi-inputs">
        <h2>ROI assumptions</h2>
        <label class="field">Reviews per month <input id="roiReviews" type="number" min="1" value="38" /></label>
        <label class="field">Manual hours per review <input id="roiHours" type="number" min="1" value="4" /></label>
        <label class="field">Reviewer hourly cost <input id="roiCost" type="number" min="1" value="95" /></label>
        <label class="field">Auto-triage rate (%) <input id="roiRate" type="number" min="1" max="100" value="62" /></label>
      </section>
      <section class="roi-output">
        <h2>Market value estimate</h2>
        <p class="page-description">Values are calculated from visible assumptions for the demo, not universal claims.</p>
        <div id="roiMetrics" class="roi-metrics"></div>
      </section>
    </div>
  `;
  qsa("#roiTab input").forEach((input) => input.addEventListener("input", updateRoi));
  updateRoi();
}

function updateRoi() {
  const reviews = Number(qs("#roiReviews")?.value || 0);
  const hours = Number(qs("#roiHours")?.value || 0);
  const cost = Number(qs("#roiCost")?.value || 0);
  const rate = Number(qs("#roiRate")?.value || 0) / 100;
  const hoursSaved = Math.round(reviews * hours * rate);
  const costAvoided = Math.round(hoursSaved * cost);
  const backlogReduction = Math.round(reviews * rate);
  const auditPrep = Math.round(hoursSaved * 0.22);
  const metrics = [
    ["Hours saved", hoursSaved],
    ["Cost avoided", `$${costAvoided.toLocaleString()}`],
    ["Reviews auto-triaged", backlogReduction],
    ["Audit-prep hours saved", auditPrep],
  ];

  const target = qs("#roiMetrics");
  if (!target) return;
  target.innerHTML = metrics
    .map(
      ([label, value]) => `
        <article class="kpi-card">
          <p class="metric-label">${label}</p>
          <div class="metric-value">${value}</div>
        </article>
      `,
    )
    .join("");
}

function evidenceReviewSummary(vendor) {
  const required = requiredEvidenceTypes(vendor);
  const finalEvidence = (evidenceByVendor[vendor.id] || []).filter(isFinalSupportingEvidence);
  const complete = required.filter((type) => finalEvidence.some((source) => source.sourceType === type));
  const missing = required.filter((type) => !complete.includes(type));
  const detectedSignals = [
    ...new Set(finalEvidence.flatMap((source) => (Array.isArray(source.extractedSignals) ? source.extractedSignals : []))),
  ].slice(0, 8);
  return {
    complete,
    missing,
    detectedSignals,
    finalEvidenceCount: finalEvidence.length,
  };
}

function decisionExplanation(vendor) {
  const summary = evidenceReviewSummary(vendor);
  const exposure = vendor.dataExposure || "tool data";
  const evidenceNeed = requiredEvidenceTypes(vendor).join(", ");
  const missingText = summary.missing.length ? `${summary.missing.join(", ")} evidence is missing.` : "Required evidence is complete.";
  const signalText = summary.detectedSignals.length ? `Detected signals: ${summary.detectedSignals.join(", ")}.` : "No strong policy signals have been detected yet.";

  if (vendor.decision === BLOCK_DECISION) {
    return `${BLOCK_DECISION}: ${exposure} exposure requires ${evidenceNeed}. ${missingText}`;
  }
  if (vendor.decision === "Escalate") {
    return `Escalate: ${exposure} exposure and policy gaps require security, privacy, or procurement review. ${missingText} ${signalText}`;
  }
  if (vendor.decision === CONDITIONAL_DECISION) {
    return `${CONDITIONAL_DECISION}: evidence is sufficient for limited use, but conditions remain. ${missingText} ${signalText}`;
  }
  return `Approve: required evidence is present and mapped to the current policy profile. ${signalText}`;
}

function bandAgentState(agent, vendor, missing, summary) {
  if (agent.id === "discovery") return summary.finalEvidenceCount ? "Pass" : "Needs Review";
  if (agent.id === "security") {
    return vendor.policyProfile === "AI Agent With Tool Access" || missing.includes("Trust Center") || missing.includes("Documentation")
      ? "Needs Review"
      : "Pass";
  }
  if (agent.id === "privacy-legal") {
    if (vendor.policyProfile === "High Risk Regulated Vendor" && (missing.includes("Privacy Policy") || missing.includes("Subprocessors"))) return "Fail";
    return exposureWeight(vendor.dataExposure || "") >= 24 ? "Needs Review" : "Pass";
  }
  if (agent.id === "finance-procurement") return vendor.decision === "Approve" ? "Pass" : "Needs Review";
  if (agent.id === "compliance") return missing.length ? "Needs Review" : "Pass";
  if (agent.id === "policy-gate") return vendor.decision === BLOCK_DECISION ? "Fail" : vendor.decision === "Approve" ? "Pass" : "Needs Review";
  return "Needs Review";
}

function bandAgentFinding(agent, vendor, missing, summary) {
  const exposure = String(vendor.dataExposure || "AI tool data").toLowerCase();
  if (agent.id === "discovery") {
    return `${vendor.name} entered review from ${vendor.detectedFrom.toLowerCase()} with ${vendor.users} users, ${vendor.department} ownership, and ${missing.length} remaining evidence gap${missing.length === 1 ? "" : "s"}.`;
  }
  if (agent.id === "security") {
    return vendor.policyProfile === "AI Agent With Tool Access"
      ? `Security review is required because ${vendor.name} can touch ${exposure} and agentic or repository access boundaries need approval.`
      : `${vendor.name} has ${summary.finalEvidenceCount} memo-ready evidence record${summary.finalEvidenceCount === 1 ? "" : "s"} for security review; remaining trust gaps are ${missing.includes("Trust Center") ? "material" : "not blocking"}.`;
  }
  if (agent.id === "privacy-legal") {
    return exposureWeight(vendor.dataExposure || "") >= 24
      ? `Privacy and legal review must confirm retention, training use, subprocessors, consent, and DPA coverage before ${exposure} is approved.`
      : `Privacy and legal risk is bounded to ${exposure}; attach missing policy evidence before broad use.`;
  }
  if (agent.id === "finance-procurement") {
    return `${vendor.department} usage and ${vendor.users} detected users should be tied to a business owner, contract path, and renewal-control decision before procurement closes the request.`;
  }
  if (agent.id === "compliance") {
    return missing.length
      ? `Compliance cannot mark the packet complete until ${missing.join(", ")} evidence is attached or explicitly waived by a reviewer.`
      : `Compliance evidence is complete enough to generate an audit-ready AI Vendor Passport memo.`;
  }
  return `Policy Gate recommends ${vendor.decision} because risk score ${vendor.riskScore}, freshness ${vendor.freshnessScore}%, and evidence gap ${vendor.gapIndex}% produce the current control outcome.`;
}

function bandAgentSignals(agent, vendor, missing, summary) {
  const base = [vendor.policyProfile, vendor.dataExposure, `${vendor.users} users`];
  if (agent.id === "discovery") return [vendor.detectedFrom, `${missing.length} open gaps`, `${summary.finalEvidenceCount} memo records`];
  if (agent.id === "security") return base.concat([vendor.riskLevel, missing.includes("Trust Center") ? "trust evidence gap" : "trust evidence present"]);
  if (agent.id === "privacy-legal") return base.concat([missing.includes("Subprocessors") ? "subprocessor gap" : "subprocessor reviewed"]);
  if (agent.id === "finance-procurement") return [vendor.department, `${vendor.reviewHours} review hours`, vendor.decision];
  if (agent.id === "compliance") return [vendor.policyProfile, missing.length ? "control evidence incomplete" : "control evidence complete"];
  return [vendor.decision, `risk ${vendor.riskScore}`, `gap ${vendor.gapIndex}%`];
}

function buildBandRoom(vendor, overrides = {}) {
  const missing = missingEvidenceTypes(vendor);
  const summary = evidenceReviewSummary(vendor);
  const recommendation = normalizeDecision(vendor.decision);
  const status = overrides.status || "Prepared";
  const roomId = `BAND-CG-${vendor.id.toUpperCase()}`;
  const agents = BAND_AGENTS.map((agent, index) => {
    const state = bandAgentState(agent, vendor, missing, summary);
    return {
      ...agent,
      state,
      confidence: clamp(94 - missing.length * 4 - index * 2 + (vendor.freshnessScore > 80 ? 3 : 0), 62, 96),
      finding: bandAgentFinding(agent, vendor, missing, summary),
      signals: bandAgentSignals(agent, vendor, missing, summary),
    };
  });
  const highRiskOwner = vendor.policyProfile === "High Risk Regulated Vendor" ? "Privacy & Legal Agent" : "Security Agent";
  const events = [
    {
      id: "intake",
      time: "00:00",
      agent: "Discovery Agent",
      type: "Intake",
      title: "Shadow AI intake packet opened",
      summary: `${vendor.name} was detected from ${vendor.detectedFrom.toLowerCase()} with ${vendor.users} users and ${vendor.dataExposure.toLowerCase()} exposure.`,
      handoff: "Security Agent",
    },
    {
      id: "evidence",
      time: "00:18",
      agent: "Discovery Agent",
      type: "Evidence",
      title: "Evidence requirements mapped",
      summary: missing.length ? `Open requirements: ${missing.join(", ")}.` : "Required public evidence is already attached.",
      handoff: highRiskOwner,
    },
    {
      id: "security",
      time: "00:34",
      agent: "Security Agent",
      type: "Control",
      title: "Security posture review",
      summary: agents.find((agent) => agent.id === "security").finding,
      handoff: "Privacy & Legal Agent",
    },
    {
      id: "privacy",
      time: "00:49",
      agent: "Privacy & Legal Agent",
      type: "Control",
      title: "Privacy and legal review",
      summary: agents.find((agent) => agent.id === "privacy-legal").finding,
      handoff: "Finance & Procurement Agent",
    },
    {
      id: "procurement",
      time: "01:07",
      agent: "Finance & Procurement Agent",
      type: "Commercial",
      title: "Business-owner and contract path checked",
      summary: agents.find((agent) => agent.id === "finance-procurement").finding,
      handoff: "Compliance Agent",
    },
    {
      id: "compliance",
      time: "01:22",
      agent: "Compliance Agent",
      type: "Audit",
      title: "Audit packet requirements checked",
      summary: agents.find((agent) => agent.id === "compliance").finding,
      handoff: "Policy Gate Agent",
    },
    {
      id: "decision",
      time: "01:38",
      agent: "Policy Gate Agent",
      type: "Decision",
      title: `${recommendation} recommendation prepared`,
      summary: decisionExplanation(vendor),
      handoff: "Human reviewer",
    },
  ];
  const packetSeed = `${roomId}:${vendor.name}:${recommendation}:${vendor.riskScore}:${vendor.freshnessScore}:${vendor.gapIndex}`;
  return {
    id: roomId,
    vendorId: vendor.id,
    status,
    startedAt: overrides.startedAt || "",
    completedAt: overrides.completedAt || "",
    agents,
    events,
    sharedContext: {
      vendor: vendor.name,
      department: vendor.department,
      dataExposure: vendor.dataExposure,
      policyProfile: vendor.policyProfile,
      openEvidenceGaps: missing,
      memoReadyEvidence: summary.finalEvidenceCount,
      detectedSignals: summary.detectedSignals,
    },
    decisionPacket: {
      recommendation,
      explanation: decisionExplanation(vendor),
      requiredConditions: vendor.requiredConditions || [],
      evidenceComplete: summary.complete,
      evidenceMissing: summary.missing,
      auditHash: `BAND-${sha256(packetSeed).slice(0, 12).toUpperCase()}`,
    },
    humanAction: overrides.humanAction || null,
  };
}

function ensureBandRoom(vendor) {
  const room = bandRoomsByVendor[vendor.id];
  if (room && Array.isArray(room.agents) && Array.isArray(room.events) && room.decisionPacket) return room;
  const preparedRoom = buildBandRoom(vendor);
  bandRoomsByVendor[vendor.id] = preparedRoom;
  return preparedRoom;
}

function bandEvidenceRecords(vendor, room) {
  return room.agents.map((agent) =>
    normalizeEvidenceRecord(vendor, {
      id: `${vendor.id}-band-${agent.id}`,
      title: `${agent.name} finding`,
      url: `band://cleargate-ai/agent-room/${vendor.id}/${agent.id}`,
      sourceType: "Band Agent Finding",
      product: "Band Agent Room",
      retrievalProduct: "Band Agent Room",
      fetchedAt: "just now",
      claim: agent.finding,
      confidence: agent.confidence,
      clause: agent.clause,
      freshness: "Seeded Demo Data",
      status: agent.state,
      provenance: "seeded_demo_data",
      extractedSignals: agent.signals,
      snapshotContent: `${room.id} ${agent.name} ${agent.owner} ${agent.finding} ${room.decisionPacket.recommendation}`,
    }, "mapping"),
  );
}

function bandRoomLines(room) {
  if (!room) return ["No Band Agent Room review has been started for this vendor."];
  return [
    `Room ID: ${room.id}`,
    `Status: ${room.status}`,
    `Recommendation: ${room.decisionPacket.recommendation}`,
    `Audit hash: ${room.decisionPacket.auditHash}`,
    `Agents: ${room.agents.map((agent) => `${agent.name} (${agent.state})`).join(", ")}`,
    `Handoffs: ${room.events.map((event) => `${event.agent} -> ${event.handoff}`).join(" | ")}`,
    `Decision explanation: ${room.decisionPacket.explanation}`,
  ];
}

function startBandAgentReview(vendorId) {
  const vendor = vendorById(vendorId);
  const now = new Date().toISOString();
  const room = buildBandRoom(vendor, {
    status: "Completed",
    startedAt: now,
    completedAt: now,
    humanAction: bandRoomsByVendor[vendor.id]?.humanAction || null,
  });
  bandRoomsByVendor[vendor.id] = room;
  const additions = addEvidenceRecords(vendor, bandEvidenceRecords(vendor, room));
  vendor.bandRoomId = room.id;
  vendor.bandReviewStatus = room.status;
  vendor.bandRecommendation = room.decisionPacket.recommendation;
  vendor.lastReviewed = "just now";
  if (!vendor.topFindings.some((finding) => finding.includes("Band Agent Room"))) {
    vendor.topFindings = [
      `Band Agent Room completed with ${room.agents.length} agent findings and recommendation ${room.decisionPacket.recommendation}.`,
      ...vendor.topFindings,
    ].slice(0, 4);
  }
  refreshPolicyFindings(vendor);
  activityLog.unshift(["Band Agent Room", `${vendor.name} Band review completed with ${additions.length} memo-ready agent finding${additions.length === 1 ? "" : "s"}.`]);
  activityLog = activityLog.slice(0, 12);
  saveState();
  renderReview();
  setActiveTab("agent");
  showQueueToast("Band agent room completed and attached to the memo.");
}

function applyBandHumanAction(vendorId, action) {
  const vendor = vendorById(vendorId);
  const room = ensureBandRoom(vendor);
  const actionMap = {
    conditions: {
      decision: CONDITIONAL_DECISION,
      label: "Approved with conditions from Band room",
      note: "Human reviewer accepted the Band room recommendation as approve with conditions.",
    },
    escalate: {
      decision: "Escalate",
      label: "Escalated from Band room",
      note: "Human reviewer escalated the Band room packet to security, legal, and procurement owners.",
    },
    block: {
      decision: BLOCK_DECISION,
      label: "Blocked from Band room",
      note: "Human reviewer blocked usage pending privacy, legal, and security approval.",
    },
  };
  const selected = actionMap[action];
  if (!selected) return;
  vendor.decision = selected.decision;
  vendor.manualDecision = true;
  vendor.reviewerNotes = [vendor.reviewerNotes, `${selected.label}: ${selected.note}`].filter(Boolean).join("\n");
  vendor.lastReviewed = "just now";
  bandRoomsByVendor[vendor.id] = {
    ...buildBandRoom(vendor, {
      status: "Human action recorded",
      startedAt: room.startedAt,
      completedAt: room.completedAt || new Date().toISOString(),
      humanAction: {
        action,
        decision: selected.decision,
        label: selected.label,
        recordedAt: new Date().toISOString(),
      },
    }),
  };
  refreshPolicyFindings(vendor);
  activityLog.unshift(["Band Human Action", `${vendor.name}: ${selected.label}.`]);
  activityLog = activityLog.slice(0, 12);
  saveState();
  renderReview();
  setActiveTab("agent");
}

function exportBandRoom(vendor) {
  const room = ensureBandRoom(vendor);
  downloadJson(`${vendor.id}-band-agent-room.json`, {
    product: "ClearGate AI",
    pitch: "ClearGate AI turns unapproved AI tools into audit-ready approval decisions using Band-powered agents for security, legal, finance, procurement, and compliance.",
    vendor: {
      id: vendor.id,
      name: vendor.name,
      domain: vendor.domain,
      decision: vendor.decision,
      policyProfile: vendor.policyProfile,
    },
    room,
  });
}

function renderAgentRoom(vendor) {
  const room = ensureBandRoom(vendor);
  const humanAction = room.humanAction;
  qs("#agentTab").innerHTML = `
    <div class="agent-room">
      <section class="agent-room-hero">
        <div>
          <p class="eyebrow">Band Agent Room</p>
          <h2>Approval decision collaboration</h2>
          <p class="page-description">Band-powered agents coordinate security, legal, finance, procurement, and compliance findings before a human reviewer records the approval action.</p>
        </div>
        <div class="agent-actions">
          <button class="button primary" type="button" data-start-band-review="${safeText(vendor.id)}">Run Band review</button>
          <button class="button secondary" type="button" data-export-band-room="${safeText(vendor.id)}">Export room JSON</button>
        </div>
      </section>

      <div class="agent-summary-grid">
        <article>
          <span>Status</span>
          <strong>${safeText(room.status)}</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>${room.agents.length}</strong>
        </article>
        <article>
          <span>Recommendation</span>
          <strong>${safeText(room.decisionPacket.recommendation)}</strong>
        </article>
        <article>
          <span>Audit hash</span>
          <strong>${safeText(room.decisionPacket.auditHash)}</strong>
        </article>
      </div>

      <div class="agent-board">
        <section class="agent-panel">
          <div class="panel-header compact">
            <div>
              <h2>Agent roster</h2>
              <p>Specialized agents produce findings against the same shared review packet.</p>
            </div>
          </div>
          <div class="agent-roster">
            ${room.agents.map((agent) => `
              <article class="agent-card">
                <header>
                  <div>
                    <h3>${safeText(agent.name)}</h3>
                    <p>${safeText(agent.owner)}</p>
                  </div>
                  ${pill(agent.state, riskColor(agent.state))}
                </header>
                <p>${safeText(agent.charter)}</p>
                <div class="agent-signal-row">
                  ${agent.signals.map((signal) => `<span>${safeText(signal)}</span>`).join("")}
                </div>
                <strong>${safeText(agent.confidence)}% confidence</strong>
              </article>
            `).join("")}
          </div>
        </section>

        <section class="agent-panel">
          <div class="panel-header compact">
            <div>
              <h2>Decision packet</h2>
              <p>Shared context, handoffs, and final recommendation for the human approver.</p>
            </div>
            ${pill(room.decisionPacket.recommendation, decisionColor(room.decisionPacket.recommendation))}
          </div>
          <div class="agent-context-list">
            <div><span>Vendor</span><strong>${safeText(room.sharedContext.vendor)}</strong></div>
            <div><span>Department</span><strong>${safeText(room.sharedContext.department)}</strong></div>
            <div><span>Data exposure</span><strong>${safeText(room.sharedContext.dataExposure)}</strong></div>
            <div><span>Policy profile</span><strong>${safeText(room.sharedContext.policyProfile)}</strong></div>
          </div>
          <div class="note-box">${safeText(room.decisionPacket.explanation)}</div>
          <div class="agent-actions compact-actions">
            <button class="button secondary" type="button" data-band-human-action="conditions">Approve with conditions</button>
            <button class="button secondary" type="button" data-band-human-action="escalate">Escalate</button>
            <button class="button secondary" type="button" data-band-human-action="block">Block pending review</button>
          </div>
          ${humanAction ? `<p class="metric-note">Recorded action: ${safeText(humanAction.label)} at ${safeText(humanAction.recordedAt)}.</p>` : ""}
        </section>
      </div>

      <section class="agent-panel">
        <div class="panel-header compact">
          <div>
            <h2>Collaboration timeline</h2>
            <p>Each handoff stays visible for audit and procurement review.</p>
          </div>
        </div>
        <div class="agent-timeline">
          ${room.events.map((event) => `
            <article class="agent-event">
              <div class="agent-event-time">${safeText(event.time)}</div>
              <div>
                <div class="agent-event-heading">
                  <strong>${safeText(event.title)}</strong>
                  ${pill(event.type, "gray")}
                </div>
                <p>${safeText(event.summary)}</p>
                <span>${safeText(event.agent)} -> ${safeText(event.handoff)}</span>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
  qs("[data-start-band-review]")?.addEventListener("click", () => startBandAgentReview(vendor.id));
  qs("[data-export-band-room]")?.addEventListener("click", () => exportBandRoom(vendor));
  qsa("[data-band-human-action]").forEach((button) => {
    button.addEventListener("click", () => applyBandHumanAction(vendor.id, button.dataset.bandHumanAction));
  });
}

function renderDecisionSidebar(vendor) {
  const summary = evidenceReviewSummary(vendor);
  const completeHtml = summary.complete.length
    ? summary.complete.map((item) => pill(item, "green")).join("")
    : pill("No final evidence complete", "amber");
  const missingHtml = summary.missing.length
    ? summary.missing.map((item) => pill(item, "amber")).join("")
    : pill("No required evidence missing", "green");
  const signalHtml = summary.detectedSignals.length
    ? summary.detectedSignals.map((item) => `<span>${safeText(item)}</span>`).join("")
    : "<span>No extracted signals yet</span>";
  qs("#decisionSidebar").innerHTML = `
    <h2>Approval decision</h2>
    <div class="decision-block">
      <div class="decision-callout">
        <p class="metric-label">Current recommendation</p>
        <strong>${vendor.decision}</strong>
        <p class="metric-note">Risk score ${vendor.riskScore}, evidence freshness ${vendor.freshnessScore}%.</p>
      </div>
      <div class="note-box">
        ${safeText(decisionExplanation(vendor))}
      </div>
      <div>
        <h3>Evidence complete</h3>
        <div class="evidence-pill-row">${completeHtml}</div>
      </div>
      <div>
        <h3>Missing evidence</h3>
        <div class="evidence-pill-row">${missingHtml}</div>
      </div>
      <div>
        <h3>Detected signals</h3>
        <div class="signal-list">${signalHtml}</div>
      </div>
      <div>
        <h3>Blocking or review findings</h3>
        <ul class="finding-list">
          ${vendor.topFindings.slice(0, 3).map((finding) => `<li>${finding}</li>`).join("")}
        </ul>
      </div>
      <div>
        <h3>Required conditions</h3>
        <ul class="conditions-list">
          ${vendor.requiredConditions.slice(0, 3).map((condition) => `<li>${condition}</li>`).join("")}
        </ul>
      </div>
      <form class="decision-form" id="decisionForm">
        <label class="field">Decision override
          <select id="decisionOverride">
            ${DECISIONS
              .map((decision) => `<option value="${decision}" ${decision === vendor.decision ? "selected" : ""}>${decision}</option>`)
              .join("")}
          </select>
        </label>
        <label class="field">Reviewer notes
          <textarea id="reviewerNotes" placeholder="Add security, legal, or procurement notes">${safeText(vendor.reviewerNotes || "")}</textarea>
        </label>
        <div class="note-box">Overrides are saved locally and included in the exported AI Vendor Passport.</div>
        <button class="button secondary" type="submit">Save review action</button>
      </form>
      <div class="decision-actions">
        <button class="button primary" type="button" data-export-memo="${vendor.id}">Export memo</button>
        <button class="button secondary" type="button" data-escalate-vendor="${vendor.id}">Send escalation package</button>
      </div>
    </div>
  `;
  qs("[data-export-memo]").addEventListener("click", () => exportMemo(vendor));
  qs("[data-escalate-vendor]").addEventListener("click", () => escalateVendor(vendor.id));
  qs("#decisionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    applyDecisionAction(vendor.id);
  });
}

function applyDecisionAction(vendorId) {
  const vendor = vendorById(vendorId);
  vendor.decision = normalizeDecision(qs("#decisionOverride").value);
  vendor.manualDecision = true;
  vendor.reviewerNotes = qs("#reviewerNotes").value.trim();
  vendor.lastReviewed = "just now";
  activityLog.unshift(["Decision Override", `${vendor.name} decision set to ${vendor.decision}. Reviewer notes saved.`]);
  activityLog = activityLog.slice(0, 12);
  saveState();
  renderReview();
}

function renderReview() {
  const vendor = vendorById(activeVendorId);
  updateConnectionMode();
  renderReviewHeader(vendor);
  renderOverview(vendor);
  renderAgentRoom(vendor);
  renderEvidence(vendor);
  renderPolicy(vendor);
  renderMemo(vendor);
  renderRoi(vendor);
  renderDecisionSidebar(vendor);
  setActiveTab(activeTab);
}

function openReview(id) {
  activeVendorId = id;
  activeTab = "overview";
  showView("reviewView");
  renderReview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setActiveTab(tab) {
  const panel = qs(`#${tab}Tab`) || qs("#overviewTab");
  activeTab = panel.id.replace(/Tab$/, "");
  qsa(".tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === activeTab));
  qsa(".tab-panel").forEach((panel) => panel.classList.remove("active-tab-panel"));
  panel.classList.add("active-tab-panel");
}

function goInbox() {
  showView("inboxView");
  setActiveNav("inbox");
  renderDashboard();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showView(viewId) {
  ["inboxView", "reviewView", "moduleView"].forEach((id) => {
    qs(`#${id}`).classList.toggle("active-view", id === viewId);
  });
}

function setActiveNav(target) {
  qsa(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.viewTarget === target);
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function updateReviewProgress(steps, progress, index) {
  steps.forEach((step, stepIndex) => {
    step.classList.toggle("complete", stepIndex < index);
    step.classList.toggle("active", stepIndex === index);
  });
  progress.style.width = `${Math.min(100, (index / (reviewSteps.length - 1)) * 100)}%`;
}

async function runLiveReview(vendorId) {
  if (liveReviewInFlight) return;
  liveReviewInFlight = true;
  const vendor = vendorById(vendorId);
  let steps = qsa("#stepList .step");
  let progress = qs("#reviewProgress");
  const { candidates } = collectReviewEvidence(vendor);

  try {
    steps.forEach((step) => {
      step.classList.remove("active", "complete");
    });
    progress.style.width = "0%";

    for (let index = 0; index < reviewSteps.length; index += 1) {
      updateReviewProgress(steps, progress, index);

      if (index === 1 && candidates[0] && unseenEvidence(evidenceByVendor[vendor.id] || [], [candidates[0]]).length) {
        evidenceByVendor[vendor.id].push(candidates[0]);
        renderEvidence(vendor);
        steps = qsa("#stepList .step");
        progress = qs("#reviewProgress");
      }

      if (index === 3) {
        await analyzeVendorWithBackend(vendor.id);
        renderReview();
        steps = qsa("#stepList .step");
        progress = qs("#reviewProgress");
      }

      await delay(650);
    }

    renderReview();
    setActiveTab("evidence");
  } finally {
    liveReviewInFlight = false;
  }
}

const QUEUE_REVIEW_STEPS = [
  "Preparing queue",
  "Checking evidence",
  "Applying policy rules",
  "Updating decisions",
  "Complete",
];

function renderQueueProgressBanner() {
  const el = qs("#queueProgressBanner");
  if (!el) return;
  el.innerHTML = `
    <div class="progress-panel" style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong style="font-size:13px;">Queue review running</strong>
        ${pill("In progress", "amber")}
      </div>
      <div class="progress-track" style="margin:6px 0;">
        <div id="queueProgressFill" class="progress-fill" style="width:0%"></div>
      </div>
      <div class="step-list">
        ${QUEUE_REVIEW_STEPS.map((label, i) => `<div class="step" id="queueStep${i}">${safeText(label)}</div>`).join("")}
      </div>
    </div>
  `;
}

function setQueueStep(stepIndex, mode) {
  for (let i = 0; i < stepIndex; i++) {
    const s = qs(`#queueStep${i}`);
    if (s) { s.classList.remove("active"); s.classList.add("complete"); }
  }
  const step = qs(`#queueStep${stepIndex}`);
  if (step) { step.classList.remove("complete"); step.classList.add(mode); }
  const fill = qs("#queueProgressFill");
  if (fill) {
    const pct = Math.round(((stepIndex + (mode === "complete" ? 1 : 0.5)) / QUEUE_REVIEW_STEPS.length) * 100);
    fill.style.width = `${pct}%`;
  }
}

function clearQueueProgressBanner() {
  const el = qs("#queueProgressBanner");
  if (el) el.innerHTML = "";
}

function showQueueToast(message, color = "green") {
  const el = document.createElement("div");
  el.className = `queue-toast ${safeText(color)}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 420);
  }, 3000);
}

async function runQueueReview() {
  const btn = qs("#runQueueReview");
  const originalLabel = btn ? btn.textContent : "Run queue review";
  const badge = qs("#connectionMode");
  const badgePrevText = badge ? badge.textContent : "";
  const badgePrevClass = badge ? badge.className : "status-badge blue";

  // Immediate feedback (< 100ms)
  if (btn) { btn.disabled = true; btn.textContent = "Reviewing queue…"; }
  qsa("[data-action='run-batch']").forEach((b) => { b.disabled = true; });
  if (badge) { badge.textContent = "Review in progress"; badge.className = "status-badge amber"; }

  activityLog.unshift(["Queue Review Started", `Batch review is running across ${vendors.length} AI tools.`]);
  activityLog = activityLog.slice(0, 12);
  renderActivity();

  renderQueueProgressBanner();
  setQueueStep(0, "active");

  const timers = [
    setTimeout(() => setQueueStep(1, "active"), 500),
    setTimeout(() => setQueueStep(2, "active"), 1200),
  ];

  const previousModule = activeModule;

  try {
    const results = await Promise.all(
      vendors.map((vendor) => analyzeVendorWithBackend(vendor.id, { batch: true })),
    );
    timers.forEach(clearTimeout);
    applyDemoDecisionOverrides();

    const additions = results.reduce((sum, result) => sum + result.additions.length, 0);
    const blocked   = vendors.filter((v) => v.decision === BLOCK_DECISION).length;
    const escalated = vendors.filter((v) => v.decision === "Escalate").length;

    setQueueStep(3, "active");
    await delay(350);
    setQueueStep(4, "complete");
    await delay(500);

    activityLog.unshift(["Batch Complete", `Queue triage refreshed ${vendors.length} tools, attached ${additions} evidence records, and produced ${blocked} block / ${escalated} escalate decisions.`]);
    activityLog = activityLog.slice(0, 12);
    saveState();

    if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
    qsa("[data-action='run-batch']").forEach((b) => { b.disabled = false; });
    if (badge) { badge.textContent = badgePrevText; badge.className = badgePrevClass; }
    updateConnectionMode();

    showQueueToast("Queue review complete — decisions updated.");
    clearQueueProgressBanner();

    if (previousModule && previousModule !== "inbox") {
      renderModule(previousModule);
    } else {
      renderDashboard();
    }
  } catch (error) {
    timers.forEach(clearTimeout);
    clearQueueProgressBanner();
    if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
    qsa("[data-action='run-batch']").forEach((b) => { b.disabled = false; });
    if (badge) { badge.textContent = badgePrevText; badge.className = badgePrevClass; }
    activityLog.unshift(["Queue Review Failed", `Batch review failed: ${error.message || "Unknown error."}`]);
    activityLog = activityLog.slice(0, 12);
    renderActivity();
    showQueueToast("Queue review failed. Try again.", "red");
  }
}

function exportMemo(vendor) {
  const missing = missingEvidenceTypes(vendor);
  const memoEvidence = (evidenceByVendor[vendor.id] || []).filter(isFinalSupportingEvidence);
  const hashId = memoHash(vendor);
  const summary = evidenceReviewSummary(vendor);
  const bandRoom = bandRoomsByVendor[vendor.id];
  const lines = [
    `ClearGate AI - AI Vendor Passport`,
    `Evidence hash chain: ${hashId}`,
    `Vendor: ${vendor.name}`,
    `Domain: ${vendor.domain}`,
    `Decision: ${vendor.decision}`,
    `Risk score: ${vendor.riskScore}`,
    `Freshness score: ${vendor.freshnessScore}%`,
    `Evidence gap index: ${vendor.gapIndex}%`,
    `Missing evidence: ${missing.length ? missing.join(", ") : "none"}`,
    `Evidence complete: ${summary.complete.length ? summary.complete.join(", ") : "none"}`,
    `Detected signals: ${summary.detectedSignals.length ? summary.detectedSignals.join(", ") : "none"}`,
    `Decision explanation: ${decisionExplanation(vendor)}`,
    ``,
    `Top findings:`,
    ...vendor.topFindings.map((finding) => `- ${finding}`),
    ``,
    `Policy findings:`,
    ...(vendor.policyFindings || []).map((finding) => `- ${finding.group}: ${finding.state} (${finding.evidenceCount} mapped evidence records)`),
    ``,
    `Required conditions:`,
    ...vendor.requiredConditions.map((condition) => `- ${condition}`),
    ``,
    `Band collaboration proof:`,
    ...bandRoomLines(bandRoom).map((line) => `- ${line}`),
    ...(bandRoom ? [
      ``,
      `Band agent findings:`,
      ...bandRoom.agents.map((agent) => `- ${agent.name} [${agent.state}]: ${agent.finding}`),
      ``,
      `Band handoff timeline:`,
      ...bandRoom.events.map((event) => `- ${event.time} ${event.agent} -> ${event.handoff}: ${event.title}`),
    ] : []),
    ``,
    `Reviewer notes:`,
    vendor.reviewerNotes || "No reviewer notes added yet.",
    ...(vendor.memoDraft ? [
      ``,
      `AI/ML API grounded draft (non-authoritative):`,
      vendor.memoDraft.executiveSummary || "No executive summary returned.",
    ] : []),
    ``,
    `Evidence records:`,
    ...memoEvidence.flatMap((item) => [
      `- Finding type: ${item.sourceType}`,
      `  Source URL: ${sourceDisplayUrl(item) || "not attached"}`,
      `  Retrieved: ${item.fetchedAt || "not fetched"}`,
      `  Bright Data product: ${item.retrievalProduct || item.discoveryProduct || item.product || "recorded"}`,
      `  Evidence origin: ${item.evidenceOrigin || provenanceLabel(item)}`,
      `  Snapshot SHA-256: ${item.snapshotSha256 || "pending"}`,
      `  Finding method: ${findingMethodLabel(item)}`,
      `  Finding: ${supportedFinding(item) || "No finding excerpt returned."}`,
      `  Grounded quote: ${item.aiExtraction?.supportingQuote || findingExcerpt(item) || "No grounded quote returned."}`,
      Array.isArray(item.extractedSignals) && item.extractedSignals.length ? `  Signals: ${item.extractedSignals.join(", ")}` : "",
      `  Policy mapping: ${item.clause || "Policy mapping pending"}`,
    ].filter(Boolean)),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${vendor.id}-approval-memo.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function memoHash(vendor) {
  return `CG-${vendor.id.toUpperCase()}-${vendor.riskScore}${vendor.freshnessScore}${vendor.gapIndex}`;
}

function buildEscalationRequest(vendor) {
  return {
    vendor: {
      id: vendor.id,
      name: vendor.name,
      domain: vendor.domain,
      decision: vendor.decision,
      riskScore: vendor.riskScore,
      freshnessScore: vendor.freshnessScore,
      gapIndex: vendor.gapIndex,
      policyProfile: vendor.policyProfile,
      dataExposure: vendor.dataExposure,
      department: vendor.department,
      category: vendor.category,
    },
    missingEvidence: missingEvidenceTypes(vendor),
    requiredConditions: vendor.requiredConditions || [],
    topFindings: vendor.topFindings || [],
    reviewerNotes: vendor.reviewerNotes || "",
    triggerReason: vendor.driftReason || decisionExplanation(vendor),
    memoHash: memoHash(vendor),
    bandAgentRoom: bandRoomsByVendor[vendor.id] || null,
    evidence: (evidenceByVendor[vendor.id] || []).filter(isFinalSupportingEvidence),
  };
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function requestWorkflowEscalation(vendor) {
  const payload = buildEscalationRequest(vendor);
  if (!backendReviewEnabled() || typeof fetch !== "function") {
    return {
      mode: "workflow-draft",
      deliveries: [],
      errors: [],
      draft: {
        workflowId: `CG-ESC-${vendor.id.toUpperCase()}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...payload,
      },
      adapterNotes: ["Static-file mode returned a downloadable escalation draft."],
    };
  }

  const response = await fetch(appSettings.workflowApiEndpoint || "/api/escalate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Workflow escalation request failed.");
  return response.json();
}

function openEscalationDetail(vendor, result) {
  const draft = result.draft || {};
  const deliveries = result.deliveries || [];
  const errors = result.errors || [];
  qs("#detailEyebrow").textContent = "Workflow escalation";
  qs("#detailTitle").textContent = `${vendor.name} workflow package`;
  qs("#detailDrawerContent").innerHTML = `
    <div class="detail-grid">
      <section class="detail-card">
        <h3>Workflow mode</h3>
        <p>${safeText(result.mode || "workflow-draft")}</p>
      </section>
      <section class="detail-card">
        <h3>Workflow ID</h3>
        <p>${safeText(draft.workflowId || "pending")}</p>
      </section>
      <section class="detail-card">
        <h3>Deliveries</h3>
        <p>${deliveries.length ? deliveries.map((item) => `${item.target}: ${item.status}${item.issueKey ? ` (${item.issueKey})` : ""}`).join(", ") : result.mode === "workflow-failed" ? "Failed. Draft preserved for retry." : "Draft-only fallback"}</p>
      </section>
      <section class="detail-card">
        <h3>Missing evidence</h3>
        <p>${safeText((draft.missingEvidence || []).join(", ") || "none")}</p>
      </section>
      <section class="detail-card full">
        <h3>Summary</h3>
        <p>${safeText(draft.summary || `${vendor.name} escalation package generated.`)}</p>
      </section>
      <section class="detail-card full">
        <h3>Adapter notes</h3>
        <p>${safeText((result.adapterNotes || []).join(" "))}</p>
      </section>
      ${errors.length ? `
        <section class="detail-card full">
          <h3>Delivery errors</h3>
          <p>${safeText(errors.join(" "))}</p>
          <button id="retryEscalation" class="button secondary" type="button">Retry Slack delivery</button>
        </section>
      ` : ""}
      <section class="detail-card full">
        <h3>Escalation draft</h3>
        <pre class="raw-preview">${safeText(JSON.stringify(draft, null, 2))}</pre>
      </section>
    </div>
  `;
  qs("#retryEscalation")?.addEventListener("click", () => escalateVendor(vendor.id));
  openDetailDrawer();
}

async function escalateVendor(vendorId) {
  const vendor = vendorById(vendorId);
  try {
    const result = await requestWorkflowEscalation(vendor);
    appSettings.lastWorkflowMode = result.mode || "workflow-draft";
    appSettings.lastWorkflowId = result.draft?.workflowId || "";
    const auditEvent = result.mode === "workflow-sent" ? "ESCALATION_SENT" : "ESCALATION_DRAFTED";
    activityLog.unshift([auditEvent, `${new Date().toISOString()} · ${vendor.name} escalation package ${result.mode === "workflow-sent" ? "sent to Slack" : result.mode === "workflow-failed" ? "failed delivery and preserved a retryable draft" : "prepared as a draft-only fallback"}.`]);
    activityLog = activityLog.slice(0, 12);
    saveState();
    openEscalationDetail(vendor, result);
    if (result.mode !== "workflow-sent") {
      downloadJson(`${vendor.id}-workflow-escalation.json`, result.draft || buildEscalationRequest(vendor));
    }
  } catch (error) {
    activityLog.unshift(["ESCALATION_DRAFTED", `${new Date().toISOString()} · ${vendor.name} escalation failed: ${error.message || "unknown error"}.`]);
    activityLog = activityLog.slice(0, 12);
    saveState();
    renderReview();
  }
}

function exportQueueSummary() {
  const lines = [
    "ClearGate AI - Shadow AI Queue Summary",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    ...[...vendors]
      .sort((a, b) => b.riskScore - a.riskScore)
      .map(
        (vendor) =>
          `${vendor.name} | ${vendor.decision} | Risk ${vendor.riskScore} | Freshness ${vendor.freshnessScore}% | Gap ${vendor.gapIndex}% | Evidence ${(evidenceByVendor[vendor.id] || []).length}`,
      ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cleargate-shadow-ai-queue-summary.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseImportedTool(line) {
  const parts = line
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const name = cleanImportValue(parts[0] || line.trim(), 80);
  if (!name || name.length < 2) return { error: "Vendor name is required." };
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (!id) return { error: `Could not create an ID from "${line}".` };
  const domain = normalizeDomainInput(parts[1], id);
  const users = Number(parts[2]) > 0 ? Number(parts[2]) : 1;
  const department = cleanImportValue(parts[3] || "Unassigned", 80);
  const dataExposure = cleanImportValue(parts[4] || "Unknown", 120);
  const vendor = {
    id,
    name,
    domain,
    initials: initials(name),
    category: inferCategory(name),
    department,
    users,
    dataExposure,
    riskLevel: "Medium",
    riskScore: 55,
    freshnessScore: 0,
    gapIndex: 72,
    decision: "Escalate",
    seededWorkspace: false,
    lastReviewed: "Not reviewed",
    detectedFrom: "Manual import",
    reviewHours: Math.max(4, Math.round(users / 5)),
    policyProfile: inferPolicyProfile(dataExposure),
    reviewerNotes: "",
    manualDecision: false,
    requiredConditions: ["Run Bright Data evidence discovery before approval."],
    topFindings: ["Imported tool has not been reviewed yet.", "Missing evidence is treated as risk.", "Policy gate requires source discovery."],
  };
  return scoreVendor(vendor);
}

function importTools() {
  const input = qs("#toolImportInput");
  const names = input.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const feedback = qs("#importFeedback");
  if (!names.length) {
    feedback.textContent = "Paste at least one tool before importing.";
    return;
  }

  let added = 0;
  let skipped = 0;
  const errors = [];
  names.forEach((name) => {
    const vendor = parseImportedTool(name);
    if (vendor.error) {
      errors.push(vendor.error);
      return;
    }
    if (vendors.some((existing) => existing.id === vendor.id)) return;
    vendors.push(vendor);
    evidenceByVendor[vendor.id] = [];
    added += 1;
  });

  skipped = names.length - added - errors.length;
  if (feedback) {
    feedback.textContent = `Imported ${added} tool${added === 1 ? "" : "s"}. Skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}.${errors.length ? ` ${errors.join(" ")}` : ""}`;
  }

  if (!added && !errors.length) {
    return;
  }

  if (added > 0) {
    activityLog.unshift(["Shadow AI Intake", `Imported ${added} tool${added === 1 ? "" : "s"} from CSV-style intake.`]);
    activityLog = activityLog.slice(0, 12);
    input.value = "";
    closeDrawer();
    saveState();
    renderDashboard();
    return;
  }

  if (errors.length) {
    saveState();
  }
}

function ensureImportedVendor(line) {
  const vendor = parseImportedTool(line);
  if (vendor.error || vendors.some((existing) => existing.id === vendor.id)) return false;
  vendors.push(vendor);
  evidenceByVendor[vendor.id] = [];
  return true;
}

async function loadJudgeDemoFlow() {
  const demoRows = [
    "Otter.ai, otter.ai, 42, Sales, Call recordings",
    "Replit Agent, replit.com, 24, Engineering, Source code",
    "Writer, writer.com, 18, Legal, Customer contracts",
  ];
  const added = demoRows.filter(ensureImportedVendor).length;
  activityLog.unshift(["Demo Path", `Prepared judge demo with ${added} new intake tools and started queue triage.`]);
  activityLog = activityLog.slice(0, 12);
  saveState();
  await runQueueReview();
  const target =
    vendors.find((vendor) => vendor.id === "otter-ai") ||
    vendors.find((vendor) => vendor.id === "fireflies") ||
    [...vendors].sort((a, b) => b.riskScore - a.riskScore)[0];
  openReview(target.id);
  setActiveTab("evidence");
}

function openDrawer() {
  qs("#importDrawer").classList.add("open");
  qs("#importDrawer").setAttribute("aria-hidden", "false");
  qs("#toolImportInput").focus();
}

function closeDrawer() {
  qs("#importDrawer").classList.remove("open");
  qs("#importDrawer").setAttribute("aria-hidden", "true");
}

async function fetchServerStatus() {
  try {
    const resp = await fetch("/api/healthz", { signal: AbortSignal.timeout(3000) });
    if (!resp.ok) return;
    const data = await resp.json().catch(() => null);
    if (!data) return;
    appSettings.backendStatus = {
      aimlApiConfigured: data?.integrations?.aimlApi === "ready",
      mode: data?.mode || "demo-fallback",
    };
    const settingsEl = qs("#moduleContent");
    if (activeModule === "settings" && settingsEl) {
      settingsEl.innerHTML = renderSettingsHub();
      bindModuleActions();
    }
  } catch { /* silent in static-file mode */ }
}

function renderDashboard() {
  activeModule = "inbox";
  updateConnectionMode();
  renderKpis();
  renderRiskQueue();
  renderActivity();
}

function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

function initEvents() {
  qs("#globalSearch").addEventListener("input", renderRiskQueue);
  qs("#riskFilter").addEventListener("change", renderRiskQueue);
  qs("#resetFilters").addEventListener("click", () => {
    qs("#globalSearch").value = "";
    qs("#riskFilter").value = "all";
    renderRiskQueue();
  });
  qs("#runQueueReview").addEventListener("click", runQueueReview);
  qs("#loadJudgeDemo").addEventListener("click", loadJudgeDemoFlow);
  qs("#backToInbox").addEventListener("click", goInbox);
  qs("#openImportDrawer").addEventListener("click", openDrawer);
  qs("#closeImportDrawer").addEventListener("click", closeDrawer);
  qs("#closeDetailDrawer").addEventListener("click", closeDetailDrawer);
  qs("#clearImport").addEventListener("click", () => {
    qs("#toolImportInput").value = "";
  });
  qs("#importTools").addEventListener("click", importTools);
  qs("#importDrawer").addEventListener("click", (event) => {
    if (event.target.id === "importDrawer") closeDrawer();
  });
  qs("#detailDrawer").addEventListener("click", (event) => {
    if (event.target.id === "detailDrawer") closeDetailDrawer();
  });
  qsa(".tab").forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.tab)));
  qsa(".nav-item").forEach((button) => {
      button.addEventListener("click", () => {
        qsa(".nav-item").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        if (button.dataset.viewTarget === "inbox") {
          goInbox();
        } else {
          renderModule(button.dataset.viewTarget);
        }
      });
  });
}

function hydrateRuntimeState() {
  vendors.forEach((vendor) => {
    evidenceByVendor[vendor.id] = (evidenceByVendor[vendor.id] || []).map((source) =>
      normalizeEvidenceRecord(vendor, source, source.pipelineStage || "fetch"),
    );
    vendor.policyProfile = vendor.policyProfile || inferPolicyProfile(vendor.dataExposure || "");
    vendor.manualDecision = Boolean(vendor.manualDecision);
    vendor.decision = normalizeDecision(vendor.decision);
    vendor.recommendedDecision = decisionFromVendor(vendor);
    if (!vendor.manualDecision && !vendor.seededWorkspace) vendor.decision = normalizeDecision(vendor.recommendedDecision);
    refreshPolicyFindings(vendor);
  });
  applyDemoDecisionOverrides();
}

hydrateRuntimeState();
renderDashboard();
initEvents();
