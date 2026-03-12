"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";

const DATA = [
  { date: "Jan 2020", trust: 45 },
  { date: "Mar 2020", trust: 52 },
  { date: "Jun 2020", trust: 48 },
  { date: "Sep 2020", trust: 44 },
  { date: "Dec 2020", trust: 40 },
  { date: "Mar 2021", trust: 43 },
  { date: "Jun 2021", trust: 47 },
  { date: "Sep 2021", trust: 44 },
  { date: "Dec 2021", trust: 41 },
  { date: "Mar 2022", trust: 35 },
  { date: "Jun 2022", trust: 30 },
  { date: "Sep 2022", trust: 28 },
  { date: "Dec 2022", trust: 32 },
  { date: "Mar 2023", trust: 34 },
  { date: "Jun 2023", trust: 36 },
  { date: "Sep 2023", trust: 33 },
  { date: "Dec 2023", trust: 31 },
  { date: "Mar 2024", trust: 35 },
  { date: "Jun 2024", trust: 38 },
  { date: "Sep 2024", trust: 41 },
  { date: "Dec 2024", trust: 39 },
  { date: "Mar 2025", trust: 37 },
];

const EVENTS = [
  { date: "Mar 2020", label: "COVID-19 Outbreak", y: 52, side: "above" },
  { date: "Jun 2022", label: "Cost of Living Crisis", y: 30, side: "below" },
  { date: "Jun 2024", label: "Election 2024", y: 38, side: "above" },
  { date: "Dec 2024", label: "AI Act Passed", y: 39, side: "below" },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const event = EVENTS.find((e) => e.date === label);
    return (
      <div
        className="bg-white border-2 border-black p-3 font-mono text-xs"
        style={{ boxShadow: "3px 3px 0px #000" }}
      >
        <div className="font-bold">{label}</div>
        <div className="text-accent text-lg font-display">{payload[0].value}%</div>
        {event && <div className="text-gray-500 mt-1 max-w-[140px]">{event.label}</div>}
      </div>
    );
  }
  return null;
};

export default function TrendLines() {
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  return (
    <div className="border-4 border-black p-6 bg-white">
      <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
        <div>
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Metric 04</div>
          <h2 className="font-display text-4xl tracking-wider leading-none">TRUST IN GOVERNMENT</h2>
          <p className="font-mono text-xs mt-2 text-gray-600">LONGITUDINAL TREND 2020–2025</p>
        </div>
        <div className="text-6xl font-display text-accent leading-none">04</div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {EVENTS.map((ev) => (
          <button
            key={ev.date}
            onClick={() => setActiveEvent(activeEvent === ev.date ? null : ev.date)}
            className="border-2 border-black px-2 py-1 font-mono text-xs text-left transition-colors"
            style={{
              background: activeEvent === ev.date ? "#000" : "#fff",
              color: activeEvent === ev.date ? "#FF3B00" : "#000",
              boxShadow: activeEvent === ev.date ? "none" : "2px 2px 0px #000",
            }}
          >
            <div className="text-gray-400 text-xs">{ev.date}</div>
            <div className="leading-tight">{ev.label}</div>
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={DATA} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 8, fontFamily: "IBM Plex Mono", fill: "#555" }}
            axisLine={{ stroke: "#000", strokeWidth: 2 }}
            tickLine={false}
            interval={3}
          />
          <YAxis
            domain={[20, 60]}
            tick={{ fontSize: 9, fontFamily: "IBM Plex Mono", fill: "#555" }}
            axisLine={{ stroke: "#000", strokeWidth: 2 }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          {EVENTS.map((ev) => (
            <ReferenceLine
              key={ev.date}
              x={ev.date}
              stroke={activeEvent === ev.date ? "#FF3B00" : "#ccc"}
              strokeWidth={activeEvent === ev.date ? 2 : 1}
              strokeDasharray="4 4"
              label={
                activeEvent === ev.date
                  ? {
                      value: ev.label,
                      position: "top",
                      fontSize: 8,
                      fontFamily: "IBM Plex Mono",
                      fill: "#FF3B00",
                    }
                  : undefined
              }
            />
          ))}
          <Line
            type="monotone"
            dataKey="trust"
            stroke="#000"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, fill: "#FF3B00", stroke: "#000", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-3 border-t-2 border-black pt-3 flex gap-6 font-mono text-xs text-gray-500">
        <div>
          <span className="font-bold text-black">37%</span> — CURRENT TRUST LEVEL
        </div>
        <div>
          <span className="font-bold text-black">△–8pp</span> — SINCE 2020
        </div>
        <div>
          <span className="font-bold text-accent">LOW</span> — HISTORIC RANGE
        </div>
      </div>
    </div>
  );
}
