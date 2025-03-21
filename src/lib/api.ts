// This file provides utilities for interacting with the Cloudflare Worker API

// Base API URL - in production this would point to your Cloudflare Workers domain
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://blog-api.aldodiku.workers.dev' 
  : 'http://localhost:8787';

// API token for authentication (would be stored securely in environment variables)
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '100e11ea0f87724622e73e2d3ec69bb145dcb89cf81e9c46e0f1ff71fda18a55'; 