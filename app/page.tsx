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

const ISSUE_DATE = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const SECTIONS = [
  { id: "political-compass", label: "01 POLITICAL COMPASS" },
  { id: "national-debt", label: "02 NATIONAL DEBT" },
  { id: "election-polls", label: "03 ELECTION POLLS" },
  { id: "betting-odds", label: "04 BETTING ODDS" },
  { id: "crime-stats", label: "05 CRIME STATS" },
  { id: "govt-approval", label: "06 GOVT APPROVAL" },
  { id: "gov-trust-trend", label: "07 GOV TRUST TREND" },
  { id: "economy", label: "08 ECONOMY" },
  { id: "uk-regions", label: "09 UK REGIONS" },
  { id: "policy-links", label: "10 POLICY LINKS" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* ── TOP BAR ── */}
      <div className="border-b-4 border-black bg-black text-white px-6 py-2 flex justify-between items-center">
        <span className="font-mono text-xs tracking-widest uppercase">
          UK Public Data Intelligence Platform
        </span>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-red-500 inline-block"
            style={{ animation: "pulse-live 1.5s ease-in-out infinite" }}
          />
          <span className="font-mono text-xs tracking-widest text-red-400 uppercase">Public Data</span>
        </div>
        <span className="font-mono text-xs tracking-widest uppercase opacity-60">{ISSUE_DATE}</span>
      </div>

      {/* ── MASTHEAD ── */}
      <header className="border-b-8 border-black px-6 py-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-xs tracking-[0.4em] uppercase text-gray-500 mb-2">
                Public Data Aggregator · United Kingdom
              </div>
              <h1
                className="font-display leading-none tracking-tight"
                style={{
                  fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif",
                  fontSize: "clamp(80px, 18vw, 200px)",
                  letterSpacing: "-0.02em",
                  lineHeight: 0.9,
                }}
              >
                PULSE
              </h1>
            </div>
            <div className="text-right">
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
              className="font-mono text-xs tracking-widest px-3 py-1 bg-black text-white"
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
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* Section intro */}
        <div className="mb-8 border-l-8 border-black pl-6">
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">
            Public Data Dashboard · All Sources Cited
          </div>
          <p className="font-display text-2xl md:text-3xl tracking-wide max-w-2xl leading-tight">
            KEY UK METRICS FROM PUBLIC DATASETS & APIS.
            REAL DATA. ALL SOURCES CITED.
          </p>
        </div>

        {/* ── ROW 1: Political Compass (full-width) ── */}
        <section id="political-compass" className="mb-6 border-4 border-black p-6 bg-white relative scroll-mt-20">
          <div
            className="absolute -top-4 -right-2 font-display opacity-5 pointer-events-none select-none leading-none"
            style={{ fontSize: "clamp(80px, 15vw, 140px)", fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
          >
            01
          </div>
          <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
            <div>
              <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Interactive</div>
              <h2 className="font-display text-4xl tracking-wider leading-none">POLITICAL COMPASS</h2>
              <p className="font-mono text-xs mt-2 text-gray-600">WHERE DO YOU SIT ON THE POLITICAL SPECTRUM? ANSWER 10 POLICY QUESTIONS.</p>
            </div>
          </div>
          <PoliticalCompass />
        </section>

        {/* ── ROW 2: Debt Counter + Polling (2-col) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <section id="national-debt" className="border-4 border-black p-6 bg-white relative scroll-mt-20">
            <div
              className="absolute -top-4 -right-2 font-display opacity-5 pointer-events-none select-none leading-none"
              style={{ fontSize: "120px", fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
            >
              02
            </div>
            <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
              <div>
                <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Live Counter</div>
                <h2 className="font-display text-4xl tracking-wider leading-none">NATIONAL DEBT</h2>
                <p className="font-mono text-xs mt-2 text-gray-600">UK PUBLIC SECTOR NET DEBT · LIVE ESTIMATE</p>
              </div>
            </div>
            <NationalDebtCounter />
          </section>
          <section id="election-polls" className="border-4 border-black p-6 bg-white relative scroll-mt-20">
            <div
              className="absolute -top-4 -right-2 font-display opacity-5 pointer-events-none select-none leading-none"
              style={{ fontSize: "120px", fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
            >
              03
            </div>
            <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
              <div>
                <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Polling Data</div>
                <h2 className="font-display text-4xl tracking-wider leading-none">ELECTION POLLING</h2>
                <p className="font-mono text-xs mt-2 text-gray-600">UK GENERAL ELECTION VOTING INTENTION AVERAGES</p>
              </div>
            </div>
            <ElectionPolling />
          </section>
        </div>

        {/* ── SECTION DIVIDER ── */}
        <div className="my-10 flex items-center gap-0">
          <div className="h-2 flex-1 bg-black" />
          <div className="h-2 w-8" style={{ background: "#FF3B00" }} />
        </div>

        {/* ── ROW 3: Betting Odds + Crime (2-col) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <section id="betting-odds" className="border-4 border-black p-6 bg-white relative scroll-mt-20">
            <div
              className="absolute -top-4 -right-2 font-display opacity-5 pointer-events-none select-none leading-none"
              style={{ fontSize: "120px", fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
            >
              04
            </div>
            <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
              <div>
                <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Market Data</div>
                <h2 className="font-display text-4xl tracking-wider leading-none">BETTING ODDS</h2>
                <p className="font-mono text-xs mt-2 text-gray-600">NEXT UK GENERAL ELECTION · IMPLIED PROBABILITIES</p>
              </div>
            </div>
            <BettingOdds />
          </section>
          <section id="crime-stats" className="border-4 border-black p-6 bg-white relative scroll-mt-20">
            <div
              className="absolute -top-4 -right-2 font-display opacity-5 pointer-events-none select-none leading-none"
              style={{ fontSize: "120px", fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
            >
              05
            </div>
            <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
              <div>
                <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Government Stats</div>
                <h2 className="font-display text-4xl tracking-wider leading-none">CRIME STATISTICS</h2>
                <p className="font-mono text-xs mt-2 text-gray-600">ONS RECORDED CRIME · ENGLAND & WALES</p>
              </div>
            </div>
            <CrimeStatistics />
          </section>
        </div>

        {/* ── ROW 4: Polarization (full-width) ── */}
        <section id="govt-approval" className="mb-6 border-4 border-black p-6 bg-white relative scroll-mt-20">
          <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
            <div>
              <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Public Opinion</div>
              <h2 className="font-display text-4xl tracking-wider leading-none">GOVERNMENT APPROVAL</h2>
              <p className="font-mono text-xs mt-2 text-gray-600">DISTRIBUTION OF GOVERNMENT SATISFACTION ACROSS POLLS</p>
            </div>
            <div className="text-6xl font-display text-accent leading-none">06</div>
          </div>
          <PolarizationMeter />
        </section>

        {/* ── SECTION DIVIDER ── */}
        <div className="my-10 flex items-center gap-0">
          <div className="h-2 w-8" style={{ background: "#FF3B00" }} />
          <div className="h-2 flex-1 bg-black" />
        </div>

        {/* ── ROW 5: Trust Trend (full-width) ── */}
        <section id="gov-trust-trend" className="mb-6 border-4 border-black p-6 bg-white relative scroll-mt-20">
          <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
            <div>
              <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Longitudinal Data</div>
              <h2 className="font-display text-4xl tracking-wider leading-none">TRUST IN GOVERNMENT</h2>
              <p className="font-mono text-xs mt-2 text-gray-600">SATISFACTION WITH GOVERNMENT 2020–2025 · KEY EVENTS ANNOTATED</p>
            </div>
            <div className="text-6xl font-display text-accent leading-none">07</div>
          </div>
          <TrendLines />
        </section>

        {/* ── ROW 6: Economic + Regional + Correlations (3-col) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          <section id="economy" className="border-4 border-black p-6 bg-white scroll-mt-20">
            <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
              <div>
                <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Economic Data</div>
                <h2 className="font-display text-3xl tracking-wider leading-none">ECONOMY</h2>
                <p className="font-mono text-xs mt-2 text-gray-600">KEY UK INDICATORS</p>
              </div>
              <div className="text-5xl font-display text-accent leading-none">08</div>
            </div>
            <SentimentPulse />
          </section>
          <section id="uk-regions" className="border-4 border-black p-6 bg-white scroll-mt-20">
            <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
              <div>
                <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Regional Data</div>
                <h2 className="font-display text-3xl tracking-wider leading-none">UK REGIONS</h2>
                <p className="font-mono text-xs mt-2 text-gray-600">MULTI-LAYER MAP</p>
              </div>
              <div className="text-5xl font-display text-accent leading-none">09</div>
            </div>
            <GeographicHeatmap />
          </section>
          <section id="policy-links" className="border-4 border-black p-6 bg-white scroll-mt-20">
            <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
              <div>
                <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Survey Data</div>
                <h2 className="font-display text-3xl tracking-wider leading-none">POLICY LINKS</h2>
                <p className="font-mono text-xs mt-2 text-gray-600">OPINION CORRELATIONS</p>
              </div>
              <div className="text-5xl font-display text-accent leading-none">10</div>
            </div>
            <EchoChamberMap />
          </section>
        </div>

        {/* ── SOCIAL SHARE ── */}
        <div className="mb-6">
          <SocialShare />
        </div>

        {/* ── PULL QUOTE ── */}
        <div
          className="mb-10 border-4 border-black p-6 md:p-10 bg-black text-white relative overflow-hidden"
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
            className="font-display text-2xl md:text-4xl leading-tight max-w-3xl"
            style={{ fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
          >
            &ldquo;ALL DATA ON THIS DASHBOARD IS SOURCED FROM PUBLIC DATASETS AND
            PUBLIC APIS. WE DON&apos;T CAPTURE NEW DATA — WE AGGREGATE WHAT&apos;S ALREADY PUBLIC.&rdquo;
          </blockquote>
          <cite className="block mt-4 font-mono text-xs text-gray-400 not-italic">
            — SOURCES: ONS, ELECTORAL COMMISSION, IPSOS, YOUGOV, BANK OF ENGLAND, HOME OFFICE
          </cite>
        </div>

        {/* ── STATS BAR ── */}
        <div className="border-4 border-black bg-black text-white p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-700">
            {[
              { label: "DATA SOURCES", value: "10+", note: "PUBLIC APIS & DATASETS" },
              { label: "METRICS TRACKED", value: "10", note: "INTERACTIVE VIEWS" },
              { label: "COVERAGE", value: "UK", note: "NATIONAL & REGIONAL" },
              { label: "ALL DATA", value: "PUBLIC", note: "FREELY AVAILABLE", accent: true },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-2 first:pl-0 last:pr-0">
                <div className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {stat.label}
                </div>
                <div
                  className="font-display text-4xl leading-none"
                  style={{ fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif", color: stat.accent ? "#FF3B00" : "#fff" }}
                >
                  {stat.value}
                </div>
                <div className="font-mono text-xs text-gray-600 mt-1">{stat.note}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t-4 border-black px-6 py-8 bg-white">
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
          </div>
          <div className="font-mono text-xs text-gray-400">
            <div className="mb-1 font-bold text-black">BUILT WITH</div>
            <div>Next.js · TypeScript</div>
            <div>Recharts · Tailwind CSS</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t-2 border-black flex justify-between items-center">
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
