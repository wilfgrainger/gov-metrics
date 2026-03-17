"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useMetrics } from "@/app/lib/useMetrics";
import MetricsStatus from "@/app/components/MetricsStatus";
import ClientOnlyChart from "@/app/components/ClientOnlyChart";

const POLLING_DATA = [
  { party: "REF", name: "Reform UK", pct: 28, color: "#12B6CF", change: 14 },
  { party: "LAB", name: "Labour", pct: 21, color: "#E4003B", change: -13 },
  { party: "CON", name: "Conservative", pct: 18, color: "#0087DC", change: -6 },
  { party: "GRN", name: "Green", pct: 12, color: "#6AB023", change: 5 },
  { party: "LD", name: "Liberal Democrats", pct: 12, color: "#FAA61A", change: 1 },
  { party: "SNP", name: "SNP", pct: 3, color: "#FFF95D", change: -1 },
  { party: "OTH", name: "Others", pct: 6, color: "#999999", change: 0 },
];

const RECENT_POLLS = [
  { pollster: "More in Common", date: "Mar 2026", lab: 22, con: 19, ref: 30, ld: 13 },
  { pollster: "YouGov", date: "Mar 2026", lab: 20, con: 18, ref: 28, ld: 12 },
  { pollster: "Savanta", date: "Feb 2026", lab: 21, con: 19, ref: 27, ld: 12 },
  { pollster: "Ipsos", date: "Feb 2026", lab: 22, con: 17, ref: 27, ld: 13 },
  { pollster: "R&W", date: "Feb 2026", lab: 19, con: 18, ref: 29, ld: 12 },
];

const FALLBACK = { pollingData: POLLING_DATA, recentPolls: RECENT_POLLS };

export default function ElectionPolling() {
  const metrics = useMetrics("electionPolling", FALLBACK);
  const { data } = metrics;
  const { pollingData, recentPolls } = data;
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  return (
    <div className="min-w-0">
      <ClientOnlyChart heightClass="h-64">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={pollingData}
            layout="vertical"
            margin={{ left: 5, right: 30 }}
          >
            <XAxis
              type="number"
              domain={[0, 40]}
              tick={{ fontFamily: "IBM Plex Mono", fontSize: 10 }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="party"
              tick={{
                fontFamily: "IBM Plex Mono",
                fontSize: 11,
                fontWeight: 700,
              }}
              width={35}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) {
                  return null;
                }

                const datum = payload[0].payload;

                return (
                  <div className="border-2 border-black bg-black p-3 font-mono text-xs text-white">
                    <p className="font-bold">{datum.name}</p>
                    <p className="text-lg">{datum.pct}%</p>
                    <p
                      className={
                        datum.change > 0
                          ? "text-green-400"
                          : datum.change < 0
                            ? "text-red-400"
                            : "text-gray-400"
                      }
                    >
                      {datum.change > 0 ? "+" : ""}
                      {datum.change}pp vs 2024 GE
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="pct"
              onMouseEnter={(_, index) =>
                setSelectedParty(pollingData[index].party)
              }
              onMouseLeave={() => setSelectedParty(null)}
            >
              {pollingData.map((datum) => (
                <Cell
                  key={datum.party}
                  fill={
                    selectedParty && selectedParty !== datum.party
                      ? "#e5e5e5"
                      : datum.color
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ClientOnlyChart>

      <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-5">
        {pollingData.slice(0, 5).map((datum) => (
          <div key={datum.party} className="border-2 border-black p-2 text-center">
            <div
              className="mx-auto mb-1 h-3 w-3"
              style={{ backgroundColor: datum.color }}
            />
            <p className="font-mono text-xs font-bold">{datum.party}</p>
            <p className="font-mono text-lg font-bold">{datum.pct}%</p>
            <p
              className={`font-mono text-[10px] ${
                datum.change > 0
                  ? "text-green-600"
                  : datum.change < 0
                    ? "text-red-600"
                    : "text-gray-500"
              }`}
            >
              {datum.change > 0 ? "UP" : datum.change < 0 ? "DOWN" : "FLAT"}{" "}
              {Math.abs(datum.change)}pp
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 border-2 border-black">
        <div className="bg-black p-2 text-white">
          <p className="font-mono text-xs font-bold">RECENT INDIVIDUAL POLLS</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="p-2 text-left">POLLSTER</th>
                <th className="p-2">DATE</th>
                <th className="p-2" style={{ color: "#E4003B" }}>
                  LAB
                </th>
                <th className="p-2" style={{ color: "#0087DC" }}>
                  CON
                </th>
                <th className="p-2" style={{ color: "#12B6CF" }}>
                  REF
                </th>
                <th className="p-2" style={{ color: "#FAA61A" }}>
                  LD
                </th>
              </tr>
            </thead>
            <tbody>
              {recentPolls.map((poll, index) => (
                <tr
                  key={index}
                  className={
                    index < recentPolls.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }
                >
                  <td className="p-2 font-bold">{poll.pollster}</td>
                  <td className="p-2 text-gray-500">{poll.date}</td>
                  <td className="p-2 text-center">{poll.lab}%</td>
                  <td className="p-2 text-center">{poll.con}%</td>
                  <td className="p-2 text-center">{poll.ref}%</td>
                  <td className="p-2 text-center">{poll.ld}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] text-gray-400">
        DATA SOURCES: YouGov, Ipsos, Savanta, Redfield & Wilton Strategies,
        More in Common, Deltapoll. Polling averages aggregated from publicly
        available data via PollCheck, Wikipedia UK polling tracker, and
        Electoral Calculus. Changes shown vs 2024 General Election result
        (4 Jul 2024). Data verified: March 2026.
      </p>
      <MetricsStatus section="electionPolling" status={metrics} />
    </div>
  );
}
