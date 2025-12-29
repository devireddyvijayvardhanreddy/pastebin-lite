import { NextRequest, NextResponse } from 'next/server';
import { createPaste, getPaste } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, ttl_seconds, max_views } = body;

    const result = await createPaste(content, ttl_seconds, max_views);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const testNowMs = process.env.TEST_MODE === '1'
      ? parseInt(searchParams.get('x-test-now-ms') || '')
      : undefined;

    if (!id) {
      return NextResponse.json(
        { error: 'Paste ID is required' },
        { status: 400 }
      );
    }

    const result = await getPaste(id, testNowMs);
    if (!result) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
