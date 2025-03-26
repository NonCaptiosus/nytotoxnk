# Next.js Blog with Cloudflare Worker Backend

This project is a simple blog application built with Next.js and a Cloudflare Worker backend. The Worker serves as an API for storing and retrieving blog posts, while the Next.js application provides the frontend interface.

## Architecture

This application follows a two-tier architecture:

1. **Frontend**: Next.js application
   - Server-side rendering for blog posts
   - Client-side interaction for creating posts
   - Server-side API routes that proxy requests to the Cloudflare Worker

2. **Backend**: Cloudflare Worker with KV storage
   - RESTful API for blog post CRUD operations
   - Uses Cloudflare KV for data persistence
   - Protected routes with simple token-based authentication

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for Cloudflare Worker development)

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/nextjs-cloudflare-blog.git
cd nextjs-cloudflare-blog
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the Cloudflare Worker locally**

```bash
cd src/worker
npx wrangler dev --local
```

This will start the worker on `http://127.0.0.1:8787`.

4. **Start the Next.js development server**

In a separate terminal window:

```bash
npm run dev
```

This will start the Next.js app on `http://localhost:3000`.

## Development

### Key URLs

- **Main Blog**: [http://localhost:3000/blogs](http://localhost:3000/blogs)
- **Create Post**: [http://localhost:3000/create-post](http://localhost:3000/create-post)
- **Test Server API**: [http://localhost:3000/test-server-api](http://localhost:3000/test-server-api)
- **Test Worker Directly**: [http://localhost:3000/test-worker](http://localhost:3000/test-worker)

### API Endpoints

#### Next.js Server API Routes

- `GET /api/posts` - Get all blog posts
- `GET /api/posts/:slug` - Get a single blog post by slug
- `POST /api/create-post` - Create a new blog post

#### Cloudflare Worker API Routes

- `GET /api/posts` - Get all blog posts
- `GET /api/posts/:slug` - Get a single blog post by slug
- `POST /api/posts` - Create a new blog post
- `PUT /api/posts/:id` - Update an existing blog post
- `DELETE /api/posts/:id` - Delete a blog post

## Authentication

For API calls that create, update, or delete data, authentication is required. A simple token-based authentication is implemented. The current token is:

```
100e11ea0f87724622e73e2d3ec69bb145dcb89cf81e9c46e0f1ff71fda18a55
```

This token is included in API requests in the following ways:

- Direct Worker API: Via the `Authorization: Bearer <token>` header
- Next.js API routes: Included in the request body as `{ token: "<token>" }`

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Make sure the Cloudflare Worker is running with `npx wrangler dev --local`
   - Check that the worker is running on `http://127.0.0.1:8787`

2. **CORS Issues**
   - The worker has CORS headers set up to allow requests from any origin
   - The Next.js API routes proxy requests to avoid CORS issues

3. **"Hanging Promise" Errors**
   - If the worker logs "hanging Promise" errors, check for unresolved promises in request handlers
   - Ensure all promises are properly awaited and error handling is in place

### Testing Tools

The application includes two testing tools:

1. **Test Server API** (`/test-server-api`)
   - Tests the Next.js API routes that proxy to the worker
   - Good for end-to-end testing

2. **Test Worker Directly** (`/test-worker`)
   - Makes direct requests to the Cloudflare Worker
   - Useful for debugging worker issues independent of the Next.js app

## Deployment

### Next.js App

The Next.js app can be deployed to Vercel:

```bash
vercel
```

### Cloudflare Worker

Deploy the worker to Cloudflare:

```bash
cd src/worker
npx wrangler publish
```

After deployment, update the `WORKER_URL` environment variable in your Vercel project settings to point to your deployed worker URL.

## License

MIT 