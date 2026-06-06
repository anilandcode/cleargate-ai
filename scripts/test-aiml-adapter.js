const assert = require("assert");
const { validateExtraction, extractGroundedFinding } = require("../lib/aiml-adapter");

const source = {
  sourceType: "Trust Center",
  officialSourceUrl: "https://trust.acme.ai",
  snapshotContent: "Acme encrypts customer data and supports SSO. Audit logs are available to enterprise administrators.",
};

function testUnsupportedQuoteIsRejected() {
  assert.throws(
    () => validateExtraction({
      factType: "certification",
      supportedFinding: "Acme is SOC 2 certified.",
      supportingQuote: "Acme is SOC 2 certified.",
      sourceType: "Trust Center",
      controlMapping: ["Enterprise Security"],
      confidence: 95,
      uncertainty: "",
      requiresHumanReview: false,
    }, source),
    /supporting quote was not present/,
  );
}

function testInsufficientEvidenceIsAllowedWithoutInventingSupport() {
  const result = validateExtraction({
    factType: "certification",
    supportedFinding: "insufficient evidence",
    supportingQuote: "",
    sourceType: "Trust Center",
    controlMapping: ["Enterprise Security"],
    confidence: 20,
    uncertainty: "No certification statement is present.",
    requiresHumanReview: true,
  }, source);
  assert.strictEqual(result.supportedFinding, "insufficient evidence");
  assert.strictEqual(result.requiresHumanReview, true);
}

async function testGroundedAiSuccess() {
  const originalEnv = {
    AIMLAPI_ENABLED: process.env.AIMLAPI_ENABLED,
    AIMLAPI_API_KEY: process.env.AIMLAPI_API_KEY,
    AIMLAPI_MODEL: process.env.AIMLAPI_MODEL,
  };
  const originalFetch = global.fetch;
  process.env.AIMLAPI_ENABLED = "1";
  process.env.AIMLAPI_API_KEY = "test-key";
  process.env.AIMLAPI_MODEL = "test-model";
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      choices: [{
        message: {
          content: JSON.stringify({
            factType: "enterprise_control",
            supportedFinding: "Enterprise audit logs are available.",
            supportingQuote: "Audit logs are available to enterprise administrators.",
            sourceType: "Trust Center",
            controlMapping: ["Enterprise Security"],
            confidence: 92,
            uncertainty: "",
            requiresHumanReview: false,
          }),
        },
      }],
    }),
  });
  try {
    const result = await extractGroundedFinding({ vendorName: "Acme AI", source });
    assert.strictEqual(result.extractionMethod, "AI/ML API");
    assert.strictEqual(result.supportingQuote, "Audit logs are available to enterprise administrators.");
  } finally {
    global.fetch = originalFetch;
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
}

async function main() {
  testUnsupportedQuoteIsRejected();
  testInsufficientEvidenceIsAllowedWithoutInventingSupport();
  await testGroundedAiSuccess();
  console.log("AI/ML adapter tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
