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
          if (json.data && active) {
            cache.set(section, {
              data: json.data,
              timestamp: Date.now(),
              source: "api",
            });
            setResult({
              data: json.data as T,
              isLive: true,
              lastUpdated: new Date(json.timestamp ?? Date.now()),
              source: "api",
            });
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
            if (json.data && active) {
              cache.set(section, {
                data: json.data,
                timestamp: Date.now(),
                source: "worker",
              });
              setResult({
                data: json.data as T,
                isLive: true,
                lastUpdated: new Date(json.timestamp ?? Date.now()),
                source: "worker",
              });
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
