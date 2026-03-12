"use client";

import { useState } from "react";

const CLUSTERS = [
  {
    id: "economy",
    label: "Economy",
    pct: 42,
    color: "#FF3B00",
    cx: 160,
    cy: 160,
    r: 80,
    quotes: [
      "Cost of living is making it impossible to save for the future.",
      "Wages haven't kept up with inflation for over a decade.",
      "Small businesses are being crushed by energy costs.",
      "The gap between rich and poor has never felt wider.",
    ],
  },
  {
    id: "nhs",
    label: "NHS",
    pct: 31,
    color: "#222",
    cx: 310,
    cy: 130,
    r: 62,
    quotes: [
      "Waiting 18 months for a routine operation is unacceptable.",
      "My GP surgery has no appointments for weeks.",
      "Mental health services are completely overwhelmed.",
      "We're losing nurses faster than we can train them.",
    ],
  },
  {
    id: "housing",
    label: "Housing",
    pct: 18,
    color: "#555",
    cx: 295,
    cy: 260,
    r: 48,
    quotes: [
      "Rent is eating 60% of my take-home pay.",
      "Young people have no path to home ownership.",
      "Social housing waiting lists are years long.",
    ],
  },
  {
    id: "climate",
    label: "Climate",
    pct: 9,
    color: "#888",
    cx: 150,
    cy: 280,
    r: 34,
    quotes: [
      "Flooding in my area is getting worse every year.",
      "Net zero targets feel like empty promises.",
    ],
  },
];

export default function SentimentClusters() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const selectedCluster = CLUSTERS.find((c) => c.id === selected);

  return (
    <div className="border-4 border-black p-6 bg-white">
      <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
        <div>
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Metric 09</div>
          <h2 className="font-display text-4xl tracking-wider leading-none">SENTIMENT CLUSTERS</h2>
          <p className="font-mono text-xs mt-2 text-gray-600">
            "WHAT IS THE BIGGEST CHALLENGE FACING THE UK?"
          </p>
        </div>
        <div className="text-6xl font-display text-accent leading-none">09</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <svg viewBox="0 0 400 340" className="w-full border-2 border-black bg-gray-50">
            {CLUSTERS.map((c) => {
              const isHov = hovered === c.id;
              const isSel = selected === c.id;
              return (
                <g key={c.id}>
                  <circle
                    cx={c.cx}
                    cy={c.cy}
                    r={isHov || isSel ? c.r + 6 : c.r}
                    fill={c.color}
                    stroke={isSel ? "#FF3B00" : isHov ? "#000" : "none"}
                    strokeWidth={isSel ? 4 : 2}
                    opacity={selected && !isSel ? 0.25 : 0.88}
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={() => setHovered(c.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(selected === c.id ? null : c.id)}
                  />
                  <text
                    x={c.cx}
                    y={c.cy - 6}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={Math.max(9, c.r * 0.18)}
                    fontFamily="IBM Plex Mono"
                    fontWeight="700"
                    style={{ pointerEvents: "none" }}
                  >
                    {c.label.toUpperCase()}
                  </text>
                  <text
                    x={c.cx}
                    y={c.cy + 12}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={Math.max(12, c.r * 0.25)}
                    fontFamily="Bebas Neue, sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {c.pct}%
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="font-mono text-xs text-gray-500 mt-2 text-center">
            CLICK A CLUSTER TO SEE SAMPLE RESPONSES
          </p>
        </div>

        <div>
          {selectedCluster ? (
            <div
              className="border-2 border-black p-4 h-full"
              style={{ boxShadow: "4px 4px 0px #FF3B00" }}
            >
              <div className="flex items-baseline gap-2 mb-3 border-b-2 border-black pb-2">
                <div
                  className="font-display text-4xl leading-none"
                  style={{ color: selectedCluster.color }}
                >
                  {selectedCluster.pct}%
                </div>
                <div className="font-display text-xl">{selectedCluster.label.toUpperCase()}</div>
              </div>
              <div className="space-y-3">
                {selectedCluster.quotes.map((q, i) => (
                  <div key={i} className="border-l-4 border-accent pl-3 font-mono text-xs leading-relaxed">
                    &ldquo;{q}&rdquo;
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="mt-4 border-2 border-black px-3 py-1 font-mono text-xs hover:bg-black hover:text-white transition-colors"
              >
                ← BACK
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 p-4 h-full flex flex-col justify-center">
              <div className="font-display text-2xl mb-4">CLUSTER BREAKDOWN</div>
              {CLUSTERS.map((c) => (
                <div key={c.id} className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 flex-shrink-0 border border-black"
                    style={{ background: c.color }}
                  />
                  <div className="flex-1 h-2 bg-gray-100 border border-black">
                    <div
                      className="h-full"
                      style={{ width: `${c.pct}%`, background: c.color }}
                    />
                  </div>
                  <span className="font-mono text-xs w-20">
                    {c.label} {c.pct}%
                  </span>
                </div>
              ))}
              <div className="mt-4 font-mono text-xs text-gray-500">
                N=8,421 AI-CLUSTERED RESPONSES
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
