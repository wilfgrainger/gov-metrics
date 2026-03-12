"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// UK polling averages as of March 2026
// Sources: PollCheck, POLITICO Poll of Polls, Electoral Calculus, YouGov, Statista
// Changes shown vs 2024 General Election result
const POLLING_DATA = [
  { party: "REF", name: "Reform UK", pct: 26, color: "#12B6CF", change: +12 },
  { party: "LAB", name: "Labour", pct: 20, color: "#E4003B", change: -14 },
  { party: "CON", name: "Conservative", pct: 18, color: "#0087DC", change: -6 },
  { party: "LD", name: "Liberal Democrats", pct: 12, color: "#FAA61A", change: 0 },
  { party: "GRN", name: "Green", pct: 12, color: "#6AB023", change: +5 },
  { party: "SNP", name: "SNP", pct: 3, color: "#FFF95D", change: 0 },
  { party: "OTH", name: "Others", pct: 9, color: "#999999", change: 0 },
];

// Recent individual polls for context
const RECENT_POLLS = [
  { pollster: "YouGov", date: "Mar 2026", lab: 19, con: 17, ref: 28, ld: 12 },
  { pollster: "Savanta", date: "Mar 2026", lab: 21, con: 18, ref: 26, ld: 12 },
  { pollster: "More in Common", date: "Mar 2026", lab: 22, con: 16, ref: 30, ld: 11 },
  { pollster: "Deltapoll", date: "Feb 2026", lab: 20, con: 19, ref: 25, ld: 13 },
  { pollster: "Opinium", date: "Feb 2026", lab: 18, con: 18, ref: 27, ld: 12 },
];

export default function ElectionPolling() {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  return (
    <div>
      {/* Main chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={POLLING_DATA} layout="vertical" margin={{ left: 5, right: 30 }}>
            <XAxis type="number" domain={[0, 40]} tick={{ fontFamily: "IBM Plex Mono", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="party" tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fontWeight: 700 }} width={35} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-black text-white p-3 border-2 border-black font-mono text-xs">
                    <p className="font-bold">{d.name}</p>
                    <p className="text-lg">{d.pct}%</p>
                    <p className={d.change > 0 ? "text-green-400" : d.change < 0 ? "text-red-400" : "text-gray-400"}>
                      {d.change > 0 ? "+" : ""}{d.change}pp vs 2024 GE
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="pct" onMouseEnter={(_, i) => setSelectedParty(POLLING_DATA[i].party)} onMouseLeave={() => setSelectedParty(null)}>
              {POLLING_DATA.map((d) => (
                <Cell key={d.party} fill={selectedParty && selectedParty !== d.party ? "#e5e5e5" : d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Party cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
        {POLLING_DATA.slice(0, 5).map((d) => (
          <div key={d.party} className="border-2 border-black p-2 text-center">
            <div className="w-3 h-3 mx-auto mb-1" style={{ backgroundColor: d.color }} />
            <p className="font-mono text-xs font-bold">{d.party}</p>
            <p className="font-mono text-lg font-bold">{d.pct}%</p>
            <p className={`font-mono text-[10px] ${d.change > 0 ? "text-green-600" : d.change < 0 ? "text-red-600" : "text-gray-500"}`}>
              {d.change > 0 ? "↑" : d.change < 0 ? "↓" : "—"}{Math.abs(d.change)}pp
            </p>
          </div>
        ))}
      </div>

      {/* Recent polls table */}
      <div className="mt-4 border-2 border-black">
        <div className="bg-black text-white p-2">
          <p className="font-mono text-xs font-bold">RECENT INDIVIDUAL POLLS</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="p-2 text-left">POLLSTER</th>
                <th className="p-2">DATE</th>
                <th className="p-2" style={{ color: "#12B6CF" }}>REF</th>
                <th className="p-2" style={{ color: "#E4003B" }}>LAB</th>
                <th className="p-2" style={{ color: "#0087DC" }}>CON</th>
                <th className="p-2" style={{ color: "#FAA61A" }}>LD</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_POLLS.map((p, i) => (
                <tr key={i} className={i < RECENT_POLLS.length - 1 ? "border-b border-gray-200" : ""}>
                  <td className="p-2 font-bold">{p.pollster}</td>
                  <td className="p-2 text-gray-500">{p.date}</td>
                  <td className="p-2 text-center">{p.ref}%</td>
                  <td className="p-2 text-center">{p.lab}%</td>
                  <td className="p-2 text-center">{p.con}%</td>
                  <td className="p-2 text-center">{p.ld}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="font-mono text-[10px] text-gray-400 mt-3">
        DATA SOURCES: PollCheck, POLITICO Poll of Polls, Electoral Calculus, YouGov, Statista.
        Polling averages aggregated from publicly available data as of March 2026.
        Changes shown vs 2024 General Election result.
      </p>
    </div>
  );
}
