const workerUrlRaw =
  process.env.NEXT_PUBLIC_CF_WORKER_URL ?? process.env.WORKER_URL ?? "";
const refreshSecret = process.env.WORKER_REFRESH_SECRET ?? "";

const workerUrl = workerUrlRaw.replace(/\/+$/, "");

if (!workerUrl) {
  throw new Error("Missing NEXT_PUBLIC_CF_WORKER_URL (or WORKER_URL).");
}

if (!refreshSecret) {
  throw new Error("Missing WORKER_REFRESH_SECRET.");
}

const automatedSections = [
  "sentimentPulse",
  "gdpTracker",
  "employmentStats",
  "nationalDebt",
  "taxRevenue",
  "migrationStats",
  "electionPolling",
  "nhsStats",
  "bettingOdds",
];

const expectedCacheStates = new Set(["fresh", "stale", "expired", "missing", null]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isIsoTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function hasArray(value) {
  return Array.isArray(value) && value.length > 0;
}

const validators = {
  sentimentPulse: (data) =>
    hasArray(data?.economicData) &&
    typeof data?.metricConfig === "object" &&
    data?.metricConfig !== null,
  gdpTracker: (data) =>
    hasArray(data?.gdpHistory) &&
    hasArray(data?.g7Comparison) &&
    hasArray(data?.sectorBreakdown),
  employmentStats: (data) =>
    typeof data?.headline === "object" &&
    data?.headline !== null &&
    hasArray(data?.publicVsPrivate) &&
    hasArray(data?.employmentTrend),
  nationalDebt: (data) =>
    typeof data?.baseDebt === "number" &&
    typeof data?.debtPerSecond === "number" &&
    hasArray(data?.milestones),
  taxRevenue: (data) =>
    hasArray(data?.taxCategories) &&
    hasArray(data?.taxBurdenHistory) &&
    typeof data?.totalReceipts === "number",
  migrationStats: (data) =>
    hasArray(data?.migrationHistory) &&
    hasArray(data?.visaTypes) &&
    hasArray(data?.topNationalities),
  electionPolling: (data) => hasArray(data?.pollingData) && hasArray(data?.recentPolls),
  nhsStats: (data) =>
    typeof data?.headline === "object" &&
    data?.headline !== null &&
    hasArray(data?.waitingTrend) &&
    hasArray(data?.lifeExpectancyTrend),
  bettingOdds: (data) =>
    hasArray(data?.nextPmOdds) && hasArray(data?.mostSeats) && hasArray(data?.yearOdds),
};

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // Preserve null payload for diagnostics.
  }

  return { response, payload, text };
}

async function validateSection(section) {
  const start = Date.now();
  const { response, payload, text } = await fetchJson(
    `${workerUrl}/metrics?section=${encodeURIComponent(section)}`
  );

  if (!response.ok) {
    throw new Error(`Section ${section} failed (${response.status}): ${text}`);
  }

  assert(payload?.section === section, `Section mismatch for ${section}.`);
  assert(payload?.source === "worker", `Source mismatch for ${section}.`);
  assert(isIsoTimestamp(payload?.timestamp), `Invalid timestamp for ${section}.`);
  assert(
    expectedCacheStates.has(payload?.cacheState ?? null),
    `Invalid cacheState for ${section}: ${String(payload?.cacheState)}`
  );
  assert(validators[section](payload?.data), `Schema check failed for ${section}.`);

  return {
    section,
    status: "ok",
    cacheState: payload.cacheState ?? null,
    timestamp: payload.timestamp,
    durationMs: Date.now() - start,
  };
}

async function validateAllDataset() {
  const { response, payload, text } = await fetchJson(`${workerUrl}/all`);
  if (!response.ok) {
    throw new Error(`/all failed (${response.status}): ${text}`);
  }

  assert(payload?.meta?.sources, "Dataset missing meta.sources.");

  for (const section of automatedSections) {
    assert(payload.meta.sources[section], `Dataset missing source metadata for ${section}.`);
  }

  return {
    generatedAt: payload.meta.generatedAt ?? null,
    sourceCount: Object.keys(payload.meta.sources).length,
  };
}

async function probeRefresh() {
  const { response, payload, text } = await fetchJson(
    `${workerUrl}/refresh?section=sentimentPulse`,
    {
      method: "POST",
      headers: { "X-Refresh-Secret": refreshSecret },
    }
  );

  if (!response.ok) {
    throw new Error(`/refresh probe failed (${response.status}): ${text}`);
  }

  assert(payload?.status === "ok", "Refresh probe did not return status=ok.");
}

async function probeIngest() {
  const current = await fetchJson(
    `${workerUrl}/metrics?section=${encodeURIComponent("bettingOdds")}`
  );

  if (!current.response.ok) {
    throw new Error(`Unable to read bettingOdds for ingest probe: ${current.response.status}`);
  }

  const ingestPayload = {
    section: "bettingOdds",
    fetchedAt: new Date().toISOString(),
    sourceLabel: "live-feed-canary-reingest",
    backend: "live-feed-canary",
    data: current.payload?.data,
  };

  const ingest = await fetchJson(`${workerUrl}/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Refresh-Secret": refreshSecret,
    },
    body: JSON.stringify(ingestPayload),
  });

  if (!ingest.response.ok) {
    throw new Error(`/ingest probe failed (${ingest.response.status}): ${ingest.text}`);
  }

  assert(ingest.payload?.status === "ok", "Ingest probe did not return status=ok.");
}

async function main() {
  const summary = {
    workerUrl,
    checkedAt: new Date().toISOString(),
    sections: [],
    dataset: null,
    refreshProbe: "pending",
    ingestProbe: "pending",
  };

  const health = await fetchJson(`${workerUrl}/health`);
  if (!health.response.ok) {
    throw new Error(`/health failed (${health.response.status}): ${health.text}`);
  }
  assert(health.payload?.status === "ok", "Health endpoint did not return status=ok.");

  for (const section of automatedSections) {
    // Keep this sequential so failures are deterministic and easier to debug.
    const result = await validateSection(section);
    summary.sections.push(result);
  }

  summary.dataset = await validateAllDataset();

  await probeRefresh();
  summary.refreshProbe = "ok";

  await probeIngest();
  summary.ingestProbe = "ok";

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        status: "failed",
        workerUrl,
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )
  );
  process.exit(1);
});
