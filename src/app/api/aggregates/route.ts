import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const roomCode = searchParams.get('roomCode');

  try {
    const { getDb, getAggregates, resolveRoom } = await import('@/lib/db');
    const db = getDb();
    const room = await resolveRoom(db, roomId, roomCode);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const { aggregates, totalParticipants } = await getAggregates(db, room.id);
    return NextResponse.json({ success: true, aggregates, totalParticipants });
  } catch {
    // Fallback to mock data
    const { getAggregates } = await import('@/lib/mock-data');
    const aggregates = getAggregates();
    const maxResponses = Math.max(
      ...Object.values(aggregates).map(a => a.yes + a.no),
      0
    );
    return NextResponse.json({ success: true, aggregates, totalParticipants: maxResponses });
  }
}
