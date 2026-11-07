import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "phimimg.com" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "phimapi.com" },
    ],
  },
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
