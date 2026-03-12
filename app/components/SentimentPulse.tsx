"use client";

import { useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// UK Key Economic Indicators — monthly time series
// Sources: ONS, Bank of England, Office for Budget Responsibility (OBR)
// CPI Inflation: ONS Consumer Price Index
// Bank Rate: Bank of England base rate decisions
// Unemployment: ONS Labour Force Survey
const ECONOMIC_DATA = [
  { date: "Jan 24", inflation: 4.0, bankRate: 5.25, unemployment: 4.0 },
  { date: "Mar 24", inflation: 3.2, bankRate: 5.25, unemployment: 4.0 },
  { date: "May 24", inflation: 2.3, bankRate: 5.25, unemployment: 4.2 },
  { date: "Jul 24", inflation: 2.2, bankRate: 5.00, unemployment: 4.2 },
  { date: "Sep 24", inflation: 1.7, bankRate: 5.00, unemployment: 4.3 },
  { date: "Nov 24", inflation: 2.6, bankRate: 4.75, unemployment: 4.4 },
  { date: "Jan 25", inflation: 3.0, bankRate: 4.50, unemployment: 4.6 },
  { date: "Mar 25", inflation: 3.2, bankRate: 4.50, unemployment: 4.7 },
  { date: "May 25", inflation: 2.4, bankRate: 4.25, unemployment: 4.8 },
  { date: "Jul 25", inflation: 2.6, bankRate: 4.25, unemployment: 4.9 },
  { date: "Sep 25", inflation: 2.2, bankRate: 4.00, unemployment: 5.0 },
  { date: "Nov 25", inflation: 3.4, bankRate: 4.00, unemployment: 5.1 },
  { date: "Jan 26", inflation: 3.0, bankRate: 3.75, unemployment: 5.2 },
];

type Metric = "inflation" | "bankRate" | "unemployment";

const METRIC_CONFIG: Record<Metric, { label: string; unit: string; color: string; current: string; target: string }> = {
  inflation: { label: "CPI INFLATION", unit: "%", color: "#FF3B00", current: "3.0%", target: "2.0% target" },
  bankRate: { label: "BANK OF ENGLAND RATE", unit: "%", color: "#000000", current: "3.75%", target: "Monetary policy" },
  unemployment: { label: "UNEMPLOYMENT RATE", unit: "%", color: "#666666", current: "5.2%", target: "Labour Force Survey" },
};

export default function SentimentPulse() {
  const [metric, setMetric] = useState<Metric>("inflation");
  const config = METRIC_CONFIG[metric];

  return (
    <div>
      {/* Metric selector */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {(Object.entries(METRIC_CONFIG) as [Metric, typeof config][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={`border-2 border-black p-3 text-left transition-colors ${
              metric === key ? "bg-black text-white" : "bg-white"
            }`}
          >
            <div className="font-mono text-[10px] text-gray-500">{metric === key ? <span className="text-gray-300">{cfg.label}</span> : cfg.label}</div>
            <div className="font-display text-2xl leading-none" style={{ color: metric === key ? cfg.color : "#000" }}>
              {cfg.current}
            </div>
            <div className="font-mono text-[10px] mt-1" style={{ color: metric === key ? "#999" : "#999" }}>{cfg.target}</div>
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={ECONOMIC_DATA} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={config.color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 8, fontFamily: "IBM Plex Mono", fill: "#555" }}
            axisLine={{ stroke: "#000", strokeWidth: 1 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 8, fontFamily: "IBM Plex Mono", fill: "#555" }}
            axisLine={{ stroke: "#000", strokeWidth: 1 }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              fontFamily: "IBM Plex Mono",
              fontSize: 10,
              border: "2px solid #000",
              borderRadius: 0,
              background: "#fff",
            }}
            formatter={(val) => [`${val}%`, config.label]}
          />
          <Area
            type="monotone"
            dataKey={metric}
            stroke={config.color}
            strokeWidth={2}
            fill="url(#metricGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="font-mono text-[10px] text-gray-400 mt-3">
        DATA SOURCES: ONS Consumer Price Index (CPI), Bank of England base rate decisions,
        ONS Labour Force Survey. Monthly data Jan 2024–Jan 2026. Data as of March 2026.
        All figures from publicly available statistical releases.
      </p>
    </div>
  );
}
