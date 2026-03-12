"use client";
import { useState } from "react";

const QUESTIONS = [
  { text: "The government should provide universal healthcare free at the point of use", axis: "economic", direction: -1 },
  { text: "A strong military is essential to national security", axis: "social", direction: 1 },
  { text: "Corporations should face higher taxes to fund public services", axis: "economic", direction: -1 },
  { text: "Immigration enriches our culture and economy", axis: "social", direction: -1 },
  { text: "The free market is the best way to allocate resources", axis: "economic", direction: 1 },
  { text: "Traditional family values should be promoted by the state", axis: "social", direction: 1 },
  { text: "Climate change action should take priority over economic growth", axis: "economic", direction: -1 },
  { text: "Law enforcement should have broader surveillance powers", axis: "social", direction: 1 },
  { text: "Wealth inequality is the biggest threat to society", axis: "economic", direction: -1 },
  { text: "Individual liberty matters more than collective security", axis: "social", direction: -1 },
];

const LABELS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

function getLabel(economic: number, social: number): string {
  const parts: string[] = [];
  if (economic < -2) parts.push("Left");
  else if (economic > 2) parts.push("Right");
  else parts.push("Centre");

  if (social < -2) parts.push("Libertarian");
  else if (social > 2) parts.push("Authoritarian");

  return parts.join("-");
}

export default function PoliticalCompass() {
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(2));
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (idx: number, val: number) => {
    const next = [...answers];
    next[idx] = val;
    setAnswers(next);
  };

  // Calculate scores: -10 to +10 scale
  const economic = QUESTIONS.reduce((sum, q, i) => {
    if (q.axis !== "economic") return sum;
    return sum + (answers[i] - 2) * q.direction;
  }, 0);

  const social = QUESTIONS.reduce((sum, q, i) => {
    if (q.axis !== "social") return sum;
    return sum + (answers[i] - 2) * q.direction;
  }, 0);

  // Normalize to -10..10
  const maxEcon = QUESTIONS.filter((q) => q.axis === "economic").length * 2;
  const maxSoc = QUESTIONS.filter((q) => q.axis === "social").length * 2;
  const econNorm = (economic / maxEcon) * 10;
  const socNorm = (social / maxSoc) * 10;
  const label = getLabel(econNorm, socNorm);

  if (!submitted) {
    return (
      <div>
        <div className="space-y-6">
          {QUESTIONS.map((q, i) => (
            <div key={i} className="border-2 border-black p-4">
              <p className="font-mono text-sm font-bold mb-3">
                Q{i + 1}. {q.text}
              </p>
              <div className="flex gap-2 flex-wrap">
                {LABELS.map((lbl, v) => (
                  <button
                    key={v}
                    onClick={() => handleAnswer(i, v)}
                    className={`px-3 py-2 border-2 border-black font-mono text-xs transition-all ${
                      answers[i] === v ? "bg-[#FF3B00] text-white" : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setSubmitted(true)}
          className="mt-6 w-full py-4 bg-black text-white font-mono text-lg font-bold border-4 border-black hover:bg-[#FF3B00] transition-colors"
        >
          REVEAL MY POLITICAL POSITION →
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Compass Grid */}
      <div className="relative mx-auto" style={{ width: 320, height: 320 }}>
        <svg viewBox="0 0 320 320" className="w-full h-full">
          {/* Quadrant backgrounds */}
          <rect x="0" y="0" width="160" height="160" fill="#fee2e2" opacity="0.5" />
          <rect x="160" y="0" width="160" height="160" fill="#dbeafe" opacity="0.5" />
          <rect x="0" y="160" width="160" height="160" fill="#dcfce7" opacity="0.5" />
          <rect x="160" y="160" width="160" height="160" fill="#fef9c3" opacity="0.5" />

          {/* Grid lines */}
          <line x1="160" y1="0" x2="160" y2="320" stroke="black" strokeWidth="2" />
          <line x1="0" y1="160" x2="320" y2="160" stroke="black" strokeWidth="2" />
          {[80, 240].map((v) => (
            <g key={v}>
              <line x1={v} y1="0" x2={v} y2="320" stroke="black" strokeWidth="0.5" opacity="0.2" />
              <line x1="0" y1={v} x2="320" y2={v} stroke="black" strokeWidth="0.5" opacity="0.2" />
            </g>
          ))}

          {/* Axis labels */}
          <text x="160" y="14" textAnchor="middle" className="font-mono" fontSize="11" fontWeight="bold">AUTHORITARIAN</text>
          <text x="160" y="314" textAnchor="middle" className="font-mono" fontSize="11" fontWeight="bold">LIBERTARIAN</text>
          <text x="8" y="164" textAnchor="start" className="font-mono" fontSize="11" fontWeight="bold">LEFT</text>
          <text x="312" y="164" textAnchor="end" className="font-mono" fontSize="11" fontWeight="bold">RIGHT</text>

          {/* Quadrant labels */}
          <text x="80" y="80" textAnchor="middle" fontSize="9" opacity="0.4" className="font-mono">Auth-Left</text>
          <text x="240" y="80" textAnchor="middle" fontSize="9" opacity="0.4" className="font-mono">Auth-Right</text>
          <text x="80" y="240" textAnchor="middle" fontSize="9" opacity="0.4" className="font-mono">Lib-Left</text>
          <text x="240" y="240" textAnchor="middle" fontSize="9" opacity="0.4" className="font-mono">Lib-Right</text>

          {/* User position */}
          <circle
            cx={160 + (econNorm / 10) * 150}
            cy={160 - (socNorm / 10) * -150}
            r="12"
            fill="#FF3B00"
            stroke="black"
            strokeWidth="3"
          />
          <text
            x={160 + (econNorm / 10) * 150}
            y={160 - (socNorm / 10) * -150 + 4}
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
          >
            YOU
          </text>
        </svg>
      </div>

      {/* Score Display */}
      <div className="mt-6 border-4 border-black p-4 bg-black text-white text-center">
        <p className="font-mono text-xs tracking-widest mb-2">YOUR POLITICAL POSITION</p>
        <p className="font-display text-4xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{label}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="border-2 border-black p-3 text-center">
          <p className="font-mono text-xs text-gray-500">ECONOMIC AXIS</p>
          <p className="font-mono text-2xl font-bold">{econNorm > 0 ? "+" : ""}{econNorm.toFixed(1)}</p>
          <p className="font-mono text-xs">{econNorm < -2 ? "LEFT" : econNorm > 2 ? "RIGHT" : "CENTRE"}</p>
        </div>
        <div className="border-2 border-black p-3 text-center">
          <p className="font-mono text-xs text-gray-500">SOCIAL AXIS</p>
          <p className="font-mono text-2xl font-bold">{socNorm > 0 ? "+" : ""}{socNorm.toFixed(1)}</p>
          <p className="font-mono text-xs">{socNorm > 2 ? "AUTHORITARIAN" : socNorm < -2 ? "LIBERTARIAN" : "MODERATE"}</p>
        </div>
      </div>

      <button
        onClick={() => setSubmitted(false)}
        className="mt-4 w-full py-3 bg-white text-black font-mono text-sm font-bold border-2 border-black hover:bg-gray-100 transition-colors"
      >
        ← RETAKE QUIZ
      </button>

      <p className="font-mono text-[10px] text-gray-400 mt-4">
        Based on the Political Compass methodology. This is a simplified assessment — for a comprehensive test visit politicalcompass.org.
        Source: politicalcompass.org
      </p>
    </div>
  );
}
