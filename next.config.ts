import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: { 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'first-anteater-634.convex.cloud',
      },
    ],
  },
};

export default nextConfig;
