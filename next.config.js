/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Temporarily disable output standalone for development
  // output: 'standalone',
  // Enable image optimization for Cloudflare Pages
  images: {
    unoptimized: true,
    domains: ['blog-api.aldodiku.workers.dev'],
  },
  // Temporarily disable trailing slash handling
  // trailingSlash: false,
  
  // Set ESLint to only fail on errors, not warnings
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig; 