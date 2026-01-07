// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      }

      // Ignore test runners that are accidentally imported by dependencies
      config.resolve.alias = {
        ...config.resolve.alias,
        tap: false,
        tape: false,
        'why-is-node-running': false,
      }
    }
    return config
  },
  images: {
    localPatterns: [{ pathname: '/assets/**', search: '' }],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    formats: ['image/webp', 'image/avif'],
  },
}

export default nextConfig
