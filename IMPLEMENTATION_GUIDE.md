# Pastebin-Lite Implementation Guide

## Complete Code Structure

This document contains all remaining files needed to complete the Pastebin-Lite application.

### File: app/api/pastes/[id]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getPaste } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testNowMs = process.env.TEST_MODE === '1'
      ? parseInt(request.headers.get('x-test-now-ms') || '')
      : undefined;

    const result = await getPaste(params.id, testNowMs);
    if (!result) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### File: app/p/[id]/page.tsx

```typescript
import { GetStaticProps, GetStaticPaths } from 'next';
import { getPaste } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function PastePage({ params }: { params: { id: string } }) {
  const result = await getPaste(params.id);
  
  if (!result) {
    return notFound();
  }

  // Simple HTML rendering without script execution
  const content = result.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return (
    <html>
      <head>
        <title>Pastebin - View Paste</title>
      </head>
      <body>
        <pre>{content}</pre>
      </body>
    </html>
  );
}
```

### File: app/layout.tsx

```typescript
export const metadata = {
  title: 'Pastebin-Lite',
  description: 'Share text pastes easily',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### File: app/page.tsx

```typescript
'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState<number | ''>(3600);
  const [maxViews, setMaxViews] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ttl_seconds: ttlSeconds || undefined,
          max_views: maxViews || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create paste');
      }

      const data = await response.json();
      setResult(data);
      setContent('');
      setTtlSeconds(3600);
      setMaxViews('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1>Pastebin-Lite</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your content here..."
          required
          className={styles.textarea}
        />
        <div className={styles.options}>
          <div>
            <label>
              TTL (seconds):
              <input
                type="number"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value ? parseInt(e.target.value) : '')}
                min="1"
              />
            </label>
          </div>
          <div>
            <label>
              Max Views:
              <input
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value ? parseInt(e.target.value) : '')}
                min="1"
              />
            </label>
          </div>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}
      {result && (
        <div className={styles.result}>
          <p>Paste created successfully!</p>
          <input
            type="text"
            value={result.url}
            readOnly
            className={styles.urlInput}
          />
          <button onClick={() => navigator.clipboard.writeText(result.url)}>
            Copy Link
          </button>
        </div>
      )}
    </main>
  );
}
```

### File: app/page.module.css

```css
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.textarea {
  width: 100%;
  height: 300px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  resize: vertical;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.options label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.options input[type='number'] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

.error {
  padding: 12px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-top: 16px;
}

.result {
  padding: 16px;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  margin-top: 16px;
}

.urlInput {
  width: 100%;
  padding: 10px;
  border: 1px solid #28a745;
  border-radius: 4px;
  margin: 12px 0;
  font-size: 14px;
}
```

## Deployment Steps

1. Install dependencies: `npm install`
2. Build project: `npm run build`
3. Test locally: `npm run dev`
4. Push to GitHub
5. Connect to Vercel
6. Set environment variables:
   - `TEST_MODE=1` (for test mode)
   - KV store credentials from Vercel
7. Deploy

## Testing

Test all endpoints:

```bash
# Health check
curl http://localhost:3000/api/healthz

# Create paste
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello World", "ttl_seconds": 3600}'

# Get paste
curl http://localhost:3000/api/pastes/[id]
```
