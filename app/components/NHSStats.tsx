"use client";

import { useState } from "react";
import { useMetrics } from "@/app/lib/useMetrics";
import MetricsStatus from "@/app/components/MetricsStatus";

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

const FALLBACK = {
  headline: HEADLINE,
  waitingTrend: WAITING_TREND,
  waitingBySpecialty: WAITING_BY_SPECIALTY,
  lifeExpectancyTrend: LIFE_EXPECTANCY_TREND,
};

export default function NHSStats() {
  const metrics = useMetrics("nhsStats", FALLBACK);
  const { data } = metrics;
  const { headline, waitingTrend, waitingBySpecialty, lifeExpectancyTrend } =
    data;
  const [view, setView] = useState<"waiting" | "specialties" | "lifeexp">(
    "waiting"
  );

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-0 md:grid-cols-4">
        {[
          {
            label: "WAITING LIST",
            value: `${headline.waitingList}M`,
            sub: `${headline.waitingListChange}% YoY`,
            accent: true,
          },
          {
            label: "A&E 4HR TARGET",
            value: `${headline.aePerformance}%`,
            sub: `target: ${headline.aeTarget}%`,
          },
          { label: "GP WAIT", value: `${headline.gpWait}`, sub: "avg days" },
          {
            label: "NHS STAFF",
            value: `${headline.nhsWorkforce}M`,
            sub: "FTE employees",
          },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`border-2 border-black p-3 text-center ${
              index > 0 ? "border-l-0" : ""
            }`}
          >
            <p className="font-mono text-[10px] text-gray-500">{stat.label}</p>
            <p
              className="font-mono text-lg font-bold"
              style={{ color: stat.accent ? "#FF3B00" : "#000" }}
            >
              {stat.value}
            </p>
            <p className="font-mono text-[10px] text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <p className="mb-2 font-mono text-xs text-gray-500">
          A&E 4-HOUR PERFORMANCE VS 95% TARGET
        </p>
        <div className="relative h-6 w-full border-2 border-black bg-gray-100">
          <div
            className="h-full bg-[#FF3B00]"
            style={{ width: `${headline.aePerformance}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-black"
            style={{ left: `${headline.aeTarget}%` }}
          />
          <div
            className="absolute -top-5 font-mono text-[10px] font-bold"
            style={{
              left: `${headline.aeTarget}%`,
              transform: "translateX(-50%)",
            }}
          >
            95% TARGET
          </div>
        </div>
        <p className="mt-1 font-mono text-[10px] text-gray-500">
          Only {headline.aePerformance}% of patients seen within 4 hours -{" "}
          {(headline.aeTarget - headline.aePerformance).toFixed(1)}pp below
          target
        </p>
      </div>

      <div className="mb-4 flex border-2 border-black">
        {[
          { key: "waiting" as const, label: "WAITING LIST" },
          { key: "specialties" as const, label: "BY SPECIALTY" },
          { key: "lifeexp" as const, label: "LIFE EXPECTANCY" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2 font-mono text-xs font-bold transition-colors ${
              view === tab.key
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === "waiting" && (
        <div className="space-y-2">
          <p className="mb-2 font-mono text-xs text-gray-500">
            NHS ENGLAND WAITING LIST (MILLIONS)
          </p>
          {waitingTrend.map((entry) => (
            <div key={entry.date} className="flex items-center gap-3">
              <p className="w-10 text-right font-mono text-xs text-gray-500">
                {entry.date}
              </p>
              <div className="relative h-5 flex-1 border border-black bg-gray-100">
                <div
                  className="h-full"
                  style={{
                    width: `${(entry.list / 8) * 100}%`,
                    background: entry.list > 7 ? "#FF3B00" : "#000",
                  }}
                />
              </div>
              <p className="w-12 text-right font-mono text-xs font-bold">
                {entry.list}M
              </p>
            </div>
          ))}
        </div>
      )}

      {view === "specialties" && (
        <div className="space-y-2">
          <p className="mb-2 font-mono text-xs text-gray-500">
            AVERAGE WAIT BY SPECIALTY (WEEKS)
          </p>
          {waitingBySpecialty.map((entry) => (
            <div key={entry.specialty} className="flex items-center gap-2">
              <p className="w-24 text-right font-mono text-xs">
                {entry.specialty}
              </p>
              <div className="relative h-5 flex-1 border border-black bg-gray-100">
                <div
                  className="h-full"
                  style={{
                    width: `${(entry.weeks / 30) * 100}%`,
                    background: entry.weeks > 20 ? "#FF3B00" : "#000",
                  }}
                />
              </div>
              <p className="w-10 text-right font-mono text-xs font-bold">
                {entry.weeks}w
              </p>
              <p className="w-12 text-right font-mono text-[10px] text-gray-500">
                {entry.patients}K
              </p>
            </div>
          ))}
        </div>
      )}

      {view === "lifeexp" && (
        <div>
          <p className="mb-3 font-mono text-xs text-gray-500">
            UK LIFE EXPECTANCY AT BIRTH (YEARS)
          </p>
          <div className="mb-4 grid grid-cols-2 gap-3">
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
            {lifeExpectancyTrend.map((entry) => (
              <div key={entry.year} className="border-2 border-black p-2">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-mono text-xs font-bold">{entry.year}</p>
                  <p className="font-mono text-xs">
                    M: {entry.male} / F: {entry.female}
                  </p>
                </div>
                <div className="flex gap-1">
                  <div className="h-3 flex-1 border border-black bg-gray-100">
                    <div
                      className="h-full bg-black"
                      style={{ width: `${((entry.male - 76) / 8) * 100}%` }}
                    />
                  </div>
                  <div className="h-3 flex-1 border border-black bg-gray-100">
                    <div
                      className="h-full bg-[#FF3B00]"
                      style={{ width: `${((entry.female - 80) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 font-mono text-[10px] text-gray-400">
        DATA SOURCES: NHS England Referral to Treatment waiting times, NHS
        England monthly SitRep, ONS national life tables, NHS Digital GP
        Patient Survey, and NHS Digital workforce statistics.
      </p>
      <MetricsStatus section="nhsStats" status={metrics} />
    </div>
  );
}
