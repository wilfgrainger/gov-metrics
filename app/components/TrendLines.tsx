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
import MetricsStatus from "@/app/components/MetricsStatus";
import ClientOnlyChart from "@/app/components/ClientOnlyChart";

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
  { date: "Mar 2020", label: "COVID-19 Lockdown" },
  { date: "Sep 2022", label: "Mini-Budget Crisis" },
  { date: "Jun 2024", label: "General Election (Jul 4)" },
  { date: "Dec 2025", label: "Autumn Budget Impact" },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const event = EVENTS.find((entry) => entry.date === label);

  return (
    <div
      className="border-2 border-black bg-white p-3 font-mono text-xs"
      style={{ boxShadow: "3px 3px 0px #000" }}
    >
      <div className="font-bold">{label}</div>
      <div className="font-display text-lg text-accent">{payload[0].value}%</div>
      {event ? (
        <div className="mt-1 max-w-[140px] text-gray-500">{event.label}</div>
      ) : null}
    </div>
  );
};

const FALLBACK = { data: DATA, events: EVENTS };

export default function TrendLines() {
  const metrics = useMetrics("trendLines", FALLBACK);
  const { data } = metrics;
  const { data: trendData, events } = data;
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  return (
    <div className="min-w-0">
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {events.map((event) => (
          <button
            key={event.date}
            onClick={() =>
              setActiveEvent(activeEvent === event.date ? null : event.date)
            }
            className="border-2 border-black px-2 py-1 text-left font-mono text-xs transition-colors"
            style={{
              background: activeEvent === event.date ? "#000" : "#fff",
              color: activeEvent === event.date ? "#FF3B00" : "#000",
              boxShadow: activeEvent === event.date ? "none" : "2px 2px 0px #000",
            }}
          >
            <div className="text-xs text-gray-400">{event.date}</div>
            <div className="leading-tight">{event.label}</div>
          </button>
        ))}
      </div>

      <ClientOnlyChart heightClass="h-[260px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart
            data={trendData}
            margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
          >
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
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            {events.map((event) => (
              <ReferenceLine
                key={event.date}
                x={event.date}
                stroke={activeEvent === event.date ? "#FF3B00" : "#ccc"}
                strokeWidth={activeEvent === event.date ? 2 : 1}
                strokeDasharray="4 4"
                label={
                  activeEvent === event.date
                    ? {
                        value: event.label,
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
      </ClientOnlyChart>

      <div className="mt-3 flex flex-wrap gap-6 border-t-2 border-black pt-3 font-mono text-xs text-gray-500">
        <div>
          <span className="font-bold text-black">24%</span> - CURRENT SATISFACTION
        </div>
        <div>
          <span className="font-bold text-black">DOWN 21pp</span> - SINCE 2020
        </div>
        <div>
          <span className="font-bold text-accent">HISTORIC LOW</span> - IN RANGE
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] text-gray-400">
        DATA SOURCE: Ipsos Political Monitor and YouGov government approval
        polls. Figures represent the share satisfied with the way the
        government is running the country. Key events are annotated from major
        policy and political developments.
      </p>
      <MetricsStatus section="trendLines" status={metrics} />
    </div>
  );
}
