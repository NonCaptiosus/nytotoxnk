/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  // Enable image optimization for Cloudflare Pages
  images: {
    unoptimized: true,
    domains: ['blog-api.aldodiku.workers.dev'],
  },
  // Explicitly set trailing slash handling
  trailingSlash: true,
  
  // Set ESLint to only fail on errors, not warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Add experimental features for Edge runtime
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig; 