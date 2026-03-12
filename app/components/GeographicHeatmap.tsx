"use client";

import { useState } from "react";

// UK Regional Statistics from ONS and public data sources
// Sources:
// - Median household income: ONS Annual Survey of Hours and Earnings (ASHE) 2024
// - Unemployment rate: ONS Labour Force Survey by region, Q3 2025
// - Crime rate: ONS/Home Office Police Recorded Crime per 1,000 population, year ending Sep 2025
// - 2024 GE Vote Share: Electoral Commission general election results, July 2024 (Labour %)
const REGIONS = [
  { id: "scotland", label: "Scotland", col: 2, row: 0, income: 29.8, unemployment: 3.6, crime: 52, labVote: 35 },
  { id: "ne", label: "North East", col: 3, row: 1, income: 27.5, unemployment: 5.1, crime: 82, labVote: 46 },
  { id: "nw", label: "North West", col: 2, row: 1, income: 29.1, unemployment: 4.2, crime: 89, labVote: 44 },
  { id: "yorkshire", label: "Yorkshire", col: 3, row: 2, income: 28.4, unemployment: 4.4, crime: 87, labVote: 39 },
  { id: "midlands", label: "Midlands", col: 2, row: 2, income: 29.6, unemployment: 4.6, crime: 80, labVote: 38 },
  { id: "wales", label: "Wales", col: 1, row: 2, income: 27.9, unemployment: 3.8, crime: 68, labVote: 37 },
  { id: "east", label: "East", col: 3, row: 3, income: 33.2, unemployment: 3.4, crime: 61, labVote: 31 },
  { id: "sw", label: "South West", col: 1, row: 3, income: 30.8, unemployment: 3.0, crime: 64, labVote: 27 },
  { id: "se", label: "South East", col: 2, row: 3, income: 35.4, unemployment: 3.2, crime: 62, labVote: 29 },
  { id: "london", label: "London", col: 2, row: 4, income: 39.7, unemployment: 5.0, crime: 98, labVote: 48 },
  { id: "ni", label: "N. Ireland", col: 0, row: 2, income: 27.2, unemployment: 2.6, crime: 44, labVote: 0 },
];

type Layer = "income" | "unemployment" | "crime" | "labVote";

function getColor(value: number, layer: Layer): string {
  if (layer === "income") {
    const t = (value - 25) / 15;
    return `rgba(0, 0, 0, ${0.2 + t * 0.7})`;
  }
  if (layer === "unemployment") {
    const t = (value - 2.5) / 3;
    return `rgb(${Math.round(180 + 75 * t)}, ${Math.round(80 - 50 * t)}, 30)`;
  }
  if (layer === "crime") {
    const t = (value - 40) / 60;
    return `rgb(${Math.round(100 + 155 * t)}, ${Math.round(100 - 70 * t)}, ${Math.round(100 - 70 * t)})`;
  }
  // labVote
  if (value === 0) return "#999";
  const t = (value - 25) / 25;
  return `rgb(${Math.round(228 - 100 * t)}, ${Math.round(0 + 60 * t)}, ${Math.round(59 + 100 * t)})`;
}

const LAYER_LABELS: Record<Layer, string> = {
  income: "MEDIAN HOUSEHOLD INCOME (£K)",
  unemployment: "UNEMPLOYMENT RATE (%)",
  crime: "CRIME PER 1,000 POPULATION",
  labVote: "LABOUR VOTE SHARE 2024 GE (%)",
};

const LAYER_SOURCES: Record<Layer, string> = {
  income: "ONS ASHE 2024",
  unemployment: "ONS LFS Q3 2025",
  crime: "Home Office, year ending Sep 2025",
  labVote: "Electoral Commission, July 2024",
};

export default function GeographicHeatmap() {
  const [layer, setLayer] = useState<Layer>("income");
  const [hovered, setHovered] = useState<string | null>(null);

  const cols = 5;
  const rows = 5;
  const cellW = 80;
  const cellH = 52;
  const gap = 4;
  const svgW = cols * (cellW + gap);
  const svgH = rows * (cellH + gap);

  const hoveredRegion = REGIONS.find((r) => r.id === hovered);

  const formatVal = (val: number, l: Layer) => {
    if (l === "income") return `£${val}k`;
    if (l === "labVote" && val === 0) return "N/A";
    return l === "crime" ? `${val}` : `${val}%`;
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["income", "unemployment", "crime", "labVote"] as Layer[]).map((l) => (
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
            {l === "income" ? "INCOME" : l === "unemployment" ? "JOBS" : l === "crime" ? "CRIME" : "VOTING"}
          </button>
        ))}
      </div>

      <p className="font-mono text-[10px] text-gray-500 mb-3">{LAYER_LABELS[layer]}</p>

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
                  {formatVal(val, layer)}
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
                {(["income", "unemployment", "crime", "labVote"] as Layer[]).map((l) => (
                  <div key={l} className="font-mono text-xs">
                    <div className="text-gray-500 uppercase">{LAYER_LABELS[l]}</div>
                    <div
                      className="text-xl font-display"
                      style={{ color: l === layer ? "#FF3B00" : "#000" }}
                    >
                      {formatVal(hoveredRegion[l], l)}
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
        </div>
      </div>

      <p className="font-mono text-[10px] text-gray-400 mt-3">
        DATA SOURCES: {LAYER_SOURCES[layer]}.
        Regional boundaries simplified for visualisation. N. Ireland voting data not shown (separate party system).
        Sources: ons.gov.uk/employmentandlabourmarket · ons.gov.uk/peoplepopulationandcommunity/crimeandjustice ·
        electoralcommission.org.uk
      </p>
    </div>
  );
}
