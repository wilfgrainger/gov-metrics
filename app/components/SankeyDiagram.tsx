"use client";

import { useState } from "react";

const DEMOGRAPHICS = [
  { id: "genz", label: "Gen Z", color: "#FF3B00", total: 100 },
  { id: "millennials", label: "Millennials", color: "#222", total: 100 },
  { id: "genx", label: "Gen X", color: "#555", total: 100 },
  { id: "boomers", label: "Boomers", color: "#888", total: 100 },
];

const RESPONSES = [
  { id: "strongly_agree", label: "Strongly Agree", color: "#FF3B00" },
  { id: "agree", label: "Agree", color: "#333" },
  { id: "neutral", label: "Neutral", color: "#888" },
  { id: "disagree", label: "Disagree", color: "#aaa" },
  { id: "strongly_disagree", label: "Strongly Disagree", color: "#ccc" },
];

const FLOWS: Record<string, Record<string, number>> = {
  genz: { strongly_agree: 38, agree: 30, neutral: 15, disagree: 10, strongly_disagree: 7 },
  millennials: { strongly_agree: 25, agree: 32, neutral: 20, disagree: 14, strongly_disagree: 9 },
  genx: { strongly_agree: 15, agree: 22, neutral: 25, disagree: 22, strongly_disagree: 16 },
  boomers: { strongly_agree: 8, agree: 14, neutral: 20, disagree: 28, strongly_disagree: 30 },
};

export default function SankeyDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);

  const leftX = 0;
  const rightX = 480;
  const svgH = 320;
  const colW = 80;

  const leftSpacing = svgH / DEMOGRAPHICS.length;
  const rightSpacing = svgH / RESPONSES.length;

  const leftNodes = DEMOGRAPHICS.map((d, i) => ({
    ...d,
    y: i * leftSpacing + leftSpacing / 2,
    h: leftSpacing - 8,
  }));

  const rightNodes = RESPONSES.map((r, i) => ({
    ...r,
    y: i * rightSpacing + rightSpacing / 2,
    h: rightSpacing - 8,
  }));

  const paths: Array<{
    key: string;
    d: string;
    color: string;
    width: number;
    label: string;
    pct: number;
  }> = [];

  const rightOffsets: Record<string, number> = {};
  RESPONSES.forEach((r) => {
    rightOffsets[r.id] = 0;
  });
  const leftOffsets: Record<string, number> = {};
  DEMOGRAPHICS.forEach((d) => {
    leftOffsets[d.id] = 0;
  });

  DEMOGRAPHICS.forEach((demo) => {
    const lNode = leftNodes.find((n) => n.id === demo.id)!;
    RESPONSES.forEach((resp) => {
      const rNode = rightNodes.find((n) => n.id === resp.id)!;
      const pct = FLOWS[demo.id][resp.id];
      const strokeW = Math.max(2, (pct / 100) * (leftSpacing - 8));

      const ly = lNode.y - lNode.h / 2 + leftOffsets[demo.id] + strokeW / 2;
      const ry = rNode.y - rNode.h / 2 + rightOffsets[resp.id] + strokeW / 2;

      const mx = (leftX + colW + rightX) / 2;

      paths.push({
        key: `${demo.id}-${resp.id}`,
        d: `M ${leftX + colW} ${ly} C ${mx} ${ly}, ${mx} ${ry}, ${rightX} ${ry}`,
        color: demo.color,
        width: strokeW,
        label: `${demo.label} → ${resp.label}`,
        pct,
      });

      leftOffsets[demo.id] += strokeW;
      rightOffsets[resp.id] += strokeW;
    });
  });

  return (
    <div className="border-4 border-black p-6 bg-white">
      <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
        <div>
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Metric 02</div>
          <h2 className="font-display text-4xl tracking-wider leading-none">DEMOGRAPHIC FLOW</h2>
          <p className="font-mono text-xs mt-2 text-gray-600">
            "SHOULD VOTING AGE BE LOWERED TO 16?"
          </p>
        </div>
        <div className="text-6xl font-display text-accent leading-none">02</div>
      </div>

      {hovered && (
        <div className="mb-3 border-2 border-accent px-3 py-1 font-mono text-xs bg-accent text-white inline-block">
          {paths.find((p) => p.key === hovered)?.label} —{" "}
          {paths.find((p) => p.key === hovered)?.pct}%
        </div>
      )}

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${rightX + colW} ${svgH}`} className="w-full" style={{ minWidth: 400 }}>
          {leftNodes.map((n) => (
            <g key={n.id}>
              <rect
                x={0}
                y={n.y - n.h / 2}
                width={colW - 4}
                height={n.h}
                fill={n.color}
              />
              <text
                x={colW - 8}
                y={n.y}
                textAnchor="end"
                dominantBaseline="middle"
                fill={n.color === "#FF3B00" ? "#fff" : "#fff"}
                fontSize={9}
                fontFamily="IBM Plex Mono"
                fontWeight="700"
              >
                {n.label.toUpperCase()}
              </text>
            </g>
          ))}

          {paths.map((p) => (
            <path
              key={p.key}
              d={p.d}
              stroke={p.color}
              strokeWidth={p.width}
              fill="none"
              opacity={hovered ? (hovered === p.key ? 0.9 : 0.08) : 0.4}
              onMouseEnter={() => setHovered(p.key)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer", transition: "opacity 0.15s" }}
            />
          ))}

          {rightNodes.map((n) => (
            <g key={n.id}>
              <rect
                x={rightX + 4}
                y={n.y - n.h / 2}
                width={colW - 4}
                height={n.h}
                fill={n.color}
              />
              <text
                x={rightX + 8}
                y={n.y}
                dominantBaseline="middle"
                fill="#fff"
                fontSize={8}
                fontFamily="IBM Plex Mono"
                fontWeight="700"
              >
                {n.label.toUpperCase()}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 flex gap-4 flex-wrap">
        {DEMOGRAPHICS.map((d) => (
          <div key={d.id} className="flex items-center gap-1">
            <div className="w-3 h-3 border border-black" style={{ background: d.color }} />
            <span className="font-mono text-xs">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
