import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  
  // Headers for caching static assets
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
