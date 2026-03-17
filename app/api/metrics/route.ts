import { NextRequest, NextResponse } from "next/server";
import { BOE_API_BASE, BOE_SERIES, ONS_CSV_BASE, ONS_SERIES } from "@/app/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 300;

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const serverCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

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

async function fetchOnsCsv(
  topicPath: string,
  limit = 24
): Promise<Array<{ date: string; value: number }>> {
  const cacheKey = `ons:${topicPath}:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return cached as Array<{ date: string; value: number }>;
  }

  const response = await fetch(`${ONS_CSV_BASE}${topicPath}`, {
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    throw new Error(`ONS CSV ${response.status}`);
  }

  const text = await response.text();
  const result: Array<{ date: string; value: number }> = [];
  for (const line of text.trim().split("\n")) {
    const stripped = line.trim().replace(/^"/, "");
    if (!stripped || !/^\d/.test(stripped)) {
      continue;
    }

    const parts = line.split(",").map((part) => part.trim().replace(/"/g, ""));
    if (parts.length < 2 || parts[1] === ".." || parts[1] === "") {
      continue;
    }

    const value = Number.parseFloat(parts[1]);
    if (!Number.isFinite(value)) {
      continue;
    }

    result.push({ date: parts[0], value });
  }

  const trimmed = result.slice(-limit);
  setCache(cacheKey, trimmed);
  return trimmed;
}

async function fetchBoeRate(seriesCode: string): Promise<Array<{ date: string; value: number }>> {
  const cacheKey = `boe:${seriesCode}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return cached as Array<{ date: string; value: number }>;
  }

  const response = await fetch(
    `${BOE_API_BASE}/_iadb-fromshowcolumns.asp?csv.x=yes&SeriesCodes=${seriesCode}&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N`,
    { signal: AbortSignal.timeout(8_000) }
  );
  if (!response.ok) {
    throw new Error(`BoE API ${response.status}`);
  }

  const result = (await response.text())
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [date, value] = line.split(",").map((part) => part.trim());
      return { date, value: Number.parseFloat(value) };
    })
    .filter((point) => Number.isFinite(point.value))
    .slice(-60);

  setCache(cacheKey, result);
  return result;
}

function parseEconomicDate(raw: string): Date | null {
  const value = raw.trim();
  const monthMap: Record<string, number> = {
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

  const onsMonthly = value.match(/^(\d{4})\s+([A-Za-z]{3})$/);
  if (onsMonthly) {
    return new Date(
      Date.UTC(
        Number(onsMonthly[1]),
        monthMap[onsMonthly[2].toUpperCase()],
        1
      )
    );
  }

  const onsQuarterly = value.match(/^(\d{4})\s+Q([1-4])$/i);
  if (onsQuarterly) {
    return new Date(
      Date.UTC(Number(onsQuarterly[1]), (Number(onsQuarterly[2]) - 1) * 3, 1)
    );
  }

  const boeDaily = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (boeDaily) {
    return new Date(
      Date.UTC(
        Number(boeDaily[3]),
        monthMap[boeDaily[2].toUpperCase()],
        Number(boeDaily[1])
      )
    );
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function findLatestAtOrBefore(
  date: Date | null,
  series: Array<{ date: string; value: number }>
): number | null {
  if (!date) {
    return null;
  }

  let latestValue: number | null = null;
  let latestTime = -Infinity;
  for (const point of series) {
    const pointDate = parseEconomicDate(point.date);
    if (!pointDate) {
      continue;
    }
    const pointTime = pointDate.getTime();
    if (pointTime <= date.getTime() && pointTime > latestTime) {
      latestTime = pointTime;
      latestValue = point.value;
    }
  }

  return latestValue;
}

function onsDateShort(raw: string) {
  const parts = raw.trim().split(/\s+/);
  if (parts.length < 2) {
    return raw;
  }
  const month = parts[1].slice(0, 3).toLowerCase();
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${parts[0].slice(-2)}`;
}

function onsDateToEpochMs(raw: string): number | null {
  const parts = raw.trim().split(/\s+/);
  const monthMap: Record<string, number> = {
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
  if (parts.length < 2) {
    return null;
  }
  const month = monthMap[parts[1].slice(0, 3).toUpperCase()];
  if (!Number.isInteger(month)) {
    return null;
  }
  return Date.UTC(Number(parts[0]), month, 1);
}

async function fetchSentimentPulse() {
  const [cpiSeries, bankRateSeries, unemploymentSeries] = await Promise.all([
    fetchOnsCsv(ONS_SERIES.CPI_ANNUAL_RATE.topicPath, 24),
    fetchBoeRate(BOE_SERIES.BANK_RATE),
    fetchOnsCsv(ONS_SERIES.UNEMPLOYMENT_RATE.topicPath, 24),
  ]);

  return {
    economicData: cpiSeries.map((point) => {
      const date = parseEconomicDate(point.date);
      return {
        date: onsDateShort(point.date),
        inflation: point.value,
        bankRate: findLatestAtOrBefore(date, bankRateSeries),
        unemployment: findLatestAtOrBefore(date, unemploymentSeries),
      };
    }),
  };
}

async function fetchGDPData() {
  const [growth, level] = await Promise.all([
    fetchOnsCsv(ONS_SERIES.GDP_QUARTERLY.topicPath, 40),
    fetchOnsCsv(ONS_SERIES.GDP_INDEX.topicPath, 40),
  ]);

  const levelMap = new Map(level.map((point) => [point.date, Number((point.value / 1_000_000).toFixed(3))]));
  return {
    gdpHistory: growth.map((point) => ({
      year: point.date,
      growth: point.value,
      ...(levelMap.has(point.date) ? { total: levelMap.get(point.date) } : {}),
    })),
  };
}

async function fetchEmploymentData() {
  const [employmentRate, unemploymentRate] = await Promise.all([
    fetchOnsCsv(ONS_SERIES.EMPLOYMENT_RATE.topicPath, 24),
    fetchOnsCsv(ONS_SERIES.UNEMPLOYMENT_RATE.topicPath, 24),
  ]);

  return {
    employmentRate: employmentRate.map((point) => ({
      date: point.date,
      value: point.value,
    })),
    unemploymentRate: unemploymentRate.map((point) => ({
      date: point.date,
      value: point.value,
    })),
  };
}

async function fetchNationalDebtData() {
  const borrowing = await fetchOnsCsv(ONS_SERIES.NET_BORROWING.topicPath, 24);
  const latest = borrowing[borrowing.length - 1];
  const baseDate = latest ? onsDateToEpochMs(latest.date) : null;
  if (!latest || baseDate == null) {
    throw new Error("National debt fallback data unavailable");
  }

  const annualBorrowing = borrowing.reduce((sum, point) => sum + point.value, 0) * 1_000_000;
  return {
    baseDebt: Math.round(latest.value * 1_000_000),
    baseDate,
    debtPerSecond: Math.round(annualBorrowing / (365.25 * 24 * 3600)),
  };
}

type FetcherFn = () => Promise<unknown>;

const liveFetchers: Record<string, FetcherFn> = {
  sentimentPulse: fetchSentimentPulse,
  gdpTracker: fetchGDPData,
  employmentStats: fetchEmploymentData,
  nationalDebt: fetchNationalDebtData,
};

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section");
  if (!section) {
    return NextResponse.json({ error: "Missing ?section= parameter" }, { status: 400 });
  }

  const workerUrl = process.env.NEXT_PUBLIC_CF_WORKER_URL?.trim();
  if (workerUrl) {
    const response = await fetch(
      `${workerUrl}/metrics?section=${encodeURIComponent(section)}`,
      { signal: AbortSignal.timeout(10_000) }
    );
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control":
          response.headers.get("Cache-Control") ??
          "public, max-age=300, stale-while-revalidate=600",
      },
    });
  }

  const fetcher = liveFetchers[section];
  if (!fetcher) {
    return NextResponse.json(
      {
        section,
        data: null,
        source: "none",
        timestamp: new Date().toISOString(),
        message: `No local development fetcher for '${section}'.`,
      },
      {
        headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        section,
        data: null,
        source: "error",
        timestamp: new Date().toISOString(),
        message: `Local fallback fetch failed: ${message}`,
      },
      {
        status: 502,
        headers: { "Cache-Control": "no-cache" },
      }
    );
  }
}
