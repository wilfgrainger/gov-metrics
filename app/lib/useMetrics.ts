"use client";

import { useEffect, useRef, useState } from "react";
import {
  CF_WORKER_URL,
  DATA_SOURCES,
  METRICS_API_PATH,
  REFRESH_INTERVAL_MS,
} from "./config";

export type MetricsCacheState = "fresh" | "stale" | "expired" | "missing" | null;

export interface MetricsResult<T> {
  data: T;
  isLive: boolean;
  lastUpdated: Date | null;
  source: "api" | "worker" | "fallback";
  cacheState: MetricsCacheState;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
  source: "api" | "worker";
  lastUpdated: string | null;
  cacheState: MetricsCacheState;
}

const cache = new Map<string, CacheEntry>();

function createTimeoutController(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => globalThis.clearTimeout(timeoutId),
  };
}

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
  const sourceMeta = DATA_SOURCES[section];
  const shouldUseLocalApi =
    sourceMeta?.automation === "automated" &&
    process.env.NODE_ENV !== "production";
  const shouldFetchLive =
    sourceMeta?.automation === "automated" &&
    (Boolean(CF_WORKER_URL) || shouldUseLocalApi);

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  const [result, setResult] = useState<MetricsResult<T>>({
    data: fallback,
    isLive: false,
    lastUpdated: null,
    source: "fallback",
    cacheState: null,
  });

  useEffect(() => {
    let active = true;

    const applyData = (
      raw: unknown,
      source: "api" | "worker",
      timestamp: string | undefined,
      cacheState: MetricsCacheState
    ) => {
      const merged = shallowMerge(fallbackRef.current, raw);
      cache.set(section, {
        data: merged,
        timestamp: Date.now(),
        source,
        lastUpdated: timestamp ?? null,
        cacheState,
      });

      if (!active) {
        return;
      }

      setResult({
        data: merged,
        isLive: true,
        lastUpdated: new Date(timestamp ?? Date.now()),
        source,
        cacheState,
      });
    };

    const fetchData = async () => {
      if (!shouldFetchLive) {
        if (active) {
          setResult({
            data: fallbackRef.current,
            isLive: false,
            lastUpdated: null,
            source: "fallback",
            cacheState: null,
          });
        }
        return;
      }

      const cached = cache.get(section);
      if (cached && Date.now() - cached.timestamp < REFRESH_INTERVAL_MS) {
        if (active) {
          setResult({
            data: cached.data as T,
            isLive: true,
            lastUpdated: new Date(cached.lastUpdated ?? cached.timestamp),
            source: cached.source,
            cacheState: cached.cacheState,
          });
        }
        return;
      }

      if (CF_WORKER_URL) {
        const timeout = createTimeoutController(10_000);
        try {
          const response = await fetch(
            `${CF_WORKER_URL}/metrics?section=${encodeURIComponent(section)}`,
            { signal: timeout.signal }
          );
          if (response.ok) {
            const payload = await response.json();
            if (payload.data !== null && payload.data !== undefined) {
              applyData(payload.data, "worker", payload.timestamp, payload.cacheState ?? null);
              return;
            }
          }
        } catch {
          // Continue to local API fallback.
        } finally {
          timeout.cleanup();
        }
      }

      if (shouldUseLocalApi) {
        const timeout = createTimeoutController(5_000);
        try {
          const response = await fetch(
            `${METRICS_API_PATH}?section=${encodeURIComponent(section)}`,
            { signal: timeout.signal }
          );
          if (response.ok) {
            const payload = await response.json();
            if (payload.data !== null && payload.data !== undefined) {
              applyData(
                payload.data,
                "api",
                payload.timestamp,
                payload.cacheState ?? null
              );
              return;
            }
          }
        } catch {
          // Continue to embedded fallback.
        } finally {
          timeout.cleanup();
        }
      }

      if (active) {
        setResult({
          data: fallbackRef.current,
          isLive: false,
          lastUpdated: null,
          source: "fallback",
          cacheState: null,
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [section, shouldFetchLive, shouldUseLocalApi]);

  return result;
}
