import RadarChart from "./components/RadarChart";
import SankeyDiagram from "./components/SankeyDiagram";
import PolarizationMeter from "./components/PolarizationMeter";
import TrendLines from "./components/TrendLines";
import SentimentPulse from "./components/SentimentPulse";
import GeographicHeatmap from "./components/GeographicHeatmap";
import EchoChamberMap from "./components/EchoChamberMap";
import PredictionMarket from "./components/PredictionMarket";
import SentimentClusters from "./components/SentimentClusters";
import ScenarioSliders from "./components/ScenarioSliders";

const ISSUE_DATE = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* ── TOP BAR ── */}
      <div className="border-b-4 border-black bg-black text-white px-6 py-2 flex justify-between items-center">
        <span className="font-mono text-xs tracking-widest uppercase">
          Public Opinion Intelligence Platform
        </span>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-red-500 inline-block"
            style={{ animation: "pulse-live 1.5s ease-in-out infinite" }}
          />
          <span className="font-mono text-xs tracking-widest text-red-400 uppercase">Live Data</span>
        </div>
        <span className="font-mono text-xs tracking-widest uppercase opacity-60">{ISSUE_DATE}</span>
      </div>

      {/* ── MASTHEAD ── */}
      <header className="border-b-8 border-black px-6 py-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-xs tracking-[0.4em] uppercase text-gray-500 mb-2">
                Issue No. 047 · Est. 2024
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
                REAL-TIME PUBLIC OPINION
                <br />
                INTELLIGENCE
              </div>
              <div className="font-display text-lg text-gray-400 tracking-widest">
                UNITED KINGDOM · 12,847 RESPONDENTS
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
              10 KEY METRICS
            </div>
            <div className="flex-1 h-1 bg-black" />
          </div>
        </div>
      </header>

      {/* ── NAVIGATION STRIP ── */}
      <nav className="border-b-2 border-black bg-gray-50 px-6 py-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-0 font-mono text-xs tracking-widest whitespace-nowrap">
          {[
            "01 WHERE DO I STAND",
            "02 DEMOGRAPHIC FLOW",
            "03 POLARIZATION",
            "04 TRUST TREND",
            "05 SENTIMENT PULSE",
            "06 UK MAP",
            "07 ECHO CHAMBER",
            "08 PREDICTIONS",
            "09 CLUSTERS",
            "10 SCENARIOS",
          ].map((item, i) => (
            <div key={i} className="flex items-center">
              <span
                className="px-3 py-1 hover:bg-black hover:text-white cursor-pointer transition-colors"
                style={{ color: i === 0 ? "#FF3B00" : "#000" }}
              >
                {item}
              </span>
              {i < 9 && <span className="text-gray-300">·</span>}
            </div>
          ))}
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* Section intro */}
        <div className="mb-8 border-l-8 border-black pl-6">
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">
            Latest Edition · Public Opinion Tracker
          </div>
          <p className="font-display text-2xl md:text-3xl tracking-wide max-w-2xl leading-tight">
            10 INTERACTIVE METRICS TRACKING THE MOOD OF THE NATION.
            REAL DATA. NO SPIN.
          </p>
        </div>

        {/* ── GRID ROW 1: Full-width ── */}
        <div className="mb-6 relative">
          <div
            className="absolute -top-4 -right-2 font-display opacity-5 pointer-events-none select-none leading-none"
            style={{ fontSize: "clamp(80px, 15vw, 140px)", fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
          >
            01
          </div>
          <RadarChart />
        </div>

        {/* ── GRID ROW 2: 2-col ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="relative">
            <div
              className="absolute -top-4 -right-2 font-display opacity-5 pointer-events-none select-none leading-none"
              style={{ fontSize: "120px", fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
            >
              02
            </div>
            <SankeyDiagram />
          </div>
          <div className="relative">
            <div
              className="absolute -top-4 -right-2 font-display opacity-5 pointer-events-none select-none leading-none"
              style={{ fontSize: "120px", fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
            >
              03
            </div>
            <PolarizationMeter />
          </div>
        </div>

        {/* ── SECTION DIVIDER ── */}
        <div className="my-10 flex items-center gap-0">
          <div className="h-2 flex-1 bg-black" />
          <div className="h-2 w-8" style={{ background: "#FF3B00" }} />
        </div>

        {/* ── GRID ROW 3: Full-width ── */}
        <div className="mb-6 relative">
          <TrendLines />
        </div>

        {/* ── GRID ROW 4: 3-col ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          <div>
            <SentimentPulse />
          </div>
          <div>
            <GeographicHeatmap />
          </div>
          <div>
            <EchoChamberMap />
          </div>
        </div>

        {/* ── SECTION DIVIDER ── */}
        <div className="my-10 flex items-center gap-0">
          <div className="h-2 w-8" style={{ background: "#FF3B00" }} />
          <div className="h-2 flex-1 bg-black" />
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
            Editor's Note
          </div>
          <blockquote
            className="font-display text-2xl md:text-4xl leading-tight max-w-3xl"
            style={{ fontFamily: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif" }}
          >
            "PUBLIC OPINION IS NOT A MONOLITH. IT IS A LIVING, FRACTURING,
            CONTRADICTORY THING — AND THAT'S WHAT MAKES IT WORTH MEASURING."
          </blockquote>
          <cite className="block mt-4 font-mono text-xs text-gray-400 not-italic">
            — PULSE EDITORIAL, ISSUE 047
          </cite>
        </div>

        {/* ── GRID ROW 5: 2-col ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PredictionMarket />
          <SentimentClusters />
        </div>

        {/* ── GRID ROW 6: Full-width ── */}
        <div className="mb-6">
          <ScenarioSliders />
        </div>

        {/* ── STATS BAR ── */}
        <div className="border-4 border-black bg-black text-white p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-700">
            {[
              { label: "TOTAL RESPONDENTS", value: "12,847", note: "THIS WEEK" },
              { label: "METRICS TRACKED", value: "10", note: "INTERACTIVE" },
              { label: "TOPICS COVERED", value: "24", note: "POLICY AREAS" },
              { label: "DATA UPDATED", value: "LIVE", note: "EVERY 2 SECONDS", accent: true },
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
              Public Opinion Intelligence Platform. All data is simulated for
              demonstration purposes. No real polling data used.
            </div>
          </div>
          <div className="font-mono text-xs text-gray-400">
            <div className="mb-1 font-bold text-black">BUILT WITH</div>
            <div>Next.js 16 · TypeScript</div>
            <div>Recharts · Tailwind CSS v4</div>
            <div>Framer Motion</div>
          </div>
          <div className="font-mono text-xs text-gray-400">
            <div className="mb-1 font-bold text-black">DESIGN LANGUAGE</div>
            <div>Editorial Brutalism</div>
            <div>Bebas Neue · IBM Plex Mono</div>
            <div>#FF3B00 · #000000 · #FFFFFF</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t-2 border-black flex justify-between items-center">
          <div className="font-mono text-xs text-gray-400">
            © 2024 PULSE METRICS. ISSUE 047.
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
            REAL-TIME PUBLIC OPINION INTELLIGENCE
          </div>
        </div>
      </footer>
    </div>
  );
}
