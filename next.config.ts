import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },

      // Your custom R2 media domain
      {
        protocol: "https",
        hostname: "media.newshub.example.com",
      },

      // Bunny Stream
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
      },

      // External news images
      {
        protocol: "https",
        hostname: "nextgenev.in",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;