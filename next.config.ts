import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Paralel route prefetch
    optimisticClientCache: true,
  },
  // Supabase domain'ini optimize et
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "btcvwtdyefcdfzwgmzmg.supabase.co" },
    ],
  },
};

export default nextConfig;
