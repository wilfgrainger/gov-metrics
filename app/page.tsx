import PoliticalCompass from "./components/PoliticalCompass";
import NationalDebtCounter from "./components/NationalDebtCounter";
import ElectionPolling from "./components/ElectionPolling";
import BettingOdds from "./components/BettingOdds";
import CrimeStatistics from "./components/CrimeStatistics";
import PolarizationMeter from "./components/PolarizationMeter";
import TrendLines from "./components/TrendLines";
import SentimentPulse from "./components/SentimentPulse";
import GeographicHeatmap from "./components/GeographicHeatmap";
import EchoChamberMap from "./components/EchoChamberMap";
import SocialShare from "./components/SocialShare";
import SectionNav from "./components/SectionNav";
import PMApproval from "./components/PMApproval";
import GDPTracker from "./components/GDPTracker";
import TaxRevenue from "./components/TaxRevenue";
import EmploymentStats from "./components/EmploymentStats";
import MigrationStats from "./components/MigrationStats";
import NHSStats from "./components/NHSStats";

const ISSUE_DATE = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const SECTIONS = [
  {
    category: "POLITICS",
    sections: [
      { id: "pm-approval", label: "PM APPROVAL" },
      { id: "election-polls", label: "ELECTION POLLS" },
      { id: "betting-odds", label: "BETTING ODDS" },
      { id: "govt-approval", label: "GOVT APPROVAL" },
      { id: "gov-trust-trend", label: "TRUST TREND" },
    ],
  },
  {
    category: "ECONOMY",
    sections: [
      { id: "national-debt", label: "NATIONAL DEBT" },
      { id: "gdp", label: "GDP" },
      { id: "economy", label: "INDICATORS" },
      { id: "tax", label: "TAX" },
      { id: "employment", label: "EMPLOYMENT" },
    ],
  },
  {
    category: "SOCIETY",
    sections: [
      { id: "crime-stats", label: "CRIME" },
      { id: "nhs", label: "NHS & HEALTH" },
      { id: "migration", label: "MIGRATION" },
    ],
  },
  {
    category: "DATA",
    sections: [
      { id: "uk-regions", label: "UK REGIONS" },
      { id: "policy-links", label: "POLICY LINKS" },
      { id: "political-compass", label: "COMPASS QUIZ" },
    ],
  },
];

let sectionCounter = 0;
function nextNum() {
  sectionCounter += 1;
  return String(sectionCounter).padStart(2, "0");
}

function SectionHeader({ tag, title, subtitle, num }: { tag: string; title: string; subtitle: string; num: string }) {
  return (
    <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
      <div className="min-w-0">
        <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">{tag}</div>
        <h2 className="font-display text-3xl md:text-4xl tracking-wider leading-none">{title}</h2>
        <p className="font-mono text-xs mt-2 text-gray-600">{subtitle}</p>
      </div>
      <div className="text-4xl md:text-6xl font-display text-accent leading-none ml-2 shrink-0">{num}</div>
    </div>
  );
}

function CategoryDivider({ label }: { label: string }) {
  return (
    <div className="my-10 md:my-14 flex items-center gap-0">
      <div className="h-2 w-8" style={{ background: "#FF3B00" }} />
      <div className="h-2 flex-1 bg-black" />
      <div className="font-mono text-xs tracking-widest px-4 py-2 bg-black text-white whitespace-nowrap" style={{ boxShadow: "3px 3px 0px #FF3B00" }}>
        {label}
      </div>
      <div className="h-2 flex-1 bg-black" />
      <div className="h-2 w-8" style={{ background: "#FF3B00" }} />
    </div>
  );
}

export default function Home() {
  sectionCounter = 0;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ── TOP BAR ── */}
      <div className="border-b-4 border-black bg-black text-white px-4 md:px-6 py-2 flex justify-between items-center">
        <span className="font-mono text-[10px] md:text-xs tracking-widest uppercase">
          UK Public Data
        </span>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-red-500 inline-block"
            style={{ animation: "pulse-live 1.5s ease-in-out infinite" }}
          />
          <span className="font-mono text-[10px] md:text-xs tracking-widest text-red-400 uppercase">Live</span>
        </div>
        <span className="font-mono text-[10px] md:text-xs tracking-widest uppercase opacity-60 hidden sm:inline">{ISSUE_DATE}</span>
      </div>

      {/* ── MASTHEAD ── */}
      <header className="border-b-8 border-black px-4 md:px-6 py-6 md:py-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-[10px] md:text-xs tracking-[0.4em] uppercase text-gray-500 mb-2">
                Public Data Aggregator · United Kingdom
              </div>
              <h1
                className="font-display leading-none tracking-tight"
                style={{
                  fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif",
                  fontSize: "clamp(60px, 16vw, 200px)",
                  letterSpacing: "-0.02em",
                  lineHeight: 0.9,
                }}
              >
                PULSE
              </h1>
            </div>
            <div className="text-right hidden sm:block">
              <div
                className="font-mono text-xs tracking-[0.3em] uppercase mb-2"
                style={{ borderLeft: "4px solid #FF3B00", paddingLeft: "12px" }}
              >
                AGGREGATING PUBLIC DATA
                <br />
                IN ONE PLACE
              </div>
              <div className="font-display text-lg text-gray-400 tracking-widest">
                UNITED KINGDOM · ALL PUBLIC SOURCES
              </div>
            </div>
          </div>

          {/* Horizontal rule with label */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-1 bg-black" />
            <div
              className="font-mono text-[10px] md:text-xs tracking-widest px-3 py-1 bg-black text-white"
              style={{ boxShadow: "3px 3px 0px #FF3B00" }}
            >
              KEY METRICS FROM PUBLIC DATA
            </div>
            <div className="flex-1 h-1 bg-black" />
          </div>
        </div>
      </header>

      {/* ── NAVIGATION STRIP ── */}
      <SectionNav sections={SECTIONS} />

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-8">

        {/* Section intro */}
        <div className="mb-8 border-l-8 border-black pl-4 md:pl-6">
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">
            Public Data Dashboard · All Sources Cited
          </div>
          <p className="font-display text-xl md:text-3xl tracking-wide max-w-2xl leading-tight">
            KEY UK METRICS FROM PUBLIC DATASETS &amp; APIS.
            REAL DATA. ALL SOURCES CITED.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ██  POLITICS SECTION  ██ */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <CategoryDivider label="POLITICS & GOVERNMENT" />

        {/* PM Approval Rating (full-width) */}
        <section id="pm-approval" className="mb-6 border-4 border-black p-4 md:p-6 bg-white relative scroll-mt-20">
          <SectionHeader tag="Public Opinion" title="PM APPROVAL RATING" subtitle="KEIR STARMER · NET APPROVAL FROM YOUGOV TRACKER" num={nextNum()} />
          <PMApproval />
        </section>

        {/* Election Polling + Betting Odds (2-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <section id="election-polls" className="border-4 border-black p-4 md:p-6 bg-white relative scroll-mt-20">
            <SectionHeader tag="Polling Data" title="ELECTION POLLING" subtitle="UK VOTING INTENTION AVERAGES" num={nextNum()} />
            <ElectionPolling />
          </section>
          <section id="betting-odds" className="border-4 border-black p-4 md:p-6 bg-white relative scroll-mt-20">
            <SectionHeader tag="Market Data" title="BETTING ODDS" subtitle="NEXT UK GENERAL ELECTION · IMPLIED PROBABILITIES" num={nextNum()} />
            <BettingOdds />
          </section>
        </div>

        {/* Government Approval (full-width) */}
        <section id="govt-approval" className="mb-6 border-4 border-black p-4 md:p-6 bg-white relative scroll-mt-20">
          <SectionHeader tag="Public Opinion" title="GOVERNMENT APPROVAL" subtitle="DISTRIBUTION OF GOVERNMENT SATISFACTION ACROSS POLLS" num={nextNum()} />
          <PolarizationMeter />
        </section>

        {/* Trust Trend (full-width) */}
        <section id="gov-trust-trend" className="mb-6 border-4 border-black p-4 md:p-6 bg-white relative scroll-mt-20">
          <SectionHeader tag="Longitudinal Data" title="TRUST IN GOVERNMENT" subtitle="SATISFACTION WITH GOVERNMENT 2020–2025 · KEY EVENTS ANNOTATED" num={nextNum()} />
          <TrendLines />
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ██  ECONOMY SECTION  ██ */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <CategoryDivider label="ECONOMY & FINANCE" />

        {/* National Debt (full-width) */}
        <section id="national-debt" className="mb-6 border-4 border-black p-4 md:p-6 bg-white relative scroll-mt-20">
          <SectionHeader tag="Live Counter" title="NATIONAL DEBT" subtitle="UK PUBLIC SECTOR NET DEBT · LIVE ESTIMATE" num={nextNum()} />
          <NationalDebtCounter />
        </section>

        {/* GDP + Economy indicators (2-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <section id="gdp" className="border-4 border-black p-4 md:p-6 bg-white scroll-mt-20">
            <SectionHeader tag="National Accounts" title="GDP" subtitle="GROSS DOMESTIC PRODUCT · TOTAL & PER CAPITA" num={nextNum()} />
            <GDPTracker />
          </section>
          <section id="economy" className="border-4 border-black p-4 md:p-6 bg-white scroll-mt-20">
            <SectionHeader tag="Economic Data" title="KEY INDICATORS" subtitle="INFLATION · BANK RATE · UNEMPLOYMENT" num={nextNum()} />
            <SentimentPulse />
          </section>
        </div>

        {/* Tax + Employment (2-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <section id="tax" className="border-4 border-black p-4 md:p-6 bg-white scroll-mt-20">
            <SectionHeader tag="HMRC Data" title="TAX REVENUE" subtitle="UK TAX RECEIPTS & TAX BURDEN" num={nextNum()} />
            <TaxRevenue />
          </section>
          <section id="employment" className="border-4 border-black p-4 md:p-6 bg-white scroll-mt-20">
            <SectionHeader tag="Labour Market" title="EMPLOYMENT" subtitle="PRIVATE VS PUBLIC SECTOR · LABOUR MARKET OVERVIEW" num={nextNum()} />
            <EmploymentStats />
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ██  SOCIETY SECTION  ██ */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <CategoryDivider label="SOCIETY & PUBLIC SERVICES" />

        {/* Crime + NHS (2-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <section id="crime-stats" className="border-4 border-black p-4 md:p-6 bg-white relative scroll-mt-20">
            <SectionHeader tag="Government Stats" title="CRIME STATISTICS" subtitle="ONS RECORDED CRIME · ENGLAND & WALES" num={nextNum()} />
            <CrimeStatistics />
          </section>
          <section id="nhs" className="border-4 border-black p-4 md:p-6 bg-white relative scroll-mt-20">
            <SectionHeader tag="Health Data" title="NHS & HEALTH" subtitle="WAITING LISTS · A&E · LIFE EXPECTANCY" num={nextNum()} />
            <NHSStats />
          </section>
        </div>

        {/* Migration (full-width) */}
        <section id="migration" className="mb-6 border-4 border-black p-4 md:p-6 bg-white relative scroll-mt-20">
          <SectionHeader tag="ONS Data" title="MIGRATION" subtitle="UK INTERNATIONAL MIGRATION · NET MIGRATION · VISA TYPES" num={nextNum()} />
          <MigrationStats />
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ██  DATA & INTERACTIVE SECTION  ██ */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <CategoryDivider label="DATA & INTERACTIVE" />

        {/* Regional + Policy Links (2-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <section id="uk-regions" className="border-4 border-black p-4 md:p-6 bg-white scroll-mt-20">
            <SectionHeader tag="Regional Data" title="UK REGIONS" subtitle="MULTI-LAYER REGIONAL MAP" num={nextNum()} />
            <GeographicHeatmap />
          </section>
          <section id="policy-links" className="border-4 border-black p-4 md:p-6 bg-white scroll-mt-20">
            <SectionHeader tag="Survey Data" title="POLICY LINKS" subtitle="OPINION CORRELATION MATRIX" num={nextNum()} />
            <EchoChamberMap />
          </section>
        </div>

        {/* Political Compass (full-width) */}
        <section id="political-compass" className="mb-6 border-4 border-black p-4 md:p-6 bg-white relative scroll-mt-20">
          <SectionHeader tag="Interactive Quiz" title="POLITICAL COMPASS" subtitle="WHERE DO YOU SIT ON THE POLITICAL SPECTRUM? ANSWER 10 QUESTIONS." num={nextNum()} />
          <PoliticalCompass />
        </section>

        {/* ── SOCIAL SHARE ── */}
        <div className="mb-6">
          <SocialShare />
        </div>

        {/* ── PULL QUOTE ── */}
        <div
          className="mb-10 border-4 border-black p-4 md:p-10 bg-black text-white relative overflow-hidden"
          style={{ boxShadow: "8px 8px 0px #FF3B00" }}
        >
          <div
            className="absolute -bottom-6 -right-4 font-display opacity-10 leading-none pointer-events-none"
            style={{ fontSize: "clamp(100px, 20vw, 200px)", fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
          >
            DATA
          </div>
          <div className="font-mono text-xs tracking-widest text-red-400 mb-4 uppercase">
            About This Dashboard
          </div>
          <blockquote
            className="font-display text-xl md:text-4xl leading-tight max-w-3xl"
            style={{ fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
          >
            &ldquo;ALL DATA ON THIS DASHBOARD IS SOURCED FROM PUBLIC DATASETS AND
            PUBLIC APIS. WE DON&apos;T CAPTURE NEW DATA — WE AGGREGATE WHAT&apos;S ALREADY PUBLIC.&rdquo;
          </blockquote>
          <cite className="block mt-4 font-mono text-xs text-gray-400 not-italic">
            — SOURCES: ONS, ELECTORAL COMMISSION, IPSOS, YOUGOV, BANK OF ENGLAND, HOME OFFICE, HMRC, NHS ENGLAND
          </cite>
        </div>

        {/* ── STATS BAR ── */}
        <div className="border-4 border-black bg-black text-white p-4 md:p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-700">
            {[
              { label: "DATA SOURCES", value: "15+", note: "PUBLIC APIS & DATASETS" },
              { label: "METRICS TRACKED", value: "16", note: "INTERACTIVE VIEWS" },
              { label: "COVERAGE", value: "UK", note: "NATIONAL & REGIONAL" },
              { label: "ALL DATA", value: "PUBLIC", note: "FREELY AVAILABLE", accent: true },
            ].map((stat) => (
              <div key={stat.label} className="px-3 md:px-4 py-2 first:pl-0 last:pr-0">
                <div className="font-mono text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {stat.label}
                </div>
                <div
                  className="font-display text-2xl md:text-4xl leading-none"
                  style={{ fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif", color: stat.accent ? "#FF3B00" : "#fff" }}
                >
                  {stat.value}
                </div>
                <div className="font-mono text-[10px] text-gray-600 mt-1">{stat.note}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t-4 border-black px-4 md:px-6 py-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-start gap-6">
          <div>
            <div
              className="font-display text-5xl leading-none mb-2"
              style={{ fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
            >
              PULSE
            </div>
            <div className="font-mono text-xs text-gray-500 max-w-xs">
              UK Public Data Intelligence Platform. All data sourced from
              publicly available datasets, government statistics, and public APIs.
            </div>
            <div className="mt-3">
              <SocialShare compact />
            </div>
          </div>
          <div className="font-mono text-xs text-gray-400">
            <div className="mb-1 font-bold text-black">DATA SOURCES</div>
            <div>ONS · Electoral Commission</div>
            <div>Ipsos · YouGov · Savanta</div>
            <div>Bank of England · Home Office</div>
            <div>NatCen (BSA) · PollCheck</div>
            <div>Betfair · Oddschecker · Smarkets</div>
            <div>HMRC · NHS England · NHS Digital</div>
            <div>OBR · IMF · Home Office</div>
          </div>
          <div className="font-mono text-xs text-gray-400">
            <div className="mb-1 font-bold text-black">BUILT WITH</div>
            <div>Next.js · TypeScript</div>
            <div>Recharts · Tailwind CSS</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t-2 border-black flex flex-wrap justify-between items-center gap-2">
          <div className="font-mono text-xs text-gray-400">
            © 2025 PULSE METRICS. ALL PUBLIC DATA.
          </div>
          <div
            className="font-display text-xs tracking-widest px-3 py-1"
            style={{
              fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif",
              background: "#FF3B00",
              color: "#fff",
              boxShadow: "2px 2px 0px #000",
            }}
          >
            PUBLIC DATA INTELLIGENCE
          </div>
        </div>
      </footer>
    </div>
  );
}
