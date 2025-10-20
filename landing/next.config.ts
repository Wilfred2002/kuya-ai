import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix workspace root warning
  outputFileTracingRoot: __dirname,
  
  // Optimize for Vercel deployment
  experimental: {
    optimizePackageImports: ['three'],
  },
  
  // Enable static optimization
  trailingSlash: false,
  
  // Compress images and assets
  compress: true,
};

export default nextConfig;
