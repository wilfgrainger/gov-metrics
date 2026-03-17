import { describe, expect, it } from "vitest";
import { DATA_SOURCES } from "@/app/lib/config";
import { SECTIONS } from "@/app/lib/sections";
import { SECTION_CONTENT } from "@/app/lib/sectionContent";
import { AUTOMATED_METRIC_KEYS } from "@/app/lib/metricFallbacks";
import { sectionDescriptors } from "@/worker/index";

describe("metadata contracts", () => {
  it("keeps automated frontend sections aligned with local fallbacks", () => {
    const automatedKeys = Object.entries(DATA_SOURCES)
      .filter(([, meta]) => meta.automation === "automated")
      .map(([key]) => key)
      .sort();

    expect(automatedKeys).toEqual([...AUTOMATED_METRIC_KEYS].sort());
  });

  it("keeps automated frontend sections aligned with worker descriptors", () => {
    const automatedKeys = Object.entries(DATA_SOURCES)
      .filter(([, meta]) => meta.automation === "automated")
      .map(([key]) => key)
      .sort();

    expect(automatedKeys).toEqual(Object.keys(sectionDescriptors).sort());
  });

  it("keeps navigation and section pages aligned", () => {
    const navIds = SECTIONS.flatMap((group) =>
      group.sections.map((section) => section.id)
    ).sort();

    expect(navIds).toEqual(Object.keys(SECTION_CONTENT).sort());
  });
});
