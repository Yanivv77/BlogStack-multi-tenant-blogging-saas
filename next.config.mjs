import { createRequire } from "module";

const require = createRequire(import.meta.url);

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      // Add any specific Turbopack configurations here
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "5r0rf2wc3u.ufs.sh",
        port: "",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
