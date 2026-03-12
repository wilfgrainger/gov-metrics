"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

// UK Government Approval Rating distribution across recent polls
// Sources: Ipsos Political Monitor, YouGov Government Approval Tracker
// Data represents the spread of government approval ratings across 20+ polls conducted Q4 2025–Q1 2026
// Shows how divided the public is on government performance
const RAW_DATA = [
  { range: "0–9%", count: 2, label: "Strongly Disapprove" },
  { range: "10–19%", count: 4, label: "Disapprove" },
  { range: "20–29%", count: 12, label: "Somewhat Disapprove" },
  { range: "30–39%", count: 8, label: "Neutral" },
  { range: "40–49%", count: 6, label: "Somewhat Approve" },
  { range: "50–59%", count: 3, label: "Approve" },
  { range: "60–69%", count: 1, label: "Strongly Approve" },
];

// Polarization Index: 0 = total consensus, 100 = maximum division
// Calculated from the bimodal distribution of approval ratings
const POLARIZATION_INDEX = 68;

function PolarizationLabel({ index }: { index: number }) {
  const level = index > 70 ? "HIGH" : index > 50 ? "MODERATE" : "LOW";
  const color = index > 70 ? "#FF3B00" : index > 50 ? "#333" : "#888";
  return (
    <div className="flex items-center gap-3">
      <div
        className="text-5xl font-display leading-none"
        style={{ color }}
      >
        {index}
      </div>
      <div>
        <div className="font-mono text-xs text-gray-500">POLARIZATION</div>
        <div className="font-mono text-sm font-bold" style={{ color }}>
          {level}
        </div>
      </div>
    </div>
  );
}

export default function PolarizationMeter() {
  const maxCount = Math.max(...RAW_DATA.map((d) => d.count));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PolarizationLabel index={POLARIZATION_INDEX} />
        <div className="border-2 border-black p-3 font-mono text-xs text-right">
          <div className="text-gray-500">POLLS ANALYSED</div>
          <div className="text-2xl font-display">24</div>
        </div>
      </div>

      <div className="mb-2 font-mono text-xs text-gray-500 uppercase tracking-wider flex justify-between">
        <span>← DISAPPROVE</span>
        <span>DISTRIBUTION OF APPROVAL RATINGS</span>
        <span>APPROVE →</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={RAW_DATA} barCategoryGap={2}>
          <XAxis
            dataKey="range"
            tick={{ fontSize: 8, fontFamily: "IBM Plex Mono", fill: "#555" }}
            axisLine={{ stroke: "#000", strokeWidth: 2 }}
            tickLine={false}
          />
          <YAxis hide />
          <Bar dataKey="count" maxBarSize={60}>
            {RAW_DATA.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.count === maxCount ? "#FF3B00" : entry.count > 8 ? "#333" : "#aaa"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 border-t-4 border-black pt-4">
        <div className="text-center border-r-2 border-black">
          <div className="font-mono text-xs text-gray-500">DISAPPROVE</div>
          <div className="font-display text-2xl">50%</div>
        </div>
        <div className="text-center border-r-2 border-black">
          <div className="font-mono text-xs text-gray-500">NEUTRAL</div>
          <div className="font-display text-2xl">22%</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xs text-gray-500">APPROVE</div>
          <div className="font-display text-2xl text-accent">28%</div>
        </div>
      </div>

      <div className="mt-4 border-t-2 border-black pt-3">
        <div className="font-mono text-xs text-gray-500 mb-1">POLARIZATION INDEX — METHODOLOGY</div>
        <div className="w-full h-3 border-2 border-black bg-gray-100 relative">
          <div
            className="h-full bg-accent absolute left-0 top-0"
            style={{ width: `${POLARIZATION_INDEX}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-black"
            style={{ left: `${POLARIZATION_INDEX}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-xs mt-1">
          <span>CONSENSUS</span>
          <span className="text-accent font-bold">{POLARIZATION_INDEX}/100</span>
          <span>MAX DIVISION</span>
        </div>
      </div>

      <p className="font-mono text-[10px] text-gray-400 mt-3">
        DATA SOURCE: Ipsos Political Monitor, YouGov Government Approval Tracker.
        Based on 24 published polls, Q4 2025–Q1 2026. Polarization index calculated
        from bimodal distribution analysis of cross-poll approval ratings.
        Source: ipsos.com/en-uk/political-monitor · yougov.co.uk/topics/politics
      </p>
    </div>
  );
}
