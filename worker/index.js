/**
 * Cloudflare Worker — PULSE Data Proxy
 *
 * Fallback data source when the Next.js API route is unavailable
 * (e.g. when deployed as a static export to GitHub Pages).
 *
 * Reads daily_threat_data.json from the GitHub Pages deployment
 * and serves individual sections via a CORS-enabled API.
 *
 * Deploy:
 *   cd worker && npx wrangler deploy
 *
 * Set NEXT_PUBLIC_CF_WORKER_URL in your environment to the worker URL.
 */

const DEFAULT_DATA_URL =
  "https://wilfgrainger.github.io/gov-metrics/daily_threat_data.json";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Simple in-memory cache (reset on cold start)
let cached = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function resolveDataUrl(env = {}) {
  const configuredUrl = env.DATA_URL?.trim();
  const localFallbackAllowed =
    env.ENVIRONMENT === "development" ||
    env.NODE_ENV === "development" ||
    env.CF_PAGES_BRANCH === "local";

  const upstreamUrl = configuredUrl || (localFallbackAllowed ? DEFAULT_DATA_URL : null);

  if (!upstreamUrl) {
    return {
      error:
        "Worker misconfiguration: DATA_URL is required. Set DATA_URL in wrangler.toml [vars] or your Cloudflare environment.",
    };
  }

  try {
    const parsed = new URL(upstreamUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("DATA_URL must use http or https protocol.");
    }
  } catch {
    return {
      error:
        "Worker misconfiguration: DATA_URL is invalid. Provide a valid absolute http(s) URL.",
    };
  }

  return { upstreamUrl };
}

async function fetchData(upstreamUrl) {
  if (cached && Date.now() - cachedAt < CACHE_TTL) {
    return cached;
  }
  const res = await fetch(upstreamUrl);
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  cached = await res.json();
  cachedAt = Date.now();
  return cached;
}

const worker = {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/" || url.pathname === "/health") {
      return Response.json(
        { status: "ok", service: "pulse-data-worker" },
        { headers: CORS_HEADERS }
      );
    }

    // Metrics endpoint
    if (url.pathname === "/metrics") {
      const { upstreamUrl, error } = resolveDataUrl(env);
      if (error) {
        return Response.json({ error }, { status: 500, headers: CORS_HEADERS });
      }

      const section = url.searchParams.get("section");
      if (!section) {
        return Response.json(
          { error: "Missing ?section= parameter" },
          { status: 400, headers: CORS_HEADERS }
        );
      }

      try {
        const data = await fetchData(upstreamUrl);
        const sectionData = data[section] || null;

        return Response.json(
          {
            section,
            data: sectionData,
            source: sectionData ? "worker" : "none",
            timestamp: data.meta?.generatedAt || new Date().toISOString(),
          },
          {
            headers: {
              ...CORS_HEADERS,
              "Cache-Control": "public, max-age=300",
            },
          }
        );
      } catch (err) {
        return Response.json(
          {
            section,
            data: null,
            source: "error",
            message: err.message,
          },
          { status: 502, headers: CORS_HEADERS }
        );
      }
    }

    // All data (no section filter)
    if (url.pathname === "/all") {
      const { upstreamUrl, error } = resolveDataUrl(env);
      if (error) {
        return Response.json({ error }, { status: 500, headers: CORS_HEADERS });
      }

      try {
        const data = await fetchData(upstreamUrl);
        return Response.json(data, {
          headers: {
            ...CORS_HEADERS,
            "Cache-Control": "public, max-age=300",
          },
        });
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 502, headers: CORS_HEADERS }
        );
      }
    }

    return Response.json(
      { error: "Not found", endpoints: ["/metrics?section=...", "/all", "/health"] },
      { status: 404, headers: CORS_HEADERS }
    );
  },
};

export default worker;
