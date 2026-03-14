import { NextRequest, NextResponse } from "next/server";
import { ONS_CSV_BASE, BOE_API_BASE, ONS_SERIES, BOE_SERIES } from "@/app/lib/config";

// ── In-memory server-side cache ──────────────────────────────────────────────

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const serverCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached(key: string): unknown | null {
  const entry = serverCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

function setCache(key: string, data: unknown) {
  serverCache.set(key, { data, timestamp: Date.now() });
}

// ── ONS CSV Generator Fetcher ────────────────────────────────────────────────
// The legacy api.ons.gov.uk was retired Nov 2024.
// Uses the website CSV generator at www.ons.gov.uk/generator instead.

async function fetchONSCSV(
  topicPath: string,
  limit = 24
): Promise<{ date: string; value: number }[]> {
  const cacheKey = `ons-csv:${topicPath}`;
  const cached = getCached(cacheKey);
  if (cached) return cached as { date: string; value: number }[];

  const url = `${ONS_CSV_BASE}${topicPath}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!res.ok) throw new Error(`ONS CSV ${res.status}`);

  const text = await res.text();
  const lines = text.trim().split("\n");

  const result: { date: string; value: number }[] = [];
  for (const line of lines) {
    const stripped = line.trim().replace(/^"/, "");
    if (!stripped || !/^\d/.test(stripped)) continue;

    const parts = line.split(",").map((s) => s.trim().replace(/"/g, ""));
    if (parts.length < 2) continue;
    const val = parseFloat(parts[1]);
    if (isNaN(val) || parts[1] === "" || parts[1] === "..") continue;

    result.push({ date: parts[0], value: val });
  }

  const trimmed = result.slice(-limit);
  setCache(cacheKey, trimmed);
  return trimmed;
}

// ── Bank of England Fetcher ──────────────────────────────────────────────────

async function fetchBOERate(seriesCode: string): Promise<{ date: string; value: number }[]> {
  const cacheKey = `boe:${seriesCode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached as { date: string; value: number }[];

  const url = `${BOE_API_BASE}/_iadb-fromshowcolumns.asp?csv.x=yes&SeriesCodes=${seriesCode}&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!res.ok) throw new Error(`BoE API ${res.status}`);

  const text = await res.text();
  const lines = text.trim().split("\n").slice(1); // skip header

  const result = lines
    .filter((l) => l.trim() !== "")
    .map((line) => {
      const [date, val] = line.split(",").map((s) => s.trim());
      return { date, value: parseFloat(val) };
    })
    .filter((p) => !isNaN(p.value))
    .slice(-60); // last 60 data points

  setCache(cacheKey, result);
  return result;
}

// ── Section-specific fetchers ────────────────────────────────────────────────

async function fetchSentimentPulse() {
  const [cpiSeries, bankRateSeries, unemploymentSeries] = await Promise.all([
    fetchONSCSV(ONS_SERIES.CPI_ANNUAL_RATE.topicPath, 24),
    fetchBOERate(BOE_SERIES.BANK_RATE),
    fetchONSCSV(ONS_SERIES.UNEMPLOYMENT_RATE.topicPath, 24),
  ]);

  // Build merged data points from CPI series (as the base timeline)
  const data = cpiSeries.map((cpiPoint) => {
    const closestBankRate = getLastValue(bankRateSeries);
    const matchingUnemployment = unemploymentSeries.find((u) =>
      u.date.includes(cpiPoint.date.split(" ")[0])
    );

    return {
      date: formatONSDate(cpiPoint.date),
      inflation: cpiPoint.value,
      bankRate: closestBankRate ?? null,
      unemployment: matchingUnemployment?.value ?? null,
    };
  });

  return { economicData: data };
}

async function fetchGDPData() {
  const gdpGrowth = await fetchONSCSV(ONS_SERIES.GDP_QUARTERLY.topicPath, 32);

  return {
    quarterlyGrowth: gdpGrowth.map((p) => ({
      date: formatONSDate(p.date),
      growth: p.value,
    })),
  };
}

async function fetchEmploymentData() {
  const [employmentRate, unemploymentRate] = await Promise.all([
    fetchONSCSV(ONS_SERIES.EMPLOYMENT_RATE.topicPath, 24),
    fetchONSCSV(ONS_SERIES.UNEMPLOYMENT_RATE.topicPath, 24),
  ]);

  return {
    employmentRate: employmentRate.map((p) => ({ date: formatONSDate(p.date), value: p.value })),
    unemploymentRate: unemploymentRate.map((p) => ({ date: formatONSDate(p.date), value: p.value })),
  };
}

async function fetchNationalDebtData() {
  const borrowing = await fetchONSCSV(ONS_SERIES.NET_BORROWING.topicPath, 24);

  return {
    netBorrowing: borrowing.map((p) => ({ date: formatONSDate(p.date), value: p.value })),
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatONSDate(raw: string): string {
  // ONS dates: "2025 JAN", "2025 Q1", etc.
  return raw.trim();
}

function getLastValue(series: { date: string; value: number }[]): number | null {
  if (series.length === 0) return null;
  return series[series.length - 1].value;
}

// ── Section router ───────────────────────────────────────────────────────────

type FetcherFn = () => Promise<unknown>;

const liveFetchers: Record<string, FetcherFn> = {
  sentimentPulse: fetchSentimentPulse,
  gdpTracker: fetchGDPData,
  employmentStats: fetchEmploymentData,
  nationalDebt: fetchNationalDebtData,
};

// ── JSON file reader (populated by fetch_intel.py via GitHub Actions) ────────

import { readFile } from "fs/promises";
import { join } from "path";

let jsonFileCache: { data: Record<string, unknown>; ts: number } | null = null;

async function readDataFile(): Promise<Record<string, unknown> | null> {
  if (jsonFileCache && Date.now() - jsonFileCache.ts < 60_000) {
    return jsonFileCache.data;
  }
  try {
    const filePath = join(process.cwd(), "public", "daily_threat_data.json");
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    jsonFileCache = { data: parsed, ts: Date.now() };
    return parsed;
  } catch {
    return null;
  }
}

// ── GET /api/metrics?section=xxx ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section");

  if (!section) {
    return NextResponse.json(
      { error: "Missing ?section= parameter" },
      { status: 400 }
    );
  }

  // Strategy A: Read from daily_threat_data.json (populated by fetch_intel.py)
  const fileData = await readDataFile();
  if (fileData && fileData[section]) {
    return NextResponse.json(
      {
        section,
        data: fileData[section],
        source: "file",
        timestamp: (fileData.meta as Record<string, string>)?.generatedAt ?? new Date().toISOString(),
      },
      {
        headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
      }
    );
  }

  // Strategy B: Fetch from live APIs
  const fetcher = liveFetchers[section];

  if (!fetcher) {
    return NextResponse.json(
      {
        section,
        data: null,
        source: "none",
        timestamp: new Date().toISOString(),
        message: `No data available for '${section}'. Using embedded data.`,
      },
      {
        headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
      }
    );
  }

  try {
    const data = await fetcher();
    return NextResponse.json(
      {
        section,
        data,
        source: "live",
        timestamp: new Date().toISOString(),
      },
      {
        headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        section,
        data: null,
        source: "error",
        timestamp: new Date().toISOString(),
        message: `Live fetch failed: ${message}`,
      },
      {
        status: 502,
        headers: { "Cache-Control": "no-cache" },
      }
    );
  }
}
