"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

const RAW_DATA = [
  { range: "0–9", count: 3 },
  { range: "10–19", count: 5 },
  { range: "20–29", count: 8 },
  { range: "30–39", count: 14 },
  { range: "40–49", count: 22 },
  { range: "50–59", count: 18 },
  { range: "60–69", count: 9 },
  { range: "70–79", count: 6 },
  { range: "80–89", count: 8 },
  { range: "90–100", count: 7 },
];

const POLARIZATION_INDEX = 74;

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
    <div className="border-4 border-black p-6 bg-white">
      <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
        <div>
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Metric 03</div>
          <h2 className="font-display text-4xl tracking-wider leading-none">POLARIZATION METER</h2>
          <p className="font-mono text-xs mt-2 text-gray-600">
            "RATE YOUR SUPPORT FOR UNIVERSAL BASIC INCOME (0–100)"
          </p>
        </div>
        <div className="text-6xl font-display text-accent leading-none">03</div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <PolarizationLabel index={POLARIZATION_INDEX} />
        <div className="border-2 border-black p-3 font-mono text-xs text-right">
          <div className="text-gray-500">RESPONDENTS</div>
          <div className="text-2xl font-display">12,847</div>
        </div>
      </div>

      <div className="mb-2 font-mono text-xs text-gray-500 uppercase tracking-wider flex justify-between">
        <span>← OPPOSE</span>
        <span>DISTRIBUTION</span>
        <span>SUPPORT →</span>
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
          <ReferenceLine x="40–49" stroke="#FF3B00" strokeWidth={2} strokeDasharray="4 4" />
          <ReferenceLine x="80–89" stroke="#FF3B00" strokeWidth={2} strokeDasharray="4 4" />
          <Bar dataKey="count" maxBarSize={60}>
            {RAW_DATA.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.count === maxCount ? "#FF3B00" : entry.count > 15 ? "#333" : "#aaa"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 border-t-4 border-black pt-4">
        <div className="text-center border-r-2 border-black">
          <div className="font-mono text-xs text-gray-500">OPPOSE</div>
          <div className="font-display text-2xl">29%</div>
        </div>
        <div className="text-center border-r-2 border-black">
          <div className="font-mono text-xs text-gray-500">NEUTRAL</div>
          <div className="font-display text-2xl">18%</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xs text-gray-500">SUPPORT</div>
          <div className="font-display text-2xl text-accent">53%</div>
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
    </div>
  );
}
