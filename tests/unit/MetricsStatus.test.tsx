import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MetricsStatus from "@/app/components/MetricsStatus";

describe("MetricsStatus", () => {
  it("shows live automated delivery state", () => {
    render(
      <MetricsStatus
        section="sentimentPulse"
        status={{
          isLive: true,
          lastUpdated: new Date("2026-03-17T12:00:00Z"),
          source: "worker",
          cacheState: "fresh",
        }}
      />
    );

    expect(screen.getByText("AUTOMATED")).toBeInTheDocument();
    expect(screen.getByText("LIVE")).toBeInTheDocument();
    expect(screen.getByText(/Cloudflare Worker/)).toBeInTheDocument();
  });

  it("shows static snapshot delivery state", () => {
    render(
      <MetricsStatus
        section="pmApproval"
        status={{
          isLive: false,
          lastUpdated: null,
          source: "fallback",
          cacheState: null,
        }}
      />
    );

    expect(screen.getByText("STATIC")).toBeInTheDocument();
    expect(screen.getByText("EMBEDDED SNAPSHOT")).toBeInTheDocument();
  });
});
