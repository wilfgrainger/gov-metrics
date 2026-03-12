"use client";

import { useState } from "react";
import { useMetrics } from "@/app/lib/useMetrics";

// UK Prime Minister Approval Rating
// Sources: YouGov PM approval tracker (public, updated weekly)
// Ipsos Political Monitor — monthly government satisfaction tracker
// Data: Net approval = (% approve - % disapprove)
// Keir Starmer net approval has declined from +5 (Jul 2024) to around -40 (early 2026)
// Source: yougov.co.uk/topics/politics/trackers/keir-starmer-approval-rating
const PM_APPROVAL_HISTORY = [
  { date: "Jul 2024", approve: 38, disapprove: 33, net: 5 },
  { date: "Sep 2024", approve: 33, disapprove: 43, net: -10 },
  { date: "Nov 2024", approve: 28, disapprove: 52, net: -24 },
  { date: "Jan 2025", approve: 25, disapprove: 57, net: -32 },
  { date: "Mar 2025", approve: 24, disapprove: 59, net: -35 },
  { date: "Jun 2025", approve: 23, disapprove: 60, net: -37 },
  { date: "Sep 2025", approve: 22, disapprove: 62, net: -40 },
  { date: "Dec 2025", approve: 21, disapprove: 63, net: -42 },
  { date: "Feb 2026", approve: 20, disapprove: 64, net: -44 },
];

const COMPARISON = [
  { pm: "Keir Starmer", months: 20, net: -44, party: "Labour", color: "#E4003B" },
  { pm: "Rishi Sunak", months: 20, net: -30, party: "Conservative", color: "#0087DC" },
  { pm: "Boris Johnson", months: 20, net: -23, party: "Conservative", color: "#0087DC" },
  { pm: "Tony Blair", months: 20, net: +11, party: "Labour", color: "#E4003B" },
];

const FALLBACK = { history: PM_APPROVAL_HISTORY, comparison: COMPARISON };

export default function PMApproval() {
  const { data, isLive } = useMetrics("pmApproval", FALLBACK);
  const { history, comparison } = data;
  const [view, setView] = useState<"current" | "history">("current");
  const current = history[history.length - 1];

  return (
    <div>
      {/* Current rating */}
      <div className="grid grid-cols-3 gap-0 mb-4">
        <div className="border-2 border-black p-4 text-center">
          <p className="font-mono text-[10px] text-gray-500">APPROVE</p>
          <p className="font-display text-3xl leading-none">{current.approve}%</p>
        </div>
        <div className="border-2 border-black border-l-0 p-4 text-center bg-black text-white">
          <p className="font-mono text-[10px] text-gray-400">NET APPROVAL</p>
          <p className="font-display text-3xl leading-none text-[#FF3B00]">{current.net}</p>
        </div>
        <div className="border-2 border-black border-l-0 p-4 text-center">
          <p className="font-mono text-[10px] text-gray-500">DISAPPROVE</p>
          <p className="font-display text-3xl leading-none">{current.disapprove}%</p>
        </div>
      </div>

      {/* Bar visualization */}
      <div className="mb-4">
        <div className="flex h-8 border-2 border-black overflow-hidden">
          <div
            className="h-full flex items-center justify-center font-mono text-xs text-white font-bold"
            style={{ width: `${current.approve}%`, background: "#22c55e" }}
          >
            {current.approve}%
          </div>
          <div
            className="h-full flex items-center justify-center font-mono text-xs text-white font-bold"
            style={{ width: `${100 - current.approve - current.disapprove}%`, background: "#999" }}
          >
            {100 - current.approve - current.disapprove}%
          </div>
          <div
            className="h-full flex items-center justify-center font-mono text-xs text-white font-bold"
            style={{ width: `${current.disapprove}%`, background: "#FF3B00" }}
          >
            {current.disapprove}%
          </div>
        </div>
        <div className="flex justify-between font-mono text-[10px] text-gray-500 mt-1">
          <span>■ APPROVE</span>
          <span>■ DON&apos;T KNOW</span>
          <span>■ DISAPPROVE</span>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex border-2 border-black mb-4">
        {([
          { key: "current" as const, label: "TREND" },
          { key: "history" as const, label: "VS OTHER PMs" },
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

      {view === "current" && (
        <div className="space-y-2">
          {history.map((d) => (
            <div key={d.date} className="flex items-center gap-3">
              <p className="font-mono text-xs w-20 text-right text-gray-500">{d.date}</p>
              <div className="flex-1 h-5 bg-gray-100 border border-black relative">
                <div
                  className="h-full absolute left-0"
                  style={{
                    width: `${Math.abs(d.net) + 50}%`,
                    background: d.net >= 0 ? "#22c55e" : "#FF3B00",
                    maxWidth: "100%",
                  }}
                />
              </div>
              <p className="font-mono text-xs font-bold w-10 text-right" style={{ color: d.net >= 0 ? "#22c55e" : "#FF3B00" }}>
                {d.net > 0 ? "+" : ""}{d.net}
              </p>
            </div>
          ))}
        </div>
      )}

      {view === "history" && (
        <div>
          <p className="font-mono text-xs text-gray-500 mb-3">NET APPROVAL AT 20 MONTHS IN OFFICE</p>
          <div className="space-y-3">
            {comparison.map((d) => (
              <div key={d.pm} className="border-2 border-black p-3">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-mono text-sm font-bold">{d.pm}</p>
                    <p className="font-mono text-[10px] text-gray-500">{d.party}</p>
                  </div>
                  <p className="font-mono text-2xl font-bold" style={{ color: d.net >= 0 ? "#22c55e" : "#FF3B00" }}>
                    {d.net > 0 ? "+" : ""}{d.net}
                  </p>
                </div>
                <div className="w-full h-3 bg-gray-100 border border-black">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${((d.net + 50) / 100) * 100}%`,
                      backgroundColor: d.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="font-mono text-[10px] text-gray-400 mt-4">
        DATA SOURCE: YouGov PM Approval Tracker (weekly, public data). Ipsos Political Monitor (monthly).
        Net approval = % approve minus % disapprove. Historical comparison at equivalent point in tenure.
        Sources: yougov.co.uk/topics/politics/trackers/keir-starmer-approval-rating ·
        ipsos.com/en-uk/political-monitor. Data verified: March 2026.
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
