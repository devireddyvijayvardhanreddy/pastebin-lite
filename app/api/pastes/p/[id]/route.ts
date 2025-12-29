import { NextRequest, NextResponse } from 'next/server';
import { getPaste } from '@/lib/db';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const testNowMs = process.env.TEST_MODE === '1'
      ? parseInt(request.headers.get('x-test-now-ms') || '')
      : undefined;

    const result = await getPaste(params.id, testNowMs);
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
