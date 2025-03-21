/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimize for Cloudflare Pages
  output: 'standalone',
  // Enable image optimization for Cloudflare Pages
  images: {
    unoptimized: true,
    domains: ['blog-api.aldodiku.workers.dev'],
  },
  // Allow Cloudflare to handle rewrites
  trailingSlash: false,
};

module.exports = nextConfig; 