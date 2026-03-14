// Real-time data fetching configuration
// Strategy 1: Next.js API routes fetch from public UK data sources (server-side)
// Strategy 2: Cloudflare Worker fallback when server is unavailable (e.g. static export)

// API route path (server-side data aggregation)
export const METRICS_API_PATH = "/api/metrics";

// Cloudflare Worker URL — deploy worker from /worker directory, then set this env var
export const CF_WORKER_URL =
  process.env.NEXT_PUBLIC_CF_WORKER_URL || "";

// Polling interval for live data refresh (milliseconds)
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// ── Public UK Data Source Endpoints ──────────────────────────────────────────

// ONS CSV Generator (no auth required) — replaces the retired api.ons.gov.uk
// The legacy ONS API at api.ons.gov.uk was retired in November 2024.
// Docs: https://developer.ons.gov.uk/
export const ONS_CSV_BASE = "https://www.ons.gov.uk/generator?format=csv&uri=";

// Bank of England Statistical Interactive Database (no auth required)
export const BOE_API_BASE =
  "https://www.bankofengland.co.uk/boeapps/database";

// ── ONS Time Series Definitions ─────────────────────────────────────────────
// Each series includes the topicPath for the CSV generator URL.

export const ONS_SERIES = {
  CPI_ANNUAL_RATE: {
    seriesId: "D7G7",
    datasetId: "MM23",
    topicPath: "/economy/inflationandpriceindices/timeseries/d7g7/mm23",
  },
  CPIH_ANNUAL_RATE: {
    seriesId: "L55O",
    datasetId: "MM23",
    topicPath: "/economy/inflationandpriceindices/timeseries/l55o/mm23",
  },
  UNEMPLOYMENT_RATE: {
    seriesId: "MGSX",
    datasetId: "LMS",
    topicPath: "/employmentandlabourmarket/peoplenotinwork/unemployment/timeseries/mgsx/lms",
  },
  EMPLOYMENT_RATE: {
    seriesId: "LF24",
    datasetId: "LMS",
    topicPath: "/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/timeseries/lf24/lms",
  },
  GDP_QUARTERLY: {
    seriesId: "IHYQ",
    datasetId: "PN2",
    topicPath: "/economy/grossdomesticproductgdp/timeseries/ihyq/pn2",
  },
  GDP_INDEX: {
    seriesId: "ABMI",
    datasetId: "PN2",
    topicPath: "/economy/grossdomesticproductgdp/timeseries/abmi/pn2",
  },
  NET_BORROWING: {
    seriesId: "J5II",
    datasetId: "PSF",
    topicPath: "/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/j5ii/psf",
  },
} as const;

// ── Bank of England Series ───────────────────────────────────────────────────

export const BOE_SERIES = {
  BANK_RATE: "IUDBEDR", // Official Bank Rate
} as const;

// ── Data source metadata (for UI and documentation) ─────────────────────────

export const DATA_SOURCES: Record<
  string,
  { name: string; frequency: string; sources: string[] }
> = {
  pmApproval: {
    name: "PM Approval",
    frequency: "weekly",
    sources: ["YouGov", "Ipsos"],
  },
  electionPolling: {
    name: "Election Polling",
    frequency: "daily",
    sources: ["Wikipedia", "YouGov", "Ipsos", "Savanta", "R&W", "More in Common"],
  },
  bettingOdds: {
    name: "Betting Odds",
    frequency: "daily",
    sources: ["Betfair", "Oddschecker", "Smarkets"],
  },
  polarizationMeter: {
    name: "Polarization Index",
    frequency: "monthly",
    sources: ["Ipsos", "YouGov"],
  },
  trendLines: {
    name: "Govt Satisfaction",
    frequency: "monthly",
    sources: ["Ipsos"],
  },
  nationalDebt: {
    name: "National Debt",
    frequency: "monthly",
    sources: ["ONS Public Sector Finances"],
  },
  gdpTracker: {
    name: "GDP",
    frequency: "quarterly",
    sources: ["ONS", "IMF", "OBR"],
  },
  sentimentPulse: {
    name: "Economic Indicators",
    frequency: "monthly",
    sources: ["ONS", "Bank of England"],
  },
  taxRevenue: {
    name: "Tax Revenue",
    frequency: "monthly",
    sources: ["ONS", "HMRC", "OBR"],
  },
  employmentStats: {
    name: "Employment",
    frequency: "monthly",
    sources: ["ONS Labour Force Survey"],
  },
  crimeStatistics: {
    name: "Crime",
    frequency: "quarterly",
    sources: ["ONS", "Home Office"],
  },
  nhsStats: {
    name: "NHS Statistics",
    frequency: "monthly",
    sources: ["NHS England", "ONS"],
  },
  migrationStats: {
    name: "Migration",
    frequency: "quarterly",
    sources: ["ONS", "Home Office"],
  },
  geographicHeatmap: {
    name: "Regional Data",
    frequency: "annual",
    sources: ["ONS", "Home Office", "Electoral Commission"],
  },
  echoChamberMap: {
    name: "Opinion Correlations",
    frequency: "annual",
    sources: ["NatCen BSA", "YouGov"],
  },
};
