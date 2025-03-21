# Personal Blog & Portfolio Website

A modern personal blog and portfolio website built with Next.js, showcasing projects and blog posts. Features an admin panel for content management and uses Cloudflare Pages for hosting and Cloudflare Workers for the backend API.

## Features

- **Blog System**: Create, edit, and publish blog posts with rich text formatting
- **Portfolio Showcase**: Display your projects with details and images
- **Admin Panel**: Secure admin interface for content management
- **Responsive Design**: Beautiful UI that works on mobile, tablet, and desktop
- **Cloudflare Integration**: Uses Cloudflare Pages for hosting and Workers for the backend
- **TypeScript**: Type-safe codebase for better developer experience

## Tech Stack

- **Frontend**: 
  - Next.js (React framework)
  - TypeScript
  - Tailwind CSS (styling)
  - SWR (data fetching)

- **Backend**:
  - Cloudflare Workers (serverless functions)
  - Cloudflare KV (database)

- **Deployment**:
  - Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Cloudflare account (for deployment)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/your-blog-portfolio.git
cd your-blog-portfolio
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up local environment variables**

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_TOKEN=your-dev-token
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## Cloudflare Workers Setup

1. **Install Wrangler CLI**

```bash
npm install -g wrangler
```

2. **Authenticate with Cloudflare**

```bash
wrangler login
```

3. **Create KV namespace**

```bash
wrangler kv:namespace create BLOG_DATA
wrangler kv:namespace create BLOG_DATA --preview
```

Update the `wrangler.toml` file with the KV namespace IDs.

4. **Deploy the Worker**

```bash
wrangler publish
```

## Deploying to Cloudflare Pages

1. Set up a new project in Cloudflare Pages dashboard
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
4. Add environment variables:
   - `NEXT_PUBLIC_API_TOKEN`: Your API token

## Project Structure

```
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components
│   ├── lib/            # Utility functions and shared code
│   ├── styles/         # Global styles
│   └── worker/         # Cloudflare Worker code
├── .env.local          # Local environment variables (not in repo)
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── wrangler.toml       # Cloudflare Workers configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Cloudflare for the hosting and serverless infrastructure
- TailwindCSS for the utility-first CSS framework 