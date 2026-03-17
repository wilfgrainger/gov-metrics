/**
 * Cloudflare Worker backend for PULSE metrics.
 *
 * This worker is the primary backend:
 * - fetches live public-source data
 * - caches section payloads in KV when configured
 * - refreshes on schedule via cron triggers
 * - serves cached data to the frontend at /metrics and /all
 *
 * If KV is not configured, the worker falls back to isolate memory.
 * That is acceptable for local dev, but not for production scale.
 */

const ONS_CSV_BASE = "https://www.ons.gov.uk/generator?format=csv&uri=";
const BOE_CSV_URL =
  "https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp?csv.x=yes&SeriesCodes={code}&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N";
const WIKI_POLLING_URL =
  "https://en.wikipedia.org/wiki/Opinion_polling_for_the_next_United_Kingdom_general_election";
const NHS_RTT_URL =
  "https://www.england.nhs.uk/statistics/statistical-work-areas/rtt-waiting-times/rtt-data-2024-25/";

const CACHE_VERSION = "v4";
const HOT_CACHE_TTL_MS = 60 * 1000;
const DEFAULT_FRESH_TTL_SECONDS = 4 * 60 * 60;
const DEFAULT_STALE_TTL_SECONDS = 24 * 60 * 60;
const REQUEST_TIMEOUT_MS = 20_000;
const USER_AGENT =
  "gov-metrics-cloudflare-worker/4.0 (+https://github.com/wilfgrainger/gov-metrics)";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Refresh-Secret",
};

const monthMap = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

const ONS_SERIES = {
  cpi: "/economy/inflationandpriceindices/timeseries/d7g7/mm23",
  unemployment:
    "/employmentandlabourmarket/peoplenotinwork/unemployment/timeseries/mgsx/lms",
  employment:
    "/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/timeseries/lf24/lms",
  gdp_growth: "/economy/grossdomesticproductgdp/timeseries/ihyq/pn2",
  gdp_level: "/economy/grossdomesticproductgdp/timeseries/abmi/pn2",
  psnd:
    "/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/hf6x/psf",
  psnb:
    "/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/j5ii/psf",
  debt_gdp:
    "/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/hf6w/psf",
  tax_receipts:
    "/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/mf6u/psf",
  net_migration:
    "/peoplepopulationandcommunity/populationandmigration/internationalmigration/timeseries/cimu/mig",
  immigration:
    "/peoplepopulationandcommunity/populationandmigration/internationalmigration/timeseries/ciml/mig",
  emigration:
    "/peoplepopulationandcommunity/populationandmigration/internationalmigration/timeseries/cimm/mig",
};

const inMemoryStore = new Map();
const hotCache = new Map();

function sectionCacheKey(section) {
  return `${CACHE_VERSION}:section:${section}`;
}

function datasetCacheKey() {
  return `${CACHE_VERSION}:dataset`;
}

function manifestCacheKey() {
  return `${CACHE_VERSION}:manifest`;
}

function nowIso() {
  return new Date().toISOString();
}

function getFreshTtlMs(env) {
  const raw = Number.parseInt(env.DATA_REFRESH_TTL_SECONDS ?? "", 10);
  return (Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_FRESH_TTL_SECONDS) * 1000;
}

function getStaleTtlMs(env) {
  const raw = Number.parseInt(env.DATA_STALE_TTL_SECONDS ?? "", 10);
  return (Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_STALE_TTL_SECONDS) * 1000;
}

function withCors(headers = {}) {
  return {
    ...CORS_HEADERS,
    ...headers,
  };
}

function jsonResponse(payload, init = {}) {
  const headers = withCors(init.headers);
  return Response.json(payload, { ...init, headers });
}

function errorResponse(message, status = 500, details) {
  return jsonResponse(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

function cloneJson(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function getHotValue(key) {
  const entry = hotCache.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.timestamp > HOT_CACHE_TTL_MS) {
    hotCache.delete(key);
    return null;
  }
  return cloneJson(entry.value);
}

function setHotValue(key, value) {
  hotCache.set(key, { value: cloneJson(value), timestamp: Date.now() });
}

async function cacheGet(env, key) {
  const hot = getHotValue(key);
  if (hot !== null) {
    return hot;
  }

  if (env.METRICS_CACHE) {
    const value = await env.METRICS_CACHE.get(key, "json");
    if (value !== null) {
      setHotValue(key, value);
      return cloneJson(value);
    }
    return null;
  }

  if (!inMemoryStore.has(key)) {
    return null;
  }
  const value = inMemoryStore.get(key);
  setHotValue(key, value);
  return cloneJson(value);
}

async function cachePut(env, key, value) {
  setHotValue(key, value);

  if (env.METRICS_CACHE) {
    await env.METRICS_CACHE.put(key, JSON.stringify(value));
    return;
  }

  inMemoryStore.set(key, cloneJson(value));
}

function classifyRecord(record, env) {
  if (!record?.fetchedAt) {
    return "missing";
  }

  const ageMs = Date.now() - new Date(record.fetchedAt).getTime();
  if (!Number.isFinite(ageMs)) {
    return "missing";
  }
  if (ageMs <= getFreshTtlMs(env)) {
    return "fresh";
  }
  if (ageMs <= getStaleTtlMs(env)) {
    return "stale";
  }
  return "expired";
}

async function fetchText(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`Upstream ${response.status} for ${url}`);
  }
  return response.text();
}

function safeParseFloat(value) {
  if (value == null) {
    return null;
  }
  const parsed = Number.parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function stripHtml(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractNumber(text) {
  const match = text.match(/(\d+(?:[,\d]*)?(?:\.\d+)?)/);
  return match ? safeParseFloat(match[1]) : null;
}

async function fetchOnsCsv(topicPath, limit = 36) {
  const text = await fetchText(`${ONS_CSV_BASE}${topicPath}`);
  const lines = text.trim().split(/\r?\n/);
  const result = [];

  for (const line of lines) {
    const stripped = line.trim().replace(/^"/, "");
    if (!stripped || !/^\d/.test(stripped)) {
      continue;
    }

    const parts = line.split(",").map((part) => part.trim().replace(/"/g, ""));
    if (parts.length < 2) {
      continue;
    }

    const value = safeParseFloat(parts[1]);
    if (value === null || parts[1] === "..") {
      continue;
    }

    result.push({ date: parts[0], value: Number(value.toFixed(2)) });
  }

  return result.slice(-limit);
}

async function fetchBoeRate(seriesCode = "IUDBEDR", limit = 60) {
  const text = await fetchText(BOE_CSV_URL.replace("{code}", seriesCode));
  const lines = text.trim().split(/\r?\n/).slice(1);
  const result = [];

  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 2) {
      continue;
    }

    const value = safeParseFloat(parts[1]);
    if (value === null) {
      continue;
    }

    result.push({
      date: parts[0].trim(),
      value: Number(value.toFixed(4)),
    });
  }

  return result.slice(-limit);
}

function onsDateShort(dateString) {
  const parts = dateString.trim().split(/\s+/);
  if (parts.length < 2) {
    return dateString;
  }
  const month = parts[1].slice(0, 3).toLowerCase();
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${parts[0].slice(-2)}`;
}

function onsDateToEpochMs(dateString) {
  const parts = dateString.trim().split(/\s+/);
  if (parts.length < 2) {
    return null;
  }
  const year = Number(parts[0]);
  const month = monthMap[parts[1].slice(0, 3).toUpperCase()];
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return null;
  }
  return Date.UTC(year, month, 1);
}

async function safeFetch(task) {
  try {
    return await task();
  } catch {
    return null;
  }
}

async function fetchWikipediaPolling() {
  const text = await fetchText(WIKI_POLLING_URL);
  const tables = [...text.matchAll(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/gi)];
  if (tables.length === 0) {
    return null;
  }

  const recentPolls = [];
  for (const tableMatch of tables.slice(0, 3)) {
    const rows = [...tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    if (rows.length < 3) {
      continue;
    }

    const headerCells = [...rows[0][1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)];
    const headerTexts = headerCells.map((cell) => stripHtml(cell[1]).toLowerCase());

    const columnMap = {};
    headerTexts.forEach((header, index) => {
      if (header.includes("con")) {
        columnMap.con = index;
      } else if (header.includes("lab") && !header.includes("lib")) {
        columnMap.lab = index;
      } else if (header.includes("lib") || header.includes("ld")) {
        columnMap.ld = index;
      } else if (header.includes("reform") || header.includes("ref")) {
        columnMap.ref = index;
      }
    });

    if (Object.keys(columnMap).length < 3) {
      continue;
    }

    for (const row of rows.slice(1)) {
      const cells = [...row[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)];
      if (cells.length < Math.max(...Object.values(columnMap)) + 1) {
        continue;
      }

      const cellTexts = cells.map((cell) => stripHtml(cell[1]));
      const poll = {
        pollster: cellTexts[0] ?? "",
        date: cellTexts[1] ?? "",
      };

      let valid = true;
      for (const [party, index] of Object.entries(columnMap)) {
        const value = extractNumber(cellTexts[index] ?? "");
        if (value === null || value > 70) {
          valid = false;
          break;
        }
        poll[party] = value;
      }

      if (valid && poll.con != null && poll.lab != null) {
        recentPolls.push(poll);
      }
      if (recentPolls.length >= 8) {
        break;
      }
    }

    if (recentPolls.length > 0) {
      break;
    }
  }

  if (recentPolls.length === 0) {
    return null;
  }

  const parties = {
    REF: { name: "Reform UK", color: "#12B6CF", key: "ref", ge2024: 14 },
    LAB: { name: "Labour", color: "#E4003B", key: "lab", ge2024: 34 },
    CON: { name: "Conservative", color: "#0087DC", key: "con", ge2024: 24 },
    LD: { name: "Liberal Democrats", color: "#FAA61A", key: "ld", ge2024: 12 },
  };

  const pollingData = Object.entries(parties)
    .map(([party, info]) => {
      const values = recentPolls
        .map((poll) => poll[info.key])
        .filter((value) => typeof value === "number");
      if (values.length === 0) {
        return null;
      }

      const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
      return {
        party,
        name: info.name,
        pct: average,
        color: info.color,
        change: average - info.ge2024,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.pct - left.pct);

  return {
    pollingData,
    recentPolls: recentPolls.slice(0, 5).map((poll) => ({
      pollster: poll.pollster || "Unknown",
      date: poll.date || "",
      lab: poll.lab ?? 0,
      con: poll.con ?? 0,
      ref: poll.ref ?? 0,
      ld: poll.ld ?? 0,
    })),
  };
}

async function fetchNhsWaitingList() {
  const text = await fetchText(NHS_RTT_URL);

  let match = text.match(/(\d+(?:\.\d+)?)\s*million\s*(?:patient|people|waiting)/i);
  if (!match) {
    match = text.match(/waiting list.*?(\d+(?:\.\d+)?)\s*million/i);
  }
  if (!match) {
    return null;
  }

  return {
    headline: {
      waitingList: Number.parseFloat(match[1]),
    },
  };
}

function mergeSeriesByDate(points) {
  return points.reduce((map, point) => {
    map[point.date] = point.value;
    return map;
  }, {});
}

async function buildSentimentPulse() {
  const cpi = await fetchOnsCsv(ONS_SERIES.cpi, 24);
  if (cpi.length === 0) {
    throw new Error("CPI series unavailable");
  }

  const bankRates = await safeFetch(() => fetchBoeRate("IUDBEDR", 120));
  const unemployment = await safeFetch(() => fetchOnsCsv(ONS_SERIES.unemployment, 24));

  const bankRateByMonth = {};
  if (bankRates) {
    for (const point of bankRates) {
      const parts = point.date.split("/");
      if (parts.length === 3) {
        bankRateByMonth[`${parts[1].slice(0, 3)}/${parts[2]}`] = point.value;
      }
    }
  }

  const unemploymentByDate = unemployment ? mergeSeriesByDate(unemployment) : {};
  const latestBankRate =
    bankRates && bankRates.length > 0 ? bankRates[bankRates.length - 1].value : null;

  return {
    economicData: cpi.map((point) => {
      const parts = point.date.split(" ");
      const bankRateKey =
        parts.length >= 2 ? `${parts[1].slice(0, 3)}/${parts[0]}` : "";

      return {
        date: onsDateShort(point.date),
        inflation: point.value,
        bankRate: bankRateByMonth[bankRateKey] ?? latestBankRate,
        unemployment: unemploymentByDate[point.date] ?? null,
      };
    }),
  };
}

async function buildGdpTracker() {
  const growth = await fetchOnsCsv(ONS_SERIES.gdp_growth, 40);
  if (growth.length === 0) {
    throw new Error("GDP growth series unavailable");
  }

  const level = await safeFetch(() => fetchOnsCsv(ONS_SERIES.gdp_level, 40));
  const levelMap = {};
  if (level) {
    for (const point of level) {
      levelMap[point.date] = Number((point.value / 1_000_000).toFixed(3));
    }
  }

  return {
    gdpHistory: growth.map((point) => {
      const entry = {
        year: point.date,
        growth: point.value,
      };

      if (levelMap[point.date] != null) {
        entry.total = levelMap[point.date];
      }

      return entry;
    }),
  };
}

async function buildEmploymentStats() {
  const [employment, unemployment] = await Promise.all([
    safeFetch(() => fetchOnsCsv(ONS_SERIES.employment, 24)),
    safeFetch(() => fetchOnsCsv(ONS_SERIES.unemployment, 24)),
  ]);

  if (!employment && !unemployment) {
    throw new Error("Employment and unemployment series unavailable");
  }

  const payload = {};
  if (employment) {
    payload.employmentRate = employment.map((point) => ({
      date: point.date,
      value: point.value,
    }));
  }
  if (unemployment) {
    payload.unemploymentRate = unemployment.map((point) => ({
      date: point.date,
      value: point.value,
    }));
  }
  return payload;
}

async function buildNationalDebt() {
  const debtSeries = await fetchOnsCsv(ONS_SERIES.psnd, 36);
  if (debtSeries.length === 0) {
    throw new Error("Net debt series unavailable");
  }

  const borrowingSeries = await safeFetch(() => fetchOnsCsv(ONS_SERIES.psnb, 36));
  const debtGdpSeries = await safeFetch(() => fetchOnsCsv(ONS_SERIES.debt_gdp, 12));
  const latest = debtSeries[debtSeries.length - 1];
  const baseDate = onsDateToEpochMs(latest.date);

  if (baseDate == null) {
    throw new Error("Unable to parse national debt date");
  }

  let debtPerSecond = 0;
  if (borrowingSeries && borrowingSeries.length > 0) {
    const multiplier = borrowingSeries.length >= 12 ? 1 : 12 / borrowingSeries.length;
    const annualBorrowing =
      borrowingSeries.reduce((sum, point) => sum + point.value, 0) * 1_000_000 * multiplier;
    debtPerSecond = Math.round(annualBorrowing / (365.25 * 24 * 3600));
  }

  const payload = {
    baseDebt: Math.round(latest.value * 1_000_000),
    baseDate,
    debtPerSecond,
  };

  if (debtGdpSeries && debtGdpSeries.length > 0) {
    payload.debtToGdp = debtGdpSeries[debtGdpSeries.length - 1].value;
  }

  return payload;
}

async function buildTaxRevenue() {
  const receipts = await fetchOnsCsv(ONS_SERIES.tax_receipts, 36);
  if (receipts.length === 0) {
    throw new Error("Tax receipts series unavailable");
  }

  const yearly = {};
  for (const point of receipts) {
    const year = point.date.split(" ")[0];
    if (!yearly[year]) {
      yearly[year] = [];
    }
    yearly[year].push(point.value);
  }

  const taxBurdenHistory = Object.entries(yearly)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([year, values]) => ({
      year,
      pct: Number(
        (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)
      ),
    }));

  const totalAnnual =
    receipts.length >= 12
      ? receipts.slice(-12).reduce((sum, point) => sum + point.value, 0)
      : receipts.reduce((sum, point) => sum + point.value, 0) * (12 / receipts.length);

  return {
    totalReceipts: Math.round(totalAnnual / 1000),
    taxBurdenHistory,
  };
}

async function buildMigrationStats() {
  const [net, immigration, emigration] = await Promise.all([
    safeFetch(() => fetchOnsCsv(ONS_SERIES.net_migration, 20)),
    safeFetch(() => fetchOnsCsv(ONS_SERIES.immigration, 20)),
    safeFetch(() => fetchOnsCsv(ONS_SERIES.emigration, 20)),
  ]);

  if (!net && !immigration) {
    throw new Error("Migration series unavailable");
  }

  const netByYear = Object.fromEntries((net ?? []).map((point) => [point.date.trim(), point.value]));
  const immigrationByYear = Object.fromEntries(
    (immigration ?? []).map((point) => [point.date.trim(), point.value])
  );
  const emigrationByYear = Object.fromEntries(
    (emigration ?? []).map((point) => [point.date.trim(), point.value])
  );

  const years = [...new Set([...Object.keys(netByYear), ...Object.keys(immigrationByYear)])]
    .sort()
    .slice(-10);

  return {
    migrationHistory: years.map((year) => {
      const entry = { year };
      if (netByYear[year] != null) {
        entry.net = Math.round(netByYear[year]);
      }
      if (immigrationByYear[year] != null) {
        entry.immigration = Math.round(immigrationByYear[year]);
      }
      if (emigrationByYear[year] != null) {
        entry.emigration = Math.round(emigrationByYear[year]);
      }
      return entry;
    }),
  };
}

async function buildElectionPolling() {
  const polling = await fetchWikipediaPolling();
  if (!polling) {
    throw new Error("Election polling unavailable");
  }
  return polling;
}

async function buildNhsStats() {
  const stats = await fetchNhsWaitingList();
  if (!stats) {
    throw new Error("NHS waiting list unavailable");
  }
  return stats;
}

const sectionDescriptors = {
  sentimentPulse: {
    source: "ONS CPI (D7G7) + BoE Bank Rate + ONS Unemployment (MGSX)",
    build: buildSentimentPulse,
  },
  gdpTracker: {
    source: "ONS GDP Growth (IHYQ) + Level (ABMI)",
    build: buildGdpTracker,
  },
  employmentStats: {
    source: "ONS Employment (LF24) + Unemployment (MGSX)",
    build: buildEmploymentStats,
  },
  nationalDebt: {
    source: "ONS Net Debt (HF6X) + Net Borrowing (J5II)",
    build: buildNationalDebt,
  },
  taxRevenue: {
    source: "ONS Tax Receipts (MF6U)",
    build: buildTaxRevenue,
  },
  migrationStats: {
    source: "ONS Migration Estimates (CIMU/CIML/CIMM)",
    build: buildMigrationStats,
  },
  electionPolling: {
    source: "Wikipedia UK Opinion Polling",
    build: buildElectionPolling,
  },
  nhsStats: {
    source: "NHS England RTT Waiting Times",
    build: buildNhsStats,
  },
};

function createManifestEntry(status, descriptor, fetchedAt, error, cacheState = "fresh") {
  return {
    status,
    source: descriptor.source,
    fetchedAt,
    cacheState,
    ...(error ? { error } : {}),
  };
}

async function refreshSection(section, env) {
  const descriptor = sectionDescriptors[section];
  if (!descriptor) {
    throw new Error(`Unknown section '${section}'`);
  }

  const data = await descriptor.build();
  const record = {
    section,
    data,
    fetchedAt: nowIso(),
    sourceLabel: descriptor.source,
    backend: "cloudflare-worker",
  };

  await cachePut(env, sectionCacheKey(section), record);
  return record;
}

async function buildDatasetFromCache(env) {
  const manifest = (await cacheGet(env, manifestCacheKey())) ?? null;
  if (!manifest) {
    return null;
  }

  const dataset = {
    meta: manifest,
  };

  for (const section of Object.keys(sectionDescriptors)) {
    const record = await cacheGet(env, sectionCacheKey(section));
    if (record?.data != null) {
      dataset[section] = record.data;
    }
  }

  return dataset;
}

async function refreshAllSections(env) {
  const generatedAt = nowIso();
  const dataset = {
    meta: {
      generatedAt,
      fetchedAt: generatedAt,
      generator: "cloudflare-worker",
      version: CACHE_VERSION,
      backend: "cloudflare-worker",
      sources: {},
    },
  };

  for (const section of Object.keys(sectionDescriptors)) {
    const descriptor = sectionDescriptors[section];
    try {
      const record = await refreshSection(section, env);
      dataset[section] = record.data;
      dataset.meta.sources[section] = createManifestEntry(
        "ok",
        descriptor,
        record.fetchedAt,
        undefined,
        "fresh"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const staleRecord = await cacheGet(env, sectionCacheKey(section));

      if (staleRecord?.data != null) {
        dataset[section] = staleRecord.data;
        dataset.meta.sources[section] = createManifestEntry(
          "stale",
          descriptor,
          staleRecord.fetchedAt,
          message,
          classifyRecord(staleRecord, env)
        );
      } else {
        dataset.meta.sources[section] = createManifestEntry(
          "error",
          descriptor,
          generatedAt,
          message,
          "missing"
        );
      }
    }
  }

  await cachePut(env, manifestCacheKey(), dataset.meta);
  await cachePut(env, datasetCacheKey(), dataset);
  return dataset;
}

async function ensureSectionRecord(section, env, ctx) {
  const cached = await cacheGet(env, sectionCacheKey(section));
  const cacheState = classifyRecord(cached, env);

  if (cacheState === "fresh") {
    return { record: cached, cacheState };
  }

  if (cacheState === "stale" && cached) {
    ctx.waitUntil(refreshSection(section, env).catch(() => null));
    return { record: cached, cacheState };
  }

  try {
    const record = await refreshSection(section, env);
    return { record, cacheState: "fresh" };
  } catch (error) {
    if (cached) {
      return { record: cached, cacheState: cacheState === "missing" ? "stale" : cacheState };
    }
    throw error;
  }
}

function refreshAuthorized(request, env) {
  const configured = env.REFRESH_SECRET?.trim();
  if (!configured) {
    return false;
  }
  const headerValue = request.headers.get("X-Refresh-Secret");
  const queryValue = new URL(request.url).searchParams.get("secret");
  return headerValue === configured || queryValue === configured;
}

const worker = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: withCors() });
    }

    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/health") {
      const manifest = await cacheGet(env, manifestCacheKey());
      return jsonResponse({
        status: "ok",
        service: "pulse-cloudflare-backend",
        cache: env.METRICS_CACHE ? "kv" : "memory",
        lastRefresh: manifest?.generatedAt ?? null,
        sections: Object.keys(sectionDescriptors),
      });
    }

    if (url.pathname === "/refresh") {
      if (!refreshAuthorized(request, env)) {
        return errorResponse("Refresh secret required", 401);
      }

      const section = url.searchParams.get("section");

      try {
        if (section && section !== "all") {
          const record = await refreshSection(section, env);
          return jsonResponse({
            status: "ok",
            section,
            fetchedAt: record.fetchedAt,
            cache: env.METRICS_CACHE ? "kv" : "memory",
          });
        }

        const dataset = await refreshAllSections(env);
        return jsonResponse({
          status: "ok",
          generatedAt: dataset.meta.generatedAt,
          sources: dataset.meta.sources,
        });
      } catch (error) {
        return errorResponse(
          "Refresh failed",
          502,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    if (url.pathname === "/metrics") {
      const section = url.searchParams.get("section");
      if (!section) {
        return errorResponse("Missing ?section= parameter", 400);
      }

      if (!sectionDescriptors[section]) {
        return errorResponse(`Unknown section '${section}'`, 404);
      }

      try {
        const { record, cacheState } = await ensureSectionRecord(section, env, ctx);
        return jsonResponse(
          {
            section,
            data: record.data,
            source: "worker",
            timestamp: record.fetchedAt,
            cacheState,
            backend: record.backend,
          },
          {
            headers: {
              "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
            },
          }
        );
      } catch (error) {
        return errorResponse(
          `Unable to fetch section '${section}'`,
          502,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    if (url.pathname === "/all") {
      const cachedDataset = await cacheGet(env, datasetCacheKey());
      const cacheState = classifyRecord(cachedDataset?.meta, env);

      if (cacheState === "fresh" && cachedDataset) {
        return jsonResponse(cachedDataset, {
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        });
      }

      if (cacheState === "stale" && cachedDataset) {
        ctx.waitUntil(refreshAllSections(env).catch(() => null));
        return jsonResponse(cachedDataset, {
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        });
      }

      try {
        const dataset = await refreshAllSections(env);
        return jsonResponse(dataset, {
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        });
      } catch (error) {
        const fallbackDataset = cachedDataset ?? (await buildDatasetFromCache(env));
        if (fallbackDataset) {
          return jsonResponse(fallbackDataset, {
            headers: {
              "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
            },
          });
        }

        return errorResponse(
          "Unable to build dataset",
          502,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return errorResponse("Not found", 404, "Available endpoints: /health, /metrics, /all, /refresh");
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(
      refreshAllSections(env).catch((error) => {
        console.error("Scheduled refresh failed", controller.cron, error);
      })
    );
  },
};

export default worker;
