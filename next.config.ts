import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudflare R2 public bucket URL + Bunny Stream thumbnail CDN.
    // Update these hostnames to match your real R2_PUBLIC_BASE_URL and
    // BUNNY_STREAM_CDN_HOSTNAME once configured (see .env.example).
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "media.newshub.example.com" },
      { protocol: "https", hostname: "*.b-cdn.net" },
    ],
  },
};

export default nextConfig;
