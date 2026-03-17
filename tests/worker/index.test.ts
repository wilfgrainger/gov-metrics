// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import worker, {
  normalizeBettingOddsPayload,
  refreshAuthorized,
} from "@/worker/index";

describe("worker contracts", () => {
  it("rejects incomplete betting odds payloads", () => {
    expect(() =>
      normalizeBettingOddsPayload({
        nextPmOdds: [],
        mostSeats: [],
        yearOdds: [],
      })
    ).toThrow(/incomplete/i);
  });

  it("authorizes refresh requests by header or query secret", () => {
    const env = { REFRESH_SECRET: "secret" };

    expect(
      refreshAuthorized(
        new Request("https://example.com/refresh", {
          headers: { "X-Refresh-Secret": "secret" },
        }),
        env
      )
    ).toBe(true);

    expect(
      refreshAuthorized(
        new Request("https://example.com/refresh?secret=secret"),
        env
      )
    ).toBe(true);
  });

  it("returns a 400 for /metrics without a section", async () => {
    const response = await worker.fetch(
      new Request("https://example.com/metrics"),
      {},
      { waitUntil: vi.fn() }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Missing ?section= parameter",
    });
  });
});
