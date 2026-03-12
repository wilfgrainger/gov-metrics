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

// ONS Time Series API (no auth required)
// Docs: https://api.ons.gov.uk
export const ONS_API_BASE = "https://api.ons.gov.uk";

// Bank of England Statistical Interactive Database (no auth required)
export const BOE_API_BASE =
  "https://www.bankofengland.co.uk/boeapps/database";

// ── ONS Time Series IDs ─────────────────────────────────────────────────────

export const ONS_SERIES = {
  CPI_ANNUAL_RATE: { seriesId: "D7G7", datasetId: "MM23" }, // CPI annual rate
  CPIH_ANNUAL_RATE: { seriesId: "L55O", datasetId: "MM23" }, // CPIH annual rate
  UNEMPLOYMENT_RATE: { seriesId: "MGSX", datasetId: "LMS" }, // ILO unemployment rate
  EMPLOYMENT_RATE: { seriesId: "LF24", datasetId: "LMS" }, // Employment rate (16-64)
  GDP_QUARTERLY: { seriesId: "IHYQ", datasetId: "PN2" }, // GDP quarter-on-quarter growth
  GDP_INDEX: { seriesId: "ABMI", datasetId: "PN2" }, // GDP at market prices (£m, SA)
  POPULATION_UK: { seriesId: "UKPOP", datasetId: "POP" }, // UK population estimate
  NET_BORROWING: { seriesId: "J5II", datasetId: "PSF" }, // Public sector net borrowing
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
    sources: ["YouGov", "Ipsos", "Savanta", "R&W", "More in Common"],
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
    sources: ["HMRC", "OBR"],
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
