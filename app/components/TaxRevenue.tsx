"use client";

import { useState } from "react";
import { useMetrics } from "@/app/lib/useMetrics";

// UK Tax Revenue Data from HMRC and ONS
// Source: HMRC Tax Receipts monthly bulletin
// https://www.gov.uk/government/statistics/hmrc-tax-and-nics-receipts-for-the-united-kingdom
// Total tax receipts FY 2024/25: ~£843bn (HMRC estimate)
// Tax-to-GDP ratio: ~37% (ONS/OBR)
const TAX_CATEGORIES = [
  { name: "Income Tax", amount: 269, pct: 31.9, change: +4.2 },
  { name: "National Insurance", amount: 180, pct: 21.4, change: +3.1 },
  { name: "VAT", amount: 172, pct: 20.4, change: +2.8 },
  { name: "Corporation Tax", amount: 89, pct: 10.6, change: +21.5 },
  { name: "Council Tax", amount: 46, pct: 5.5, change: +5.0 },
  { name: "Fuel Duty", amount: 25, pct: 3.0, change: -1.2 },
  { name: "Stamp Duty", amount: 15, pct: 1.8, change: -8.3 },
  { name: "Other", amount: 47, pct: 5.4, change: +1.5 },
];

const TAX_BURDEN_HISTORY = [
  { year: "2010", pct: 32.3 },
  { year: "2012", pct: 32.9 },
  { year: "2014", pct: 32.4 },
  { year: "2016", pct: 33.2 },
  { year: "2018", pct: 33.5 },
  { year: "2020", pct: 33.0 },
  { year: "2022", pct: 35.3 },
  { year: "2024", pct: 37.0 },
  { year: "2025F", pct: 37.7 },
];

const TOTAL_RECEIPTS = 843;

const FALLBACK = { taxCategories: TAX_CATEGORIES, taxBurdenHistory: TAX_BURDEN_HISTORY, totalReceipts: TOTAL_RECEIPTS };

export default function TaxRevenue() {
  const { data, isLive } = useMetrics("taxRevenue", FALLBACK);
  const { taxCategories, taxBurdenHistory, totalReceipts } = data;

  const [view, setView] = useState<"breakdown" | "burden">("breakdown");

  return (
    <div>
      {/* Headline */}
      <div className="grid grid-cols-3 gap-0 mb-4">
        <div className="border-2 border-black p-3 text-center">
          <p className="font-mono text-[10px] text-gray-500">TOTAL RECEIPTS</p>
          <p className="font-mono text-xl font-bold">£{totalReceipts}B</p>
          <p className="font-mono text-[10px] text-gray-400">FY 2024/25</p>
        </div>
        <div className="border-2 border-black border-l-0 p-3 text-center">
          <p className="font-mono text-[10px] text-gray-500">TAX-TO-GDP</p>
          <p className="font-mono text-xl font-bold text-[#FF3B00]">37.0%</p>
          <p className="font-mono text-[10px] text-gray-400">Highest since 1948</p>
        </div>
        <div className="border-2 border-black border-l-0 p-3 text-center">
          <p className="font-mono text-[10px] text-gray-500">PER PERSON</p>
          <p className="font-mono text-xl font-bold">£12,400</p>
          <p className="font-mono text-[10px] text-gray-400">avg tax paid</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex border-2 border-black mb-4">
        {([
          { key: "breakdown" as const, label: "TAX BREAKDOWN" },
          { key: "burden" as const, label: "TAX BURDEN TREND" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2 font-mono text-xs font-bold transition-colors ${
              view === tab.key ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === "breakdown" && (
        <div className="space-y-2">
          {taxCategories.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <p className="font-mono text-xs w-28 text-right">{d.name}</p>
              <div className="flex-1 h-5 bg-gray-100 border border-black relative">
                <div
                  className="h-full"
                  style={{ width: `${d.pct}%`, background: d.pct > 20 ? "#FF3B00" : "#000" }}
                />
              </div>
              <p className="font-mono text-xs font-bold w-12 text-right">£{d.amount}B</p>
              <p className={`font-mono text-[10px] w-12 text-right ${d.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {d.change > 0 ? "+" : ""}{d.change}%
              </p>
            </div>
          ))}
          <p className="font-mono text-[10px] text-gray-500 mt-2">Change = year-on-year growth in receipts</p>
        </div>
      )}

      {view === "burden" && (
        <div>
          <p className="font-mono text-xs text-gray-500 mb-3">UK TAX BURDEN AS % OF GDP</p>
          <div className="space-y-2">
            {taxBurdenHistory.map((d) => (
              <div key={d.year} className="flex items-center gap-3">
                <p className="font-mono text-xs w-14 text-right text-gray-500">{d.year}</p>
                <div className="flex-1 h-5 bg-gray-100 border border-black relative">
                  <div
                    className="h-full"
                    style={{
                      width: `${((d.pct - 30) / 10) * 100}%`,
                      background: d.year.includes("F") ? "#FF3B00" : "#000",
                      opacity: d.year.includes("F") ? 0.6 : 1,
                    }}
                  />
                </div>
                <p className="font-mono text-xs font-bold w-12 text-right">{d.pct}%</p>
              </div>
            ))}
          </div>
          <div className="mt-3 border-2 border-black p-3 bg-gray-50">
            <p className="font-mono text-xs">
              <span className="font-bold">NOTE:</span> The UK tax burden at <span className="font-bold text-[#FF3B00]">37.0%</span> of GDP
              is the highest since records began in 1948. Projected to reach 37.7% by 2025/26 (OBR forecast).
            </p>
          </div>
        </div>
      )}

      <p className="font-mono text-[10px] text-gray-400 mt-4">
        DATA SOURCES: HMRC Tax Receipts and National Insurance Contributions monthly bulletin.
        OBR Economic and Fiscal Outlook. ONS Public Sector Finances.
        Total receipts FY 2024/25 estimated £843bn. Tax-to-GDP ratio: OBR, highest since 1948 records.
        Sources: gov.uk/government/statistics/hmrc-tax-and-nics-receipts · obr.uk
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
