"use client";

import { useState, useEffect, useRef } from "react";
import {
  METRICS_API_PATH,
  CF_WORKER_URL,
  REFRESH_INTERVAL_MS,
} from "./config";

export interface MetricsResult<T> {
  data: T;
  isLive: boolean;
  lastUpdated: Date | null;
  source: "api" | "worker" | "fallback";
}

// ── In-memory cache shared across all hook instances ─────────────────────────

interface CacheEntry {
  data: unknown;
  timestamp: number;
  source: "api" | "worker";
}

const cache = new Map<string, CacheEntry>();

// ── Shallow merge: API data fills in over fallback ───────────────────────────
// Keys present in apiData override fallback; keys only in fallback are kept.
// This prevents crashes when the API returns a subset of the expected shape.

function shallowMerge<T>(fallback: T, apiData: unknown): T {
  if (
    fallback == null ||
    apiData == null ||
    typeof fallback !== "object" ||
    typeof apiData !== "object" ||
    Array.isArray(fallback) ||
    Array.isArray(apiData)
  ) {
    // For primitives or arrays, prefer apiData if truthy
    return (apiData ?? fallback) as T;
  }
  return { ...fallback, ...(apiData as Record<string, unknown>) } as T;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useMetrics<T>(section: string, fallback: T): MetricsResult<T> {
  const fallbackRef = useRef(fallback);

  const [result, setResult] = useState<MetricsResult<T>>({
    data: fallback,
    isLive: false,
    lastUpdated: null,
    source: "fallback",
  });

  useEffect(() => {
    let active = true;

    const applyData = (
      raw: unknown,
      source: "api" | "worker",
      timestamp: string | undefined,
    ) => {
      const merged = shallowMerge(fallbackRef.current, raw);
      cache.set(section, { data: merged, timestamp: Date.now(), source });
      if (active) {
        setResult({
          data: merged,
          isLive: true,
          lastUpdated: new Date(timestamp ?? Date.now()),
          source,
        });
      }
    };

    const fetchData = async () => {
      // ── Check in-memory cache ──────────────────────────────────────────
      const cached = cache.get(section);
      if (cached && Date.now() - cached.timestamp < REFRESH_INTERVAL_MS) {
        if (active) {
          setResult({
            data: cached.data as T,
            isLive: true,
            lastUpdated: new Date(cached.timestamp),
            source: cached.source,
          });
        }
        return;
      }

      // ── Strategy 1: Next.js API route (server-side fetch) ──────────────
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      try {
        const res = await fetch(
          `${basePath}${METRICS_API_PATH}?section=${encodeURIComponent(section)}`,
          { signal: AbortSignal.timeout(10_000) }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            applyData(json.data, "api", json.timestamp);
            return;
          }
        }
      } catch {
        // Strategy 1 unavailable — continue to fallback
      }

      // ── Strategy 2: Cloudflare Worker ──────────────────────────────────
      if (CF_WORKER_URL) {
        try {
          const res = await fetch(
            `${CF_WORKER_URL}/metrics?section=${encodeURIComponent(section)}`,
            { signal: AbortSignal.timeout(10_000) }
          );
          if (res.ok) {
            const json = await res.json();
            if (json.data) {
              applyData(json.data, "worker", json.timestamp);
              return;
            }
          }
        } catch {
          // Strategy 2 unavailable — use embedded data
        }
      }

      // ── Fallback: embedded data ────────────────────────────────────────
      if (active) {
        setResult({
          data: fallbackRef.current,
          isLive: false,
          lastUpdated: null,
          source: "fallback",
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [section]);

  return result;
}
