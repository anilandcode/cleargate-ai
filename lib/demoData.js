export const DEMO_VENDOR_ID = "synthnote-ai";

export const vendors = [
  {
    id: DEMO_VENDOR_ID,
    name: "SynthNote AI",
    domain: "synthnote.ai",
    category: "AI meeting notes / customer research summarization",
    department: "Sales + Customer Success",
    users: 47,
    annualSpend: 18000,
    dataExposure: "high",
    sensitiveData: ["customer calls", "prospect emails", "internal notes"],
    trigger: "Discovered from expense report and browser extension usage",
    status: "Unapproved Shadow AI",
    riskScore: 82,
    businessOwner: "Revenue Operations",
    renewalDate: "2026-10-15",
    duplicateTools: ["Fathom", "Gong AI Notes"],
    timeSavedHours: 324,
    reviewStatus: "Needs agent review",
    description:
      "SynthNote AI records customer calls, summarizes research notes, and creates follow-up drafts for sales and success teams.",
    evidenceFlags: {
      privacyPolicyFound: true,
      trustCenterFound: true,
      pricingFound: true,
      dpaMissing: true,
      soc2Missing: true,
      subprocessorsMissing: true,
      aiTrainingUnclear: true,
      ssoUnclear: true,
      duplicateToolRisk: true,
      renewalRisk: true,
      noSecurityEvidence: false,
      criticalSensitiveData: false,
      missingPrivacyDocs: false,
      publicRiskSignal: false
    }
  },
  {
    id: "pixelprompt",
    name: "PixelPrompt",
    domain: "pixelprompt.dev",
    category: "AI image generation",
    department: "Marketing",
    users: 12,
    annualSpend: 7200,
    dataExposure: "medium",
    sensitiveData: ["campaign briefs", "brand assets"],
    trigger: "Detected in corporate card spend",
    status: "Pending intake",
    riskScore: 48,
    businessOwner: "Brand Marketing",
    renewalDate: "2026-08-01",
    duplicateTools: ["Adobe Firefly"],
    timeSavedHours: 112,
    reviewStatus: "Awaiting evidence",
    description:
      "A design team tool used to generate image concepts and social creative drafts.",
    evidenceFlags: {
      privacyPolicyFound: true,
      trustCenterFound: false,
      pricingFound: true,
      dpaMissing: true,
      soc2Missing: false,
      subprocessorsMissing: false,
      aiTrainingUnclear: true,
      ssoUnclear: false,
      duplicateToolRisk: true,
      renewalRisk: false,
      noSecurityEvidence: false,
      criticalSensitiveData: false,
      missingPrivacyDocs: false,
      publicRiskSignal: false
    }
  },
  {
    id: "contractpilot",
    name: "ContractPilot",
    domain: "contractpilot.co",
    category: "AI contract review",
    department: "Legal",
    users: 8,
    annualSpend: 26000,
    dataExposure: "critical",
    sensitiveData: ["contracts", "counterparty terms", "legal notes"],
    trigger: "Browser extension inventory",
    status: "Escalated",
    riskScore: 91,
    businessOwner: "Legal Operations",
    renewalDate: "2026-07-09",
    duplicateTools: [],
    timeSavedHours: 86,
    reviewStatus: "Escalated to Legal",
    description:
      "ContractPilot reviews commercial contracts and extracts negotiation risks.",
    evidenceFlags: {
      privacyPolicyFound: false,
      trustCenterFound: false,
      pricingFound: false,
      dpaMissing: true,
      soc2Missing: true,
      subprocessorsMissing: true,
      aiTrainingUnclear: true,
      ssoUnclear: true,
      duplicateToolRisk: false,
      renewalRisk: true,
      noSecurityEvidence: true,
      criticalSensitiveData: true,
      missingPrivacyDocs: true,
      publicRiskSignal: false
    }
  }
];

export const dashboardKpis = [
  { label: "Active Shadow AI Tools", value: "38", delta: "+9 this month" },
  { label: "High-Risk Tools", value: "11", delta: "4 process customer data" },
  { label: "Reviews Requiring Approval", value: "17", delta: "Legal and CISO queue" },
  { label: "Agent Reviews Completed", value: "126", delta: "91% auto-packeted" },
  { label: "Average Review Time Saved", value: "6.8h", delta: "per vendor review" },
  { label: "Manual Hours Avoided", value: "864", delta: "last 90 days" }
];

export const baseEvidenceLedger = [
  {
    id: "ev-base-001",
    vendorId: DEMO_VENDOR_ID,
    source: "Expense Monitor",
    claim: "SynthNote AI was detected in corporate card spend for Sales and Customer Success.",
    evidenceType: "spend_signal",
    confidence: 0.96,
    timestamp: "2026-06-05T09:05:00.000Z",
    hash: "ev_f31a9d4c",
    includeInMemo: true,
    policyMapping: "Shadow AI intake",
    riskImpact: "medium"
  },
  {
    id: "ev-base-002",
    vendorId: DEMO_VENDOR_ID,
    source: "Browser Extension Inventory",
    claim: "Usage telemetry indicates browser extension activity tied to customer calls and research notes.",
    evidenceType: "usage_signal",
    confidence: 0.9,
    timestamp: "2026-06-05T09:07:00.000Z",
    hash: "ev_c19f4a0e",
    includeInMemo: true,
    policyMapping: "Sensitive data handling",
    riskImpact: "high"
  },
  {
    id: "ev-base-003",
    vendorId: "pixelprompt",
    source: "Corporate Card Feed",
    claim: "PixelPrompt spend is active for Marketing with no completed vendor intake.",
    evidenceType: "spend_signal",
    confidence: 0.88,
    timestamp: "2026-06-04T14:20:00.000Z",
    hash: "ev_b80b7ed1",
    includeInMemo: false,
    policyMapping: "Procurement intake",
    riskImpact: "medium"
  }
];

export const policyRequirements = [
  "DPA required when customer data or PII may be processed.",
  "SOC 2 or bridge letter required before high-exposure production rollout.",
  "AI training opt-out must be confirmed for customer data.",
  "SSO and admin controls required for teams above 25 users.",
  "CISO approval required for high exposure and unclear security controls."
];

export function getVendor(vendorId = DEMO_VENDOR_ID) {
  return vendors.find((vendor) => vendor.id === vendorId) || vendors[0];
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}
