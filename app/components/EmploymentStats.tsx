"use client";

import { useState } from "react";

// UK Employment Statistics — ONS Labour Market Overview
// Source: https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes
// Private vs Public sector: ONS Public and Private Sector Employment bulletin
// https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/publicsectorpersonnel
// Latest: Q3 2025 — Public sector: 5.94M, Private sector: 27.5M
// Employment rate: 74.9% (Oct-Dec 2025), Unemployment: 4.4% (revised)
// Economic inactivity: 21.6% (9.3M people)
const HEADLINE = {
  employmentRate: 74.9,
  totalEmployed: 33.1, // millions
  unemploymentRate: 4.4,
  totalUnemployed: 1.5, // millions
  inactivityRate: 21.6,
  totalInactive: 9.3, // millions
  vacancies: 819, // thousands
  vacancyChange: -7.2,
};

const PUBLIC_VS_PRIVATE = [
  { sector: "Private Sector", count: 27.5, pct: 82.3, change: -0.4, color: "#000" },
  { sector: "Public Sector", count: 5.94, pct: 17.7, change: +2.1, color: "#FF3B00" },
];

const PUBLIC_BREAKDOWN = [
  { category: "NHS", count: 1.55, pct: 26.1 },
  { category: "Education", count: 1.42, pct: 23.9 },
  { category: "Civil Service", count: 0.53, pct: 8.9 },
  { category: "Police", count: 0.21, pct: 3.5 },
  { category: "Armed Forces", count: 0.19, pct: 3.2 },
  { category: "Local Government", count: 1.18, pct: 19.9 },
  { category: "Other Public", count: 0.86, pct: 14.5 },
];

const EMPLOYMENT_TREND = [
  { date: "2019", rate: 76.4, public: 5.38, private: 27.1 },
  { date: "2020", rate: 74.8, public: 5.61, private: 25.9 },
  { date: "2021", rate: 75.1, public: 5.72, private: 26.4 },
  { date: "2022", rate: 75.6, public: 5.76, private: 27.3 },
  { date: "2023", rate: 75.5, public: 5.85, private: 27.4 },
  { date: "2024", rate: 75.0, public: 5.91, private: 27.5 },
  { date: "2025", rate: 74.9, public: 5.94, private: 27.5 },
];

export default function EmploymentStats() {
  const [view, setView] = useState<"overview" | "sectors" | "trend">("overview");

  return (
    <div>
      {/* Headline stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-4">
        {[
          { label: "EMPLOYMENT RATE", value: `${HEADLINE.employmentRate}%`, sub: `${HEADLINE.totalEmployed}M employed` },
          { label: "UNEMPLOYMENT", value: `${HEADLINE.unemploymentRate}%`, sub: `${HEADLINE.totalUnemployed}M people`, accent: true },
          { label: "INACTIVE", value: `${HEADLINE.inactivityRate}%`, sub: `${HEADLINE.totalInactive}M people` },
          { label: "VACANCIES", value: `${HEADLINE.vacancies}K`, sub: `${HEADLINE.vacancyChange}% YoY` },
        ].map((s, i) => (
          <div key={i} className={`border-2 border-black p-3 text-center ${i > 0 ? "border-l-0" : ""}`}>
            <p className="font-mono text-[10px] text-gray-500">{s.label}</p>
            <p className="font-mono text-lg font-bold" style={{ color: s.accent ? "#FF3B00" : "#000" }}>{s.value}</p>
            <p className="font-mono text-[10px] text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Private vs Public visual */}
      <div className="mb-4">
        <p className="font-mono text-xs text-gray-500 mb-2">PRIVATE VS PUBLIC SECTOR EMPLOYMENT</p>
        <div className="flex h-10 border-2 border-black overflow-hidden">
          <div
            className="h-full flex items-center justify-center font-mono text-xs text-white font-bold"
            style={{ width: `${PUBLIC_VS_PRIVATE[0].pct}%`, background: "#000" }}
          >
            PRIVATE {PUBLIC_VS_PRIVATE[0].count}M ({PUBLIC_VS_PRIVATE[0].pct}%)
          </div>
          <div
            className="h-full flex items-center justify-center font-mono text-xs text-white font-bold"
            style={{ width: `${PUBLIC_VS_PRIVATE[1].pct}%`, background: "#FF3B00" }}
          >
            PUBLIC {PUBLIC_VS_PRIVATE[1].count}M
          </div>
        </div>
        <div className="flex justify-between font-mono text-[10px] text-gray-500 mt-1">
          <span>Private: {PUBLIC_VS_PRIVATE[0].change > 0 ? "+" : ""}{PUBLIC_VS_PRIVATE[0].change}% YoY</span>
          <span>Public: {PUBLIC_VS_PRIVATE[1].change > 0 ? "+" : ""}{PUBLIC_VS_PRIVATE[1].change}% YoY</span>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex border-2 border-black mb-4">
        {([
          { key: "overview" as const, label: "SECTOR SPLIT" },
          { key: "sectors" as const, label: "PUBLIC BREAKDOWN" },
          { key: "trend" as const, label: "TREND" },
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

      {view === "overview" && (
        <div className="space-y-3">
          {PUBLIC_VS_PRIVATE.map((d) => (
            <div key={d.sector} className="border-2 border-black p-3">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-mono text-sm font-bold">{d.sector}</p>
                  <p className="font-mono text-[10px] text-gray-500">{d.count}M employees</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold" style={{ color: d.color }}>{d.pct}%</p>
                  <p className={`font-mono text-[10px] ${d.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {d.change > 0 ? "+" : ""}{d.change}% YoY
                  </p>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-100 border border-black">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${d.pct}%`, backgroundColor: d.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "sectors" && (
        <div className="space-y-2">
          <p className="font-mono text-xs text-gray-500 mb-2">PUBLIC SECTOR EMPLOYMENT BY CATEGORY (5.94M TOTAL)</p>
          {PUBLIC_BREAKDOWN.map((d) => (
            <div key={d.category} className="flex items-center gap-2">
              <p className="font-mono text-xs w-28 text-right">{d.category}</p>
              <div className="flex-1 h-5 bg-gray-100 border border-black relative">
                <div
                  className="h-full bg-[#FF3B00]"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <p className="font-mono text-xs font-bold w-12 text-right">{d.count}M</p>
              <p className="font-mono text-[10px] text-gray-500 w-10 text-right">{d.pct}%</p>
            </div>
          ))}
        </div>
      )}

      {view === "trend" && (
        <div className="space-y-2">
          <p className="font-mono text-xs text-gray-500 mb-2">EMPLOYMENT RATE & SECTOR SPLIT (2019–2025)</p>
          {EMPLOYMENT_TREND.map((d) => (
            <div key={d.date} className="border-2 border-black p-2">
              <div className="flex justify-between items-center mb-1">
                <p className="font-mono text-xs font-bold">{d.date}</p>
                <p className="font-mono text-xs">{d.rate}%</p>
              </div>
              <div className="flex h-4 border border-black overflow-hidden">
                <div className="h-full bg-black" style={{ width: `${(d.private / (d.private + d.public)) * 100}%` }} />
                <div className="h-full bg-[#FF3B00]" style={{ width: `${(d.public / (d.private + d.public)) * 100}%` }} />
              </div>
              <div className="flex justify-between font-mono text-[10px] text-gray-500 mt-1">
                <span>Private: {d.private}M</span>
                <span>Public: {d.public}M</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="font-mono text-[10px] text-gray-400 mt-4">
        DATA SOURCES: ONS Labour Market Overview (monthly bulletin). ONS Public and Private Sector Employment.
        Employment rate 74.9% (Oct-Dec 2025). Public sector: 5.94M, private: 27.5M (Q3 2025).
        Vacancy data from ONS VACS01. Economic inactivity: ONS Labour Force Survey.
        Sources: ons.gov.uk/employmentandlabourmarket · ons.gov.uk/employmentandlabourmarket/peopleinwork/publicsectorpersonnel
      </p>
    </div>
  );
}
