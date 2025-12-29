import { kv } from '@vercel/kv';
import crypto from 'crypto';

interface Paste {
  id: string;
  content: string;
  createdAt: string;
  ttlSeconds?: number;
  maxViews?: number;
  views: number;
}

export async function createPaste(
  content: string,
  ttlSeconds?: number,
  maxViews?: number
): Promise<{ id: string; url: string }> {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('content is required and must be a non-empty string');
  }

  if (ttlSeconds !== undefined && (typeof ttlSeconds !== 'number' || ttlSeconds < 1)) {
    throw new Error('ttl_seconds must be an integer >= 1');
  }

  if (maxViews !== undefined && (typeof maxViews !== 'number' || maxViews < 1)) {
    throw new Error('max_views must be an integer >= 1');
  }

  const id = crypto.randomBytes(8).toString('hex');
  const paste: Paste = {
    id,
    content,
    createdAt: new Date().toISOString(),
    ttlSeconds,
    maxViews,
    views: 0,
  };

  const key = `paste:${id}`;
  const ttl = ttlSeconds || 86400 * 30; // Default 30 days
  await kv.setex(key, ttl, JSON.stringify(paste));

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/p/${id}`;

  return { id, url };
}

export async function getPaste(
  id: string,
  testNowMs?: number
): Promise<{ content: string; remaining_views: number | null; expires_at: string | null } | null> {
  const key = `paste:${id}`;
  const data = await kv.get(key);

  if (!data) {
    return null;
  }

  const paste = JSON.parse(data as string) as Paste;
  const now = testNowMs ? new Date(testNowMs) : new Date();
  const createdAt = new Date(paste.createdAt);

  // Check TTL expiry
  if (paste.ttlSeconds) {
    const expiryTime = new Date(createdAt.getTime() + paste.ttlSeconds * 1000);
    if (now >= expiryTime) {
      await kv.del(key);
      return null;
    }
  }

  // Check view limit
  if (paste.maxViews !== undefined && paste.views >= paste.maxViews) {
    await kv.del(key);
    return null;
  }

  // Increment views
  paste.views += 1;
  if (paste.maxViews !== undefined && paste.views >= paste.maxViews) {
    await kv.setex(key, 1, JSON.stringify(paste)); // Will expire immediately
  } else {
    const ttl = paste.ttlSeconds || 86400 * 30;
    await kv.setex(key, ttl, JSON.stringify(paste));
  }

  const remaining_views = paste.maxViews !== undefined ? paste.maxViews - paste.views : null;
  const expiresAt = paste.ttlSeconds
    ? new Date(createdAt.getTime() + paste.ttlSeconds * 1000).toISOString()
    : null;

  return {
    content: paste.content,
    remaining_views,
    expires_at: expiresAt,
  };
}
