import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Demo pitch app: avoid Cache Components prerender strictness on client hooks.
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
