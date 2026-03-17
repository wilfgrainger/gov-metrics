import Link from "next/link";
import DataAutomationSummary from "@/app/components/DataAutomationSummary";

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
    <main className="min-h-screen bg-white px-4 py-6 text-black md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 border-4 border-black bg-black p-5 text-white md:p-8" style={{ boxShadow: "6px 6px 0 #FF3B00" }}>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-red-400 md:text-xs">Data Governance</p>
          <h1 className="font-display text-5xl leading-none tracking-tight md:text-7xl">DATA SOURCES & UPDATE CADENCE</h1>
          <p className="mt-4 max-w-3xl font-mono text-xs text-gray-300 md:text-sm">
            This page documents where each metric comes from, whether it is automated, and when the worker last imported live data. Cadence windows can still vary with public release schedules.
          </p>
          <div className="mt-5">
            <Link href="/" className="inline-block border-2 border-white px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-white hover:text-black">
              {"<-"} Back to dashboard
            </Link>
          </div>
        </div>

        <DataAutomationSummary />

        <section className="border-4 border-black bg-white p-4 md:p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 md:text-xs">Reference Matrix</div>

          <div className="space-y-6">
            {SOURCE_GROUPS.map((group) => (
              <article key={group.category} className="border-2 border-black">
                <h2 className="border-b-2 border-black bg-gray-100 px-4 py-3 font-display text-3xl leading-none md:text-4xl">{group.category}</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-[680px] w-full border-collapse">
                    <thead>
                      <tr className="bg-black text-left font-mono text-[10px] uppercase tracking-wider text-white md:text-xs">
                        <th className="border-r border-gray-700 px-4 py-3">Source</th>
                        <th className="border-r border-gray-700 px-4 py-3">How PULSE Uses It</th>
                        <th className="px-4 py-3">Expected Cadence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.entries.map((entry, index) => (
                        <tr key={entry.name} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border-t border-black px-4 py-3 font-mono text-xs md:text-sm">{entry.name}</td>
                          <td className="border-t border-black px-4 py-3 font-mono text-xs md:text-sm">{entry.use}</td>
                          <td className="border-t border-black px-4 py-3 font-mono text-xs text-[#FF3B00] md:text-sm">{entry.cadence}</td>
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
