import PMApproval from "@/app/components/PMApproval";
import ElectionPolling from "@/app/components/ElectionPolling";
import BettingOdds from "@/app/components/BettingOdds";
import PolarizationMeter from "@/app/components/PolarizationMeter";
import TrendLines from "@/app/components/TrendLines";
import NationalDebtCounter from "@/app/components/NationalDebtCounter";
import GDPTracker from "@/app/components/GDPTracker";
import SentimentPulse from "@/app/components/SentimentPulse";
import TaxRevenue from "@/app/components/TaxRevenue";
import EmploymentStats from "@/app/components/EmploymentStats";
import CrimeStatistics from "@/app/components/CrimeStatistics";
import NHSStats from "@/app/components/NHSStats";
import MigrationStats from "@/app/components/MigrationStats";
import GeographicHeatmap from "@/app/components/GeographicHeatmap";
import EchoChamberMap from "@/app/components/EchoChamberMap";
import PoliticalCompass from "@/app/components/PoliticalCompass";

export const SECTION_CONTENT = {
  "pm-approval": {
    category: "POLITICS",
    tag: "Public Opinion",
    title: "PM APPROVAL RATING",
    subtitle: "KEIR STARMER / NET APPROVAL FROM YOUGOV TRACKER",
    num: "01",
    component: PMApproval,
  },
  "election-polls": {
    category: "POLITICS",
    tag: "Polling Data",
    title: "ELECTION POLLING",
    subtitle: "UK VOTING INTENTION AVERAGES",
    num: "02",
    component: ElectionPolling,
  },
  "betting-odds": {
    category: "POLITICS",
    tag: "Market Data",
    title: "BETTING ODDS",
    subtitle: "NEXT UK GENERAL ELECTION / IMPLIED PROBABILITIES",
    num: "03",
    component: BettingOdds,
  },
  "govt-approval": {
    category: "POLITICS",
    tag: "Public Opinion",
    title: "GOVERNMENT APPROVAL",
    subtitle: "DISTRIBUTION OF GOVERNMENT SATISFACTION ACROSS POLLS",
    num: "04",
    component: PolarizationMeter,
  },
  "gov-trust-trend": {
    category: "POLITICS",
    tag: "Longitudinal Data",
    title: "TRUST IN GOVERNMENT",
    subtitle: "SATISFACTION WITH GOVERNMENT 2020-2025 / KEY EVENTS ANNOTATED",
    num: "05",
    component: TrendLines,
  },
  "national-debt": {
    category: "ECONOMY",
    tag: "Live Counter",
    title: "NATIONAL DEBT",
    subtitle: "UK PUBLIC SECTOR NET DEBT / LIVE ESTIMATE",
    num: "06",
    component: NationalDebtCounter,
  },
  gdp: {
    category: "ECONOMY",
    tag: "National Accounts",
    title: "GDP",
    subtitle: "GROSS DOMESTIC PRODUCT / TOTAL & PER CAPITA",
    num: "07",
    component: GDPTracker,
  },
  economy: {
    category: "ECONOMY",
    tag: "Economic Data",
    title: "KEY INDICATORS",
    subtitle: "INFLATION / BANK RATE / UNEMPLOYMENT",
    num: "08",
    component: SentimentPulse,
  },
  tax: {
    category: "ECONOMY",
    tag: "HMRC Data",
    title: "TAX REVENUE",
    subtitle: "UK TAX RECEIPTS & TAX BURDEN",
    num: "09",
    component: TaxRevenue,
  },
  employment: {
    category: "ECONOMY",
    tag: "Labour Market",
    title: "EMPLOYMENT",
    subtitle: "PRIVATE VS PUBLIC SECTOR / LABOUR MARKET OVERVIEW",
    num: "10",
    component: EmploymentStats,
  },
  "crime-stats": {
    category: "SOCIETY",
    tag: "Government Stats",
    title: "CRIME STATISTICS",
    subtitle: "ONS RECORDED CRIME / ENGLAND & WALES",
    num: "11",
    component: CrimeStatistics,
  },
  nhs: {
    category: "SOCIETY",
    tag: "Health Data",
    title: "NHS & HEALTH",
    subtitle: "WAITING LISTS / A&E / LIFE EXPECTANCY",
    num: "12",
    component: NHSStats,
  },
  migration: {
    category: "SOCIETY",
    tag: "ONS Data",
    title: "MIGRATION",
    subtitle: "UK INTERNATIONAL MIGRATION / NET MIGRATION / VISA TYPES",
    num: "13",
    component: MigrationStats,
  },
  "uk-regions": {
    category: "DATA",
    tag: "Regional Data",
    title: "UK REGIONS",
    subtitle: "MULTI-LAYER REGIONAL MAP",
    num: "14",
    component: GeographicHeatmap,
  },
  "policy-links": {
    category: "DATA",
    tag: "Survey Data",
    title: "POLICY LINKS",
    subtitle: "OPINION CORRELATION MATRIX",
    num: "15",
    component: EchoChamberMap,
  },
  "political-compass": {
    category: "DATA",
    tag: "Interactive Quiz",
    title: "POLITICAL COMPASS",
    subtitle: "WHERE DO YOU SIT ON THE POLITICAL SPECTRUM? ANSWER 10 QUESTIONS.",
    num: "16",
    component: PoliticalCompass,
  },
} as const;
