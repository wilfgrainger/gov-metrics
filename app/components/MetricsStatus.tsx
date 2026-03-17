"use client";

import { DATA_SOURCES } from "@/app/lib/config";
import type { MetricsResult } from "@/app/lib/useMetrics";

interface MetricsStatusProps {
  section: string;
  status: Pick<MetricsResult<unknown>, "isLive" | "lastUpdated" | "source" | "cacheState">;
}

function formatImportDate(value: Date | null) {
  if (!value) {
    return "Not available";
  }

  const formatted = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(value);

  return `${formatted} UTC`;
}

export default function MetricsStatus({ section, status }: MetricsStatusProps) {
  const meta = DATA_SOURCES[section];

  if (!meta) {
    return null;
  }

  const importState =
    meta.automation === "interactive"
      ? "NO IMPORT"
      : meta.automation === "static"
        ? "EMBEDDED SNAPSHOT"
        : !status.isLive
          ? "FALLBACK"
          : status.cacheState === "stale"
            ? "STALE CACHE"
            : "LIVE";

  const importStateTone =
    meta.automation !== "automated" || !status.isLive
      ? "bg-neutral-200 text-neutral-800"
      : status.cacheState === "stale"
        ? "bg-amber-100 text-amber-900"
        : "bg-green-100 text-green-900";

  const automationTone =
    meta.automation === "automated"
      ? "bg-black text-white"
      : meta.automation === "interactive"
        ? "border border-blue-900 bg-blue-100 text-blue-900"
        : "border border-black bg-white text-black";

  const automationLabel =
    meta.automation === "automated"
      ? "AUTOMATED"
      : meta.automation === "interactive"
        ? "INTERACTIVE"
        : "STATIC";

  const lastImportLabel =
    meta.automation === "automated" && status.lastUpdated
      ? formatImportDate(status.lastUpdated)
      : meta.automation === "interactive"
        ? "Not applicable"
        : meta.automation === "automated"
          ? "Not available"
          : "Not configured";

  const sourceLabel =
    meta.automation === "interactive"
      ? "Client-side only"
      : status.source === "worker"
        ? "Cloudflare Worker"
        : status.source === "api"
          ? "Local API"
          : "Embedded fallback";

  return (
    <div className="mt-3 border-2 border-black bg-gray-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`px-2 py-1 font-mono text-[10px] tracking-widest ${automationTone}`}>{automationLabel}</span>
        <span className={`px-2 py-1 font-mono text-[10px] tracking-widest ${importStateTone}`}>{importState}</span>
      </div>
      <div className="mt-2 space-y-1 font-mono text-[10px] text-gray-600">
        <p>Last import: {lastImportLabel}</p>
        <p>Cadence: {meta.frequency}</p>
        <p>Delivery: {sourceLabel}</p>
        <p>Sources: {meta.sources.join(" / ")}</p>
      </div>
    </div>
  );
}
