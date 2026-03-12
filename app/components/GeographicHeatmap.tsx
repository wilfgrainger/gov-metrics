"use client";

import { useState } from "react";

const REGIONS = [
  { id: "scotland", label: "Scotland", col: 2, row: 0, netZero: 72, income: 32, age: 40 },
  { id: "ne", label: "North East", col: 3, row: 1, netZero: 58, income: 28, age: 42 },
  { id: "nw", label: "North West", col: 2, row: 1, netZero: 61, income: 31, age: 39 },
  { id: "yorkshire", label: "Yorkshire", col: 3, row: 2, netZero: 56, income: 30, age: 41 },
  { id: "midlands", label: "Midlands", col: 2, row: 2, netZero: 54, income: 33, age: 43 },
  { id: "wales", label: "Wales", col: 1, row: 2, netZero: 63, income: 29, age: 44 },
  { id: "east", label: "East", col: 3, row: 3, netZero: 60, income: 36, age: 42 },
  { id: "sw", label: "South West", col: 1, row: 3, netZero: 67, income: 34, age: 46 },
  { id: "se", label: "South East", col: 2, row: 3, netZero: 65, income: 42, age: 44 },
  { id: "london", label: "London", col: 2, row: 4, netZero: 78, income: 55, age: 34 },
  { id: "ni", label: "N. Ireland", col: 0, row: 2, netZero: 55, income: 27, age: 41 },
];

type Layer = "netZero" | "income" | "age";

function getColor(value: number, layer: Layer): string {
  if (layer === "netZero") {
    const t = (value - 50) / 30;
    const r = Math.round(255 * (1 - t));
    const g = Math.round(50 + 150 * t);
    return `rgb(${r}, ${g}, 30)`;
  }
  if (layer === "income") {
    const t = (value - 25) / 35;
    return `rgba(0, 0, 0, ${0.15 + t * 0.75})`;
  }
  const t = (value - 30) / 16;
  return `hsl(${200 + t * 40}, 70%, ${30 + t * 30}%)`;
}

const LAYER_LABELS: Record<Layer, string> = {
  netZero: "SUPPORT FOR NET ZERO BY 2030",
  income: "MEDIAN INCOME INDEX",
  age: "MEDIAN AGE",
};

export default function GeographicHeatmap() {
  const [layer, setLayer] = useState<Layer>("netZero");
  const [hovered, setHovered] = useState<string | null>(null);

  const cols = 5;
  const rows = 5;
  const cellW = 80;
  const cellH = 52;
  const gap = 4;
  const svgW = cols * (cellW + gap);
  const svgH = rows * (cellH + gap);

  const hoveredRegion = REGIONS.find((r) => r.id === hovered);

  return (
    <div className="border-4 border-black p-6 bg-white">
      <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
        <div>
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Metric 06</div>
          <h2 className="font-display text-4xl tracking-wider leading-none">UK REGIONAL MAP</h2>
          <p className="font-mono text-xs mt-2 text-gray-600">{LAYER_LABELS[layer]}</p>
        </div>
        <div className="text-6xl font-display text-accent leading-none">06</div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(["netZero", "income", "age"] as Layer[]).map((l) => (
          <button
            key={l}
            onClick={() => setLayer(l)}
            className="border-2 border-black px-3 py-1 font-mono text-xs tracking-widest transition-colors"
            style={{
              background: layer === l ? "#000" : "#fff",
              color: layer === l ? "#FF3B00" : "#000",
              boxShadow: layer === l ? "none" : "2px 2px 0px #000",
            }}
          >
            {l === "netZero" ? "POLL DATA" : l === "income" ? "INCOME" : "AGE"}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="flex-shrink-0"
          style={{ width: Math.min(svgW, 320), height: "auto" }}
        >
          {REGIONS.map((region) => {
            const x = region.col * (cellW + gap);
            const y = region.row * (cellH + gap);
            const val = region[layer];
            const fill = getColor(val, layer);
            const isHovered = hovered === region.id;

            return (
              <g key={region.id}>
                <rect
                  x={x}
                  y={y}
                  width={cellW}
                  height={cellH}
                  fill={fill}
                  stroke={isHovered ? "#FF3B00" : "#000"}
                  strokeWidth={isHovered ? 3 : 2}
                  style={{ cursor: "pointer", transition: "stroke 0.1s" }}
                  onMouseEnter={() => setHovered(region.id)}
                  onMouseLeave={() => setHovered(null)}
                />
                <text
                  x={x + cellW / 2}
                  y={y + cellH / 2 - 6}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={7}
                  fontFamily="IBM Plex Mono"
                  fontWeight="700"
                  style={{ pointerEvents: "none", textShadow: "0 0 2px #000" }}
                >
                  {region.label.toUpperCase()}
                </text>
                <text
                  x={x + cellW / 2}
                  y={y + cellH / 2 + 8}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={11}
                  fontFamily="IBM Plex Mono"
                  fontWeight="700"
                  style={{ pointerEvents: "none" }}
                >
                  {layer === "netZero" ? `${val}%` : val}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex-1 min-w-0">
          {hoveredRegion ? (
            <div
              className="border-2 border-black p-4"
              style={{ boxShadow: "4px 4px 0px #FF3B00" }}
            >
              <div className="font-display text-2xl mb-2">{hoveredRegion.label.toUpperCase()}</div>
              <div className="space-y-2">
                {(["netZero", "income", "age"] as Layer[]).map((l) => (
                  <div key={l} className="font-mono text-xs">
                    <div className="text-gray-500 uppercase">{LAYER_LABELS[l]}</div>
                    <div
                      className="text-xl font-display"
                      style={{ color: l === layer ? "#FF3B00" : "#000" }}
                    >
                      {l === "netZero" ? `${hoveredRegion[l]}%` : hoveredRegion[l]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 p-4 font-mono text-xs text-gray-400 text-center h-full flex items-center justify-center">
              HOVER A REGION FOR DETAILS
            </div>
          )}

          <div className="mt-3 border-t-2 border-black pt-3">
            <div className="font-mono text-xs text-gray-500 mb-2">NATIONAL AVG</div>
            <div className="font-display text-3xl text-accent">
              {layer === "netZero" ? "63%" : layer === "income" ? "34" : "42"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
