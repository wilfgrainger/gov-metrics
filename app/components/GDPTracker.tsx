"use client";

import { useState } from "react";
import { useMetrics } from "@/app/lib/useMetrics";
import MetricsStatus from "@/app/components/MetricsStatus";

const GDP_HISTORY = [
  { year: "2018", total: 2.174, perCapita: 32720, growth: 1.4 },
  { year: "2019", total: 2.255, perCapita: 33794, growth: 1.6 },
  { year: "2020", total: 2.037, perCapita: 30423, growth: -10.4 },
  { year: "2021", total: 2.202, perCapita: 32857, growth: 8.7 },
  { year: "2022", total: 2.236, perCapita: 33270, growth: 4.3 },
  { year: "2023", total: 2.253, perCapita: 33312, growth: 0.3 },
  { year: "2024", total: 2.274, perCapita: 33486, growth: 0.9 },
  { year: "2025F", total: 2.299, perCapita: 33760, growth: 1.1 },
];

const G7_COMPARISON = [
  { country: "United States", perCapita: 85370, color: "#3b82f6" },
  { country: "Germany", perCapita: 52820, color: "#333" },
  { country: "Canada", perCapita: 52090, color: "#ef4444" },
  { country: "France", perCapita: 44410, color: "#333" },
  { country: "United Kingdom", perCapita: 48910, color: "#FF3B00" },
  { country: "Japan", perCapita: 33140, color: "#333" },
  { country: "Italy", perCapita: 37560, color: "#22c55e" },
];

const SECTOR_BREAKDOWN = [
  { sector: "Services", pct: 80.2, value: "GBP1.82T" },
  { sector: "Manufacturing", pct: 9.7, value: "GBP221B" },
  { sector: "Construction", pct: 6.3, value: "GBP143B" },
  { sector: "Agriculture", pct: 0.6, value: "GBP14B" },
  { sector: "Other", pct: 3.2, value: "GBP73B" },
];

const FALLBACK = { gdpHistory: GDP_HISTORY, g7Comparison: G7_COMPARISON, sectorBreakdown: SECTOR_BREAKDOWN };
const FALLBACK_HISTORY_BY_YEAR = Object.fromEntries(GDP_HISTORY.map((entry) => [entry.year, entry]));

function isForecastYear(value: string) {
  return value.includes("F");
}

function isQuarterlyYear(value: string) {
  return /\sQ[1-4]$/i.test(value);
}

export default function GDPTracker() {
  const metrics = useMetrics("gdpTracker", FALLBACK);
  const { data } = metrics;
  const { gdpHistory, g7Comparison, sectorBreakdown } = data;

  const [view, setView] = useState<"overview" | "g7" | "sectors">("overview");

  const latestSeriesPoint = gdpHistory[gdpHistory.length - 1] ?? GDP_HISTORY[GDP_HISTORY.length - 1];
  const latestActual =
    [...gdpHistory].reverse().find((entry) => !isForecastYear(entry.year)) ??
    GDP_HISTORY[GDP_HISTORY.length - 2];
  const forecast =
    [...gdpHistory].reverse().find((entry) => isForecastYear(entry.year)) ??
    FALLBACK_HISTORY_BY_YEAR["2025F"];
  const summaryActual =
    (isQuarterlyYear(latestActual.year) ? FALLBACK_HISTORY_BY_YEAR["2024"] : latestActual) ??
    FALLBACK_HISTORY_BY_YEAR["2024"];
  const summaryPerCapita =
    summaryActual?.perCapita ??
    FALLBACK_HISTORY_BY_YEAR[latestActual.year]?.perCapita ??
    FALLBACK_HISTORY_BY_YEAR["2024"]?.perCapita ??
    0;
  const summaryTotal = summaryActual?.total ?? FALLBACK_HISTORY_BY_YEAR["2024"]?.total ?? 0;
  const summaryGrowth = summaryActual?.growth ?? FALLBACK_HISTORY_BY_YEAR["2024"]?.growth ?? 0;
  const summaryLabel = isQuarterlyYear(latestActual.year) ? "2024 annual" : `${summaryActual.year} nominal`;
  const forecastGrowth = forecast?.growth ?? FALLBACK_HISTORY_BY_YEAR["2025F"]?.growth ?? 0;

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-0 md:grid-cols-4">
        {[
          { label: "TOTAL GDP", value: `GBP${summaryTotal}T`, sub: summaryLabel },
          { label: "PER CAPITA", value: `GBP${summaryPerCapita.toLocaleString("en-GB")}`, sub: "per person" },
          { label: "GROWTH", value: `${summaryGrowth}%`, sub: `${latestSeriesPoint.year} real`, accent: summaryGrowth > 0 },
          { label: "2025 FORECAST", value: `${forecastGrowth}%`, sub: "OBR estimate", accent: true },
        ].map((stat, index) => (
          <div key={stat.label} className={`border-2 border-black p-3 text-center ${index > 0 ? "border-l-0" : ""}`}>
            <p className="font-mono text-[10px] text-gray-500">{stat.label}</p>
            <p className="font-mono text-lg font-bold" style={{ color: stat.accent ? "#FF3B00" : "#000" }}>
              {stat.value}
            </p>
            <p className="font-mono text-[10px] text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex border-2 border-black">
        {[
          { key: "overview" as const, label: "GDP TREND" },
          { key: "g7" as const, label: "G7 COMPARISON" },
          { key: "sectors" as const, label: "BY SECTOR" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2 font-mono text-xs font-bold transition-colors ${
              view === tab.key ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === "overview" && (
        <div className="space-y-2">
          {gdpHistory.map((entry) => {
            const total = entry.total ?? summaryTotal;

            return (
              <div key={entry.year} className="flex items-center gap-3">
                <p className="w-14 text-right font-mono text-xs text-gray-500">{entry.year}</p>
                <div className="relative h-6 flex-1 border border-black bg-gray-100">
                  <div
                    className="h-full"
                    style={{
                      width: `${(total / 2.5) * 100}%`,
                      background: isForecastYear(entry.year) ? "#FF3B00" : "#000",
                      opacity: isForecastYear(entry.year) ? 0.6 : 1,
                    }}
                  />
                </div>
                <p className="w-16 text-right font-mono text-xs font-bold">GBP{total}T</p>
                <p className={`w-16 text-right font-mono text-xs ${entry.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {entry.growth > 0 ? "+" : ""}
                  {entry.growth}%
                </p>
              </div>
            );
          })}
          <p className="mt-2 font-mono text-[10px] text-gray-500">
            Black = actual / <span className="text-[#FF3B00]">Orange</span> = forecast
          </p>
        </div>
      )}

      {view === "g7" && (
        <div>
          <p className="mb-3 font-mono text-xs text-gray-500">GDP PER CAPITA (USD, PPP) - IMF 2024 ESTIMATES</p>
          <div className="space-y-2">
            {[...g7Comparison].sort((left, right) => right.perCapita - left.perCapita).map((entry) => (
              <div key={entry.country} className="flex items-center gap-3">
                <p className="w-24 text-right font-mono text-xs">
                  {entry.country === "United Kingdom" ? <strong>{entry.country}</strong> : entry.country}
                </p>
                <div className="relative h-5 flex-1 border border-black bg-gray-100">
                  <div
                    className="h-full"
                    style={{
                      width: `${(entry.perCapita / 90000) * 100}%`,
                      backgroundColor: entry.color,
                    }}
                  />
                </div>
                <p
                  className="w-16 text-right font-mono text-xs font-bold"
                  style={{ color: entry.country === "United Kingdom" ? "#FF3B00" : "#000" }}
                >
                  ${(entry.perCapita / 1000).toFixed(1)}k
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "sectors" && (
        <div>
          <p className="mb-3 font-mono text-xs text-gray-500">UK GDP BY SECTOR (% OF TOTAL)</p>
          <div className="space-y-3">
            {sectorBreakdown.map((entry) => (
              <div key={entry.sector} className="border-2 border-black p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-sm font-bold">{entry.sector}</p>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold">{entry.pct}%</p>
                    <p className="font-mono text-[10px] text-gray-500">{entry.value}</p>
                  </div>
                </div>
                <div className="h-3 w-full border border-black bg-gray-100">
                  <div className="h-full bg-black transition-all duration-500" style={{ width: `${entry.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 font-mono text-[10px] text-gray-400">
        DATA SOURCES: ONS Gross Domestic Product quarterly national accounts. Annual summary cards use the latest
        comparable published annual context, while the trend view can show the finer quarterly worker series. G7
        comparison: IMF World Economic Outlook. Sector breakdown: ONS output approach. Forecast: OBR.
      </p>
      <MetricsStatus section="gdpTracker" status={metrics} />
    </div>
  );
}
