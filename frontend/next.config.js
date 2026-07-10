/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mpics.mgronline.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:4000/api'}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
