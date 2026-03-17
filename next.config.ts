import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Server mode by default keeps the local API fallback available during development.
  // Set STATIC_EXPORT=true to build a static frontend; live data still comes from the Worker.
  ...(process.env.STATIC_EXPORT === "true" ? { output: "export" as const } : {}),
  basePath: isProd ? "/gov-metrics" : "",
  assetPrefix: isProd ? "/gov-metrics" : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/gov-metrics" : "",
  },
};

export default nextConfig;
