import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright drives a real Chromium and must not be bundled into the server build.
  serverExternalPackages: ["playwright", "playwright-core"],
};

export default nextConfig;
