// API Routes are fully functional
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Service unavailable' }, { status: 500 });
  }
}
