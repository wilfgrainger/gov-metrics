"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// UK Crime Statistics from ONS Crime Survey for England and Wales
// Source: https://www.ons.gov.uk/peoplepopulationandcommunity/crimeandjustice
// Police recorded crime data from Home Office / ONS
// Year ending March 2025 estimates
const CRIME_CATEGORIES = [
  { category: "Fraud", count: 4_200_000, change: +31, per1000: 61.8 },
  { category: "Theft", count: 2_000_000, change: -5, per1000: 29.4 },
  { category: "Violence", count: 1_500_000, change: +3, per1000: 22.1 },
  { category: "Criminal Damage", count: 700_000, change: -8, per1000: 10.3 },
  { category: "Shoplifting", count: 530_643, change: +20, per1000: 7.8 },
  { category: "Vehicle Crime", count: 390_000, change: -2, per1000: 5.7 },
  { category: "Robbery", count: 78_804, change: -3, per1000: 1.2 },
  { category: "Drug Offences", count: 120_000, change: -10, per1000: 1.8 },
];

// Headline stats
const HEADLINE = {
  totalCrime: 9_400_000,
  changePct: +7,
  knifeCrime: 53_047,
  knifeCrimeChange: -1,
  homicides: 535,
  homicideChange: -6,
  chargeRate: 5.7, // % of crimes resulting in charge
};

// Regional breakdown
const REGIONAL = [
  { region: "London", per1000: 98.2, color: "#FF3B00" },
  { region: "North West", per1000: 89.4, color: "#333" },
  { region: "Yorkshire", per1000: 87.1, color: "#333" },
  { region: "West Midlands", per1000: 84.6, color: "#333" },
  { region: "North East", per1000: 82.3, color: "#333" },
  { region: "East Midlands", per1000: 76.8, color: "#666" },
  { region: "South West", per1000: 64.2, color: "#666" },
  { region: "South East", per1000: 62.1, color: "#999" },
  { region: "East of England", per1000: 60.5, color: "#999" },
];

export default function CrimeStatistics() {
  const [view, setView] = useState<"category" | "regional">("category");

  return (
    <div>
      {/* Headline stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-4">
        {[
          { label: "TOTAL CRIME", value: "9.4M", sub: `+${HEADLINE.changePct}% YoY`, negative: false },
          { label: "KNIFE CRIME", value: HEADLINE.knifeCrime.toLocaleString("en-GB"), sub: `${HEADLINE.knifeCrimeChange}% YoY`, positive: true },
          { label: "HOMICIDES", value: HEADLINE.homicides.toString(), sub: `${HEADLINE.homicideChange}% YoY`, negative: true },
          { label: "CHARGE RATE", value: `${HEADLINE.chargeRate}%`, sub: "of reported crimes", neutral: true },
        ].map((s, i) => (
          <div key={i} className={`border-2 border-black p-3 text-center ${i > 0 ? "border-l-0" : ""}`}>
            <p className="font-mono text-[10px] text-gray-500">{s.label}</p>
            <p className="font-mono text-xl font-bold">{s.value}</p>
            <p className={`font-mono text-[10px] ${
              s.sub.includes("+") ? "text-red-600" : s.sub.includes("-") ? "text-green-600" : "text-gray-500"
            }`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div className="flex border-2 border-black mb-4">
        {[
          { key: "category" as const, label: "BY CATEGORY" },
          { key: "regional" as const, label: "BY REGION" },
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

      {view === "category" && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CRIME_CATEGORIES} layout="vertical" margin={{ left: 10, right: 40 }}>
              <XAxis
                type="number"
                tick={{ fontFamily: "IBM Plex Mono", fontSize: 9 }}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fontFamily: "IBM Plex Mono", fontSize: 10 }}
                width={100}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-black text-white p-3 border-2 border-black font-mono text-xs">
                      <p className="font-bold">{d.category}</p>
                      <p>{d.count.toLocaleString("en-GB")} incidents</p>
                      <p>{d.per1000} per 1,000 population</p>
                      <p className={d.change > 0 ? "text-red-400" : "text-green-400"}>
                        {d.change > 0 ? "+" : ""}{d.change}% YoY
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count">
                {CRIME_CATEGORIES.map((d, i) => (
                  <Cell key={i} fill={d.change > 0 ? "#FF3B00" : "#000000"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="font-mono text-[10px] text-gray-500 mt-1">
            ■ <span className="text-[#FF3B00]">Orange</span> = increasing YoY · ■ Black = decreasing YoY
          </p>
        </div>
      )}

      {view === "regional" && (
        <div className="space-y-2">
          {REGIONAL.map((r) => (
            <div key={r.region} className="flex items-center gap-3">
              <p className="font-mono text-xs w-28 text-right">{r.region}</p>
              <div className="flex-1 h-5 bg-gray-100 border border-black relative">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${(r.per1000 / 100) * 100}%`, backgroundColor: r.color }}
                />
              </div>
              <p className="font-mono text-xs font-bold w-12">{r.per1000}</p>
            </div>
          ))}
          <p className="font-mono text-[10px] text-gray-500 mt-2">Crimes per 1,000 population · Police recorded crime</p>
        </div>
      )}

      <p className="font-mono text-[10px] text-gray-400 mt-4">
        DATA SOURCES: ONS Crime Survey for England & Wales (CSEW), year ending March 2025. Home Office Police Recorded Crime statistics. Knife crime & homicide data: Home Office. Shoplifting: Police recorded crime. Charge rate from CPS/Home Office data.
      </p>
    </div>
  );
}
