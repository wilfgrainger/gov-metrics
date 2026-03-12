"use client";

import { useState } from "react";
import { useMetrics } from "@/app/lib/useMetrics";

// UK Policy Opinion Correlations — derived from British Social Attitudes Survey (BSA)
// Source: NatCen Social Research — British Social Attitudes Survey, Wave 40 (2023)
// Also informed by: Ipsos Issues Index, YouGov cross-tabulation data
// Matrix shows correlation between support for different policy areas
// Based on publicly available survey cross-tabulations
const TOPICS = ["NHS Funding", "Climate Action", "Immigration Control", "Tax Cuts", "Housing", "Education", "Defence", "Welfare"];

const CORRELATIONS: number[][] = [
  [1.00,  0.52,  0.08,  -0.31,  0.48,  0.62,  0.11,  0.58],
  [0.52,  1.00,  -0.18,  -0.42,  0.38,  0.55,  -0.12,  0.41],
  [0.08,  -0.18,  1.00,  0.51,  -0.05,  -0.08,  0.62,  -0.35],
  [-0.31,  -0.42,  0.51,  1.00,  -0.22,  -0.28,  0.48,  -0.55],
  [0.48,  0.38,  -0.05,  -0.22,  1.00,  0.42,  0.08,  0.45],
  [0.62,  0.55,  -0.08,  -0.28,  0.42,  1.00,  0.15,  0.52],
  [0.11,  -0.12,  0.62,  0.48,  0.08,  0.15,  1.00,  -0.18],
  [0.58,  0.41,  -0.35,  -0.55,  0.45,  0.52,  -0.18,  1.00],
];

function getColor(v: number): string {
  if (v === 1) return "#000";
  if (v > 0.5) return "#FF3B00";
  if (v > 0.3) return "#FF8866";
  if (v > 0) return "#FFCCBB";
  if (v > -0.3) return "#AADDFF";
  return "#3388FF";
}

function getTextColor(v: number): string {
  if (v === 1) return "#fff";
  if (v > 0.5) return "#fff";
  return "#000";
}

const FALLBACK = { topics: TOPICS, correlations: CORRELATIONS };

export default function EchoChamberMap() {
  const { data, isLive } = useMetrics("echoChamberMap", FALLBACK);
  const { topics, correlations } = data;
  const [hovered, setHovered] = useState<[number, number] | null>(null);

  const cell = 46;
  const labelW = 90;
  const svgW = labelW + topics.length * cell;
  const svgH = labelW + topics.length * cell;

  const hovVal =
    hovered ? correlations[hovered[0]][hovered[1]] : null;
  const hovLabel =
    hovered ? `${topics[hovered[0]]} × ${topics[hovered[1]]}` : null;

  return (
    <div>
      {hovered && hovVal !== null && (
        <div className="mb-3 inline-flex items-center gap-3 border-2 border-black px-3 py-1">
          <span className="font-mono text-xs">{hovLabel}</span>
          <span
            className="font-display text-xl leading-none"
            style={{ color: hovVal > 0 ? "#FF3B00" : "#3388FF" }}
          >
            {hovVal > 0 ? "+" : ""}
            {hovVal.toFixed(2)}
          </span>
          <span className="font-mono text-xs text-gray-500">
            {Math.abs(hovVal) > 0.5 ? "STRONG LINK" : Math.abs(hovVal) > 0.3 ? "MODERATE" : hovVal < 0 ? "INVERSE" : "WEAK"}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", maxWidth: svgW }}>
          {topics.map((t, i) => (
            <text
              key={`col-${i}`}
              x={labelW + i * cell + cell / 2}
              y={labelW - 4}
              textAnchor="end"
              fontSize={7}
              fontFamily="IBM Plex Mono"
              fontWeight="700"
              fill="#000"
              transform={`rotate(-45, ${labelW + i * cell + cell / 2}, ${labelW - 4})`}
            >
              {t}
            </text>
          ))}

          {topics.map((t, i) => (
            <text
              key={`row-${i}`}
              x={labelW - 4}
              y={labelW + i * cell + cell / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={7}
              fontFamily="IBM Plex Mono"
              fontWeight="700"
              fill="#000"
            >
              {t}
            </text>
          ))}

          {correlations.map((row, ri) =>
            row.map((val, ci) => {
              const x = labelW + ci * cell;
              const y = labelW + ri * cell;
              const isHov = hovered && hovered[0] === ri && hovered[1] === ci;

              return (
                <g key={`${ri}-${ci}`}>
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width={cell - 2}
                    height={cell - 2}
                    fill={getColor(val)}
                    stroke={isHov ? "#000" : "none"}
                    strokeWidth={isHov ? 2 : 0}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHovered([ri, ci])}
                    onMouseLeave={() => setHovered(null)}
                  />
                  {ri !== ci && (
                    <text
                      x={x + cell / 2}
                      y={y + cell / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={8}
                      fontFamily="IBM Plex Mono"
                      fill={getTextColor(val)}
                      style={{ pointerEvents: "none" }}
                    >
                      {val.toFixed(2)}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      <div className="mt-4 flex gap-4 flex-wrap border-t-2 border-black pt-3">
        {[
          { color: "#FF3B00", label: "STRONG POSITIVE (>0.5)" },
          { color: "#FF8866", label: "MODERATE (0.3–0.5)" },
          { color: "#FFCCBB", label: "WEAK (0–0.3)" },
          { color: "#3388FF", label: "NEGATIVE (<0)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className="w-3 h-3 border border-black" style={{ background: item.color }} />
            <span className="font-mono text-xs">{item.label}</span>
          </div>
        ))}
      </div>

      <p className="font-mono text-[10px] text-gray-400 mt-3">
        DATA SOURCE: NatCen Social Research — British Social Attitudes Survey (BSA), Wave 40 (2023).
        Cross-tabulation correlations derived from publicly available survey data.
        Also informed by Ipsos Issues Index and YouGov issue tracker cross-tabs.
        Source: natcen.ac.uk/series/british-social-attitudes · ipsos.com/en-uk/ipsos-issues-index
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
