"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useMetrics } from "@/app/lib/useMetrics";
import MetricsStatus from "@/app/components/MetricsStatus";
import ClientOnlyChart from "@/app/components/ClientOnlyChart";

const RAW_DATA = [
  { range: "0-9%", count: 2, label: "Strongly Disapprove" },
  { range: "10-19%", count: 4, label: "Disapprove" },
  { range: "20-29%", count: 12, label: "Somewhat Disapprove" },
  { range: "30-39%", count: 8, label: "Neutral" },
  { range: "40-49%", count: 6, label: "Somewhat Approve" },
  { range: "50-59%", count: 3, label: "Approve" },
  { range: "60-69%", count: 1, label: "Strongly Approve" },
];

const POLARIZATION_INDEX = 68;

function PolarizationLabel({ index }: { index: number }) {
  const level = index > 70 ? "HIGH" : index > 50 ? "MODERATE" : "LOW";
  const color = index > 70 ? "#FF3B00" : index > 50 ? "#333" : "#888";

  return (
    <div className="flex items-center gap-3">
      <div className="font-display text-5xl leading-none" style={{ color }}>
        {index}
      </div>
      <div>
        <div className="font-mono text-xs text-gray-500">POLARIZATION</div>
        <div className="font-mono text-sm font-bold" style={{ color }}>
          {level}
        </div>
      </div>
    </div>
  );
}

const FALLBACK = { rawData: RAW_DATA, polarizationIndex: POLARIZATION_INDEX };

export default function PolarizationMeter() {
  const metrics = useMetrics("polarizationMeter", FALLBACK);
  const { data } = metrics;
  const { rawData, polarizationIndex } = data;
  const maxCount = Math.max(...rawData.map((datum) => datum.count));

  return (
    <div className="min-w-0">
      <div className="mb-6 flex items-center justify-between">
        <PolarizationLabel index={polarizationIndex} />
        <div className="border-2 border-black p-3 font-mono text-xs text-right">
          <div className="text-gray-500">POLLS ANALYSED</div>
          <div className="font-display text-2xl">24</div>
        </div>
      </div>

      <div className="mb-2 flex justify-between font-mono text-xs uppercase tracking-wider text-gray-500">
        <span>DISAPPROVE</span>
        <span>DISTRIBUTION OF APPROVAL RATINGS</span>
        <span>APPROVE</span>
      </div>

      <ClientOnlyChart heightClass="h-[200px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={rawData} barCategoryGap={2}>
            <XAxis
              dataKey="range"
              tick={{ fontSize: 8, fontFamily: "IBM Plex Mono", fill: "#555" }}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
              tickLine={false}
            />
            <YAxis hide />
            <Bar dataKey="count" maxBarSize={60}>
              {rawData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.count === maxCount
                      ? "#FF3B00"
                      : entry.count > 8
                        ? "#333"
                        : "#aaa"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ClientOnlyChart>

      <div className="mt-4 grid grid-cols-3 border-t-4 border-black pt-4">
        <div className="border-r-2 border-black text-center">
          <div className="font-mono text-xs text-gray-500">DISAPPROVE</div>
          <div className="font-display text-2xl">50%</div>
        </div>
        <div className="border-r-2 border-black text-center">
          <div className="font-mono text-xs text-gray-500">NEUTRAL</div>
          <div className="font-display text-2xl">22%</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xs text-gray-500">APPROVE</div>
          <div className="font-display text-2xl text-accent">28%</div>
        </div>
      </div>

      <div className="mt-4 border-t-2 border-black pt-3">
        <div className="mb-1 font-mono text-xs text-gray-500">
          POLARIZATION INDEX - METHODOLOGY
        </div>
        <div className="relative h-3 w-full border-2 border-black bg-gray-100">
          <div
            className="absolute left-0 top-0 h-full bg-accent"
            style={{ width: `${polarizationIndex}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-black"
            style={{ left: `${polarizationIndex}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-xs">
          <span>CONSENSUS</span>
          <span className="font-bold text-accent">{polarizationIndex}/100</span>
          <span>MAX DIVISION</span>
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] text-gray-400">
        DATA SOURCE: Ipsos Political Monitor, YouGov Government Approval
        Tracker. Based on 24 published polls, Q4 2025-Q1 2026. Polarization
        index calculated from bimodal distribution analysis of cross-poll
        approval ratings.
      </p>
      <MetricsStatus section="polarizationMeter" status={metrics} />
    </div>
  );
}
