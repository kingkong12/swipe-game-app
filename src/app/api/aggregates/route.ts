import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// GET - Get aggregates for all scenarios
export async function GET(request: Request) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId') || 'default';

    // Get aggregates for the room
    const result = await db
      .prepare('SELECT scenario_id, yes_count, no_count FROM room_aggregates WHERE room_id = ?')
      .bind(roomId)
      .all<{ scenario_id: string; yes_count: number; no_count: number }>();

    const aggregates: Record<string, { yes: number; no: number }> = {};
    let maxTotal = 0;

    for (const row of result.results || []) {
      aggregates[row.scenario_id] = { yes: row.yes_count, no: row.no_count };
      const total = row.yes_count + row.no_count;
      if (total > maxTotal) maxTotal = total;
    }

    return NextResponse.json({
      success: true,
      aggregates,
      totalParticipants: maxTotal,
    });
  } catch (error) {
    console.error('Error fetching aggregates:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch aggregates' }, { status: 500 });
  }
}
