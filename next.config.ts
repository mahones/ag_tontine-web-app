import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables `forbidden()`/`unauthorized()` (next/navigation) and their matching
    // app/forbidden.tsx / app/unauthorized.tsx pages.
    authInterrupts: true,
  },
};

export default nextConfig;
