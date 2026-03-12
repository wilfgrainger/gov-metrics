"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useMetrics } from "@/app/lib/useMetrics";

// Latest UK polling averages (aggregated from multiple public pollsters)
// Sources: YouGov, Ipsos, Savanta, Redfield & Wilton, More in Common, Deltapoll
// Data represents weighted polling averages as of March 2026
// Publicly available from PollCheck (pollcheck.co.uk), Electoral Calculus, Wikipedia UK polling tracker
const POLLING_DATA = [
  { party: "REF", name: "Reform UK", pct: 28, color: "#12B6CF", change: +14 },
  { party: "LAB", name: "Labour", pct: 21, color: "#E4003B", change: -13 },
  { party: "CON", name: "Conservative", pct: 18, color: "#0087DC", change: -6 },
  { party: "GRN", name: "Green", pct: 12, color: "#6AB023", change: +5 },
  { party: "LD", name: "Liberal Democrats", pct: 12, color: "#FAA61A", change: +1 },
  { party: "SNP", name: "SNP", pct: 3, color: "#FFF95D", change: -1 },
  { party: "OTH", name: "Others", pct: 6, color: "#999999", change: 0 },
];

// Recent individual polls for context
const RECENT_POLLS = [
  { pollster: "More in Common", date: "Mar 2026", lab: 22, con: 19, ref: 30, ld: 13 },
  { pollster: "YouGov", date: "Mar 2026", lab: 20, con: 18, ref: 28, ld: 12 },
  { pollster: "Savanta", date: "Feb 2026", lab: 21, con: 19, ref: 27, ld: 12 },
  { pollster: "Ipsos", date: "Feb 2026", lab: 22, con: 17, ref: 27, ld: 13 },
  { pollster: "R&W", date: "Feb 2026", lab: 19, con: 18, ref: 29, ld: 12 },
];

const FALLBACK = { pollingData: POLLING_DATA, recentPolls: RECENT_POLLS };

export default function ElectionPolling() {
  const { data, isLive } = useMetrics("electionPolling", FALLBACK);
  const { pollingData, recentPolls } = data;
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  return (
    <div>
      {/* Main chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pollingData} layout="vertical" margin={{ left: 5, right: 30 }}>
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
            <Bar dataKey="pct" onMouseEnter={(_, i) => setSelectedParty(pollingData[i].party)} onMouseLeave={() => setSelectedParty(null)}>
              {pollingData.map((d) => (
                <Cell key={d.party} fill={selectedParty && selectedParty !== d.party ? "#e5e5e5" : d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Party cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
        {pollingData.slice(0, 5).map((d) => (
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
                <th className="p-2" style={{ color: "#E4003B" }}>LAB</th>
                <th className="p-2" style={{ color: "#0087DC" }}>CON</th>
                <th className="p-2" style={{ color: "#12B6CF" }}>REF</th>
                <th className="p-2" style={{ color: "#FAA61A" }}>LD</th>
              </tr>
            </thead>
            <tbody>
              {recentPolls.map((p, i) => (
                <tr key={i} className={i < recentPolls.length - 1 ? "border-b border-gray-200" : ""}>
                  <td className="p-2 font-bold">{p.pollster}</td>
                  <td className="p-2 text-gray-500">{p.date}</td>
                  <td className="p-2 text-center">{p.lab}%</td>
                  <td className="p-2 text-center">{p.con}%</td>
                  <td className="p-2 text-center">{p.ref}%</td>
                  <td className="p-2 text-center">{p.ld}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="font-mono text-[10px] text-gray-400 mt-3">
        DATA SOURCES: YouGov, Ipsos, Savanta, Redfield &amp; Wilton Strategies, More in Common, Deltapoll.
        Polling averages aggregated from publicly available data via PollCheck (pollcheck.co.uk),
        Wikipedia UK polling tracker, and Electoral Calculus. Changes shown vs 2024 General Election result (4 Jul 2024).
        Data verified: March 2026. Sources: pollcheck.co.uk/gb-polls · statista.com/statistics/985764
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
