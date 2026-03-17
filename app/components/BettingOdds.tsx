"use client";
import { useState } from "react";
import { useMetrics } from "@/app/lib/useMetrics";
import MetricsStatus from "@/app/components/MetricsStatus";

// Public politics market odds normalized into implied probabilities.
const NEXT_PM_ODDS = [
  { name: "Angela Rayner", party: "Labour", probability: 24, color: "#E4003B", role: "Deputy PM" },
  { name: "Wes Streeting", party: "Labour", probability: 18, color: "#E4003B", role: "Health Secretary" },
  { name: "Nigel Farage", party: "Reform UK", probability: 15, color: "#12B6CF", role: "Reform UK Leader" },
  { name: "Ed Miliband", party: "Labour", probability: 10, color: "#E4003B", role: "Energy Secretary" },
  { name: "Keir Starmer", party: "Labour", probability: 10, color: "#E4003B", role: "Current PM" },
  { name: "Other", party: "Various", probability: 23, color: "#999999", role: "Market remainder" },
];

const MOST_SEATS = [
  { party: "Reform UK", probability: 40, color: "#12B6CF" },
  { party: "Labour", probability: 25, color: "#E4003B" },
  { party: "Conservative", probability: 10, color: "#0087DC" },
  { party: "Other", probability: 25, color: "#666666" },
];

const YEAR_ODDS = [
  { year: "2026", probability: 20 },
  { year: "2027", probability: 30 },
  { year: "2028", probability: 25 },
  { year: "2029+", probability: 25 },
];

const FALLBACK = { nextPmOdds: NEXT_PM_ODDS, mostSeats: MOST_SEATS, yearOdds: YEAR_ODDS };

export default function BettingOdds() {
  const metrics = useMetrics("bettingOdds", FALLBACK);
  const { data } = metrics;
  const { nextPmOdds, mostSeats, yearOdds } = data;
  const [view, setView] = useState<"pm" | "seats" | "year">("pm");

  return (
    <div>
      <div className="mb-4 flex border-2 border-black">
        {[
          { key: "pm" as const, label: "NEXT PM" },
          { key: "seats" as const, label: "MOST SEATS" },
          { key: "year" as const, label: "ELECTION YEAR" },
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

      {view === "pm" && (
        <div className="space-y-3">
          {nextPmOdds.map((entry) => (
            <div key={entry.name} className="border-2 border-black p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-bold">{entry.name}</p>
                  <p className="font-mono text-[10px] text-gray-500">
                    {entry.party}
                    {entry.role ? ` - ${entry.role}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold" style={{ color: entry.color }}>
                    {entry.probability}%
                  </p>
                  <p className="font-mono text-[10px] text-gray-500">IMPLIED PROB.</p>
                </div>
              </div>
              <div className="h-3 w-full border border-black bg-gray-100">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${entry.probability}%`, backgroundColor: entry.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "seats" && (
        <div className="space-y-3">
          {mostSeats.map((entry) => (
            <div key={entry.party} className="border-2 border-black p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-sm font-bold">{entry.party}</p>
                <p className="font-mono text-2xl font-bold" style={{ color: entry.color }}>
                  {entry.probability}%
                </p>
              </div>
              <div className="h-3 w-full border border-black bg-gray-100">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${entry.probability}%`, backgroundColor: entry.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "year" && (
        <div>
          <p className="mb-4 font-mono text-xs text-gray-500">
            Next UK General Election must be held by July 2029. When do the markets think it will happen?
          </p>
          <div className="space-y-3">
            {yearOdds.map((entry) => (
              <div key={entry.year} className="border-2 border-black p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-lg font-bold">{entry.year}</p>
                  <p className="font-mono text-2xl font-bold">{entry.probability}%</p>
                </div>
                <div className="h-3 w-full border border-black bg-gray-100">
                  <div
                    className="h-full bg-[#FF3B00] transition-all duration-500"
                    style={{ width: `${entry.probability}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-2 border-black bg-gray-50 p-3">
            <p className="font-mono text-xs">
              <span className="font-bold">MARKET CONSENSUS:</span> Elevated probability of an election before the
              statutory deadline, with early-year scenarios carrying a meaningful market price.
            </p>
          </div>
        </div>
      )}

      <p className="mt-4 font-mono text-[10px] text-gray-400">
        DATA SOURCE: Implied probabilities derived from public politics market pages on Oddschecker, including
        exchange prices where they are exposed. This section is refreshed by the Cloudflare Worker every 2
        hours and cached between imports. Probabilities are normalized from best available market odds and
        should be treated as market sentiment, not direct vote forecasts.
      </p>
      <MetricsStatus section="bettingOdds" status={metrics} />
    </div>
  );
}
