import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/", // The incoming request path pattern (base path)
        destination: "/competitive-content-analyzer", // The path you want to redirect to
        permanent: true, // Use true for a permanent 308 redirect, false for a temporary 307
      },
    ];
  },
};

export default nextConfig;
