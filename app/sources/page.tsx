import Link from "next/link";

const SOURCE_GROUPS = [
  {
    category: "Politics & Public Opinion",
    entries: [
      { name: "Electoral Commission", use: "Election turnout and constituency-level election results", cadence: "Updated after elections and by-elections" },
      { name: "YouGov / Ipsos / Savanta", use: "Voting intention and approval trend snapshots", cadence: "Daily to weekly, depending on poll release schedules" },
      { name: "PollCheck", use: "Aggregated polling signals for cross-source comparison", cadence: "Daily" },
      { name: "Betfair / Oddschecker / Smarkets", use: "Political betting market implied probabilities", cadence: "Near real-time" },
    ],
  },
  {
    category: "Economy & Labour",
    entries: [
      { name: "Office for National Statistics (ONS)", use: "GDP, CPI, labour market, migration and crime datasets", cadence: "Monthly / quarterly depending on series" },
      { name: "Bank of England", use: "Base rate and related policy series", cadence: "At MPC decision times" },
      { name: "HMRC", use: "Tax receipts and fiscal indicators", cadence: "Monthly" },
      { name: "Office for Budget Responsibility (OBR)", use: "Fiscal projections and context indicators", cadence: "Periodic forecast releases" },
    ],
  },
  {
    category: "Society & Public Services",
    entries: [
      { name: "NHS England / NHS Digital", use: "NHS waiting lists, A&E pressure and service demand", cadence: "Monthly" },
      { name: "Home Office", use: "Visa routes and migration-related operational series", cadence: "Monthly / quarterly" },
      { name: "NatCen (British Social Attitudes)", use: "Long-term social and trust sentiment benchmarking", cadence: "Annual" },
      { name: "IMF", use: "International economic context comparison metrics", cadence: "Quarterly / periodic" },
    ],
  },
] as const;

export default function SourcesPage() {
  return (
    <main className="min-h-screen bg-white text-black px-4 md:px-6 py-6 md:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="border-4 border-black p-5 md:p-8 bg-black text-white mb-6" style={{ boxShadow: "6px 6px 0 #FF3B00" }}>
          <p className="font-mono text-[10px] md:text-xs tracking-[0.25em] uppercase text-red-400 mb-3">Data Governance</p>
          <h1 className="font-display text-5xl md:text-7xl leading-none tracking-tight">DATA SOURCES & UPDATE CADENCE</h1>
          <p className="font-mono text-xs md:text-sm mt-4 text-gray-300 max-w-3xl">
            This page documents where each metric comes from and how often we expect it to refresh. Cadence windows can vary based on public release schedules.
          </p>
          <div className="mt-5">
            <Link href="/" className="inline-block border-2 border-white px-3 py-2 font-mono text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
              ← Back to dashboard
            </Link>
          </div>
        </div>

        <section className="border-4 border-black bg-white p-4 md:p-6">
          <div className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">Reference Matrix</div>

          <div className="space-y-6">
            {SOURCE_GROUPS.map((group) => (
              <article key={group.category} className="border-2 border-black">
                <h2 className="font-display text-3xl md:text-4xl leading-none px-4 py-3 border-b-2 border-black bg-gray-100">{group.category}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse">
                    <thead>
                      <tr className="font-mono text-[10px] md:text-xs uppercase tracking-wider text-left bg-black text-white">
                        <th className="px-4 py-3 border-r border-gray-700">Source</th>
                        <th className="px-4 py-3 border-r border-gray-700">How PULSE Uses It</th>
                        <th className="px-4 py-3">Expected Cadence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.entries.map((entry, index) => (
                        <tr key={entry.name} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-3 border-t border-black font-mono text-xs md:text-sm">{entry.name}</td>
                          <td className="px-4 py-3 border-t border-black font-mono text-xs md:text-sm">{entry.use}</td>
                          <td className="px-4 py-3 border-t border-black font-mono text-xs md:text-sm text-[#FF3B00]">{entry.cadence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

