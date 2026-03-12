"use client";

import { useState } from "react";
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

const AXES = [
  { key: "nhs", label: "NHS Support" },
  { key: "climate", label: "Climate Action" },
  { key: "immigration", label: "Immigration" },
  { key: "inequality", label: "Econ. Inequality" },
  { key: "privacy", label: "Digital Privacy" },
  { key: "housing", label: "Housing Crisis" },
];

const NATIONAL_AVG = {
  nhs: 72,
  climate: 61,
  immigration: 48,
  inequality: 65,
  privacy: 54,
  housing: 78,
};

const DEMOGRAPHIC_AVGS = {
  "18-24": { nhs: 80, climate: 82, immigration: 55, inequality: 78, privacy: 70, housing: 88 },
  "45-64": { nhs: 68, climate: 52, immigration: 42, inequality: 58, privacy: 45, housing: 72 },
};

export default function RadarChart() {
  const [userValues, setUserValues] = useState<Record<string, number>>({
    nhs: 70,
    climate: 60,
    immigration: 50,
    inequality: 65,
    privacy: 55,
    housing: 75,
  });
  const [submitted, setSubmitted] = useState(false);

  const chartData = AXES.map((axis) => ({
    subject: axis.label,
    You: userValues[axis.key],
    National: NATIONAL_AVG[axis.key as keyof typeof NATIONAL_AVG],
    "18-24": DEMOGRAPHIC_AVGS["18-24"][axis.key as keyof typeof DEMOGRAPHIC_AVGS["18-24"]],
  }));

  return (
    <div className="border-4 border-black p-6 bg-white">
      <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
        <div>
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Metric 01</div>
          <h2 className="font-display text-4xl tracking-wider leading-none">WHERE DO I STAND?</h2>
          <p className="font-mono text-xs mt-2 text-gray-600">YOUR VIEWS VS NATIONAL AVERAGE</p>
        </div>
        <div className="text-6xl font-display text-accent leading-none">01</div>
      </div>

      {!submitted ? (
        <div className="space-y-4">
          <p className="font-mono text-sm border-l-4 border-accent pl-3 py-1">
            SET YOUR POSITIONS ON 6 KEY ISSUES (0–100)
          </p>
          {AXES.map((axis) => (
            <div key={axis.key} className="grid grid-cols-[1fr_auto] gap-4 items-center">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider mb-1 flex justify-between">
                  <span>{axis.label}</span>
                  <span className="text-accent font-bold">{userValues[axis.key]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={userValues[axis.key]}
                  onChange={(e) =>
                    setUserValues((v) => ({ ...v, [axis.key]: Number(e.target.value) }))
                  }
                  className="w-full accent-red-600 h-2"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => setSubmitted(true)}
            className="mt-4 w-full bg-black text-white font-display text-xl py-3 tracking-widest hover:bg-accent transition-colors"
            style={{ boxShadow: "4px 4px 0px #FF3B00" }}
          >
            REVEAL MY PROFILE
          </button>
        </div>
      ) : (
        <div>
          <ResponsiveContainer width="100%" height={320}>
            <RechartsRadar data={chartData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#000" strokeWidth={1} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 10, fontFamily: "IBM Plex Mono", fontWeight: 700, fill: "#000" }}
              />
              <Radar
                name="You"
                dataKey="You"
                stroke="#FF3B00"
                fill="#FF3B00"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Radar
                name="National"
                dataKey="National"
                stroke="#000000"
                fill="#000000"
                fillOpacity={0.08}
                strokeWidth={2}
              />
              <Radar
                name="18-24"
                dataKey="18-24"
                stroke="#555"
                fill="#555"
                fillOpacity={0.08}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <Legend
                wrapperStyle={{ fontFamily: "IBM Plex Mono", fontSize: 10, textTransform: "uppercase" }}
              />
            </RechartsRadar>
          </ResponsiveContainer>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-2 border-2 border-black px-4 py-2 font-mono text-xs tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            ← RESET
          </button>
        </div>
      )}
    </div>
  );
}
