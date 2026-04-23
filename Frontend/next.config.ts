import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
