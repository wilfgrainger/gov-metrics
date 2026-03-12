"use client";

import { useState } from "react";

const TOPICS = ["NHS", "Climate", "Immigration", "Economy", "Housing", "Education", "Defence", "Tax"];

const CORRELATIONS: number[][] = [
  [1.00,  0.68,  0.21,  0.72,  0.55,  0.63,  0.18,  0.61],
  [0.68,  1.00,  0.31,  0.48,  0.44,  0.58,  0.12,  0.39],
  [0.21,  0.31,  1.00, -0.12,  0.08,  0.22, -0.38, -0.28],
  [0.72,  0.48, -0.12,  1.00,  0.61,  0.52,  0.44,  0.76],
  [0.55,  0.44,  0.08,  0.61,  1.00,  0.49,  0.21,  0.48],
  [0.63,  0.58,  0.22,  0.52,  0.49,  1.00,  0.28,  0.44],
  [0.18,  0.12, -0.38,  0.44,  0.21,  0.28,  1.00,  0.52],
  [0.61,  0.39, -0.28,  0.76,  0.48,  0.44,  0.52,  1.00],
];

function getColor(v: number): string {
  if (v === 1) return "#000";
  if (v > 0.6) return "#FF3B00";
  if (v > 0.3) return "#FF8866";
  if (v > 0) return "#FFCCBB";
  if (v > -0.3) return "#AADDFF";
  return "#3388FF";
}

function getTextColor(v: number): string {
  if (v === 1) return "#fff";
  if (v > 0.6) return "#fff";
  return "#000";
}

export default function EchoChamberMap() {
  const [hovered, setHovered] = useState<[number, number] | null>(null);

  const cell = 46;
  const labelW = 72;
  const svgW = labelW + TOPICS.length * cell;
  const svgH = labelW + TOPICS.length * cell;

  const hovVal =
    hovered ? CORRELATIONS[hovered[0]][hovered[1]] : null;
  const hovLabel =
    hovered ? `${TOPICS[hovered[0]]} × ${TOPICS[hovered[1]]}` : null;

  return (
    <div className="border-4 border-black p-6 bg-white">
      <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
        <div>
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Metric 07</div>
          <h2 className="font-display text-4xl tracking-wider leading-none">ECHO CHAMBER MAP</h2>
          <p className="font-mono text-xs mt-2 text-gray-600">OPINION CORRELATION MATRIX</p>
        </div>
        <div className="text-6xl font-display text-accent leading-none">07</div>
      </div>

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
            {hovVal > 0.6 ? "STRONG LINK" : hovVal > 0.3 ? "MODERATE" : hovVal < 0 ? "INVERSE" : "WEAK"}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", maxWidth: svgW }}>
          {TOPICS.map((t, i) => (
            <text
              key={`col-${i}`}
              x={labelW + i * cell + cell / 2}
              y={labelW - 4}
              textAnchor="end"
              fontSize={8}
              fontFamily="IBM Plex Mono"
              fontWeight="700"
              fill="#000"
              transform={`rotate(-45, ${labelW + i * cell + cell / 2}, ${labelW - 4})`}
            >
              {t}
            </text>
          ))}

          {TOPICS.map((t, i) => (
            <text
              key={`row-${i}`}
              x={labelW - 4}
              y={labelW + i * cell + cell / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={8}
              fontFamily="IBM Plex Mono"
              fontWeight="700"
              fill="#000"
            >
              {t}
            </text>
          ))}

          {CORRELATIONS.map((row, ri) =>
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
          { color: "#FF3B00", label: "STRONG POSITIVE (>0.6)" },
          { color: "#FF8866", label: "MODERATE (0.3–0.6)" },
          { color: "#FFCCBB", label: "WEAK (0–0.3)" },
          { color: "#3388FF", label: "NEGATIVE (<0)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className="w-3 h-3 border border-black" style={{ background: item.color }} />
            <span className="font-mono text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
