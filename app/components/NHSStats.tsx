"use client";

import { useState } from "react";
import { useMetrics } from "@/app/lib/useMetrics";

// UK NHS & Health Statistics
// Sources: NHS England, ONS Health Statistics, NHS Digital
// NHS waiting list: 7.48M (Dec 2025) — NHS England Referral to Treatment (RTT) data
// A&E performance: 71.4% seen within 4 hours (Jan 2026) vs 95% target
// Life expectancy: 79.0 male, 82.9 female (ONS, 2022-2024 estimate)
// NHS workforce: 1.55M FTE (NHS Digital)
const HEADLINE = {
  waitingList: 7.48,
  waitingListChange: -2.1,
  aePerformance: 71.4,
  aeTarget: 95,
  gpWait: 14.8,
  lifeExpMale: 79.0,
  lifeExpFemale: 82.9,
  nhsWorkforce: 1.55,
};

const WAITING_TREND = [
  { date: "2019", list: 4.41 },
  { date: "2020", list: 4.95 },
  { date: "2021", list: 5.83 },
  { date: "2022", list: 7.21 },
  { date: "2023", list: 7.61 },
  { date: "2024", list: 7.54 },
  { date: "2025", list: 7.48 },
];

const WAITING_BY_SPECIALTY = [
  { specialty: "Orthopaedics", weeks: 24, patients: 821 },
  { specialty: "Ophthalmology", weeks: 18, patients: 654 },
  { specialty: "ENT", weeks: 20, patients: 512 },
  { specialty: "General Surgery", weeks: 19, patients: 498 },
  { specialty: "Dermatology", weeks: 16, patients: 423 },
  { specialty: "Cardiology", weeks: 15, patients: 312 },
  { specialty: "Gynaecology", weeks: 17, patients: 298 },
  { specialty: "Urology", weeks: 16, patients: 276 },
];

const LIFE_EXPECTANCY_TREND = [
  { year: "2010", male: 78.6, female: 82.6 },
  { year: "2012", male: 79.0, female: 82.8 },
  { year: "2014", male: 79.3, female: 83.0 },
  { year: "2016", male: 79.2, female: 82.9 },
  { year: "2018", male: 79.3, female: 83.0 },
  { year: "2020", male: 78.7, female: 82.7 },
  { year: "2022", male: 78.8, female: 82.8 },
  { year: "2024", male: 79.0, female: 82.9 },
];

const FALLBACK = { headline: HEADLINE, waitingTrend: WAITING_TREND, waitingBySpecialty: WAITING_BY_SPECIALTY, lifeExpectancyTrend: LIFE_EXPECTANCY_TREND };

export default function NHSStats() {
  const { data, isLive } = useMetrics("nhsStats", FALLBACK);
  const { headline, waitingTrend, waitingBySpecialty, lifeExpectancyTrend } = data;
  const [view, setView] = useState<"waiting" | "specialties" | "lifeexp">("waiting");

  return (
    <div>
      {/* Headline stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-4">
        {[
          { label: "WAITING LIST", value: `${headline.waitingList}M`, sub: `${headline.waitingListChange}% YoY`, accent: true },
          { label: "A&E 4HR TARGET", value: `${headline.aePerformance}%`, sub: `target: ${headline.aeTarget}%` },
          { label: "GP WAIT", value: `${headline.gpWait}`, sub: "avg days" },
          { label: "NHS STAFF", value: `${headline.nhsWorkforce}M`, sub: "FTE employees" },
        ].map((s, i) => (
          <div key={i} className={`border-2 border-black p-3 text-center ${i > 0 ? "border-l-0" : ""}`}>
            <p className="font-mono text-[10px] text-gray-500">{s.label}</p>
            <p className="font-mono text-lg font-bold" style={{ color: s.accent ? "#FF3B00" : "#000" }}>{s.value}</p>
            <p className="font-mono text-[10px] text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* A&E performance bar */}
      <div className="mb-4">
        <p className="font-mono text-xs text-gray-500 mb-2">A&amp;E 4-HOUR PERFORMANCE VS 95% TARGET</p>
        <div className="w-full h-6 bg-gray-100 border-2 border-black relative">
          <div className="h-full bg-[#FF3B00]" style={{ width: `${headline.aePerformance}%` }} />
          <div
            className="absolute top-0 h-full w-0.5 bg-black"
            style={{ left: `${headline.aeTarget}%` }}
          />
          <div
            className="absolute -top-5 font-mono text-[10px] font-bold"
            style={{ left: `${headline.aeTarget}%`, transform: "translateX(-50%)" }}
          >
            95% TARGET
          </div>
        </div>
        <p className="font-mono text-[10px] text-gray-500 mt-1">
          Only {headline.aePerformance}% of patients seen within 4 hours — {(headline.aeTarget - headline.aePerformance).toFixed(1)}pp below target
        </p>
      </div>

      {/* Toggle */}
      <div className="flex border-2 border-black mb-4">
        {([
          { key: "waiting" as const, label: "WAITING LIST" },
          { key: "specialties" as const, label: "BY SPECIALTY" },
          { key: "lifeexp" as const, label: "LIFE EXPECTANCY" },
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

      {view === "waiting" && (
        <div className="space-y-2">
          <p className="font-mono text-xs text-gray-500 mb-2">NHS ENGLAND WAITING LIST (MILLIONS)</p>
          {waitingTrend.map((d) => (
            <div key={d.date} className="flex items-center gap-3">
              <p className="font-mono text-xs w-10 text-right text-gray-500">{d.date}</p>
              <div className="flex-1 h-5 bg-gray-100 border border-black relative">
                <div
                  className="h-full"
                  style={{
                    width: `${(d.list / 8) * 100}%`,
                    background: d.list > 7 ? "#FF3B00" : "#000",
                  }}
                />
              </div>
              <p className="font-mono text-xs font-bold w-12 text-right">{d.list}M</p>
            </div>
          ))}
        </div>
      )}

      {view === "specialties" && (
        <div className="space-y-2">
          <p className="font-mono text-xs text-gray-500 mb-2">AVERAGE WAIT BY SPECIALTY (WEEKS)</p>
          {waitingBySpecialty.map((d) => (
            <div key={d.specialty} className="flex items-center gap-2">
              <p className="font-mono text-xs w-24 text-right">{d.specialty}</p>
              <div className="flex-1 h-5 bg-gray-100 border border-black relative">
                <div
                  className="h-full"
                  style={{ width: `${(d.weeks / 30) * 100}%`, background: d.weeks > 20 ? "#FF3B00" : "#000" }}
                />
              </div>
              <p className="font-mono text-xs font-bold w-10 text-right">{d.weeks}w</p>
              <p className="font-mono text-[10px] text-gray-500 w-12 text-right">{d.patients}K</p>
            </div>
          ))}
        </div>
      )}

      {view === "lifeexp" && (
        <div>
          <p className="font-mono text-xs text-gray-500 mb-3">UK LIFE EXPECTANCY AT BIRTH (YEARS)</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="border-2 border-black p-3 text-center">
              <p className="font-mono text-[10px] text-gray-500">MALE</p>
              <p className="font-display text-3xl">{headline.lifeExpMale}</p>
            </div>
            <div className="border-2 border-black p-3 text-center">
              <p className="font-mono text-[10px] text-gray-500">FEMALE</p>
              <p className="font-display text-3xl">{headline.lifeExpFemale}</p>
            </div>
          </div>
          <div className="space-y-2">
            {lifeExpectancyTrend.map((d) => (
              <div key={d.year} className="border-2 border-black p-2">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-mono text-xs font-bold">{d.year}</p>
                  <p className="font-mono text-xs">M: {d.male} · F: {d.female}</p>
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 h-3 bg-gray-100 border border-black">
                    <div className="h-full bg-black" style={{ width: `${((d.male - 76) / 8) * 100}%` }} />
                  </div>
                  <div className="flex-1 h-3 bg-gray-100 border border-black">
                    <div className="h-full bg-[#FF3B00]" style={{ width: `${((d.female - 80) / 5) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="font-mono text-[10px] text-gray-400 mt-4">
        DATA SOURCES: NHS England Referral to Treatment (RTT) waiting times. A&amp;E: NHS England monthly SitRep.
        Waiting list: 7.48M (Dec 2025). Life expectancy: ONS National Life Tables (2022-2024).
        GP waiting times: NHS Digital GP Patient Survey. NHS workforce: NHS Digital.
        Sources: england.nhs.uk/statistics · ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare
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
