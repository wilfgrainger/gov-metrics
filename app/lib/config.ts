// Real-time data fetching configuration.
// Strategy 1: Cloudflare Worker backend.
// Strategy 2: Next.js API route fallback for local development.

// API route path used only when the Worker URL is not configured.
export const METRICS_API_PATH = "/api/metrics";

// Cloudflare Worker URL. Deploy the backend from /worker and set this env var.
export const CF_WORKER_URL = process.env.NEXT_PUBLIC_CF_WORKER_URL || "";

// Polling interval for live data refresh (milliseconds)
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Public UK data source endpoints.

// ONS CSV Generator (no auth required) replaces the retired api.ons.gov.uk.
export const ONS_CSV_BASE = "https://www.ons.gov.uk/generator?format=csv&uri=";

// Bank of England Statistical Interactive Database (no auth required)
export const BOE_API_BASE = "https://www.bankofengland.co.uk/boeapps/database";

// ONS time series definitions.
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
    topicPath:
      "/employmentandlabourmarket/peoplenotinwork/unemployment/timeseries/mgsx/lms",
  },
  EMPLOYMENT_RATE: {
    seriesId: "LF24",
    datasetId: "LMS",
    topicPath:
      "/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/timeseries/lf24/lms",
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
    topicPath:
      "/economy/governmentpublicsectorandtaxes/publicsectorfinance/timeseries/j5ii/psf",
  },
} as const;

// Bank of England series.
export const BOE_SERIES = {
  BANK_RATE: "IUDBEDR",
} as const;

export type DataAutomation = "automated" | "static" | "interactive";

export interface DataSourceDefinition {
  name: string;
  frequency: string;
  sources: string[];
  automation: DataAutomation;
}

export const INTERACTIVE_ONLY_SECTIONS = ["politicalCompass"] as const;

// Data source metadata for UI and documentation.
export const DATA_SOURCES: Record<string, DataSourceDefinition> = {
  pmApproval: {
    name: "PM Approval",
    frequency: "weekly",
    sources: ["YouGov", "Ipsos"],
    automation: "static",
  },
  electionPolling: {
    name: "Election Polling",
    frequency: "daily",
    sources: ["Wikipedia", "YouGov", "Ipsos", "Savanta", "R&W", "More in Common"],
    automation: "automated",
  },
  bettingOdds: {
    name: "Betting Odds",
    frequency: "daily",
    sources: ["Betfair", "Oddschecker", "Smarkets"],
    automation: "static",
  },
  polarizationMeter: {
    name: "Polarization Index",
    frequency: "monthly",
    sources: ["Ipsos", "YouGov"],
    automation: "static",
  },
  trendLines: {
    name: "Govt Satisfaction",
    frequency: "monthly",
    sources: ["Ipsos"],
    automation: "static",
  },
  nationalDebt: {
    name: "National Debt",
    frequency: "monthly",
    sources: ["ONS Public Sector Finances"],
    automation: "automated",
  },
  gdpTracker: {
    name: "GDP",
    frequency: "quarterly",
    sources: ["ONS", "IMF", "OBR"],
    automation: "automated",
  },
  sentimentPulse: {
    name: "Economic Indicators",
    frequency: "monthly",
    sources: ["ONS", "Bank of England"],
    automation: "automated",
  },
  taxRevenue: {
    name: "Tax Revenue",
    frequency: "monthly",
    sources: ["ONS", "HMRC", "OBR"],
    automation: "automated",
  },
  employmentStats: {
    name: "Employment",
    frequency: "monthly",
    sources: ["ONS Labour Force Survey"],
    automation: "automated",
  },
  crimeStatistics: {
    name: "Crime",
    frequency: "quarterly",
    sources: ["ONS", "Home Office"],
    automation: "static",
  },
  nhsStats: {
    name: "NHS Statistics",
    frequency: "monthly",
    sources: ["NHS England", "ONS"],
    automation: "automated",
  },
  migrationStats: {
    name: "Migration",
    frequency: "quarterly",
    sources: ["ONS", "Home Office"],
    automation: "automated",
  },
  geographicHeatmap: {
    name: "Regional Data",
    frequency: "annual",
    sources: ["ONS", "Home Office", "Electoral Commission"],
    automation: "static",
  },
  echoChamberMap: {
    name: "Opinion Correlations",
    frequency: "annual",
    sources: ["NatCen BSA", "YouGov"],
    automation: "static",
  },
  politicalCompass: {
    name: "Political Compass",
    frequency: "user interaction only",
    sources: ["User responses"],
    automation: "interactive",
  },
};
