import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
    ],
  },
  // Optimize for Vercel deployment
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  // Disable x-powered-by header
  poweredByHeader: false,
  // Enable compression
  compress: true,
  // Configure allowed dev origins for cross-origin requests
  allowedDevOrigins: [
    'mhwfzl-8000.csb.app',
    'localhost:8000',
    '127.0.0.1:8000'
  ]
}

export default nextConfig
