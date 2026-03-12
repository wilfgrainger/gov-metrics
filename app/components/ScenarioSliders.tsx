"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

const BASE = {
  Labour: 34,
  Conservative: 24,
  LibDem: 12,
  Reform: 14,
  Green: 7,
  Other: 9,
};

const PARTY_COLORS: Record<string, string> = {
  Labour: "#FF3B00",
  Conservative: "#000",
  LibDem: "#555",
  Reform: "#888",
  Green: "#444",
  Other: "#aaa",
};

function project(sliders: Record<string, number>): typeof BASE {
  const genzFactor = (sliders.genz - 50) / 100;
  const boomerFactor = (sliders.boomer - 50) / 100;
  const urbanFactor = (sliders.urban - 50) / 100;
  const ruralFactor = (sliders.rural - 50) / 100;

  const labourDelta = genzFactor * 8 + urbanFactor * 6 - boomerFactor * 4 - ruralFactor * 3;
  const toryDelta = boomerFactor * 9 + ruralFactor * 7 - genzFactor * 6 - urbanFactor * 5;
  const reformDelta = boomerFactor * 4 + ruralFactor * 5 - urbanFactor * 3;
  const libdemDelta = urbanFactor * 3 + genzFactor * 2 - boomerFactor * 2;
  const greenDelta = genzFactor * 4 + urbanFactor * 2;

  const raw = {
    Labour: Math.max(5, BASE.Labour + labourDelta),
    Conservative: Math.max(5, BASE.Conservative + toryDelta),
    LibDem: Math.max(3, BASE.LibDem + libdemDelta),
    Reform: Math.max(2, BASE.Reform + reformDelta),
    Green: Math.max(2, BASE.Green + greenDelta),
    Other: BASE.Other,
  };

  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Math.round((v / total) * 100)])
  ) as typeof BASE;
}

const SLIDER_CONFIG = [
  { key: "genz", label: "Gen Z Turnout", default: 50, icon: "🔺" },
  { key: "boomer", label: "Boomer Turnout", default: 50, icon: "🔵" },
  { key: "urban", label: "Urban Turnout", default: 50, icon: "🏙" },
  { key: "rural", label: "Rural Turnout", default: 50, icon: "🌾" },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-white border-2 border-black p-2 font-mono text-xs"
        style={{ boxShadow: "2px 2px 0px #000" }}
      >
        <div className="font-bold">{label}</div>
        <div className="text-accent text-lg font-display">{payload[0].value}%</div>
      </div>
    );
  }
  return null;
};

export default function ScenarioSliders() {
  const [sliders, setSliders] = useState<Record<string, number>>({
    genz: 50,
    boomer: 50,
    urban: 50,
    rural: 50,
  });

  const projected = project(sliders);
  const chartData = Object.entries(projected).map(([name, value]) => ({ name, value }));
  const leader = Object.entries(projected).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="border-4 border-black p-6 bg-white">
      <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
        <div>
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Metric 10</div>
          <h2 className="font-display text-4xl tracking-wider leading-none">SCENARIO SLIDERS</h2>
          <p className="font-mono text-xs mt-2 text-gray-600">
            "HOW WOULD CHANGING TURNOUT AFFECT THE 2024 ELECTION?"
          </p>
        </div>
        <div className="text-6xl font-display text-accent leading-none">10</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {SLIDER_CONFIG.map((s) => (
            <div key={s.key}>
              <div className="font-mono text-xs flex justify-between mb-1">
                <span className="uppercase tracking-wider">{s.label}</span>
                <span
                  className="font-bold"
                  style={{ color: sliders[s.key] > 50 ? "#FF3B00" : sliders[s.key] < 50 ? "#888" : "#000" }}
                >
                  {sliders[s.key]}%
                  {sliders[s.key] > 50 ? " ↑" : sliders[s.key] < 50 ? " ↓" : ""}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={20}
                  max={80}
                  value={sliders[s.key]}
                  onChange={(e) =>
                    setSliders((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))
                  }
                  className="w-full accent-red-600 h-3"
                />
                <div className="flex justify-between font-mono text-xs text-gray-400 mt-0.5">
                  <span>LOW</span>
                  <span>BASELINE</span>
                  <span>HIGH</span>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setSliders({ genz: 50, boomer: 50, urban: 50, rural: 50 })}
            className="w-full border-2 border-black py-2 font-mono text-xs tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            RESET TO BASELINE
          </button>
        </div>

        <div>
          <div className="font-mono text-xs uppercase tracking-wider mb-2 flex justify-between">
            <span>PROJECTED VOTE SHARE</span>
            <span className="text-accent">WINNER: {leader[0].toUpperCase()} {leader[1]}%</span>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" barCategoryGap={4}>
              <XAxis
                type="number"
                domain={[0, 50]}
                tick={{ fontSize: 8, fontFamily: "IBM Plex Mono" }}
                axisLine={{ stroke: "#000" }}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 9, fontFamily: "IBM Plex Mono", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={0}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={PARTY_COLORS[entry.name] || "#999"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-3 border-t-2 border-black pt-3 grid grid-cols-3 gap-2">
            {chartData.slice(0, 3).map((p) => (
              <div key={p.name} className="text-center border border-black p-2">
                <div className="font-mono text-xs text-gray-500">{p.name}</div>
                <div
                  className="font-display text-2xl"
                  style={{ color: PARTY_COLORS[p.name] }}
                >
                  {p.value}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
