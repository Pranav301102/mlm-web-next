/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aggressive cache busting and optimization
  generateEtags: false,
  poweredByHeader: false,
  
  // Custom headers to prevent aggressive caching
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        // Static assets can be cached but with proper versioning
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes should never be cached
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ];
  },

  // Build optimization for better cache invalidation
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Ensure proper asset optimization
  images: {
    unoptimized: true, // Prevents caching issues with images
  },
};

export default nextConfig;
