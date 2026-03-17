import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const fallback = {
  economicData: [{ date: "Fallback", inflation: 1, bankRate: 1, unemployment: 1 }],
  metricConfig: {
    inflation: {
      label: "CPI INFLATION",
      unit: "%",
      color: "#FF3B00",
      current: "1%",
      target: "target",
    },
    bankRate: {
      label: "BANK OF ENGLAND RATE",
      unit: "%",
      color: "#000000",
      current: "1%",
      target: "target",
    },
    unemployment: {
      label: "UNEMPLOYMENT RATE",
      unit: "%",
      color: "#666666",
      current: "1%",
      target: "target",
    },
  },
};

async function loadUseMetrics(workerUrl: string) {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "development");
  vi.doMock("@/app/lib/config", async () => {
    const actual = await vi.importActual<typeof import("@/app/lib/config")>(
      "@/app/lib/config"
    );

    return {
      ...actual,
      CF_WORKER_URL: workerUrl,
      METRICS_API_PATH: "/api/metrics",
    };
  });

  return import("@/app/lib/useMetrics");
}

describe("useMetrics", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("uses worker data when available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { economicData: [{ date: "Worker", inflation: 3.1, bankRate: 4, unemployment: 5 }] },
          timestamp: "2026-03-17T10:00:00Z",
          cacheState: "fresh",
        }),
      })
    );

    const { useMetrics } = await loadUseMetrics("https://worker.example.com");
    const { result } = renderHook(() => useMetrics("sentimentPulse", fallback));

    await waitFor(() => {
      expect(result.current.source).toBe("worker");
    });

    expect(result.current.isLive).toBe(true);
    expect(result.current.data.economicData[0].date).toBe("Worker");
  });

  it("falls back to the local API in development when the worker fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValueOnce(new Error("worker down"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              economicData: [
                { date: "API", inflation: 2.8, bankRate: 3.75, unemployment: 5.2 },
              ],
            },
            timestamp: "2026-03-17T10:05:00Z",
            cacheState: "missing",
          }),
        })
    );

    const { useMetrics } = await loadUseMetrics("https://worker.example.com");
    const { result } = renderHook(() => useMetrics("sentimentPulse", fallback));

    await waitFor(() => {
      expect(result.current.source).toBe("api");
    });

    expect(result.current.isLive).toBe(true);
    expect(result.current.data.economicData[0].date).toBe("API");
  });

  it("falls back to embedded data when live sources fail", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValueOnce(new Error("worker down"))
        .mockRejectedValueOnce(new Error("api down"))
    );

    const { useMetrics } = await loadUseMetrics("https://worker.example.com");
    const { result } = renderHook(() => useMetrics("sentimentPulse", fallback));

    await waitFor(() => {
      expect(result.current.source).toBe("fallback");
    });

    expect(result.current.isLive).toBe(false);
    expect(result.current.data.economicData[0].date).toBe("Fallback");
  });
});
