"use client";
import { useState } from "react";
import { useMetrics } from "@/app/lib/useMetrics";

// Next UK General Election betting odds / implied probabilities
// Sources: Public betting market data aggregated from Betfair Exchange, Oddschecker
// These represent implied probabilities from publicly available odds
// Next GE must be held by July 2029 (5 year max parliamentary term)
// Market sentiment: 93% of bets on Oddschecker back Starmer exit in 2026
const NEXT_PM_ODDS = [
  { name: "Angela Rayner", party: "Labour", probability: 24, color: "#E4003B", role: "Deputy PM" },
  { name: "Wes Streeting", party: "Labour", probability: 18, color: "#E4003B", role: "Health Secretary" },
  { name: "Nigel Farage", party: "Reform UK", probability: 15, color: "#12B6CF", role: "Reform UK Leader" },
  { name: "Ed Miliband", party: "Labour", probability: 10, color: "#E4003B", role: "Energy Secretary" },
  { name: "Keir Starmer", party: "Labour", probability: 10, color: "#E4003B", role: "Current PM" },
  { name: "Other", party: "Various", probability: 23, color: "#999999", role: "inc. Burnham, Mahmood" },
];

const MOST_SEATS = [
  { party: "Reform UK", probability: 40, color: "#12B6CF" },
  { party: "Labour", probability: 25, color: "#E4003B" },
  { party: "Conservative", probability: 10, color: "#0087DC" },
  { party: "No Overall Majority", probability: 25, color: "#666666" },
];

const YEAR_ODDS = [
  { year: "2026", probability: 20 },
  { year: "2027", probability: 30 },
  { year: "2028", probability: 25 },
  { year: "2029", probability: 25 },
];

const FALLBACK = { nextPmOdds: NEXT_PM_ODDS, mostSeats: MOST_SEATS, yearOdds: YEAR_ODDS };

export default function BettingOdds() {
  const { data, isLive } = useMetrics("bettingOdds", FALLBACK);
  const { nextPmOdds, mostSeats, yearOdds } = data;
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
          {nextPmOdds.map((d) => (
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
          {mostSeats.map((d) => (
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
            {yearOdds.map((d) => (
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
            <p className="font-mono text-xs"><span className="font-bold">MARKET CONSENSUS:</span> Elevated probability of early election. Markets pricing in significant chance of <span className="font-bold text-[#FF3B00]">2026-2027</span> election amid political turbulence.</p>
          </div>
        </div>
      )}

      <p className="font-mono text-[10px] text-gray-400 mt-4">
        DATA SOURCE: Implied probabilities derived from publicly available betting odds
        via Betfair Exchange, Oddschecker, and Smarkets. 93% of Oddschecker bets back Starmer exit in 2026.
        Probabilities are indicative and derived from market prices. Last updated: March 2026.
        Sources: betfair.com/exchange/plus/en/politics · oddschecker.com/politics/british-politics
      </p>
      {isLive && (
        <div className="mt-2 flex items-center gap-1 font-mono text-[9px] tracking-widest text-neutral-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          LIVE
        </div>
      )}
    </div>
  );
}
