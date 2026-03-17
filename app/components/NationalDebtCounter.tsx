"use client";

import { useState, useEffect } from "react";
import { useMetrics } from "@/app/lib/useMetrics";
import MetricsStatus from "@/app/components/MetricsStatus";

const BASE_DEBT = 2_814_000_000_000;
const BASE_DATE = new Date("2025-03-31T00:00:00Z").getTime();
const DEBT_PER_SECOND = 4_820;
const UK_POPULATION = 67_960_000;
const UK_GDP = 2_950_000_000_000;

const HISTORICAL_MILESTONES = [
  { year: "2008", amount: "GBP0.53T", event: "Financial Crisis" },
  { year: "2015", amount: "GBP1.60T", event: "Austerity Era" },
  { year: "2020", amount: "GBP2.02T", event: "COVID-19 Pandemic" },
  { year: "2024", amount: "GBP2.70T", event: "Post-COVID Recovery" },
];

const FALLBACK = {
  baseDebt: BASE_DEBT,
  baseDate: BASE_DATE,
  debtPerSecond: DEBT_PER_SECOND,
  population: UK_POPULATION,
  gdp: UK_GDP,
  milestones: HISTORICAL_MILESTONES,
};

export default function NationalDebtCounter() {
  const metrics = useMetrics("nationalDebt", FALLBACK);
  const { data } = metrics;
  const { baseDebt, baseDate, debtPerSecond, population, gdp, milestones } = data;

  const [debt, setDebt] = useState(baseDebt);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;

    const update = () => {
      const elapsed = (Date.now() - baseDate) / 1000;
      if (active) {
        setDebt(baseDebt + elapsed * debtPerSecond);
      }
    };

    update();
    const interval = setInterval(update, 50);

    if (!mounted) {
      Promise.resolve().then(() => {
        if (active) {
          setMounted(true);
        }
      });
    }

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [mounted, baseDebt, baseDate, debtPerSecond]);

  const debtPerCapita = debt / population;
  const debtToGdp = ((debt / gdp) * 100).toFixed(1);

  const formatDebt = (value: number) => {
    if (!mounted) {
      return "GBP0";
    }

    return `GBP${Math.floor(value).toLocaleString("en-GB")}`;
  };

  const trillions = (debt / 1_000_000_000_000).toFixed(3);

  return (
    <div>
      <div className="border-4 border-black bg-black p-6 text-white">
        <p className="mb-2 font-mono text-xs tracking-widest text-gray-400">
          UK PUBLIC SECTOR NET DEBT
        </p>
        <div
          className="font-mono text-3xl font-bold tracking-tight text-[#FF3B00] md:text-5xl"
          suppressHydrationWarning
        >
          {mounted ? formatDebt(debt) : "--"}
        </div>
        <p className="mt-1 font-mono text-lg text-gray-300" suppressHydrationWarning>
          {mounted ? `GBP${trillions} TRILLION` : "--"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-0">
        <div className="border-2 border-black p-3 text-center">
          <p className="font-mono text-[10px] text-gray-500">DEBT PER PERSON</p>
          <p className="font-mono text-lg font-bold" suppressHydrationWarning>
            {mounted
              ? `GBP${Math.floor(debtPerCapita).toLocaleString("en-GB")}`
              : "--"}
          </p>
        </div>
        <div className="border-2 border-black border-l-0 p-3 text-center">
          <p className="font-mono text-[10px] text-gray-500">DEBT-TO-GDP</p>
          <p className="font-mono text-lg font-bold" suppressHydrationWarning>
            {mounted ? `${debtToGdp}%` : "--"}
          </p>
        </div>
        <div className="border-2 border-black border-l-0 p-3 text-center">
          <p className="font-mono text-[10px] text-gray-500">GROWTH / SEC</p>
          <p className="font-mono text-lg font-bold text-[#FF3B00]">
            +GBP{debtPerSecond.toLocaleString("en-GB")}
          </p>
        </div>
      </div>

      <div className="mt-4 border-2 border-black p-3">
        <p className="mb-2 font-mono text-xs font-bold">HISTORICAL MILESTONES</p>
        <div className="space-y-1">
          {milestones.map((milestone) => (
            <div
              key={milestone.year}
              className="flex justify-between font-mono text-xs"
            >
              <span className="text-gray-500">{milestone.year}</span>
              <span className="font-bold">{milestone.amount}</span>
              <span className="text-gray-500">{milestone.event}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] text-gray-400">
        DATA SOURCE: ONS Public Sector Finances (December 2025 bulletin) and
        the UK Debt Management Office. Base figure: GBP2.814T at end of March
        2025. Growth rate: GBP152bn FY2024/25 net borrowing. Debt-to-GDP:
        about 95.5%.
      </p>
      <MetricsStatus section="nationalDebt" status={metrics} />
    </div>
  );
}
