#!/bin/bash

# Build the Next.js project
echo "Building Next.js project..."
npm run build

# Run the next-on-pages command to generate the worker
echo "Generating Cloudflare Pages worker..."
npx @cloudflare/next-on-pages

echo "Build complete!" 