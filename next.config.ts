import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Server mode by default — enables API routes for real-time data fetching.
  // Set STATIC_EXPORT=true to revert to static export (e.g. for GitHub Pages).
  // In static export mode, data is served by the Cloudflare Worker fallback.
  ...(process.env.STATIC_EXPORT === "true"
    ? { output: "export" as const }
    : {}),
  basePath: isProd ? "/gov-metrics" : "",
  assetPrefix: isProd ? "/gov-metrics" : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/gov-metrics" : "",
  },
};

export default nextConfig;
