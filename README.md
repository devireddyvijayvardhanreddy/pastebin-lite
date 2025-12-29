# Pastebin-Lite

A modern Pastebin-like application built with Next.js that allows users to create, share, and view text pastes with optional expiry constraints.

## Features

- **Create Pastes**: Users can create text pastes with arbitrary content
- **Shareable Links**: Each paste gets a unique URL for sharing
- **TTL Support**: Optional time-based expiry for pastes (in seconds)
- **View Count Limits**: Optional maximum view count before paste becomes unavailable
- **Safe Rendering**: Pastes are rendered safely without script execution
- **Persistence**: Data persists across requests using a KV store
- **Test Mode**: Deterministic testing with custom time headers for automated tests

## Tech Stack

- **Framework**: Next.js (React)
- **Runtime**: Node.js
- **Persistence**: Vercel KV (Redis)
- **Deployment**: Vercel
- **Language**: TypeScript/JavaScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/devireddyvijayvardhanreddy/pastebin-lite.git
cd pastebin-lite
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your configuration:
```bash
# For local development (optional)
KV_URL=your_redis_url
KV_REST_API_URL=your_redis_rest_url
KV_REST_API_TOKEN=your_redis_token
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Locally

### Development Mode
```bash
npm run dev
```
Visit http://localhost:3000 to use the application.

### Production Build
```bash
npm run build
npm run start
```

### Running Tests
```bash
npm test
```

## API Endpoints

### Health Check
```
GET /api/healthz
```
Returns application health status and persistence layer accessibility.

**Response:**
```json
{ "ok": true }
```

### Create a Paste
```
POST /api/pastes
```

**Request Body:**
```json
{
  "content": "Your paste content here",
  "ttl_seconds": 3600,
  "max_views": 5
}
```

**Rules:**
- `content`: Required, non-empty string
- `ttl_seconds`: Optional, integer >= 1
- `max_views`: Optional, integer >= 1

**Response (2xx):**
```json
{
  "id": "abc123def456",
  "url": "https://your-app.vercel.app/p/abc123def456"
}
```

**Error Response (4xx):**
```json
{
  "error": "content is required"
}
```

### Fetch a Paste (API)
```
GET /api/pastes/:id
```

**Successful Response (200):**
```json
{
  "content": "Your paste content",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}
```

**Notes:**
- `remaining_views`: null if unlimited
- `expires_at`: null if no TTL set
- Each API fetch counts as one view

**Error Response (404):**
Returned when:
- Paste not found
- Paste has expired
- View limit exceeded

### View a Paste (HTML)
```
GET /p/:id
```

Returns HTML containing the paste content. Content is rendered safely without script execution.

**Error:** Returns 404 if paste is unavailable.

## Persistence Layer

**Technology**: Vercel KV (Redis-compatible)

**Why Vercel KV?**
- Serverless-friendly: Data persists across requests in serverless environments
- Simple integration: Built-in Vercel integration
- Automatic scaling: Handles variable load
- Reliability: Managed by Vercel with automatic backups
- Cost-effective: Pay only for what you use

**Data Structure:**
- Each paste is stored as a JSON object with metadata
- TTL is handled by Redis expiry with actual TTL in metadata
- View count is decremented on each fetch

## Important Design Decisions

1. **Deterministic Testing**: Supports `TEST_MODE=1` environment variable with `x-test-now-ms` header for predictable expiry testing in automated tests.

2. **No Global State**: Server-side code avoids global mutable state that breaks in serverless environments.

3. **Safe HTML Rendering**: Uses DOMPurify to sanitize and safely render paste content without script execution.

4. **Automatic Expiry**: Pastes automatically become unavailable when TTL or view count expires, even without explicit cleanup.

5. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes (4xx for client errors, 5xx for server errors).

6. **URL Structure**: Uses `/p/:id` for HTML views and `/api/pastes/:id` for API access for clarity.

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect your GitHub repo to Vercel
3. Vercel will automatically detect Next.js and configure it
4. Add environment variables in Vercel dashboard (for KV configuration)
5. Deploy!

Or use Vercel CLI:
```bash
npm install -g vercel
vercel
```

## Testing

The application is tested against automated checks for:
- Health check endpoint
- Paste creation and retrieval
- TTL expiry with test mode
- View count limits
- Combined constraints
- Error handling
- JSON response validation

## Code Quality

- ✅ No hardcoded localhost URLs in production code
- ✅ No secrets or credentials in repository
- ✅ No global mutable state
- ✅ Standard commands documented in README
- ✅ Automatic database initialization

## License

MIT License - Feel free to use this project for any purpose.

## Author

Devireddyvijayvardhanreddy

## Support
## Deployment
Deployed at: https://pastebin-lite-app.vercel.app

For issues or questions, please open a GitHub issue on the repository.
