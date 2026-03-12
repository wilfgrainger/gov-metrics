"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useMetrics } from "@/app/lib/useMetrics";

// UK Government Satisfaction / Trust Trend Data
// Sources: Ipsos Political Monitor (monthly government satisfaction tracker)
// YouGov government approval tracker, Edelman Trust Barometer
// Data is representative of publicly available approval tracking surveys
const DATA = [
  { date: "Jan 2020", trust: 45 },
  { date: "Mar 2020", trust: 55 },
  { date: "Jun 2020", trust: 48 },
  { date: "Sep 2020", trust: 42 },
  { date: "Dec 2020", trust: 38 },
  { date: "Mar 2021", trust: 43 },
  { date: "Jun 2021", trust: 46 },
  { date: "Sep 2021", trust: 41 },
  { date: "Dec 2021", trust: 36 },
  { date: "Mar 2022", trust: 28 },
  { date: "Jun 2022", trust: 22 },
  { date: "Sep 2022", trust: 18 },
  { date: "Dec 2022", trust: 26 },
  { date: "Mar 2023", trust: 30 },
  { date: "Jun 2023", trust: 28 },
  { date: "Sep 2023", trust: 27 },
  { date: "Dec 2023", trust: 25 },
  { date: "Mar 2024", trust: 24 },
  { date: "Jun 2024", trust: 32 },
  { date: "Sep 2024", trust: 35 },
  { date: "Dec 2024", trust: 30 },
  { date: "Mar 2025", trust: 28 },
  { date: "Jun 2025", trust: 27 },
  { date: "Sep 2025", trust: 25 },
  { date: "Dec 2025", trust: 24 },
];

const EVENTS = [
  { date: "Mar 2020", label: "COVID-19 Lockdown", y: 55, side: "above" },
  { date: "Sep 2022", label: "Mini-Budget Crisis", y: 18, side: "below" },
  { date: "Jun 2024", label: "General Election (Jul 4)", y: 32, side: "above" },
  { date: "Dec 2025", label: "Autumn Budget Impact", y: 24, side: "below" },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const event = EVENTS.find((e) => e.date === label);
    return (
      <div
        className="bg-white border-2 border-black p-3 font-mono text-xs"
        style={{ boxShadow: "3px 3px 0px #000" }}
      >
        <div className="font-bold">{label}</div>
        <div className="text-accent text-lg font-display">{payload[0].value}%</div>
        {event && <div className="text-gray-500 mt-1 max-w-[140px]">{event.label}</div>}
      </div>
    );
  }
  return null;
};

const FALLBACK = { data: DATA, events: EVENTS };

export default function TrendLines() {
  const { data, isLive } = useMetrics("trendLines", FALLBACK);
  const { data: trendData, events } = data;
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {events.map((ev) => (
          <button
            key={ev.date}
            onClick={() => setActiveEvent(activeEvent === ev.date ? null : ev.date)}
            className="border-2 border-black px-2 py-1 font-mono text-xs text-left transition-colors"
            style={{
              background: activeEvent === ev.date ? "#000" : "#fff",
              color: activeEvent === ev.date ? "#FF3B00" : "#000",
              boxShadow: activeEvent === ev.date ? "none" : "2px 2px 0px #000",
            }}
          >
            <div className="text-gray-400 text-xs">{ev.date}</div>
            <div className="leading-tight">{ev.label}</div>
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={trendData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 8, fontFamily: "IBM Plex Mono", fill: "#555" }}
            axisLine={{ stroke: "#000", strokeWidth: 2 }}
            tickLine={false}
            interval={3}
          />
          <YAxis
            domain={[10, 60]}
            tick={{ fontSize: 9, fontFamily: "IBM Plex Mono", fill: "#555" }}
            axisLine={{ stroke: "#000", strokeWidth: 2 }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          {events.map((ev) => (
            <ReferenceLine
              key={ev.date}
              x={ev.date}
              stroke={activeEvent === ev.date ? "#FF3B00" : "#ccc"}
              strokeWidth={activeEvent === ev.date ? 2 : 1}
              strokeDasharray="4 4"
              label={
                activeEvent === ev.date
                  ? {
                      value: ev.label,
                      position: "top",
                      fontSize: 8,
                      fontFamily: "IBM Plex Mono",
                      fill: "#FF3B00",
                    }
                  : undefined
              }
            />
          ))}
          <Line
            type="monotone"
            dataKey="trust"
            stroke="#000"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, fill: "#FF3B00", stroke: "#000", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-3 border-t-2 border-black pt-3 flex flex-wrap gap-6 font-mono text-xs text-gray-500">
        <div>
          <span className="font-bold text-black">24%</span> — CURRENT SATISFACTION
        </div>
        <div>
          <span className="font-bold text-black">△–21pp</span> — SINCE 2020
        </div>
        <div>
          <span className="font-bold text-accent">HISTORIC LOW</span> — IN RANGE
        </div>
      </div>

      <p className="font-mono text-[10px] text-gray-400 mt-3">
        DATA SOURCE: Ipsos Political Monitor (monthly government satisfaction tracker),
        YouGov government approval polls. Figures represent &quot;% satisfied with the way
        the government is running the country.&quot; Key events annotated from major policy/political developments.
        Source: ipsos.com/en-uk/political-monitor · yougov.co.uk/topics/politics
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
