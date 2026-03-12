"use client";

import { useState } from "react";

// UK Migration Statistics — ONS International Migration
// Source: https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration
// Long-term International Migration (LTIM) estimates
// Year ending June 2024 (latest ONS provisional): Net migration ~728,000
// Year ending June 2023: Net migration ~906,000 (revised peak)
// Home Office visa statistics: gov.uk/government/statistics/immigration-system-statistics-quarterly-release
const MIGRATION_HISTORY = [
  { year: "2015", net: 332, immigration: 631, emigration: 299 },
  { year: "2016", net: 233, immigration: 588, emigration: 355 },
  { year: "2017", net: 262, immigration: 602, emigration: 340 },
  { year: "2018", net: 271, immigration: 612, emigration: 341 },
  { year: "2019", net: 271, immigration: 641, emigration: 370 },
  { year: "2020", net: 92, immigration: 325, emigration: 233 },
  { year: "2021", net: 488, immigration: 740, emigration: 252 },
  { year: "2022", net: 764, immigration: 1095, emigration: 331 },
  { year: "2023", net: 906, immigration: 1218, emigration: 312 },
  { year: "2024", net: 728, immigration: 1106, emigration: 378 },
];

const VISA_TYPES = [
  { type: "Work Visas", count: 337, pct: 30.5, change: -18 },
  { type: "Study Visas", count: 418, pct: 37.8, change: -15 },
  { type: "Family Visas", count: 120, pct: 10.9, change: +4 },
  { type: "Humanitarian", count: 82, pct: 7.4, change: -22 },
  { type: "Other", count: 149, pct: 13.4, change: -5 },
];

const TOP_NATIONALITIES = [
  { country: "India", count: 253, color: "#FF3B00" },
  { country: "Nigeria", count: 141, color: "#333" },
  { country: "China", count: 92, color: "#333" },
  { country: "Pakistan", count: 73, color: "#333" },
  { country: "Philippines", count: 41, color: "#333" },
  { country: "Zimbabwe", count: 36, color: "#666" },
  { country: "Ukraine", count: 35, color: "#666" },
  { country: "Bangladesh", count: 32, color: "#666" },
];

export default function MigrationStats() {
  const [view, setView] = useState<"overview" | "visas" | "origins">("overview");
  const latest = MIGRATION_HISTORY[MIGRATION_HISTORY.length - 1];

  return (
    <div>
      {/* Headline */}
      <div className="grid grid-cols-3 gap-0 mb-4">
        <div className="border-2 border-black p-3 text-center">
          <p className="font-mono text-[10px] text-gray-500">IMMIGRATION</p>
          <p className="font-mono text-xl font-bold">{(latest.immigration / 1000).toFixed(1)}M</p>
          <p className="font-mono text-[10px] text-gray-400">YE Jun 2024</p>
        </div>
        <div className="border-2 border-black border-l-0 p-3 text-center bg-black text-white">
          <p className="font-mono text-[10px] text-gray-400">NET MIGRATION</p>
          <p className="font-mono text-xl font-bold text-[#FF3B00]">{latest.net}K</p>
          <p className="font-mono text-[10px] text-gray-400">YE Jun 2024</p>
        </div>
        <div className="border-2 border-black border-l-0 p-3 text-center">
          <p className="font-mono text-[10px] text-gray-500">EMIGRATION</p>
          <p className="font-mono text-xl font-bold">{latest.emigration}K</p>
          <p className="font-mono text-[10px] text-gray-400">YE Jun 2024</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex border-2 border-black mb-4">
        {([
          { key: "overview" as const, label: "NET MIGRATION" },
          { key: "visas" as const, label: "BY VISA TYPE" },
          { key: "origins" as const, label: "TOP ORIGINS" },
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
          {MIGRATION_HISTORY.map((d) => (
            <div key={d.year} className="flex items-center gap-3">
              <p className="font-mono text-xs w-10 text-right text-gray-500">{d.year}</p>
              <div className="flex-1 h-5 bg-gray-100 border border-black relative">
                <div
                  className="h-full"
                  style={{
                    width: `${(d.net / 1000) * 100}%`,
                    background: d.net > 500 ? "#FF3B00" : "#000",
                  }}
                />
              </div>
              <p className="font-mono text-xs font-bold w-14 text-right" style={{ color: d.net > 500 ? "#FF3B00" : "#000" }}>
                {d.net}K
              </p>
            </div>
          ))}
          <p className="font-mono text-[10px] text-gray-500 mt-2">
            <span className="text-[#FF3B00]">■</span> Orange = above 500K net migration
          </p>
        </div>
      )}

      {view === "visas" && (
        <div>
          <p className="font-mono text-xs text-gray-500 mb-3">VISA GRANTS BY CATEGORY — YE JUN 2024</p>
          <div className="space-y-2">
            {VISA_TYPES.map((d) => (
              <div key={d.type} className="flex items-center gap-2">
                <p className="font-mono text-xs w-24 text-right">{d.type}</p>
                <div className="flex-1 h-5 bg-gray-100 border border-black relative">
                  <div className="h-full bg-black" style={{ width: `${d.pct}%` }} />
                </div>
                <p className="font-mono text-xs font-bold w-12 text-right">{d.count}K</p>
                <p className={`font-mono text-[10px] w-10 text-right ${d.change >= 0 ? "text-red-600" : "text-green-600"}`}>
                  {d.change > 0 ? "+" : ""}{d.change}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "origins" && (
        <div>
          <p className="font-mono text-xs text-gray-500 mb-3">TOP NATIONALITIES — NET MIGRATION (THOUSANDS)</p>
          <div className="space-y-2">
            {TOP_NATIONALITIES.map((d) => (
              <div key={d.country} className="flex items-center gap-3">
                <p className="font-mono text-xs w-20 text-right">{d.country}</p>
                <div className="flex-1 h-5 bg-gray-100 border border-black relative">
                  <div
                    className="h-full"
                    style={{ width: `${(d.count / 300) * 100}%`, backgroundColor: d.color }}
                  />
                </div>
                <p className="font-mono text-xs font-bold w-12 text-right">{d.count}K</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="font-mono text-[10px] text-gray-400 mt-4">
        DATA SOURCES: ONS Long-term International Migration (LTIM) estimates. Home Office Immigration Statistics.
        Net migration YE June 2024: 728,000 (ONS provisional). Visa data: Home Office quarterly release.
        Top nationalities: ONS estimates by citizenship.
        Sources: ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration ·
        gov.uk/government/statistics/immigration-system-statistics-quarterly-release
      </p>
    </div>
  );
}
