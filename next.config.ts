import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Separate dev URLs from legacy bundles that browsers cached as immutable.
  assetPrefix: process.env.NODE_ENV === "development" ? "/_dev-assets" : undefined,
  // Enable React Compiler for production optimization
  reactCompiler: true,
  
  images: {
    unoptimized: true,
  },
  
  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports for faster cold starts
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
    ],
  },
  
  // Disable powered by header for security
  poweredByHeader: false,
  
  // Enable gzip compression
  compress: true,
  
  // Next.js manages static asset caching for development and production.
};

export default nextConfig;
