import { NextRequest, NextResponse } from "next/server";
import { ONS_API_BASE, BOE_API_BASE, ONS_SERIES, BOE_SERIES } from "@/app/lib/config";

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

// ── ONS Time Series Fetcher ──────────────────────────────────────────────────

interface ONSTimeSeriesPoint {
  date: string;
  value: string;
  year: string;
  month?: string;
  quarter?: string;
}

async function fetchONSSeries(
  seriesId: string,
  datasetId: string,
  periodType: "months" | "quarters" | "years" = "months",
  limit = 24
): Promise<{ date: string; value: number }[]> {
  const cacheKey = `ons:${seriesId}:${datasetId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached as { date: string; value: number }[];

  const url = `${ONS_API_BASE}/timeseries/${seriesId}/dataset/${datasetId}/data`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!res.ok) throw new Error(`ONS API ${res.status}`);

  const json = await res.json();
  const points: ONSTimeSeriesPoint[] = json[periodType] ?? [];

  const result = points
    .filter((p) => p.value && p.value.trim() !== "" && !isNaN(Number(p.value)))
    .slice(-limit)
    .map((p) => ({
      date: p.date?.trim() ?? `${p.year} ${p.month ?? p.quarter ?? ""}`.trim(),
      value: parseFloat(p.value),
    }));

  setCache(cacheKey, result);
  return result;
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
    fetchONSSeries(ONS_SERIES.CPI_ANNUAL_RATE.seriesId, ONS_SERIES.CPI_ANNUAL_RATE.datasetId, "months", 24),
    fetchBOERate(BOE_SERIES.BANK_RATE),
    fetchONSSeries(ONS_SERIES.UNEMPLOYMENT_RATE.seriesId, ONS_SERIES.UNEMPLOYMENT_RATE.datasetId, "months", 24),
  ]);

  // Merge time series by aligning dates
  // Create a lookup map for each series
  const bankRateMap = new Map(bankRateSeries.map((p) => [p.date, p.value]));

  // Build merged data points from CPI series (as the base timeline)
  const data = cpiSeries.map((cpiPoint) => {
    // Find closest bank rate and unemployment
    const closestBankRate = findClosestValue(bankRateSeries, cpiPoint.date);
    const matchingUnemployment = unemploymentSeries.find((u) =>
      u.date.includes(cpiPoint.date.split(" ")[0]) // match by year
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
  const gdpGrowth = await fetchONSSeries(
    ONS_SERIES.GDP_QUARTERLY.seriesId,
    ONS_SERIES.GDP_QUARTERLY.datasetId,
    "quarters",
    32
  );

  return {
    quarterlyGrowth: gdpGrowth.map((p) => ({
      date: formatONSDate(p.date),
      growth: p.value,
    })),
  };
}

async function fetchEmploymentData() {
  const [employmentRate, unemploymentRate] = await Promise.all([
    fetchONSSeries(ONS_SERIES.EMPLOYMENT_RATE.seriesId, ONS_SERIES.EMPLOYMENT_RATE.datasetId, "months", 24),
    fetchONSSeries(ONS_SERIES.UNEMPLOYMENT_RATE.seriesId, ONS_SERIES.UNEMPLOYMENT_RATE.datasetId, "months", 24),
  ]);

  return {
    employmentRate: employmentRate.map((p) => ({ date: formatONSDate(p.date), value: p.value })),
    unemploymentRate: unemploymentRate.map((p) => ({ date: formatONSDate(p.date), value: p.value })),
  };
}

async function fetchNationalDebtData() {
  const borrowing = await fetchONSSeries(
    ONS_SERIES.NET_BORROWING.seriesId,
    ONS_SERIES.NET_BORROWING.datasetId,
    "months",
    24
  );

  return {
    netBorrowing: borrowing.map((p) => ({ date: formatONSDate(p.date), value: p.value })),
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatONSDate(raw: string): string {
  // ONS dates: "2025 JAN", "2025 Q1", etc.
  return raw.trim();
}

function findClosestValue(series: { date: string; value: number }[], targetDate: string): number | null {
  if (series.length === 0) return null;
  // Simple: return the last value (most recent)
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

// ── GET /api/metrics?section=xxx ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section");

  if (!section) {
    return NextResponse.json(
      { error: "Missing ?section= parameter" },
      { status: 400 }
    );
  }

  const fetcher = liveFetchers[section];

  if (!fetcher) {
    // No live fetcher for this section — return null so client uses fallback
    return NextResponse.json(
      {
        section,
        data: null,
        source: "none",
        timestamp: new Date().toISOString(),
        message: `No live data source configured for '${section}'. Using embedded data.`,
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
