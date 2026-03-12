"use client";
import { useState, useEffect } from "react";

// UK national debt data from ONS Public Sector Finances
// Source: https://www.ons.gov.uk/economy/governmentpublicsectorandtaxes/publicsectorfinance
// As of Q4 2025: ~£2.816 trillion (approx 100.2% of GDP)
// Annual deficit ~£120 billion → ~£3,805 per second
const BASE_DEBT = 2_816_000_000_000; // £2.816 trillion
const BASE_DATE = new Date("2025-12-31T00:00:00Z").getTime();
const DEBT_PER_SECOND = 3_805; // ~£120bn per year / 365.25 / 24 / 3600
const UK_POPULATION = 67_960_000; // ONS mid-2024 estimate
const UK_GDP = 2_810_000_000_000; // ~£2.81 trillion (2024/25 estimate)

export default function NationalDebtCounter() {
  const [debt, setDebt] = useState(BASE_DEBT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    const update = () => {
      const elapsed = (Date.now() - BASE_DATE) / 1000;
      if (active) setDebt(BASE_DEBT + elapsed * DEBT_PER_SECOND);
    };
    update();
    const interval = setInterval(update, 50);
    if (!mounted) {
      // Use a microtask to avoid synchronous setState in effect body
      Promise.resolve().then(() => { if (active) setMounted(true); });
    }
    return () => { active = false; clearInterval(interval); };
  }, [mounted]);

  const debtPerCapita = debt / UK_POPULATION;
  const debtToGDP = ((debt / UK_GDP) * 100).toFixed(1);

  const formatDebt = (n: number) => {
    if (!mounted) return "£0";
    const str = Math.floor(n).toLocaleString("en-GB");
    return `£${str}`;
  };

  const trillions = (debt / 1_000_000_000_000).toFixed(3);

  return (
    <div>
      {/* Main counter */}
      <div className="bg-black text-white p-6 border-4 border-black">
        <p className="font-mono text-xs tracking-widest text-gray-400 mb-2">UK PUBLIC SECTOR NET DEBT</p>
        <div className="font-mono text-3xl md:text-5xl font-bold tabular-nums tracking-tight text-[#FF3B00]" suppressHydrationWarning>
          {mounted ? formatDebt(debt) : "—"}
        </div>
        <p className="font-mono text-lg text-gray-300 mt-1" suppressHydrationWarning>
          {mounted ? `£${trillions} TRILLION` : "—"}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-0 mt-4">
        <div className="border-2 border-black p-3 text-center">
          <p className="font-mono text-[10px] text-gray-500">DEBT PER PERSON</p>
          <p className="font-mono text-lg font-bold" suppressHydrationWarning>
            {mounted ? `£${Math.floor(debtPerCapita).toLocaleString("en-GB")}` : "—"}
          </p>
        </div>
        <div className="border-2 border-black border-l-0 p-3 text-center">
          <p className="font-mono text-[10px] text-gray-500">DEBT-TO-GDP</p>
          <p className="font-mono text-lg font-bold" suppressHydrationWarning>
            {mounted ? `${debtToGDP}%` : "—"}
          </p>
        </div>
        <div className="border-2 border-black border-l-0 p-3 text-center">
          <p className="font-mono text-[10px] text-gray-500">GROWTH / SEC</p>
          <p className="font-mono text-lg font-bold text-[#FF3B00]">
            +£{DEBT_PER_SECOND.toLocaleString("en-GB")}
          </p>
        </div>
      </div>

      {/* Historical context */}
      <div className="mt-4 border-2 border-black p-3">
        <p className="font-mono text-xs font-bold mb-2">HISTORICAL MILESTONES</p>
        <div className="space-y-1">
          {[
            { year: "2008", amount: "£0.53T", event: "Financial Crisis" },
            { year: "2015", amount: "£1.60T", event: "Austerity Era" },
            { year: "2020", amount: "£2.02T", event: "COVID-19 Pandemic" },
            { year: "2024", amount: "£2.70T", event: "Post-COVID Recovery" },
          ].map((m) => (
            <div key={m.year} className="flex justify-between font-mono text-xs">
              <span className="text-gray-500">{m.year}</span>
              <span className="font-bold">{m.amount}</span>
              <span className="text-gray-500">{m.event}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[10px] text-gray-400 mt-3">
        DATA SOURCE: ONS Public Sector Finances, UK Debt Management Office.
        Base figure: Q4 2025. Growth rate calculated from annual net borrowing forecast.
        Population: ONS mid-2024 estimate (67.96m).
      </p>
    </div>
  );
}
