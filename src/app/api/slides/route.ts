import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { getDb, listRevealSlides } = await import('@/lib/db');
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const setId = searchParams.get('setId') || undefined;
    const slides = await listRevealSlides(db, setId);
    return NextResponse.json({ success: true, slides });
  } catch {
    // Fallback to mock data when D1 is unavailable (next dev)
    const { getAllRevealSlides } = await import('@/lib/mock-data');
    const slides = getAllRevealSlides();
    return NextResponse.json({ success: true, slides });
  }
}
