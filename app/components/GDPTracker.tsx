"use client";

import { useState } from "react";

// UK GDP Data from ONS National Accounts
// Source: https://www.ons.gov.uk/economy/grossdomesticproductgdp
// UK GDP (nominal): ~£2.274 trillion (2024, ONS)
// GDP per capita: ~£33,486 (2024, ONS)
// Real GDP growth: 0.9% in 2024, forecast 1.1% in 2025 (OBR)
// G7 comparison data from IMF World Economic Outlook (Oct 2025)
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
  { sector: "Services", pct: 80.2, value: "£1.82T" },
  { sector: "Manufacturing", pct: 9.7, value: "£221B" },
  { sector: "Construction", pct: 6.3, value: "£143B" },
  { sector: "Agriculture", pct: 0.6, value: "£14B" },
  { sector: "Other", pct: 3.2, value: "£73B" },
];

export default function GDPTracker() {
  const [view, setView] = useState<"overview" | "g7" | "sectors">("overview");
  const latest = GDP_HISTORY[GDP_HISTORY.length - 2]; // 2024 actual
  const forecast = GDP_HISTORY[GDP_HISTORY.length - 1];

  return (
    <div>
      {/* Headline stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-4">
        {[
          { label: "TOTAL GDP", value: `£${latest.total}T`, sub: `${latest.year} nominal` },
          { label: "PER CAPITA", value: `£${latest.perCapita.toLocaleString("en-GB")}`, sub: "per person" },
          { label: "GROWTH", value: `${latest.growth}%`, sub: `${latest.year} real`, accent: latest.growth > 0 },
          { label: "2025 FORECAST", value: `${forecast.growth}%`, sub: "OBR estimate", accent: true },
        ].map((s, i) => (
          <div key={i} className={`border-2 border-black p-3 text-center ${i > 0 ? "border-l-0" : ""}`}>
            <p className="font-mono text-[10px] text-gray-500">{s.label}</p>
            <p className="font-mono text-lg font-bold" style={{ color: s.accent ? "#FF3B00" : "#000" }}>{s.value}</p>
            <p className="font-mono text-[10px] text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div className="flex border-2 border-black mb-4">
        {([
          { key: "overview" as const, label: "GDP TREND" },
          { key: "g7" as const, label: "G7 COMPARISON" },
          { key: "sectors" as const, label: "BY SECTOR" },
        ]).map((tab) => (
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
          {GDP_HISTORY.map((d) => (
            <div key={d.year} className="flex items-center gap-3">
              <p className="font-mono text-xs w-14 text-right text-gray-500">{d.year}</p>
              <div className="flex-1 h-6 bg-gray-100 border border-black relative">
                <div
                  className="h-full"
                  style={{
                    width: `${(d.total / 2.5) * 100}%`,
                    background: d.year.includes("F") ? "#FF3B00" : "#000",
                    opacity: d.year.includes("F") ? 0.6 : 1,
                  }}
                />
              </div>
              <p className="font-mono text-xs font-bold w-16 text-right">£{d.total}T</p>
              <p className={`font-mono text-xs w-16 text-right ${d.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {d.growth > 0 ? "+" : ""}{d.growth}%
              </p>
            </div>
          ))}
          <p className="font-mono text-[10px] text-gray-500 mt-2">■ Black = actual · <span className="text-[#FF3B00]">■ Orange</span> = OBR forecast</p>
        </div>
      )}

      {view === "g7" && (
        <div>
          <p className="font-mono text-xs text-gray-500 mb-3">GDP PER CAPITA (USD, PPP) — IMF 2024 ESTIMATES</p>
          <div className="space-y-2">
            {G7_COMPARISON.sort((a, b) => b.perCapita - a.perCapita).map((d) => (
              <div key={d.country} className="flex items-center gap-3">
                <p className="font-mono text-xs w-24 text-right">{d.country === "United Kingdom" ? <strong>{d.country}</strong> : d.country}</p>
                <div className="flex-1 h-5 bg-gray-100 border border-black relative">
                  <div
                    className="h-full"
                    style={{
                      width: `${(d.perCapita / 90000) * 100}%`,
                      backgroundColor: d.color,
                    }}
                  />
                </div>
                <p className="font-mono text-xs font-bold w-16 text-right" style={{ color: d.country === "United Kingdom" ? "#FF3B00" : "#000" }}>
                  ${(d.perCapita / 1000).toFixed(1)}k
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "sectors" && (
        <div>
          <p className="font-mono text-xs text-gray-500 mb-3">UK GDP BY SECTOR (% OF TOTAL)</p>
          <div className="space-y-3">
            {SECTOR_BREAKDOWN.map((d) => (
              <div key={d.sector} className="border-2 border-black p-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-mono text-sm font-bold">{d.sector}</p>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold">{d.pct}%</p>
                    <p className="font-mono text-[10px] text-gray-500">{d.value}</p>
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-100 border border-black">
                  <div
                    className="h-full bg-black transition-all duration-500"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="font-mono text-[10px] text-gray-400 mt-4">
        DATA SOURCES: ONS Gross Domestic Product (GDP) quarterly national accounts.
        UK nominal GDP 2024: £2.274T. Per capita: £33,486 (ONS). G7 comparison: IMF World Economic Outlook (Oct 2025, USD PPP).
        Sector breakdown: ONS GDP output approach. 2025 forecast: OBR Economic and Fiscal Outlook (Oct 2024).
        Sources: ons.gov.uk/economy/grossdomesticproductgdp · imf.org/en/Publications/WEO
      </p>
    </div>
  );
}
