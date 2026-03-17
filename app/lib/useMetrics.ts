"use client";

import { useEffect, useRef, useState } from "react";
import { CF_WORKER_URL, METRICS_API_PATH, REFRESH_INTERVAL_MS } from "./config";

export interface MetricsResult<T> {
  data: T;
  isLive: boolean;
  lastUpdated: Date | null;
  source: "api" | "worker" | "fallback";
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
  source: "api" | "worker";
}

const cache = new Map<string, CacheEntry>();

function shallowMerge<T>(fallback: T, apiData: unknown): T {
  if (
    fallback == null ||
    apiData == null ||
    typeof fallback !== "object" ||
    typeof apiData !== "object" ||
    Array.isArray(fallback) ||
    Array.isArray(apiData)
  ) {
    return (apiData ?? fallback) as T;
  }

  return { ...fallback, ...(apiData as Record<string, unknown>) } as T;
}

export function useMetrics<T>(section: string, fallback: T): MetricsResult<T> {
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

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
      timestamp: string | undefined
    ) => {
      const merged = shallowMerge(fallbackRef.current, raw);
      cache.set(section, { data: merged, timestamp: Date.now(), source });

      if (!active) {
        return;
      }

      setResult({
        data: merged,
        isLive: true,
        lastUpdated: new Date(timestamp ?? Date.now()),
        source,
      });
    };

    const fetchData = async () => {
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

      if (CF_WORKER_URL) {
        try {
          const response = await fetch(
            `${CF_WORKER_URL}/metrics?section=${encodeURIComponent(section)}`,
            { signal: AbortSignal.timeout(10_000) }
          );
          if (response.ok) {
            const payload = await response.json();
            if (payload.data !== null && payload.data !== undefined) {
              applyData(payload.data, "worker", payload.timestamp);
              return;
            }
          }
        } catch {
          // Continue to local API fallback.
        }
      }

      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      try {
        const response = await fetch(
          `${basePath}${METRICS_API_PATH}?section=${encodeURIComponent(section)}`,
          { signal: AbortSignal.timeout(10_000) }
        );
        if (response.ok) {
          const payload = await response.json();
          if (payload.data !== null && payload.data !== undefined) {
            applyData(payload.data, "api", payload.timestamp);
            return;
          }
        }
      } catch {
        // Fall through to embedded data.
      }

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
