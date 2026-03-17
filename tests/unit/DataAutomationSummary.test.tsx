import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("DataAutomationSummary", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("renders worker-backed and non-worker section states", async () => {
    vi.doMock("@/app/lib/config", async () => {
      const actual = await vi.importActual<typeof import("@/app/lib/config")>(
        "@/app/lib/config"
      );
      return {
        ...actual,
        CF_WORKER_URL: "https://worker.example.com",
      };
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          meta: {
            generatedAt: "2026-03-17T12:00:00Z",
            sources: {
              sentimentPulse: {
                status: "ok",
                fetchedAt: "2026-03-17T11:55:00Z",
                cacheState: "fresh",
              },
            },
          },
        }),
      })
    );

    const { default: DataAutomationSummary } = await import(
      "@/app/components/DataAutomationSummary"
    );

    render(<DataAutomationSummary />);

    await waitFor(() => {
      expect(screen.getByText("SECTION STATUS")).toBeInTheDocument();
    });

    expect(screen.getAllByText("LIVE").length).toBeGreaterThan(0);
    expect(screen.getAllByText("EMBEDDED SNAPSHOT").length).toBeGreaterThan(0);
    expect(screen.getAllByText("CLIENT ONLY").length).toBeGreaterThan(0);
  });
});
