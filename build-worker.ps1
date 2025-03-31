# This script builds the Next.js application for Cloudflare Pages

# Build the Next.js project
Write-Host "Building Next.js project..."
npm run build

# Run the next-on-pages command to generate the worker
Write-Host "Generating Cloudflare Pages worker..."
npx @cloudflare/next-on-pages

Write-Host "Build complete!" 