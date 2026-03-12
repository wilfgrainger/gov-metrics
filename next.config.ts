import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/gov-metrics" : "",
  assetPrefix: isProd ? "/gov-metrics/" : undefined,
};

export default nextConfig;
