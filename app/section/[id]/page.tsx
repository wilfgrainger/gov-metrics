import { notFound } from "next/navigation";
import SectionNav from "../../components/SectionNav";
import PMApproval from "../../components/PMApproval";
import ElectionPolling from "../../components/ElectionPolling";
import BettingOdds from "../../components/BettingOdds";
import PolarizationMeter from "../../components/PolarizationMeter";
import TrendLines from "../../components/TrendLines";
import NationalDebtCounter from "../../components/NationalDebtCounter";
import GDPTracker from "../../components/GDPTracker";
import SentimentPulse from "../../components/SentimentPulse";
import TaxRevenue from "../../components/TaxRevenue";
import EmploymentStats from "../../components/EmploymentStats";
import CrimeStatistics from "../../components/CrimeStatistics";
import NHSStats from "../../components/NHSStats";
import MigrationStats from "../../components/MigrationStats";
import GeographicHeatmap from "../../components/GeographicHeatmap";
import EchoChamberMap from "../../components/EchoChamberMap";
import PoliticalCompass from "../../components/PoliticalCompass";
import { SECTIONS } from "../../lib/sections";

const ISSUE_DATE = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function SectionHeader({
  tag,
  title,
  subtitle,
  num,
}: {
  tag: string;
  title: string;
  subtitle: string;
  num: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-4 border-black gap-3 sm:gap-2 mb-6 pb-4">
      <div className="min-w-0">
        <div className="font-mono text-xs tracking-widest uppercase text-gray-500 mb-1">{tag}</div>
        <h1 className="font-display leading-none text-2xl md:text-4xl tracking-wider">{title}</h1>
        <p className="font-mono text-xs mt-2 text-gray-600">{subtitle}</p>
      </div>
      <div className="font-display text-accent leading-none sm:ml-2 shrink-0 self-end sm:self-auto text-4xl md:text-6xl">{num}</div>
    </div>
  );
}

const SECTION_CONTENT = {
  "pm-approval": { category: "POLITICS", tag: "Public Opinion", title: "PM APPROVAL RATING", subtitle: "KEIR STARMER · NET APPROVAL FROM YOUGOV TRACKER", num: "01", component: PMApproval },
  "election-polls": { category: "POLITICS", tag: "Polling Data", title: "ELECTION POLLING", subtitle: "UK VOTING INTENTION AVERAGES", num: "02", component: ElectionPolling },
  "betting-odds": { category: "POLITICS", tag: "Market Data", title: "BETTING ODDS", subtitle: "NEXT UK GENERAL ELECTION · IMPLIED PROBABILITIES", num: "03", component: BettingOdds },
  "govt-approval": { category: "POLITICS", tag: "Public Opinion", title: "GOVERNMENT APPROVAL", subtitle: "DISTRIBUTION OF GOVERNMENT SATISFACTION ACROSS POLLS", num: "04", component: PolarizationMeter },
  "gov-trust-trend": { category: "POLITICS", tag: "Longitudinal Data", title: "TRUST IN GOVERNMENT", subtitle: "SATISFACTION WITH GOVERNMENT 2020–2025 · KEY EVENTS ANNOTATED", num: "05", component: TrendLines },
  "national-debt": { category: "ECONOMY", tag: "Live Counter", title: "NATIONAL DEBT", subtitle: "UK PUBLIC SECTOR NET DEBT · LIVE ESTIMATE", num: "06", component: NationalDebtCounter },
  gdp: { category: "ECONOMY", tag: "National Accounts", title: "GDP", subtitle: "GROSS DOMESTIC PRODUCT · TOTAL & PER CAPITA", num: "07", component: GDPTracker },
  economy: { category: "ECONOMY", tag: "Economic Data", title: "KEY INDICATORS", subtitle: "INFLATION · BANK RATE · UNEMPLOYMENT", num: "08", component: SentimentPulse },
  tax: { category: "ECONOMY", tag: "HMRC Data", title: "TAX REVENUE", subtitle: "UK TAX RECEIPTS & TAX BURDEN", num: "09", component: TaxRevenue },
  employment: { category: "ECONOMY", tag: "Labour Market", title: "EMPLOYMENT", subtitle: "PRIVATE VS PUBLIC SECTOR · LABOUR MARKET OVERVIEW", num: "10", component: EmploymentStats },
  "crime-stats": { category: "SOCIETY", tag: "Government Stats", title: "CRIME STATISTICS", subtitle: "ONS RECORDED CRIME · ENGLAND & WALES", num: "11", component: CrimeStatistics },
  nhs: { category: "SOCIETY", tag: "Health Data", title: "NHS & HEALTH", subtitle: "WAITING LISTS · A&E · LIFE EXPECTANCY", num: "12", component: NHSStats },
  migration: { category: "SOCIETY", tag: "ONS Data", title: "MIGRATION", subtitle: "UK INTERNATIONAL MIGRATION · NET MIGRATION · VISA TYPES", num: "13", component: MigrationStats },
  "uk-regions": { category: "DATA", tag: "Regional Data", title: "UK REGIONS", subtitle: "MULTI-LAYER REGIONAL MAP", num: "14", component: GeographicHeatmap },
  "policy-links": { category: "DATA", tag: "Survey Data", title: "POLICY LINKS", subtitle: "OPINION CORRELATION MATRIX", num: "15", component: EchoChamberMap },
  "political-compass": { category: "DATA", tag: "Interactive Quiz", title: "POLITICAL COMPASS", subtitle: "WHERE DO YOU SIT ON THE POLITICAL SPECTRUM? ANSWER 10 QUESTIONS.", num: "16", component: PoliticalCompass },
} as const;

export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = SECTION_CONTENT[id as keyof typeof SECTION_CONTENT];

  if (!section) notFound();

  const SectionComponent = section.component;

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="sticky top-0 z-50 bg-white">
        <div className="border-b-4 border-black bg-black text-white px-4 md:px-6 py-2 flex justify-between items-center">
          <span className="font-mono text-[10px] md:text-xs tracking-widest uppercase">UK Public Data</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" style={{ animation: "pulse-live 1.5s ease-in-out infinite" }} />
            <span className="font-mono text-[10px] md:text-xs tracking-widest text-red-400 uppercase">Live</span>
          </div>
          <span className="font-mono text-[10px] md:text-xs tracking-widest uppercase opacity-60 hidden sm:inline">{ISSUE_DATE}</span>
        </div>
        <SectionNav sections={SECTIONS} />
      </div>

      <main className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-8">
        <div className="mb-8 border-l-8 border-black pl-4 md:pl-6">
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">{section.category} · Dedicated page</div>
          <p className="font-display text-xl md:text-3xl tracking-wide max-w-2xl leading-tight">Navigate between sections from the fixed top menu.</p>
        </div>

        <section className="dashboard-card mb-6 border-4 border-black p-4 md:p-6 bg-white relative">
          <SectionHeader tag={section.tag} title={section.title} subtitle={section.subtitle} num={section.num} />
          <SectionComponent />
        </section>
      </main>
    </div>
  );
}
