"use client";

import { useEffect, useRef, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const INITIAL_DATA = Array.from({ length: 30 }, (_, i) => ({
  t: i,
  positive: 38 + Math.round(Math.sin(i * 0.4) * 5 + (Math.random() - 0.5) * 4),
  negative: 28 + Math.round(Math.cos(i * 0.3) * 4 + (Math.random() - 0.5) * 3),
  neutral: 34,
}));

function normalise(p: number, n: number) {
  const total = p + n + (100 - p - n);
  return {
    positive: Math.round((p / total) * 100),
    negative: Math.round((n / total) * 100),
    neutral: 100 - Math.round((p / total) * 100) - Math.round((n / total) * 100),
  };
}

export default function SentimentPulse() {
  const [data, setData] = useState(INITIAL_DATA);
  const [live, setLive] = useState(true);
  const tickRef = useRef(30);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      tickRef.current += 1;
      setData((prev) => {
        const last = prev[prev.length - 1];
        const newP = Math.min(70, Math.max(10, last.positive + Math.round((Math.random() - 0.48) * 5)));
        const newN = Math.min(60, Math.max(8, last.negative + Math.round((Math.random() - 0.52) * 4)));
        const { positive, negative, neutral } = normalise(newP, newN);
        const next = { t: tickRef.current, positive, negative, neutral };
        return [...prev.slice(-49), next];
      });
    }, 2000);
    return () => clearInterval(id);
  }, [live]);

  const current = data[data.length - 1];
  const { positive, negative, neutral } = normalise(current.positive, current.negative);

  return (
    <div className="border-4 border-black p-6 bg-white">
      <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
        <div>
          <div className="font-mono text-xs tracking-widest text-gray-500 uppercase mb-1">Metric 05</div>
          <h2 className="font-display text-4xl tracking-wider leading-none">SENTIMENT PULSE</h2>
          <p className="font-mono text-xs mt-2 text-gray-600">
            BREAKING: BUDGET ANNOUNCEMENT
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1 font-mono text-xs border-2 border-accent px-2 py-1"
            style={{ background: live ? "#FF3B00" : "#fff", color: live ? "#fff" : "#FF3B00" }}
          >
            {live && (
              <span className="w-2 h-2 rounded-full bg-white inline-block animate-pulse" />
            )}
            {live ? "LIVE" : "PAUSED"}
          </div>
          <div className="text-6xl font-display text-accent leading-none">05</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { key: "positive", label: "POSITIVE", value: positive, color: "#000" },
          { key: "neutral", label: "NEUTRAL", value: neutral, color: "#888" },
          { key: "negative", label: "NEGATIVE", value: negative, color: "#FF3B00" },
        ].map(({ key, label, value, color }) => (
          <div key={key} className="border-2 border-black p-3">
            <div className="font-mono text-xs text-gray-500 mb-1">{label}</div>
            <div className="font-display text-3xl leading-none" style={{ color }}>
              {value}%
            </div>
            <div className="mt-2 h-2 bg-gray-100 border border-black">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${value}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#000" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF3B00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF3B00" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              fontFamily: "IBM Plex Mono",
              fontSize: 10,
              border: "2px solid #000",
              borderRadius: 0,
              background: "#fff",
            }}
            formatter={(val, name) => [`${val ?? ''}%`, String(name ?? '').toUpperCase()]}
          />
          <Area
            type="monotone"
            dataKey="positive"
            stroke="#000"
            strokeWidth={2}
            fill="url(#posGrad)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="negative"
            stroke="#FF3B00"
            strokeWidth={2}
            fill="url(#negGrad)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <button
        onClick={() => setLive((l) => !l)}
        className="mt-4 border-2 border-black px-4 py-1 font-mono text-xs tracking-widest hover:bg-black hover:text-white transition-colors"
        style={{ boxShadow: "2px 2px 0px #000" }}
      >
        {live ? "⏸ PAUSE" : "▶ RESUME"}
      </button>
    </div>
  );
}
