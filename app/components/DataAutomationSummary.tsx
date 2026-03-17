"use client";

import { useEffect, useState } from "react";
import { CF_WORKER_URL, DATA_SOURCES } from "@/app/lib/config";
import type { DataAutomation } from "@/app/lib/config";

interface WorkerSourceStatus {
  status?: string;
  fetchedAt?: string;
  cacheState?: string;
}

interface WorkerSnapshot {
  meta?: {
    generatedAt?: string;
    sources?: Record<string, WorkerSourceStatus>;
  };
}

function createTimeoutController(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => globalThis.clearTimeout(timeoutId),
  };
}

function formatTimestamp(value?: string) {
  if (!value) {
    return "Not available";
  }

  return `${new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value))} UTC`;
}

function getAutomationTone(automation: DataAutomation) {
  if (automation === "automated") {
    return "bg-black text-white";
  }

  if (automation === "interactive") {
    return "border border-blue-900 bg-blue-100 text-blue-900";
  }

  return "border border-black bg-white text-black";
}

function getSectionStatus(
  automation: DataAutomation,
  sourceStatus?: WorkerSourceStatus
) {
  if (automation === "interactive") {
    return { label: "CLIENT ONLY", tone: "bg-blue-100 text-blue-900" };
  }

  if (automation === "static") {
    return { label: "EMBEDDED SNAPSHOT", tone: "bg-neutral-200 text-neutral-800" };
  }

  if (!CF_WORKER_URL) {
    return { label: "WORKER NOT CONFIGURED", tone: "bg-red-100 text-red-900" };
  }

  if (!sourceStatus) {
    return { label: "AWAITING SNAPSHOT", tone: "bg-amber-100 text-amber-900" };
  }

  if (sourceStatus.status !== "ok") {
    return { label: (sourceStatus.status ?? "ERROR").toUpperCase(), tone: "bg-red-100 text-red-900" };
  }

  if (sourceStatus.cacheState === "stale") {
    return { label: "STALE CACHE", tone: "bg-amber-100 text-amber-900" };
  }

  return { label: "LIVE", tone: "bg-green-100 text-green-900" };
}

export default function DataAutomationSummary() {
  const [snapshot, setSnapshot] = useState<WorkerSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!CF_WORKER_URL) {
      return;
    }

    let cancelled = false;

    async function loadSnapshot() {
      const timeout = createTimeoutController(10_000);
      try {
        const response = await fetch(`${CF_WORKER_URL}/all`, {
          signal: timeout.signal,
        });

        if (!response.ok) {
          throw new Error(`Worker returned ${response.status}`);
        }

        const payload = (await response.json()) as WorkerSnapshot;
        if (!cancelled) {
          setSnapshot(payload);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load worker snapshot");
        }
      } finally {
        timeout.cleanup();
      }
    }

    loadSnapshot();

    return () => {
      cancelled = true;
    };
  }, []);

  const entries = Object.entries(DATA_SOURCES).sort(([, left], [, right]) => left.name.localeCompare(right.name));
  const automatedCount = entries.filter(([, meta]) => meta.automation === "automated").length;
  const staticCount = entries.filter(([, meta]) => meta.automation === "static").length;
  const interactiveCount = entries.filter(([, meta]) => meta.automation === "interactive").length;
  const generatedAt = snapshot?.meta?.generatedAt;
  const workerSources = snapshot?.meta?.sources ?? {};

  return (
    <section className="mb-6 border-4 border-black bg-white p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Automation Audit</div>
          <h2 className="font-display text-3xl leading-none md:text-4xl">SECTION STATUS</h2>
          <p className="mt-2 max-w-3xl font-mono text-xs text-gray-600">
            Not every page is live-fed. Only the automated sections are imported by the Cloudflare Worker. Static sections ship with embedded fallback data, and the political compass is client-side only.
          </p>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
          Worker snapshot: {generatedAt ? formatTimestamp(generatedAt) : error ? `Unavailable (${error})` : "Loading"}
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <div className="border-2 border-black bg-black p-3 text-white">
          <div className="font-mono text-[10px] uppercase tracking-widest text-gray-300">Automated</div>
          <div className="font-display text-4xl leading-none">{automatedCount}</div>
        </div>
        <div className="border-2 border-black bg-white p-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-gray-500">Static</div>
          <div className="font-display text-4xl leading-none">{staticCount}</div>
        </div>
        <div className="border-2 border-black bg-white p-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-gray-500">Interactive</div>
          <div className="font-display text-4xl leading-none">{interactiveCount}</div>
        </div>
        <div className="border-2 border-black bg-[#FF3B00] p-3 text-white">
          <div className="font-mono text-[10px] uppercase tracking-widest text-orange-100">Last full import</div>
          <div className="font-mono text-xs leading-snug">{generatedAt ? formatTimestamp(generatedAt) : "Not available"}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="bg-black text-left font-mono text-[10px] uppercase tracking-wider text-white">
              <th className="border-r border-gray-700 px-4 py-3">Section</th>
              <th className="border-r border-gray-700 px-4 py-3">Mode</th>
              <th className="border-r border-gray-700 px-4 py-3">Cadence</th>
              <th className="border-r border-gray-700 px-4 py-3">Status</th>
              <th className="border-r border-gray-700 px-4 py-3">Last import</th>
              <th className="px-4 py-3">Sources</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([section, meta], index) => {
              const sourceStatus = workerSources[section];
              const sectionStatus = getSectionStatus(meta.automation, sourceStatus);
              const lastImport =
                meta.automation === "automated"
                  ? formatTimestamp(sourceStatus?.fetchedAt)
                  : meta.automation === "interactive"
                    ? "Not applicable"
                    : "Not automated";

              return (
                <tr key={section} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border-t border-black px-4 py-3">
                    <div className="font-display text-xl leading-none">{meta.name}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-gray-500">{section}</div>
                  </td>
                  <td className="border-t border-black px-4 py-3">
                    <span className={`inline-block px-2 py-1 font-mono text-[10px] tracking-widest ${getAutomationTone(meta.automation)}`}>
                      {meta.automation.toUpperCase()}
                    </span>
                  </td>
                  <td className="border-t border-black px-4 py-3 font-mono text-xs">{meta.frequency}</td>
                  <td className="border-t border-black px-4 py-3">
                    <span className={`inline-block px-2 py-1 font-mono text-[10px] tracking-widest ${sectionStatus.tone}`}>
                      {sectionStatus.label}
                    </span>
                  </td>
                  <td className="border-t border-black px-4 py-3 font-mono text-xs">{lastImport}</td>
                  <td className="border-t border-black px-4 py-3 font-mono text-xs text-gray-600">{meta.sources.join(" / ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
