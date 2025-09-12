import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/assets/**',
        search: '',
      },
    ],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xjsqtnetbsxfzqirhrfk.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
}

export default nextConfig
