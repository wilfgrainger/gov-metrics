"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useMetrics } from "@/app/lib/useMetrics";
import MetricsStatus from "@/app/components/MetricsStatus";
import ClientOnlyChart from "@/app/components/ClientOnlyChart";

const CRIME_CATEGORIES = [
  { category: "Fraud", count: 4_200_000, change: 31, per1000: 61.8 },
  { category: "Theft", count: 1_850_000, change: -2, per1000: 27.2 },
  { category: "Violence", count: 1_380_000, change: 1, per1000: 20.3 },
  { category: "Criminal Damage", count: 590_000, change: -5, per1000: 8.7 },
  { category: "Vehicle Crime", count: 520_000, change: -16, per1000: 7.7 },
  { category: "Burglary", count: 270_000, change: -8, per1000: 4.0 },
  { category: "Computer Misuse", count: 692_000, change: -32, per1000: 10.2 },
  { category: "Robbery", count: 150_000, change: -3, per1000: 2.2 },
];

const HEADLINE = {
  totalCrime: 9_300_000,
  changePct: 0,
  knifeCrime: 51_527,
  knifeCrimeChange: -5,
  homicides: 499,
  homicideChange: -7,
  chargeRate: 5.7,
};

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

const FALLBACK = {
  crimeCategories: CRIME_CATEGORIES,
  headline: HEADLINE,
  regional: REGIONAL,
};

export default function CrimeStatistics() {
  const metrics = useMetrics("crimeStatistics", FALLBACK);
  const { data } = metrics;
  const { crimeCategories, headline, regional } = data;
  const [view, setView] = useState<"category" | "regional">("category");

  return (
    <div className="min-w-0">
      <div className="mb-4 grid grid-cols-2 gap-0 md:grid-cols-4">
        {[
          {
            label: "TOTAL CRIME",
            value: "9.3M",
            sub: `${headline.changePct === 0 ? "~0" : headline.changePct}% YoY`,
          },
          {
            label: "KNIFE CRIME",
            value: headline.knifeCrime.toLocaleString("en-GB"),
            sub: `${headline.knifeCrimeChange}% YoY`,
          },
          {
            label: "HOMICIDES",
            value: headline.homicides.toString(),
            sub: `${headline.homicideChange}% YoY`,
          },
          {
            label: "CHARGE RATE",
            value: `${headline.chargeRate}%`,
            sub: "of reported crimes",
          },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`border-2 border-black p-3 text-center ${
              index > 0 ? "border-l-0" : ""
            }`}
          >
            <p className="font-mono text-[10px] text-gray-500">{stat.label}</p>
            <p className="font-mono text-xl font-bold">{stat.value}</p>
            <p
              className={`font-mono text-[10px] ${
                stat.sub.includes("+")
                  ? "text-red-600"
                  : stat.sub.includes("-")
                    ? "text-green-600"
                    : "text-gray-500"
              }`}
            >
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex border-2 border-black">
        {[
          { key: "category" as const, label: "BY CATEGORY" },
          { key: "regional" as const, label: "BY REGION" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2 font-mono text-xs font-bold transition-colors ${
              view === tab.key
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === "category" && (
        <ClientOnlyChart heightClass="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={crimeCategories}
              layout="vertical"
              margin={{ left: 10, right: 40 }}
            >
              <XAxis
                type="number"
                tick={{ fontFamily: "IBM Plex Mono", fontSize: 9 }}
                tickFormatter={(value) =>
                  `${(value / 1_000_000).toFixed(1)}M`
                }
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fontFamily: "IBM Plex Mono", fontSize: 10 }}
                width={100}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) {
                    return null;
                  }

                  const datum = payload[0].payload;

                  return (
                    <div className="border-2 border-black bg-black p-3 font-mono text-xs text-white">
                      <p className="font-bold">{datum.category}</p>
                      <p>{datum.count.toLocaleString("en-GB")} incidents</p>
                      <p>{datum.per1000} per 1,000 population</p>
                      <p
                        className={
                          datum.change > 0
                            ? "text-red-400"
                            : "text-green-400"
                        }
                      >
                        {datum.change > 0 ? "+" : ""}
                        {datum.change}% YoY
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count">
                {crimeCategories.map((datum, index) => (
                  <Cell
                    key={index}
                    fill={datum.change > 0 ? "#FF3B00" : "#000000"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ClientOnlyChart>
      )}

      {view === "regional" && (
        <div className="space-y-2">
          {regional.map((region) => (
            <div key={region.region} className="flex items-center gap-3">
              <p className="w-28 text-right font-mono text-xs">{region.region}</p>
              <div className="relative h-5 flex-1 border border-black bg-gray-100">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(region.per1000 / 100) * 100}%`,
                    backgroundColor: region.color,
                  }}
                />
              </div>
              <p className="w-12 font-mono text-xs font-bold">{region.per1000}</p>
            </div>
          ))}
          <p className="mt-2 font-mono text-[10px] text-gray-500">
            Crimes per 1,000 population / Police recorded crime
          </p>
        </div>
      )}

      <p className="mt-4 font-mono text-[10px] text-gray-400">
        DATA SOURCES: ONS Crime Survey for England & Wales (CSEW), Home Office
        Police Recorded Crime statistics. Year ending September 2025 / March
        2025. Knife crime: Home Office, year ending June 2025 (51,527 offences,
        -5% YoY). Homicides: ONS, 499 (lowest since 2003). Charge rate from
        CPS/Home Office data.
      </p>
      <MetricsStatus section="crimeStatistics" status={metrics} />
    </div>
  );
}
