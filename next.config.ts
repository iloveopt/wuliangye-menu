import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure server-only modules don't leak into client bundle
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default nextConfig;
