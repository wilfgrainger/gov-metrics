"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

const LEADERBOARD = [
  { name: "PollWatcher_42", prediction: 44, score: 98 },
  { name: "DataNerd_UK", prediction: 46, score: 91 },
  { name: "EUFan2024", prediction: 43, score: 87 },
  { name: "BrexitSkeptic", prediction: 45, score: 82 },
  { name: "YouGovReader", prediction: 48, score: 74 },
];

const ACTUAL = 45;

const DIST_DATA = Array.from({ length: 10 }, (_, i) => {
  const center = 30 + i * 5;
  const dist = Math.abs(center - ACTUAL);
  const count = Math.max(1, 40 - dist * dist * 0.3 + Math.round(Math.random() * 6));
  return { range: `${center}–${center + 4}%`, count: Math.round(count) };
});

export default function PredictionMarket() {
  const [userPrediction, setUserPrediction] = useState(45);
  const [submitted, setSubmitted] = useState(false);
  const [userName, setUserName] = useState("");

  const accuracy = 100 - Math.abs(userPrediction - ACTUAL) * 5;
  const clampedAccuracy = Math.max(0, Math.min(100, accuracy));

  return (
    <div className="border-4 border-black p-6 bg-white">
      <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
        <div>
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Metric 08</div>
          <h2 className="font-display text-4xl tracking-wider leading-none">PREDICTION MARKET</h2>
          <p className="font-mono text-xs mt-2 text-gray-600">
            "WHAT % SUPPORT REJOINING THE EU?"
          </p>
        </div>
        <div className="text-6xl font-display text-accent leading-none">08</div>
      </div>

      {!submitted ? (
        <div className="space-y-4">
          <div className="border-l-4 border-accent pl-3 font-mono text-xs">
            ACTUAL FIGURE REVEALED AFTER SUBMISSION
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-wider mb-2 flex justify-between">
              <span>YOUR PREDICTION</span>
              <span className="text-accent text-2xl font-display leading-none">{userPrediction}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={80}
              value={userPrediction}
              onChange={(e) => setUserPrediction(Number(e.target.value))}
              className="w-full accent-red-600 h-3"
            />
            <div className="flex justify-between font-mono text-xs text-gray-500 mt-1">
              <span>20%</span>
              <span>50%</span>
              <span>80%</span>
            </div>
          </div>
          <div>
            <div className="font-mono text-xs mb-1">YOUR NAME (OPTIONAL)</div>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Anonymous"
              className="border-2 border-black px-3 py-2 w-full font-mono text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={() => setSubmitted(true)}
            className="w-full bg-black text-white font-display text-xl py-3 tracking-widest hover:bg-accent transition-colors"
            style={{ boxShadow: "4px 4px 0px #FF3B00" }}
          >
            SUBMIT PREDICTION
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-accent p-4">
            <div className="font-mono text-xs text-gray-500 mb-1">ACTUAL FIGURE</div>
            <div className="font-display text-5xl text-accent">{ACTUAL}%</div>
            <div className="font-mono text-xs mt-1">
              YOUR PREDICTION: {userPrediction}% —{" "}
              <span className={clampedAccuracy > 80 ? "text-accent font-bold" : ""}>
                ACCURACY SCORE: {clampedAccuracy}
              </span>
            </div>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-wider mb-2 border-b-2 border-black pb-1">
              TOP FORECASTERS
            </div>
            {[
              ...(userName
                ? [{ name: userName || "You", prediction: userPrediction, score: clampedAccuracy }]
                : []),
              ...LEADERBOARD,
            ]
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map((entry, i) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between py-1 border-b border-gray-200 font-mono text-xs"
                  style={{ background: entry.name === (userName || "You") && userName ? "#FFF5F3" : "transparent" }}
                >
                  <span className="w-5 text-gray-500">{i + 1}</span>
                  <span className="flex-1">{entry.name}</span>
                  <span className="text-gray-500">{entry.prediction}%</span>
                  <span
                    className="w-12 text-right font-bold"
                    style={{ color: entry.score > 90 ? "#FF3B00" : "#000" }}
                  >
                    {entry.score}pts
                  </span>
                </div>
              ))}
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-wider mb-2">PREDICTION DISTRIBUTION</div>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={DIST_DATA} barCategoryGap={2}>
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 7, fontFamily: "IBM Plex Mono" }}
                  axisLine={{ stroke: "#000" }}
                  tickLine={false}
                />
                <YAxis hide />
                <ReferenceLine x={`${ACTUAL}–${ACTUAL + 4}%`} stroke="#FF3B00" strokeWidth={2} />
                <Bar dataKey="count">
                  {DIST_DATA.map((_, i) => (
                    <Cell key={i} fill={DIST_DATA[i].range.startsWith(`${ACTUAL}`) ? "#FF3B00" : "#333"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <button
            onClick={() => setSubmitted(false)}
            className="border-2 border-black px-4 py-2 font-mono text-xs tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            ← TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
