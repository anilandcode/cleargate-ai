const crypto = require("crypto");
const { canUseAimlApi, extractGroundedFinding, draftGroundedMemo } = require("./aiml-adapter");

const BRIGHTDATA_ENDPOINT = "https://api.brightdata.com/request";
const REQUEST_TIMEOUT_MS = Number(process.env.BRIGHTDATA_TIMEOUT_MS || 12000);
const REVIEW_CACHE_TTL_MS = Number(process.env.VENDORPULSE_REVIEW_CACHE_TTL_MS || 10 * 60 * 1000);
const REVIEW_CONCURRENCY = Math.max(1, Number(process.env.BRIGHTDATA_CONCURRENCY || 3));
const SERP_COST_PER_REQUEST = 1.5 / 1000;
const UNLOCKER_COST_PER_REQUEST = 1.5 / 1000;
const BROWSER_FALLBACK_ESTIMATE_USD = 0.8;
const reviewCache = new Map();

const SOURCE_PLAYBOOK = [
  ["Trust center", "security trust center SOC 2 ISO 27001"],
  ["Privacy", "privacy policy data retention customer data training"],
  ["Subprocessors", "subprocessors data processors vendors"],
  ["Docs", "enterprise admin SSO audit logs data controls"],
  ["News", "security incident lawsuit breach outage"],
];

const EVIDENCE_CLASS_CONFIG = {
  "Privacy Policy": {
    label: "Privacy Policy",
    discoveryLabel: "Privacy",
    sourceTerms: ["privacy", "data privacy", "privacy policy", "retention", "customer data", "legal"],
    requiredSignals: ["privacy policy", "data retention", "customer data", "AI training", "GDPR", "DPA"],
    queries: (vendor) => [
      `site:${vendor.domain} privacy policy OR data privacy`,
      `${vendor.name} official privacy policy`,
      `${vendor.name} data privacy retention customer data`,
    ],
  },
  "Trust Center": {
    label: "Trust Center / Security",
    discoveryLabel: "Trust center",
    sourceTerms: ["trust", "security", "compliance", "soc", "iso", "sso", "audit"],
    requiredSignals: ["trust center", "SOC 2", "ISO 27001", "SSO", "audit logs", "security controls"],
    queries: (vendor) => [
      `${vendor.name} trust center security SOC 2 ISO 27001`,
      `site:${vendor.domain} security trust compliance SOC 2 ISO 27001`,
      `${vendor.name} official security compliance trust center`,
    ],
  },
  Subprocessors: {
    label: "Subprocessors",
    discoveryLabel: "Subprocessors",
    sourceTerms: ["subprocessor", "sub-processors", "processor", "dpa", "vendors", "legal"],
    requiredSignals: ["subprocessors", "DPA", "GDPR"],
    queries: (vendor) => [
      `${vendor.name} subprocessors official`,
      `site:${vendor.domain} subprocessors data processors vendors`,
      `${vendor.name} data processing agreement subprocessors`,
    ],
  },
  Documentation: {
    label: "Documentation / Enterprise Controls",
    discoveryLabel: "Docs",
    sourceTerms: ["docs", "documentation", "enterprise", "admin", "sso", "audit", "security"],
    requiredSignals: ["SSO", "audit logs", "security controls", "customer data"],
    queries: (vendor) => [
      `${vendor.name} enterprise SSO audit logs security official`,
      `site:${vendor.domain} enterprise admin SSO audit logs security`,
      `${vendor.name} documentation enterprise security controls`,
    ],
  },
  News: {
    label: "Public Risk / News",
    discoveryLabel: "News",
    sourceTerms: ["security", "incident", "breach", "outage", "lawsuit", "regulatory", "news"],
    requiredSignals: ["incident review"],
    queries: (vendor) => [
      `${vendor.name} security incident breach outage regulatory news`,
      `${vendor.name} privacy security breach lawsuit news`,
    ],
  },
};

const SEARCH_RESULT_HOSTS = new Set([
  "google.com",
  "www.google.com",
  "bing.com",
  "www.bing.com",
  "duckduckgo.com",
  "search.yahoo.com",
]);

const LOW_TRUST_HOST_HINTS = [
  "facebook.com",
  "x.com",
  "twitter.com",
  "linkedin.com",
  "reddit.com",
  "youtube.com",
  "medium.com",
  "substack.com",
  "github.com",
  "wikipedia.org",
  "crunchbase.com",
  "g2.com",
  "capterra.com",
  "trustpilot.com",
];

const POLICY_EXCERPT_TERMS = [
  "retention",
  "training",
  "customer data",
  "subprocessor",
  "subprocessors",
  "SOC 2",
  "ISO 27001",
  "SSO",
  "audit logs",
  "encryption",
  "incident",
  "DPA",
  "GDPR",
  "security",
  "privacy",
];

const REQUIRED_EVIDENCE_TYPES = {
  "Standard SaaS Vendor": ["Privacy Policy", "Trust Center", "Documentation", "News"],
  "AI Tool With Customer Data": ["Privacy Policy", "Trust Center", "Subprocessors", "Documentation", "News"],
  "AI Agent With Tool Access": ["Privacy Policy", "Trust Center", "Subprocessors", "Documentation", "News"],
  "High Risk Regulated Vendor": ["Privacy Policy", "Trust Center", "Subprocessors", "Documentation", "News"],
};
const SUPPORTED_EVIDENCE_TYPES = new Set(Object.keys(EVIDENCE_CLASS_CONFIG));

function brightDataConfig() {
  return {
    token: process.env.BRIGHTDATA_API_TOKEN || process.env.BRIGHTDATA_TOKEN || "",
    serpZone: process.env.BRIGHTDATA_SERP_ZONE || process.env.BRIGHTDATA_ZONE || "serp_api1",
    unlockerZone: process.env.BRIGHTDATA_UNLOCKER_ZONE || process.env.BRIGHTDATA_WEB_UNLOCKER_ZONE || process.env.BRIGHTDATA_ZONE || "web_unlocker1",
    country: (process.env.BRIGHTDATA_COUNTRY || "us").toLowerCase(),
    live: ["1", "true", "yes"].includes(String(process.env.BRIGHTDATA_LIVE || "").toLowerCase()),
    browserEnabled: ["1", "true", "yes"].includes(String(process.env.BRIGHTDATA_BROWSER_ENABLED || "").toLowerCase()),
    browserUsername: process.env.BRIGHTDATA_BROWSER_USERNAME || "",
    browserPassword: process.env.BRIGHTDATA_BROWSER_PASSWORD || "",
    browserHost: process.env.BRIGHTDATA_BROWSER_HOST || "brd.superproxy.io",
    browserPort: Number(process.env.BRIGHTDATA_BROWSER_PORT || 9222),
    browserMaxPerReview: Math.max(0, Number(process.env.BRIGHTDATA_BROWSER_MAX_PER_REVIEW || 1)),
  };
}

function canUseBrightDataLive() {
  const config = brightDataConfig();
  return Boolean(config.live && config.token && typeof fetch === "function");
}

function integrationMode() {
  const config = brightDataConfig();
  if (canUseBrightDataLive()) return "bright-data-live";
  if (config.token) return "bright-data-credential-ready-demo";
  return "demo-fallback";
}

function reviewIntegrationStatus() {
  const config = brightDataConfig();
  return {
    mode: integrationMode(),
    brightDataLive: canUseBrightDataLive(),
    browserFallback: browserFallbackReady(config) ? "ready" : "disabled",
    browserMaxPerReview: config.browserMaxPerReview,
    aimlApi: canUseAimlApi() ? "ready" : "disabled",
  };
}

function browserFallbackReady(config = brightDataConfig()) {
  return Boolean(config.browserEnabled && config.browserUsername && config.browserPassword);
}

function costEstimateFor(missing = requiredEvidenceTypes({ policyProfile: "Standard SaaS Vendor" }), browserFallbackRequests = 0) {
  const discoverySerpRequests = missing.length;
  const unlockerRequests = missing.length;
  const fetchSerpRequests = 0;
  const totalSerpRequests = discoverySerpRequests + fetchSerpRequests;
  const totalRequests = totalSerpRequests + unlockerRequests;
  const estimatedCostUsd = totalSerpRequests * SERP_COST_PER_REQUEST + unlockerRequests * UNLOCKER_COST_PER_REQUEST + browserFallbackRequests * BROWSER_FALLBACK_ESTIMATE_USD;
  const config = brightDataConfig();

  return {
    totalRequests,
    serpRequests: totalSerpRequests,
    unlockerRequests,
    browserFallbackRequests,
    browserFallbackMaxPerReview: config.browserMaxPerReview,
    browserFallbackReady: browserFallbackReady(config),
    estimatedCostUsd: Number(estimatedCostUsd.toFixed(4)),
    browserFallbackEstimateUsd: BROWSER_FALLBACK_ESTIMATE_USD,
    assumption: "$1.50 per 1,000 SERP or Web Unlocker successful requests. Live mode performs SERP discovery before Web Unlocker retrieval; Browser API fallback is estimated separately.",
  };
}

function cloneEvidence(records) {
  return JSON.parse(JSON.stringify(records));
}

function compareEvidenceSnapshots(previousEvidence = [], currentEvidence = []) {
  const previousByKey = new Map(
    previousEvidence
      .filter((record) => ["LIVE_FETCH", "CACHED_LIVE_SNAPSHOT"].includes(record.evidenceOrigin))
      .map((record) => [`${record.sourceType}:${record.officialSourceUrl || record.url}`, record]),
  );
  return currentEvidence
    .filter((record) => ["LIVE_FETCH", "CACHED_LIVE_SNAPSHOT"].includes(record.evidenceOrigin))
    .map((record) => {
      const key = `${record.sourceType}:${record.officialSourceUrl || record.url}`;
      const previous = previousByKey.get(key);
      if (!previous?.snapshotSha256 || !record.snapshotSha256 || previous.snapshotSha256 === record.snapshotSha256) return null;
      return {
        sourceType: record.sourceType,
        officialSourceUrl: record.officialSourceUrl || record.url,
        previousSnapshotSha256: previous.snapshotSha256,
        currentSnapshotSha256: record.snapshotSha256,
        detectedAt: new Date().toISOString(),
      };
    })
    .filter(Boolean);
}

function cacheKeyFor(vendor, missing) {
  return crypto
    .createHash("sha1")
    .update(JSON.stringify({
      vendor: {
        id: vendor.id,
        name: vendor.name,
        domain: vendor.domain,
        policyProfile: vendor.policyProfile,
      },
      missing: [...missing].sort(),
      version: "live-v2",
    }))
    .digest("hex");
}

function getCachedReview(cacheKey) {
  const cached = reviewCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > REVIEW_CACHE_TTL_MS) {
    reviewCache.delete(cacheKey);
    return null;
  }
  return cloneEvidence(cached.evidence).map((record) => ({
    ...record,
    provenance: "cached_live_snapshot",
    evidenceOrigin: "CACHED_LIVE_SNAPSHOT",
    retrievalStatus: "cached",
    cacheStatus: "Reused from live review cache",
  }));
}

function setCachedReview(cacheKey, evidence) {
  reviewCache.set(cacheKey, {
    createdAt: Date.now(),
    evidence: cloneEvidence(evidence),
  });
}

async function runWithConcurrency(items, worker, concurrency = REVIEW_CONCURRENCY) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await worker(items[currentIndex], currentIndex);
      }
    }),
  );
  return results;
}

function normalizeSnapshotContent(value) {
  return cleanPreviewText(value, 20000)
    .replace(/\b(skip to main content|cookie policy|accept all cookies|privacy preferences|all rights reserved)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function evidenceIdFromHash(hash) {
  return `EV-${String(hash || "").slice(0, 10).toUpperCase()}`;
}

function excerptFromContent(content, limit = 280) {
  const cleaned = cleanPreviewText(content, 20000);
  if (!cleaned) return "";
  const lower = cleaned.toLowerCase();
  const matchedTerm = POLICY_EXCERPT_TERMS.find((term) => lower.includes(term.toLowerCase()));
  if (!matchedTerm) return cleaned.slice(0, limit).trim();
  const index = lower.indexOf(matchedTerm.toLowerCase());
  const start = Math.max(0, index - Math.floor(limit / 3));
  const end = Math.min(cleaned.length, start + limit);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < cleaned.length ? "..." : "";
  return `${prefix}${cleaned.slice(start, end).trim()}${suffix}`;
}

function retrievalStatusFromRecord(source) {
  if (source.retrievalStatus) return source.retrievalStatus;
  if (source.cacheStatus || source.evidenceOrigin === "CACHED_LIVE_SNAPSHOT") return "cached";
  if (source.needsManualInspection) return "manual_review_required";
  if (source.status === "Missing Evidence" || String(source.sourceType || "").includes("Missing")) return "missing";
  if (source.provenance === "seeded_demo_data" || source.evidenceOrigin === "SEEDED_DEMO_DATA") return "success";
  return "success";
}

function evidenceOriginFromProvenance(provenance) {
  if (provenance === "cached_live_snapshot") return "CACHED_LIVE_SNAPSHOT";
  if (provenance === "live_fetch") return "LIVE_FETCH";
  return "SEEDED_DEMO_DATA";
}

function hashEvidence(value) {
  return evidenceIdFromHash(sha256Hex(normalizeSnapshotContent(value)));
}

function normalizeEvidenceRecord(vendor, source, stage = "fetch") {
  const provenance = source.provenance || "seeded_demo_data";
  const url = source.url || source.officialSourceUrl || source.discoverySearchUrl || "";
  const title = source.title || source.sourceTitle || "";
  const snapshotSource = source.snapshotContent || source.rawContent || source.rawPreview || source.readablePreview || source.excerpt || source.claim || `${title} ${url}`;
  const normalizedSnapshot = normalizeSnapshotContent(snapshotSource);
  const snapshotSha256 = source.snapshotSha256 || sha256Hex(normalizedSnapshot || snapshotSource);
  const excerpt = source.excerpt || excerptFromContent(snapshotSource);
  const snapshotPreviewSha256 = source.snapshotPreviewSha256 || (excerpt ? sha256Hex(normalizeSnapshotContent(excerpt)) : "");
  const evidenceId = source.evidenceId || evidenceIdFromHash(snapshotSha256);
  const evidenceOrigin = source.evidenceOrigin || evidenceOriginFromProvenance(provenance);
  return {
    ...source,
    pipelineStage: source.pipelineStage || stage,
    includedInMemo: source.includedInMemo ?? true,
    evidenceId,
    evidenceHash: evidenceId,
    snapshotSha256,
    snapshotPreviewSha256,
    excerpt,
    evidenceOrigin,
    retrievalStatus: retrievalStatusFromRecord({ ...source, evidenceOrigin }),
    url,
    title,
    provenance,
  };
}

function sourcePathFor(sourceType) {
  const pathByType = {
    "Privacy Policy": "privacy",
    "Trust Center": "trust",
    Subprocessors: "subprocessors",
    Documentation: "docs",
    News: "news",
  };
  return pathByType[sourceType] || sourceType.toLowerCase().replace(/\s+/g, "-");
}

function brightDataQueries(vendor) {
  return Object.entries(EVIDENCE_CLASS_CONFIG).map(([sourceType, config]) => ({
    label: config.discoveryLabel,
    sourceType,
    product: "SERP API",
    query: config.queries(vendor)[0],
    queries: config.queries(vendor),
  }));
}

function discoverSources(vendor) {
  return brightDataQueries(vendor).map((item, index) =>
    normalizeEvidenceRecord(vendor, {
      id: `${vendor.id}-api-discovery-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      title: `${vendor.name} ${item.label} discovery query`,
      url: `https://www.google.com/search?q=${encodeURIComponent(item.query)}`,
      discoverySearchUrl: `https://www.google.com/search?q=${encodeURIComponent(item.query)}`,
      sourceType: `${item.label} Discovery`,
      product: item.product,
      discoveryProduct: "SERP API",
      fetchedAt: new Date().toISOString(),
      retrievalStatus: "success",
      discoveryQuery: item.query,
      claim: `Demo fallback prepared ${item.label.toLowerCase()} source discovery for Bright Data execution.`,
      confidence: 72 + index,
      clause: `${item.label} source discovery`,
      freshness: "Seeded Demo Data",
      status: "Seeded Demo Data",
      provenance: "seeded_demo_data",
      evidenceOrigin: "SEEDED_DEMO_DATA",
      snapshotContent: `${vendor.name} ${item.label} seeded discovery query ${item.query}`,
      includedInMemo: false,
    }, "discovery"),
  );
}

function evidenceUrlFor(vendor, sourceType) {
  const sourcePath = sourcePathFor(sourceType);
  return sourceType === "News"
    ? `https://www.google.com/search?q=${encodeURIComponent(`${vendor.name} risk security privacy news`)}`
    : `https://${vendor.domain}/${sourcePath}`;
}

function searchUrlFor(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function normalizeHostname(hostname = "") {
  return String(hostname || "").toLowerCase().replace(/^www\./, "");
}

function hostnameFor(url) {
  try {
    return normalizeHostname(new URL(url).hostname);
  } catch {
    return "";
  }
}

function registrableDomain(hostname = "") {
  const normalized = normalizeHostname(hostname);
  const parts = normalized.split(".").filter(Boolean);
  if (parts.length <= 2) return normalized;
  const secondLevelTlds = new Set(["co.uk", "com.au", "com.br", "co.jp"]);
  const suffix = parts.slice(-2).join(".");
  if (secondLevelTlds.has(suffix) && parts.length >= 3) return parts.slice(-3).join(".");
  return suffix;
}

function vendorSlug(vendor) {
  return String(vendor.name || vendor.domain || "")
    .toLowerCase()
    .replace(/\.(ai|com|io|so|app)$/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function candidateUrlFrom(value) {
  if (!value || typeof value !== "string") return "";
  let raw = value.trim();
  if (!raw) return "";
  if (raw.startsWith("/url?") || raw.includes("google.com/url?")) {
    try {
      const parsed = new URL(raw.startsWith("http") ? raw : `https://www.google.com${raw}`);
      raw = parsed.searchParams.get("q") || parsed.searchParams.get("url") || raw;
    } catch {
      return "";
    }
  }
  if (!/^https?:\/\//i.test(raw)) return "";
  try {
    const parsed = new URL(raw);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function looksLikeSearchOrUnsupportedPage(url) {
  const hostname = hostnameFor(url);
  if (!hostname || SEARCH_RESULT_HOSTS.has(hostname)) return true;
  if (LOW_TRUST_HOST_HINTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))) return true;
  try {
    const parsed = new URL(url);
    const path = `${parsed.pathname} ${parsed.search}`.toLowerCase();
    return [
      "/login",
      "/signin",
      "/sign-in",
      "/signup",
      "/sign-up",
      "/auth",
      "/account",
      "/oauth",
      "/sso",
    ].some((marker) => path.includes(marker));
  } catch {
    return true;
  }
}

function collectResultObjects(value, output = []) {
  if (!value) return output;
  if (Array.isArray(value)) {
    value.forEach((item) => collectResultObjects(item, output));
    return output;
  }
  if (typeof value !== "object") return output;
  const candidate = value;
  const url = candidateUrlFrom(
    candidate.link ||
      candidate.url ||
      candidate.href ||
      candidate.source_url ||
      candidate.result_url ||
      candidate.displayed_link ||
      candidate.clean_url,
  );
  if (url) {
    output.push({
      url,
      title: String(candidate.title || candidate.name || candidate.heading || "").trim(),
      snippet: String(candidate.snippet || candidate.description || candidate.text || candidate.content || "").trim(),
      source: String(candidate.source || candidate.displayed_link || candidate.domain || "").trim(),
    });
  }
  Object.entries(value).forEach(([key, nested]) => {
    if (["link", "url", "href", "source_url", "result_url", "displayed_link", "clean_url", "title", "snippet", "description"].includes(key)) {
      return;
    }
    if (Array.isArray(nested) || (nested && typeof nested === "object")) collectResultObjects(nested, output);
  });
  return output;
}

function parseSerpResults(payload) {
  const seen = new Set();
  return collectResultObjects(payload)
    .map((result) => ({
      ...result,
      url: candidateUrlFrom(result.url),
    }))
    .filter((result) => result.url)
    .filter((result) => {
      const key = result.url.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}

function officialDomainScore(vendor, candidate) {
  const vendorHost = normalizeHostname(vendor.domain);
  const vendorRoot = registrableDomain(vendorHost);
  const candidateHost = hostnameFor(candidate.url);
  const candidateRoot = registrableDomain(candidateHost);
  const slug = vendorSlug(vendor);
  const haystack = `${candidateHost} ${candidate.title} ${candidate.snippet}`.toLowerCase();

  if (candidateRoot && candidateRoot === vendorRoot) return 80;
  if (slug && candidateHost.replace(/[^a-z0-9]/g, "").includes(slug)) return 50;
  if (slug && haystack.includes(`${slug} official`)) return 28;
  if (/\bofficial\b/i.test(haystack) && String(vendor.name || "").toLowerCase().split(/\s+/).some((part) => part.length > 3 && haystack.includes(part))) {
    return 20;
  }
  return 0;
}

function termScore(sourceType, candidate) {
  const config = EVIDENCE_CLASS_CONFIG[sourceType] || {};
  const terms = config.sourceTerms || [];
  const haystack = `${candidate.url} ${candidate.title} ${candidate.snippet}`.toLowerCase();
  return terms.reduce((score, term) => (haystack.includes(term.toLowerCase()) ? score + 8 : score), 0);
}

function rankSourceCandidate(vendor, sourceType, candidate) {
  if (!candidate.url || looksLikeSearchOrUnsupportedPage(candidate.url)) return { ...candidate, score: -1000, rejected: true };
  let score = officialDomainScore(vendor, candidate) + termScore(sourceType, candidate);
  const haystack = `${candidate.url} ${candidate.title} ${candidate.snippet}`.toLowerCase();
  if (/\bofficial\b/.test(haystack)) score += 8;
  if (/\/(privacy|security|trust|legal|compliance|subprocessors?|docs|documentation|enterprise)\b/.test(haystack)) score += 8;
  if (sourceType === "News" && /\b(news|incident|breach|outage|lawsuit|regulatory|security)\b/.test(haystack)) score += 18;
  if (!officialDomainScore(vendor, candidate) && sourceType !== "News") score -= 35;
  if (!officialDomainScore(vendor, candidate) && sourceType === "News") score -= 5;
  if (/\b(blog|community|forum|review|pricing|careers|jobs)\b/.test(haystack)) score -= 15;
  return { ...candidate, score, rejected: false };
}

function selectCanonicalSource(vendor, sourceType, candidates) {
  const ranked = candidates
    .map((candidate) => rankSourceCandidate(vendor, sourceType, candidate))
    .filter((candidate) => !candidate.rejected)
    .sort((a, b) => b.score - a.score);
  const minimum = sourceType === "News" ? 10 : 45;
  return ranked.find((candidate) => candidate.score >= minimum) || null;
}

function sourceDomainFor(url) {
  return hostnameFor(url);
}

function liveClaimForRetrievedSource(sourceType, extraction, selected) {
  const signals = extraction.extractedSignals || [];
  const configuredSignals = signals.filter((signal) => signal !== "public risk search");
  const prefixByType = {
    "Privacy Policy": "Official privacy page retrieved",
    "Trust Center": "Official trust/security page retrieved",
    Subprocessors: "Official subprocessor page retrieved",
    Documentation: "Official documentation or enterprise-control page retrieved",
    News: "Public risk/news page retrieved",
  };
  const prefix = prefixByType[sourceType] || "Official source page retrieved";
  if (extraction.needsManualInspection) {
    return `${prefix} from ${sourceDomainFor(selected.url)}; page content requires manual inspection before policy reliance.`;
  }
  if (configuredSignals.length) {
    return `${prefix}; detected terms: ${configuredSignals.slice(0, 5).join(", ")}.`;
  }
  return `${prefix}; no configured evidence terms were detected in the readable preview.`;
}

function discoveryRecord(vendor, sourceType, query, result, candidates, selected) {
  const config = EVIDENCE_CLASS_CONFIG[sourceType] || {};
  const searchUrl = searchUrlFor(query);
  const fetchedAt = new Date().toISOString();
  return normalizeEvidenceRecord(vendor, {
    id: `${vendor.id}-live-discovery-${sourcePathFor(sourceType)}-${Date.now()}`,
    title: `${vendor.name} ${config.discoveryLabel || sourceType} canonical source discovery`,
    sourceTitle: `${vendor.name} ${config.discoveryLabel || sourceType} canonical source discovery`,
    url: searchUrl,
    discoverySearchUrl: searchUrl,
    sourceType: `${sourceType} Discovery`,
    product: "SERP API",
    discoveryProduct: "SERP API",
    fetchedAt,
    discoveryQuery: query,
    retrievalStatus: selected ? "success" : "missing",
    claim: selected
      ? `SERP API discovery selected ${selected.url} from ${candidates.length} parsed result${candidates.length === 1 ? "" : "s"}.`
      : `SERP API discovery parsed ${candidates.length} result${candidates.length === 1 ? "" : "s"} but found no credible canonical source for ${sourceType}.`,
    confidence: selected ? Math.min(96, Math.max(68, Math.round(selected.score))) : 35,
    clause: `${sourceType} source discovery`,
    freshness: selected ? "Fresh Evidence" : "Missing Evidence",
    status: selected ? "Fresh Evidence" : "Missing Evidence",
    provenance: "live_fetch",
    evidenceOrigin: "LIVE_FETCH",
    includedInMemo: false,
    brightDataStatus: result.statusCode,
    readablePreview: selected ? `${selected.title || selected.url} ${selected.snippet || ""}`.trim() : "",
    snapshotContent: selected ? `${selected.title || ""} ${selected.snippet || ""} ${selected.url}` : `No canonical source found for ${sourceType}. Query: ${query}`,
    extractedSignals: selected ? extractSignals(sourceType, `${selected.title} ${selected.snippet} ${selected.url}`) : [],
    needsManualInspection: false,
    candidates: candidates.slice(0, 5),
    selectedCandidate: selected || null,
  }, "discovery");
}

function missingEvidenceRecord(vendor, sourceType, query, reason) {
  const fetchedAt = new Date().toISOString();
  return normalizeEvidenceRecord(vendor, {
    id: `${vendor.id}-missing-${sourcePathFor(sourceType)}-${Date.now()}`,
    title: `${vendor.name} ${sourceType.toLowerCase()} missing canonical source`,
    sourceTitle: `${vendor.name} ${sourceType.toLowerCase()} missing canonical source`,
    url: searchUrlFor(query),
    discoverySearchUrl: searchUrlFor(query),
    sourceType: `${sourceType} Missing`,
    product: "SERP API",
    discoveryProduct: "SERP API",
    retrievalProduct: "",
    fetchedAt,
    discoveryQuery: query,
    retrievalStatus: "missing",
    claim: reason,
    confidence: 30,
    clause: `${sourceType} evidence`,
    freshness: "Missing Evidence",
    status: "Missing Evidence",
    provenance: "live_fetch",
    evidenceOrigin: "LIVE_FETCH",
    snapshotContent: reason,
    includedInMemo: false,
    extractedSignals: [],
    needsManualInspection: true,
  }, "discovery");
}

function fetchSource(vendor, sourceType) {
  const sourcePath = sourcePathFor(sourceType);
  const url = evidenceUrlFor(vendor, sourceType);

  return normalizeEvidenceRecord(vendor, {
    id: `${vendor.id}-api-${sourcePath}-${Date.now()}`,
    title: `${vendor.name} ${sourceType.toLowerCase()}`,
    sourceTitle: `${vendor.name} ${sourceType.toLowerCase()}`,
    url,
    officialSourceUrl: url,
    sourceType,
    product: sourceType === "News" ? "SERP API" : "Web Unlocker",
    discoveryProduct: "SERP API",
    retrievalProduct: sourceType === "News" ? "SERP API" : "Web Unlocker",
    fetchedAt: new Date().toISOString(),
    retrievalStatus: "success",
    sourceDomain: sourceDomainFor(url),
    claim: `${sourceType} demo fallback evidence was produced through the server-side adapter boundary without a live Bright Data fetch.`,
    readablePreview: `${sourceType} seeded demo evidence for ${vendor.name}. Privacy, security, retention, customer data, subprocessor, SOC 2, SSO, audit logs, encryption, and incident terms may require live verification.`,
    snapshotContent: `${sourceType} seeded demo evidence for ${vendor.name}. ${url}. ${sourceType} demo fallback evidence was produced through the server-side adapter boundary without a live Bright Data fetch.`,
    confidence: sourceType === "News" ? 76 : 84,
    clause: `${sourceType} evidence`,
    freshness: "Seeded Demo Data",
    status: sourceType === "Documentation" ? "Needs Review" : "Seeded Demo Data",
    provenance: "seeded_demo_data",
    evidenceOrigin: "SEEDED_DEMO_DATA",
  }, "fetch");
}

function responsePreview(payload) {
  if (payload == null) return "";
  if (typeof payload === "string") return payload.slice(0, 1200);
  if (typeof payload.body === "string") return payload.body.slice(0, 1200);
  if (typeof payload.markdown === "string") return payload.markdown.slice(0, 1200);
  if (typeof payload === "object") return JSON.stringify(payload).slice(0, 1200);
  return String(payload).slice(0, 1200);
}

const ENTITY_MAP = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const SIGNAL_PATTERNS = [
  ["SOC 2", /\bsoc\s*2\b/i],
  ["ISO 27001", /\biso\s*27001\b/i],
  ["SSO", /\bsso\b|single sign-on/i],
  ["audit logs", /audit logs?/i],
  ["data retention", /data retention|retention period/i],
  ["customer data", /customer data|company data|personal data/i],
  ["AI training", /ai training|model training|train(ing)? (our|the) models/i],
  ["subprocessors", /sub-?processors?|data processors?/i],
  ["DPA", /\bdpa\b|data processing agreement/i],
  ["GDPR", /\bgdpr\b/i],
  ["security controls", /security controls?|trust center|security policy/i],
  ["incident review", /incident|breach|outage|lawsuit/i],
];

function decodeEntities(value) {
  return String(value || "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const key = entity.toLowerCase();
    if (key.startsWith("#x")) return String.fromCharCode(parseInt(key.slice(2), 16));
    if (key.startsWith("#")) return String.fromCharCode(parseInt(key.slice(1), 10));
    return ENTITY_MAP[key] || match;
  });
}

function cleanPreviewText(preview, limit = 420) {
  let text = String(preview || "");
  text = text.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, " ");
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/<[^>]+>/g, " ");
  text = decodeEntities(text);
  [
    /Skip to main content/gi,
    /Accessibility help/gi,
    /Press \/ to jump to the search box/gi,
    /Go to Google Home/gi,
    /Sign in/gi,
    /Google Search/gi,
  ].forEach((pattern) => {
    text = text.replace(pattern, " ");
  });
  text = text.replace(/https?:\/\/\S+/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit - 1).trim()}...` : text;
}

function looksLikeApplicationShell(preview) {
  const normalized = String(preview || "").toLowerCase();
  return [
    "__next_error__",
    "application error",
    "page could not be found",
    "404",
    "not found",
  ].some((marker) => normalized.includes(marker));
}

function policySignalCount(sourceType, preview) {
  const haystack = `${sourceType} ${cleanPreviewText(preview, 5000)} ${String(preview || "")}`;
  return SIGNAL_PATTERNS.filter(([, pattern]) => pattern.test(haystack)).length;
}

function unusableOfficialPageReason(sourceType, preview) {
  const cleaned = cleanPreviewText(preview, 5000);
  if (looksLikeApplicationShell(preview)) return "Web Unlocker returned an application shell, error page, or unusable response.";
  if (cleaned.length < 180) return `Web Unlocker returned only ${cleaned.length} readable characters.`;
  if (["Trust Center", "Documentation", "Subprocessors"].includes(sourceType) && policySignalCount(sourceType, preview) === 0) {
    return "Web Unlocker returned readable text but no expected policy-relevant content for this source type.";
  }
  return "";
}

function connectBrowserCdp(config) {
  if (typeof WebSocket !== "function") throw new Error("Browser API fallback requires a server runtime with WebSocket support.");
  const endpoint = `wss://${encodeURIComponent(config.browserUsername)}:${encodeURIComponent(config.browserPassword)}@${config.browserHost}:${config.browserPort}`;
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(endpoint);
    const timer = setTimeout(() => {
      socket.close();
      reject(new Error("Browser API WebSocket connection timed out."));
    }, REQUEST_TIMEOUT_MS);
    socket.addEventListener("open", () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error("Browser API WebSocket connection failed."));
    });
  });
}

async function retrieveWithBrowserApi(url) {
  const config = brightDataConfig();
  if (!browserFallbackReady(config)) throw new Error("Browser API fallback is disabled or missing zone credentials.");
  const socket = await connectBrowserCdp(config);
  let nextId = 0;
  const pending = new Map();
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Browser API CDP command timed out: ${method}`));
    }, REQUEST_TIMEOUT_MS);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  socket.addEventListener("message", (event) => {
    let message;
    try {
      message = JSON.parse(String(event.data || ""));
    } catch {
      return;
    }
    const request = pending.get(message.id);
    if (!request) return;
    clearTimeout(request.timer);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message || "Browser API CDP command failed."));
    else request.resolve(message.result || {});
  });
  socket.addEventListener("close", () => {
    pending.forEach(({ reject, timer }) => {
      clearTimeout(timer);
      reject(new Error("Browser API WebSocket closed before the command completed."));
    });
    pending.clear();
  });
  try {
    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    await send("Page.enable", {}, sessionId);
    await send("Page.navigate", { url }, sessionId);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const evaluated = await send("Runtime.evaluate", {
      expression: "document.documentElement.outerHTML",
      returnByValue: true,
    }, sessionId);
    const content = evaluated?.result?.value || "";
    if (!content) throw new Error("Browser API returned an empty rendered page source.");
    return {
      raw: String(content),
      preview: responsePreview(content),
      normalizedContent: normalizeSnapshotContent(content),
      snapshotSha256: sha256Hex(normalizeSnapshotContent(content) || content),
    };
  } finally {
    socket.close();
  }
}

let browserPageRetriever = retrieveWithBrowserApi;

function createBrowserReviewContext() {
  const config = brightDataConfig();
  return {
    enabled: browserFallbackReady(config),
    maxPerReview: config.browserMaxPerReview,
    attempts: 0,
    successes: 0,
    events: [],
  };
}

async function tryBrowserFallback(browserContext, selectedUrl, reason) {
  if (!browserContext?.enabled || browserContext.maxPerReview <= 0) return null;
  if (browserContext.attempts >= browserContext.maxPerReview) {
    browserContext.events.push("Scraping Browser fallback skipped because the per-review maximum was reached.");
    return null;
  }
  browserContext.attempts += 1;
  try {
    const result = await browserPageRetriever(selectedUrl);
    browserContext.successes += 1;
    browserContext.events.push("Dynamic page detected -> Scraping Browser fallback executed.");
    return { ...result, fallbackReason: reason };
  } catch (error) {
    browserContext.events.push(`Scraping Browser fallback failed: ${error.message || "unknown error"}.`);
    return null;
  }
}

function extractSignals(sourceType, preview) {
  const haystack = `${sourceType} ${cleanPreviewText(preview, 1200)} ${String(preview || "")}`;
  const baseSignals = {
    "Privacy Policy": ["privacy policy"],
    "Trust Center": ["trust center"],
    Subprocessors: ["subprocessor transparency"],
    Documentation: ["enterprise documentation"],
    News: ["public risk search"],
  };
  const signals = [...(baseSignals[sourceType] || [])];
  SIGNAL_PATTERNS.forEach(([label, pattern]) => {
    if (pattern.test(haystack) && !signals.includes(label)) signals.push(label);
  });
  return signals.slice(0, 6);
}

function rulesBasedFinding(source) {
  return {
    factType: "rules_based_signal_match",
    supportedFinding: source.claim || "No supported rules-based finding was produced.",
    supportingQuote: source.excerpt || "",
    sourceType: source.sourceType,
    controlMapping: [source.clause || `${source.sourceType} evidence`],
    confidence: Number(source.confidence || 0),
    uncertainty: source.needsManualInspection ? "Manual inspection is recommended." : "",
    requiresHumanReview: Boolean(source.needsManualInspection),
    extractionMethod: "Rules-based",
  };
}

async function enrichFindingWithAiml(vendor, source) {
  const fallback = rulesBasedFinding(source);
  if (!canUseAimlApi() || source.evidenceOrigin !== "LIVE_FETCH" || source.retrievalStatus !== "success") {
    return { ...source, extractionMethod: "Rules-based", rulesBasedFinding: fallback };
  }
  try {
    const aiExtraction = await extractGroundedFinding({ vendorName: vendor.name, source });
    return {
      ...source,
      extractionMethod: "AI/ML API",
      rulesBasedFinding: fallback,
      aiExtraction,
    };
  } catch (error) {
    return {
      ...source,
      extractionMethod: "Rules-based",
      rulesBasedFinding: fallback,
      aiExtractionError: error.message || "AI/ML API extraction failed.",
    };
  }
}

function buildLiveClaim({ vendor, sourceType, product, label, preview, stage }) {
  const signals = extractSignals(sourceType, preview);
  const shellWarning = looksLikeApplicationShell(preview);
  let claim;

  if (stage === "discovery") {
    claim = `Live SERP API completed ${label.toLowerCase()} source discovery for ${vendor.name} and captured candidate results for policy mapping.`;
  } else if (sourceType === "Privacy Policy") {
    claim = `Live ${product} fetched ${vendor.name}'s privacy policy for data handling, retention, customer-data use, and AI-training review.`;
  } else if (sourceType === "Trust Center") {
    claim = `Live ${product} fetched ${vendor.name}'s trust or security source for enterprise control, certification, and security-review mapping.`;
  } else if (sourceType === "Subprocessors") {
    claim = `Live ${product} fetched ${vendor.name}'s subprocessor source for data-processor transparency and vendor-chain review.`;
  } else if (sourceType === "Documentation") {
    claim = `Live ${product} fetched ${vendor.name}'s documentation for admin controls, SSO, audit logging, and operational governance review.`;
  } else if (sourceType === "News") {
    claim = `Live ${product} captured public-risk search evidence for ${vendor.name}, including security, privacy, incident, and governance signals.`;
  } else {
    claim = `Live ${product} captured ${sourceType} evidence for ${vendor.name} and prepared it for policy mapping.`;
  }

  if (shellWarning) {
    claim += " The captured payload looks like an application shell or error page, so this record is flagged for manual inspection.";
  } else if (signals.length) {
    claim += ` Review signals: ${signals.slice(0, 4).join(", ")}.`;
  }

  return {
    claim,
    rawPreview: preview || "",
    readablePreview: cleanPreviewText(preview),
    extractedSignals: signals,
    needsManualInspection: shellWarning,
  };
}

function liveStatusFor(sourceType, preview) {
  if (looksLikeApplicationShell(preview)) return "Needs Review";
  return sourceType === "Documentation" ? "Needs Review" : "Fresh Evidence";
}

function liveConfidenceFor(sourceType, preview, fallback) {
  const penalty = looksLikeApplicationShell(preview) ? 18 : 0;
  return Math.max(58, fallback - penalty);
}

async function brightDataRequest({ zone, url, product, format = "json", dataFormat }) {
  const config = brightDataConfig();
  if (!canUseBrightDataLive()) {
    throw new Error("Bright Data live mode is disabled or missing credentials.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const requestBody = {
      zone,
      url,
      format,
      method: "GET",
      country: config.country,
    };
    if (dataFormat) requestBody.data_format = dataFormat;

    const response = await fetch(BRIGHTDATA_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    const raw = await response.text();
    let payload;
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = raw;
    }
    if (!response.ok) {
      throw new Error(`${product} request failed with HTTP ${response.status}`);
    }
    return {
      payload,
      statusCode: typeof payload?.status_code === "number" ? payload.status_code : response.status,
      raw,
      normalizedContent: normalizeSnapshotContent(raw),
      snapshotSha256: sha256Hex(normalizeSnapshotContent(raw) || raw),
      preview: responsePreview(payload),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function discoverCanonicalSourceLive(vendor, sourceType) {
  const config = brightDataConfig();
  const evidenceConfig = EVIDENCE_CLASS_CONFIG[sourceType] || EVIDENCE_CLASS_CONFIG.Documentation;
  const queries = evidenceConfig.queries(vendor);
  let lastDiscovery = null;

  for (const query of queries) {
    const url = searchUrlFor(query);
    const result = await brightDataRequest({
      zone: config.serpZone,
      url,
      product: "SERP API",
      format: "json",
      dataFormat: "markdown",
    });
    const candidates = parseSerpResults(result.payload);
    const selected = selectCanonicalSource(vendor, sourceType, candidates);
    lastDiscovery = {
      record: discoveryRecord(vendor, sourceType, query, result, candidates, selected),
      selected,
      query,
    };
    if (selected) return lastDiscovery;
  }

  const query = queries[0] || `${vendor.name} ${sourceType}`;
  return lastDiscovery || {
    record: missingEvidenceRecord(vendor, sourceType, query, `SERP API discovery found no parseable result for ${sourceType}.`),
    selected: null,
    query,
  };
}

async function fetchSelectedSourceLive(vendor, sourceType, selected, query, browserContext) {
  const config = brightDataConfig();
  if (!selected?.url) {
    return missingEvidenceRecord(vendor, sourceType, query, `No canonical public source was selected for ${sourceType}.`);
  }
  let result;
  let retrievalProduct = "Web Unlocker";
  let fallbackReason = "";
  try {
    result = await brightDataRequest({
      zone: config.unlockerZone,
      url: selected.url,
      product: "Web Unlocker",
      format: "raw",
    });
    fallbackReason = unusableOfficialPageReason(sourceType, result.raw || result.preview);
  } catch (error) {
    fallbackReason = `Web Unlocker retrieval failed: ${error.message || "unknown error"}.`;
  }
  if (fallbackReason) {
    const browserResult = await tryBrowserFallback(browserContext, selected.url, fallbackReason);
    if (browserResult) {
      result = browserResult;
      retrievalProduct = "Scraping Browser";
    } else if (!result) {
      throw new Error(fallbackReason);
    }
  }
  const extraction = buildLiveClaim({
    vendor,
    sourceType,
    product: retrievalProduct,
    label: sourceType,
    preview: result.raw || result.preview,
    stage: "fetch",
  });
  const selectedExtraction = {
    ...extraction,
    claim: liveClaimForRetrievedSource(sourceType, extraction, selected),
  };
  const remainingIssue = unusableOfficialPageReason(sourceType, result.raw || result.preview);
  const status = remainingIssue ? "Needs Review" : liveStatusFor(sourceType, result.raw || result.preview);
  const fetchedAt = new Date().toISOString();
  const retrievedContent = result.normalizedContent || normalizeSnapshotContent(result.raw || result.preview);
  const excerpt = excerptFromContent(retrievedContent || result.preview);

  const record = normalizeEvidenceRecord(vendor, {
    id: `${vendor.id}-live-${sourcePathFor(sourceType)}-${Date.now()}`,
    title: selected.title || `${vendor.name} ${sourceType.toLowerCase()} official source`,
    sourceTitle: selected.title || `${vendor.name} ${sourceType.toLowerCase()} official source`,
    url: selected.url,
    officialSourceUrl: selected.url,
    sourceType,
    product: retrievalProduct,
    discoveryProduct: "SERP API",
    retrievalProduct,
    discoveryQuery: query,
    fetchedAt,
    retrievalStatus: status === "Needs Review" ? "manual_review_required" : "success",
    sourceDomain: sourceDomainFor(selected.url),
    claim: selectedExtraction.claim,
    confidence: liveConfidenceFor(sourceType, result.raw || result.preview, sourceType === "News" ? 80 : 88),
    clause: `${sourceType} evidence`,
    freshness: "Fresh Evidence",
    status,
    provenance: "live_fetch",
    evidenceOrigin: "LIVE_FETCH",
    brightDataStatus: result.statusCode,
    fallbackReason: retrievalProduct === "Scraping Browser" ? fallbackReason : "",
    rawPreview: selectedExtraction.rawPreview,
    readablePreview: selectedExtraction.readablePreview,
    rawContent: result.raw,
    snapshotContent: retrievedContent || result.raw || result.preview,
    snapshotSha256: result.snapshotSha256,
    excerpt,
    extractedSignals: selectedExtraction.extractedSignals,
    needsManualInspection: selectedExtraction.needsManualInspection || Boolean(remainingIssue),
  }, "fetch");
  return enrichFindingWithAiml(vendor, record);
}

async function discoverAndFetchSourceLive(vendor, sourceType, browserContext) {
  const discovery = await discoverCanonicalSourceLive(vendor, sourceType);
  if (!discovery.selected) {
    return [
      discovery.record,
      missingEvidenceRecord(vendor, sourceType, discovery.query, `No credible canonical public source was found for ${sourceType}.`),
    ];
  }
  try {
    const fetched = await fetchSelectedSourceLive(vendor, sourceType, discovery.selected, discovery.query, browserContext);
    return [discovery.record, fetched];
  } catch (error) {
    return [
      discovery.record,
      normalizeEvidenceRecord(vendor, {
        id: `${vendor.id}-fetch-failed-${sourcePathFor(sourceType)}-${Date.now()}`,
        title: `${vendor.name} ${sourceType.toLowerCase()} retrieval failed`,
        sourceTitle: `${vendor.name} ${sourceType.toLowerCase()} retrieval failed`,
        url: discovery.selected.url,
        officialSourceUrl: discovery.selected.url,
        sourceType: `${sourceType} Missing`,
        product: "Web Unlocker",
        discoveryProduct: "SERP API",
        retrievalProduct: "Web Unlocker",
        fetchedAt: new Date().toISOString(),
        discoveryQuery: discovery.query,
        retrievalStatus: "failed",
        sourceDomain: sourceDomainFor(discovery.selected.url),
        claim: `Canonical source was selected, but Web Unlocker retrieval failed: ${error.message || "unknown error"}.`,
        confidence: 35,
        clause: `${sourceType} evidence`,
        freshness: "Missing Evidence",
        status: "Missing Evidence",
        provenance: "live_fetch",
        evidenceOrigin: "LIVE_FETCH",
        snapshotContent: `Web Unlocker retrieval failed for ${discovery.selected.url}: ${error.message || "unknown error"}`,
        includedInMemo: false,
        extractedSignals: [],
        needsManualInspection: true,
      }, "fetch"),
    ];
  }
}

function requiredEvidenceTypes(vendor) {
  return REQUIRED_EVIDENCE_TYPES[vendor.policyProfile] || REQUIRED_EVIDENCE_TYPES["Standard SaaS Vendor"];
}

function demoReviewEvidence(safeVendor, missing) {
  return {
    evidence: discoverSources(safeVendor).concat(missing.map((sourceType) => fetchSource(safeVendor, sourceType))),
    notes: [
      "The API route is server-side so Bright Data credentials do not enter the browser.",
      "Demo fallback evidence is active. Set BRIGHTDATA_LIVE=1 with token and zones to run live calls.",
      "Frontend will fall back to local demo evidence when this endpoint is unavailable.",
    ],
    fallbackReason: null,
  };
}

async function liveReviewEvidence(safeVendor, missing, options = {}) {
  const cacheKey = cacheKeyFor(safeVendor, missing);
  if (!options.forceRefresh) {
    const cachedEvidence = getCachedReview(cacheKey);
    if (cachedEvidence) {
      return {
        evidence: cachedEvidence,
        notes: [
          "Live Bright Data mode is enabled.",
          "Evidence was reused from the server-side review cache for speed and cost control.",
          "Force refresh can bypass the cache when a reviewer needs current evidence.",
        ],
        fallbackReason: null,
        cacheHit: true,
        browserContext: createBrowserReviewContext(),
      };
    }
  }

  const browserContext = createBrowserReviewContext();
  const recordsBySourceType = await runWithConcurrency(missing, (sourceType) => discoverAndFetchSourceLive(safeVendor, sourceType, browserContext));
  const evidence = recordsBySourceType.flat();
  setCachedReview(cacheKey, evidence);
  let memoDraft = null;
  let memoDraftError = "";
  if (canUseAimlApi()) {
    try {
      memoDraft = await draftGroundedMemo({
        vendorName: safeVendor.name,
        evidence: evidence.filter((record) => record.includedInMemo && !String(record.sourceType || "").includes("Discovery")),
        missingEvidence: missing,
      });
    } catch (error) {
      memoDraftError = error.message || "AI/ML API memo drafting failed.";
    }
  }

  return {
    evidence,
    notes: [
      "Live Bright Data mode is enabled.",
      "SERP API is used to discover canonical public sources before retrieval.",
      "Web Unlocker retrieves selected official or public-risk evidence pages.",
      ...(browserContext.events.length ? browserContext.events : ["Scraping Browser fallback was ready but unused for this review."]),
      `Live calls run with concurrency ${REVIEW_CONCURRENCY} and cache TTL ${Math.round(REVIEW_CACHE_TTL_MS / 1000)} seconds.`,
    ],
    fallbackReason: null,
    cacheHit: false,
    browserContext,
    memoDraft,
    memoDraftError,
  };
}

function sanitizeVendor(vendor = {}) {
  const rawDomain = String(vendor.domain || "example.com").replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
  const domain = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(rawDomain) ? rawDomain : "example.com";
  return {
    id: String(vendor.id || "vendor").replace(/[^a-z0-9-]/gi, "-").toLowerCase(),
    name: String(vendor.name || "Unknown vendor").slice(0, 100),
    domain,
    policyProfile: String(vendor.policyProfile || "Standard SaaS Vendor"),
  };
}

async function buildReview(payload = {}) {
  const startedAt = Date.now();
  const safeVendor = sanitizeVendor(payload.vendor);
  const missing = Array.isArray(payload.missingEvidence)
    ? payload.missingEvidence.filter((item) => SUPPORTED_EVIDENCE_TYPES.has(item)).slice(0, SUPPORTED_EVIDENCE_TYPES.size)
    : requiredEvidenceTypes(safeVendor);
  let review;

  if (canUseBrightDataLive()) {
    try {
      review = await liveReviewEvidence(safeVendor, missing, {
        forceRefresh: Boolean(payload.forceRefresh),
      });
    } catch (error) {
      review = demoReviewEvidence(safeVendor, missing);
      review.fallbackReason = error.message || "Bright Data live request failed.";
      review.notes.unshift("Live Bright Data request failed; demo fallback evidence returned for reliability.");
    }
  } else {
    review = demoReviewEvidence(safeVendor, missing);
  }
  const browserFallbackRequests = review.browserContext?.attempts || 0;
  const costEstimate = costEstimateFor(missing, browserFallbackRequests);
  const driftChanges = compareEvidenceSnapshots(payload.existingEvidence || [], review.evidence);

  return {
    mode: review.fallbackReason ? "demo-fallback" : integrationMode(),
    provider: "Bright Data adapter",
    generatedAt: new Date().toISOString(),
    evidence: review.evidence,
    fallbackReason: review.fallbackReason,
    adapterNotes: review.notes,
    memoDraft: review.memoDraft || null,
    memoDraftError: review.memoDraftError || "",
    reviewMeta: {
      cacheHit: Boolean(review.cacheHit),
      cacheTtlSeconds: Math.round(REVIEW_CACHE_TTL_MS / 1000),
      concurrency: REVIEW_CONCURRENCY,
      durationMs: Date.now() - startedAt,
      costEstimate,
      browserFallback: {
        enabled: Boolean(review.browserContext?.enabled),
        maxPerReview: review.browserContext?.maxPerReview ?? brightDataConfig().browserMaxPerReview,
        attempts: browserFallbackRequests,
        successes: review.browserContext?.successes || 0,
        events: review.browserContext?.events || [],
      },
      driftChanges,
      aimlApi: {
        enabled: canUseAimlApi(),
        extractedFindings: review.evidence.filter((record) => record.extractionMethod === "AI/ML API" && record.aiExtraction).length,
        memoDrafted: Boolean(review.memoDraft),
      },
      requestPlan: {
        discoveryQueries: missing.length,
        sourceFetches: missing.length,
        missingEvidence: missing,
      },
    },
  };
}

module.exports = {
  buildReview,
  integrationMode,
  reviewIntegrationStatus,
  __test: {
    parseSerpResults,
    selectCanonicalSource,
    rankSourceCandidate,
    brightDataQueries,
    missingEvidenceRecord,
    discoverAndFetchSourceLive,
    compareEvidenceSnapshots,
    enrichFindingWithAiml,
    unusableOfficialPageReason,
    createBrowserReviewContext,
    setBrowserPageRetriever(retriever) {
      browserPageRetriever = retriever || retrieveWithBrowserApi;
    },
  },
};
