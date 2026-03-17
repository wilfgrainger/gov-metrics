import { NextRequest, NextResponse } from "next/server";
import {
  AUTOMATED_METRIC_FALLBACKS,
  type AutomatedMetricSection,
} from "@/app/lib/metricFallbacks";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section");

  if (!section) {
    return NextResponse.json(
      { error: "Missing ?section= parameter" },
      { status: 400 }
    );
  }

  const fallback =
    AUTOMATED_METRIC_FALLBACKS[
      section as AutomatedMetricSection
    ];

  if (!fallback) {
    return NextResponse.json(
      { error: `Unknown automated section '${section}'` },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      section,
      data: clone(fallback),
      source: "api",
      timestamp: new Date().toISOString(),
      cacheState: "missing",
      backend: "local-api-fallback",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
