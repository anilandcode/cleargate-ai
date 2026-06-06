const assert = require("assert");
const crypto = require("crypto");
const { buildReview, __test } = require("../lib/review-adapter");

const vendor = {
  id: "acme-ai",
  name: "Acme AI",
  domain: "acme.ai",
  policyProfile: "AI Tool With Customer Data",
};

function testOfficialDomainRanking() {
  const selected = __test.selectCanonicalSource(vendor, "Privacy Policy", [
    {
      url: "https://random-blog.example/acme-ai-privacy-review",
      title: "Acme AI privacy reviewed",
      snippet: "A third-party blog post.",
    },
    {
      url: "https://acme.ai/legal/privacy-policy",
      title: "Acme AI Privacy Policy",
      snippet: "Official privacy policy covering data retention and customer data.",
    },
  ]);
  assert(selected, "Expected an official candidate to be selected.");
  assert.strictEqual(selected.url, "https://acme.ai/legal/privacy-policy");
}

function testAssociatedTrustDomainRanking() {
  const selected = __test.selectCanonicalSource(vendor, "Trust Center", [
    {
      url: "https://securityweekly.example/acme-ai-soc2",
      title: "Acme AI security article",
      snippet: "A third-party security news story.",
    },
    {
      url: "https://trust.acme.ai/",
      title: "Acme AI Trust Center",
      snippet: "Official SOC 2, ISO 27001, SSO, and security controls.",
    },
  ]);
  assert(selected, "Expected associated trust domain to be selected.");
  assert.strictEqual(selected.url, "https://trust.acme.ai/");
}

function testNoCanonicalResult() {
  const selected = __test.selectCanonicalSource(vendor, "Subprocessors", [
    {
      url: "https://google.com/search?q=acme+subprocessors",
      title: "Search results",
      snippet: "",
    },
    {
      url: "https://reddit.com/r/security/comments/acme",
      title: "Acme discussion",
      snippet: "Unofficial thread.",
    },
  ]);
  assert.strictEqual(selected, null);
  const record = __test.missingEvidenceRecord(vendor, "Subprocessors", "Acme AI subprocessors official", "No credible canonical public source was found.");
  assert.strictEqual(record.retrievalStatus, "missing");
  assert.strictEqual(record.includedInMemo, false);
  assert.strictEqual(record.sourceType, "Subprocessors Missing");
}

function testSerpParsingSkipsSearchAsFinalEvidence() {
  const results = __test.parseSerpResults({
    organic: [
      {
        link: "https://www.google.com/url?q=https%3A%2F%2Facme.ai%2Fsecurity&sa=U",
        title: "Acme AI Security",
        snippet: "Official trust center and SOC 2.",
      },
      {
        url: "https://www.google.com/search?q=acme+security",
        title: "Search",
      },
    ],
  });
  assert(results.some((result) => result.url === "https://acme.ai/security"));
  const selected = __test.selectCanonicalSource(vendor, "Trust Center", results);
  assert(selected, "Expected parsed official result to be selected.");
  assert.notStrictEqual(new URL(selected.url).hostname, "www.google.com");
}

function testSnapshotDriftComparison() {
  const drift = __test.compareEvidenceSnapshots(
    [{ sourceType: "Privacy Policy", officialSourceUrl: "https://acme.ai/privacy", snapshotSha256: "a".repeat(64), evidenceOrigin: "LIVE_FETCH" }],
    [{ sourceType: "Privacy Policy", officialSourceUrl: "https://acme.ai/privacy", snapshotSha256: "b".repeat(64), evidenceOrigin: "LIVE_FETCH" }],
  );
  assert.strictEqual(drift.length, 1, "Expected changed live snapshot hashes to create a drift event.");
  const seededNoise = __test.compareEvidenceSnapshots(
    [{ sourceType: "Privacy Policy", officialSourceUrl: "https://acme.ai/privacy", snapshotSha256: "a".repeat(64), evidenceOrigin: "SEEDED_DEMO_DATA" }],
    [{ sourceType: "Privacy Policy", officialSourceUrl: "https://acme.ai/privacy", snapshotSha256: "b".repeat(64), evidenceOrigin: "LIVE_FETCH" }],
  );
  assert.strictEqual(seededNoise.length, 0, "Seeded replay must not be compared as prior live evidence.");
}

async function testFallbackDemoMode() {
  const review = await buildReview({
    vendor,
    missingEvidence: ["Privacy Policy", "Trust Center"],
  });
  assert.strictEqual(review.mode, "demo-fallback");
  assert(review.evidence.length >= 2, "Expected fallback evidence records.");
  assert(review.evidence.every((record) => record.evidenceOrigin === "SEEDED_DEMO_DATA"));
  assert(review.evidence.every((record) => record.provenance === "seeded_demo_data"));
  assert(review.evidence.every((record) => record.evidenceOrigin !== "LIVE_FETCH"), "Seeded fallback evidence must never be marked live.");
  assert(review.evidence.every((record) => /^[a-f0-9]{64}$/.test(record.snapshotSha256)), "Seeded records should still carry SHA-256 integrity hashes.");
}

async function testLiveShapeWithStubbedFetch() {
  const originalEnv = {
    BRIGHTDATA_LIVE: process.env.BRIGHTDATA_LIVE,
    BRIGHTDATA_API_TOKEN: process.env.BRIGHTDATA_API_TOKEN,
    BRIGHTDATA_SERP_ZONE: process.env.BRIGHTDATA_SERP_ZONE,
    BRIGHTDATA_UNLOCKER_ZONE: process.env.BRIGHTDATA_UNLOCKER_ZONE,
  };
  const originalFetch = global.fetch;
  process.env.BRIGHTDATA_LIVE = "1";
  process.env.BRIGHTDATA_API_TOKEN = "test-token";
  process.env.BRIGHTDATA_SERP_ZONE = "serp-zone";
  process.env.BRIGHTDATA_UNLOCKER_ZONE = "unlocker-zone";
  global.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    if (body.zone === "serp-zone") {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          organic: [
            {
              link: "https://acme.ai/privacy",
              title: "Acme AI Privacy Policy",
              snippet: "Official privacy policy with data retention and customer data terms.",
            },
          ],
        }),
      };
    }
    return {
      ok: true,
      status: 200,
      text: async () => "Privacy Policy. We describe data retention, customer data, GDPR, and AI training controls. Customers can review the handling terms for personal data, retention periods, subprocessors, and security requirements before approving enterprise use.",
    };
  };

  try {
    const review = await buildReview({
      vendor,
      missingEvidence: ["Privacy Policy"],
      forceRefresh: true,
    });
    assert.strictEqual(review.mode, "bright-data-live");
    assert(review.evidence.some((record) => record.sourceType === "Privacy Policy Discovery" && record.includedInMemo === false));
    const fetched = review.evidence.find((record) => record.sourceType === "Privacy Policy");
    assert(fetched, "Expected fetched privacy evidence.");
    assert.strictEqual(fetched.officialSourceUrl, "https://acme.ai/privacy");
    assert.strictEqual(fetched.discoveryProduct, "SERP API");
    assert.strictEqual(fetched.retrievalProduct, "Web Unlocker");
    assert.strictEqual(fetched.evidenceOrigin, "LIVE_FETCH");
    assert.strictEqual(fetched.retrievalStatus, "success");
    assert.match(fetched.fetchedAt, /^\d{4}-\d{2}-\d{2}T/);
    assert.match(fetched.snapshotSha256, /^[a-f0-9]{64}$/);
    const expectedHash = crypto
      .createHash("sha256")
      .update("privacy policy. we describe data retention, customer data, gdpr, and ai training controls. customers can review the handling terms for personal data, retention periods, subprocessors, and security requirements before approving enterprise use.", "utf8")
      .digest("hex");
    assert.strictEqual(fetched.snapshotSha256, expectedHash, "Snapshot hash should be based on normalized retrieved content.");
    assert(fetched.excerpt.length > 0 && fetched.excerpt.length <= 280, "Expected bounded supporting excerpt.");
    const discovery = review.evidence.find((record) => record.sourceType === "Privacy Policy Discovery");
    assert(discovery && discovery.includedInMemo === false, "Discovery activity should not be memo evidence.");
  } finally {
    global.fetch = originalFetch;
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
}

async function testBrowserFallbackIsSelectiveAndBounded() {
  const originalEnv = {
    BRIGHTDATA_LIVE: process.env.BRIGHTDATA_LIVE,
    BRIGHTDATA_API_TOKEN: process.env.BRIGHTDATA_API_TOKEN,
    BRIGHTDATA_SERP_ZONE: process.env.BRIGHTDATA_SERP_ZONE,
    BRIGHTDATA_UNLOCKER_ZONE: process.env.BRIGHTDATA_UNLOCKER_ZONE,
    BRIGHTDATA_BROWSER_ENABLED: process.env.BRIGHTDATA_BROWSER_ENABLED,
    BRIGHTDATA_BROWSER_USERNAME: process.env.BRIGHTDATA_BROWSER_USERNAME,
    BRIGHTDATA_BROWSER_PASSWORD: process.env.BRIGHTDATA_BROWSER_PASSWORD,
    BRIGHTDATA_BROWSER_MAX_PER_REVIEW: process.env.BRIGHTDATA_BROWSER_MAX_PER_REVIEW,
  };
  const originalFetch = global.fetch;
  let browserCalls = 0;
  process.env.BRIGHTDATA_LIVE = "1";
  process.env.BRIGHTDATA_API_TOKEN = "test-token";
  process.env.BRIGHTDATA_SERP_ZONE = "serp-zone";
  process.env.BRIGHTDATA_UNLOCKER_ZONE = "unlocker-zone";
  process.env.BRIGHTDATA_BROWSER_ENABLED = "1";
  process.env.BRIGHTDATA_BROWSER_USERNAME = "browser-zone-user";
  process.env.BRIGHTDATA_BROWSER_PASSWORD = "browser-zone-password";
  process.env.BRIGHTDATA_BROWSER_MAX_PER_REVIEW = "1";
  global.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    if (body.zone === "serp-zone") {
      const isTrust = body.url.includes("trust") || body.url.includes("security");
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          organic: [
            {
              link: isTrust ? "https://trust.acme.ai/" : "https://acme.ai/privacy",
              title: isTrust ? "Acme AI Trust Center" : "Acme AI Privacy Policy",
              snippet: isTrust ? "Official trust center security page." : "Official privacy policy.",
            },
          ],
        }),
      };
    }
    return {
      ok: true,
      status: 200,
      text: async () => "<html><body><div id=\"app\"></div><script>window.__NEXT_ERROR__ = 'application shell';</script></body></html>",
    };
  };
  __test.setBrowserPageRetriever(async () => {
    browserCalls += 1;
    return {
      raw: "<html><body>Rendered privacy policy: customer data retention, GDPR, subprocessors, encryption, SOC 2, SSO, and audit logs.</body></html>",
      preview: "Rendered privacy policy: customer data retention, GDPR, subprocessors, encryption, SOC 2, SSO, and audit logs.",
      normalizedContent: "rendered privacy policy: customer data retention, gdpr, subprocessors, encryption, soc 2, sso, and audit logs.",
      snapshotSha256: crypto.createHash("sha256").update("rendered privacy policy: customer data retention, gdpr, subprocessors, encryption, soc 2, sso, and audit logs.").digest("hex"),
    };
  });

  try {
    const review = await buildReview({
      vendor,
      missingEvidence: ["Privacy Policy", "Trust Center"],
      forceRefresh: true,
    });
    const browserEvidence = review.evidence.filter((record) => record.retrievalProduct === "Scraping Browser");
    assert.strictEqual(browserCalls, 1, "Browser fallback must not run more than the configured maximum.");
    assert.strictEqual(browserEvidence.length, 1, "Expected exactly one successful Browser API fallback finding.");
    assert(browserEvidence[0].fallbackReason.includes("application shell"), "Expected Browser API finding to retain its escalation reason.");
    assert.strictEqual(browserEvidence[0].evidenceOrigin, "LIVE_FETCH");
    assert.match(browserEvidence[0].snapshotSha256, /^[a-f0-9]{64}$/);
    assert.strictEqual(review.reviewMeta.browserFallback.attempts, 1);
    assert.strictEqual(review.reviewMeta.browserFallback.successes, 1);
    assert.strictEqual(review.reviewMeta.costEstimate.browserFallbackRequests, 1);
  } finally {
    __test.setBrowserPageRetriever();
    global.fetch = originalFetch;
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
}

async function testAimlFailureFallsBackToRules() {
  const originalEnv = {
    AIMLAPI_ENABLED: process.env.AIMLAPI_ENABLED,
    AIMLAPI_API_KEY: process.env.AIMLAPI_API_KEY,
    AIMLAPI_MODEL: process.env.AIMLAPI_MODEL,
  };
  const originalFetch = global.fetch;
  process.env.AIMLAPI_ENABLED = "1";
  process.env.AIMLAPI_API_KEY = "test-key";
  process.env.AIMLAPI_MODEL = "test-model";
  global.fetch = async () => {
    throw new Error("AI partner unavailable");
  };
  try {
    const source = await __test.enrichFindingWithAiml(vendor, {
      sourceType: "Privacy Policy",
      officialSourceUrl: "https://acme.ai/privacy",
      url: "https://acme.ai/privacy",
      snapshotContent: "Customer data retention terms are described in this privacy policy.",
      excerpt: "Customer data retention terms are described in this privacy policy.",
      claim: "Official privacy page retrieved.",
      clause: "Privacy Policy evidence",
      confidence: 82,
      evidenceOrigin: "LIVE_FETCH",
      retrievalStatus: "success",
    });
    assert.strictEqual(source.extractionMethod, "Rules-based");
    assert(source.aiExtractionError.includes("AI partner unavailable"));
  } finally {
    global.fetch = originalFetch;
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
}

async function main() {
  testOfficialDomainRanking();
  testAssociatedTrustDomainRanking();
  testNoCanonicalResult();
  testSerpParsingSkipsSearchAsFinalEvidence();
  testSnapshotDriftComparison();
  await testFallbackDemoMode();
  await testLiveShapeWithStubbedFetch();
  await testBrowserFallbackIsSelectiveAndBounded();
  await testAimlFailureFallsBackToRules();
  console.log("Review adapter tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
