const AIML_DEFAULT_BASE_URL = "https://api.aimlapi.com/v1";
const AIML_TIMEOUT_MS = Number(process.env.AIMLAPI_TIMEOUT_MS || 12000);
const MAX_EVIDENCE_TEXT = 5000;

function aimlConfig() {
  return {
    enabled: ["1", "true", "yes"].includes(String(process.env.AIMLAPI_ENABLED || "").toLowerCase()),
    apiKey: process.env.AIMLAPI_API_KEY || "",
    model: process.env.AIMLAPI_MODEL || "",
    baseUrl: (process.env.AIMLAPI_BASE_URL || AIML_DEFAULT_BASE_URL).replace(/\/$/, ""),
  };
}

function canUseAimlApi() {
  const config = aimlConfig();
  return Boolean(config.enabled && config.apiKey && config.model && typeof fetch === "function");
}

function cleanText(value, limit = MAX_EVIDENCE_TEXT) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function safeJson(value) {
  if (value && typeof value === "object") return value;
  const raw = String(value || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI/ML API did not return JSON.");
    return JSON.parse(match[0]);
  }
}

function sanitizeString(value, limit = 800) {
  return String(value || "").trim().slice(0, limit);
}

function validateExtraction(candidate, source) {
  const evidenceText = cleanText(source.snapshotContent || source.rawContent || source.readablePreview || source.excerpt || "", MAX_EVIDENCE_TEXT);
  const supportingQuote = sanitizeString(candidate.supportingQuote, 320);
  const supportedFinding = sanitizeString(candidate.supportedFinding || "insufficient evidence", 600);
  const normalizedFinding = supportedFinding.toLowerCase();
  const quoteSupported = Boolean(supportingQuote && evidenceText.toLowerCase().includes(supportingQuote.toLowerCase()));
  const insufficient = normalizedFinding === "insufficient evidence" || normalizedFinding.includes("insufficient evidence");
  if (!insufficient && !quoteSupported) throw new Error("AI/ML API finding was rejected because its supporting quote was not present in retrieved evidence.");
  return {
    factType: sanitizeString(candidate.factType || "evidence_review", 100),
    supportedFinding: insufficient ? "insufficient evidence" : supportedFinding,
    supportingQuote: quoteSupported ? supportingQuote : "",
    sourceType: sanitizeString(source.sourceType, 100),
    controlMapping: Array.isArray(candidate.controlMapping)
      ? candidate.controlMapping.map((item) => sanitizeString(item, 120)).filter(Boolean).slice(0, 6)
      : [sanitizeString(candidate.controlMapping, 120)].filter(Boolean),
    confidence: Math.max(0, Math.min(100, Number(candidate.confidence || 0))),
    uncertainty: sanitizeString(candidate.uncertainty || (insufficient ? "Retrieved text does not support a stronger finding." : ""), 400),
    requiresHumanReview: Boolean(candidate.requiresHumanReview || insufficient),
    extractionMethod: "AI/ML API",
  };
}

function policyQuestionsFor(sourceType) {
  const questions = {
    "Privacy Policy": ["Does the excerpt mention customer data, retention, training use, privacy terms, or DPA terms?"],
    "Trust Center": ["Does the excerpt mention SOC 2, ISO 27001, SSO, audit logs, encryption, or incident controls?"],
    Subprocessors: ["Does the excerpt support subprocessor transparency or data processor terms?"],
    Documentation: ["Does the excerpt support enterprise SSO, audit logs, admin controls, or access controls?"],
    News: ["Does the excerpt contain a public incident, breach, outage, lawsuit, or regulatory signal?"],
  };
  return questions[sourceType] || ["What policy-relevant facts are directly supported by the supplied retrieved text?"];
}

async function chatCompletion(messages) {
  const config = aimlConfig();
  if (!canUseAimlApi()) throw new Error("AI/ML API is disabled or missing server-side credentials.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AIML_TIMEOUT_MS);
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0,
        messages,
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`AI/ML API request failed with HTTP ${response.status}.`);
    return payload?.choices?.[0]?.message?.content || "";
  } finally {
    clearTimeout(timer);
  }
}

async function extractGroundedFinding({ vendorName, source }) {
  const officialSourceUrl = String(source.officialSourceUrl || source.url || "");
  const evidenceText = cleanText(source.snapshotContent || source.rawContent || source.readablePreview || source.excerpt || "", MAX_EVIDENCE_TEXT);
  if (!officialSourceUrl || !evidenceText) throw new Error("AI/ML API extraction requires retrieved official evidence text and its source URL.");
  const prompt = {
    vendorName,
    sourceType: source.sourceType,
    officialSourceUrl,
    retrievedEvidenceText: evidenceText,
    policyControlQuestions: policyQuestionsFor(source.sourceType),
    rules: [
      "Use only retrievedEvidenceText.",
      "Never create or modify a URL.",
      "Return supportedFinding as 'insufficient evidence' when the text does not support a fact.",
      "supportingQuote must be a short verbatim substring from retrievedEvidenceText.",
      "Never claim a certification or control without a supporting quote.",
    ],
    outputSchema: {
      factType: "string",
      supportedFinding: "string",
      supportingQuote: "string",
      sourceType: source.sourceType,
      controlMapping: ["string"],
      confidence: "number 0-100",
      uncertainty: "string",
      requiresHumanReview: "boolean",
    },
  };
  const content = await chatCompletion([
    { role: "system", content: "Return strict JSON only. You extract grounded public-web evidence and never make approval decisions." },
    { role: "user", content: JSON.stringify(prompt) },
  ]);
  return validateExtraction(safeJson(content), source);
}

async function draftGroundedMemo({ vendorName, evidence, missingEvidence }) {
  const citations = evidence.slice(0, 8).map((source) => ({
    sourceType: source.sourceType,
    officialSourceUrl: source.officialSourceUrl || source.url,
    finding: source.aiExtraction?.supportedFinding || source.claim,
    quote: source.aiExtraction?.supportingQuote || source.excerpt || "",
  }));
  if (!citations.length) return null;
  const content = await chatCompletion([
    { role: "system", content: "Return strict JSON only. Draft concise memo prose from supplied citations. Do not make or change approval decisions." },
    {
      role: "user",
      content: JSON.stringify({
        vendorName,
        citations,
        missingEvidence,
        rules: ["Use only supplied citations.", "Do not state an approval outcome.", "Do not create URLs.", "Keep each field concise."],
        outputSchema: {
          executiveSummary: "string",
          keySupportingFindings: ["string"],
          outstandingGaps: ["string"],
          recommendedConditions: ["string"],
        },
      }),
    },
  ]);
  const draft = safeJson(content);
  return {
    executiveSummary: sanitizeString(draft.executiveSummary, 700),
    keySupportingFindings: Array.isArray(draft.keySupportingFindings) ? draft.keySupportingFindings.map((item) => sanitizeString(item, 300)).slice(0, 5) : [],
    outstandingGaps: Array.isArray(draft.outstandingGaps) ? draft.outstandingGaps.map((item) => sanitizeString(item, 300)).slice(0, 5) : [],
    recommendedConditions: Array.isArray(draft.recommendedConditions) ? draft.recommendedConditions.map((item) => sanitizeString(item, 300)).slice(0, 5) : [],
    draftingMethod: "AI/ML API",
    authoritative: false,
  };
}

module.exports = {
  aimlConfig,
  canUseAimlApi,
  cleanText,
  validateExtraction,
  extractGroundedFinding,
  draftGroundedMemo,
};
