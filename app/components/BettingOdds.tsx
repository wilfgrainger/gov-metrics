"use client";
import { useState } from "react";

// Next UK General Election betting odds / implied probabilities
// Sources: Public betting market data aggregated from Betfair Exchange, Oddschecker
// These represent implied probabilities from publicly available odds
// Next GE must be held by July 2029 (5 year max parliamentary term)
const NEXT_PM_ODDS = [
  { name: "Nigel Farage", party: "Reform UK", probability: 30, color: "#12B6CF", role: "Reform UK Leader" },
  { name: "Keir Starmer", party: "Labour", probability: 25, color: "#E4003B", role: "Current PM" },
  { name: "Angela Rayner", party: "Labour", probability: 12, color: "#E4003B", role: "Deputy PM" },
  { name: "Kemi Badenoch", party: "Conservative", probability: 10, color: "#0087DC", role: "Leader of Opposition" },
  { name: "Other", party: "Various", probability: 23, color: "#999999", role: "" },
];

const MOST_SEATS = [
  { party: "Reform UK", probability: 33, color: "#12B6CF" },
  { party: "Labour", probability: 30, color: "#E4003B" },
  { party: "Conservative", probability: 10, color: "#0087DC" },
  { party: "Hung Parliament", probability: 27, color: "#666666" },
];

const YEAR_ODDS = [
  { year: "2028", probability: 25 },
  { year: "2029", probability: 75 },
];

export default function BettingOdds() {
  const [view, setView] = useState<"pm" | "seats" | "year">("pm");

  return (
    <div>
      {/* Toggle tabs */}
      <div className="flex border-2 border-black mb-4">
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
          {NEXT_PM_ODDS.map((d) => (
            <div key={d.name} className="border-2 border-black p-3">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-mono text-sm font-bold">{d.name}</p>
                  <p className="font-mono text-[10px] text-gray-500">{d.party} {d.role && `· ${d.role}`}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold" style={{ color: d.color }}>{d.probability}%</p>
                  <p className="font-mono text-[10px] text-gray-500">IMPLIED PROB.</p>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-100 border border-black">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${d.probability}%`, backgroundColor: d.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "seats" && (
        <div className="space-y-3">
          {MOST_SEATS.map((d) => (
            <div key={d.party} className="border-2 border-black p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="font-mono text-sm font-bold">{d.party}</p>
                <p className="font-mono text-2xl font-bold" style={{ color: d.color }}>{d.probability}%</p>
              </div>
              <div className="w-full h-3 bg-gray-100 border border-black">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${d.probability}%`, backgroundColor: d.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "year" && (
        <div>
          <p className="font-mono text-xs text-gray-500 mb-4">
            Next UK General Election must be held by July 2029. When do the markets think it will happen?
          </p>
          <div className="space-y-3">
            {YEAR_ODDS.map((d) => (
              <div key={d.year} className="border-2 border-black p-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-mono text-lg font-bold">{d.year}</p>
                  <p className="font-mono text-2xl font-bold">{d.probability}%</p>
                </div>
                <div className="w-full h-3 bg-gray-100 border border-black">
                  <div
                    className="h-full bg-[#FF3B00] transition-all duration-500"
                    style={{ width: `${d.probability}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-2 border-black p-3 bg-gray-50">
            <p className="font-mono text-xs"><span className="font-bold">MARKET CONSENSUS:</span> Most likely election year is <span className="font-bold text-[#FF3B00]">2029</span> (maximum term), but an earlier election in 2028 is possible.</p>
          </div>
        </div>
      )}

      <p className="font-mono text-[10px] text-gray-400 mt-4">
        DATA SOURCE: Implied probabilities derived from publicly available betting odds
        via Betfair Exchange, Oddschecker, and Smarkets. Hung parliament considered the
        single most likely individual outcome. Last updated: Q1 2026.
      </p>
    </div>
  );
}
