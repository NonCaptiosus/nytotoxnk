#!/bin/bash
# Build script for Cloudflare Pages

# Print Node.js version for debugging
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
npm ci

# Build Next.js app
npm run build

# Add Next.js on Pages adapter
npx @cloudflare/next-on-pages

# Success message
echo "Build completed successfully!" 