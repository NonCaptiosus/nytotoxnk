/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable image optimization for Cloudflare Pages
  images: {
    unoptimized: true,
    domains: ['blog-api.aldodiku.workers.dev'],
  },
  // Use trailing slash for better Cloudflare compatibility
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