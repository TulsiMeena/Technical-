import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile Three.js dependencies if needed
  transpilePackages: ['three'],
};

export default nextConfig;
