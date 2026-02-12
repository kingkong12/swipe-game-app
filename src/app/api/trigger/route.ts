import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-helpers';

export const runtime = 'edge';

// GET - check if reveal has been triggered
export async function GET() {
  try {
    const { getDb, getRevealTriggered } = await import('@/lib/db');
    const db = getDb();
    const triggered = await getRevealTriggered(db);
    return jsonResponse({ success: true, triggered });
  } catch {
    const { getRevealTriggered } = await import('@/lib/mock-data');
    const triggered = getRevealTriggered();
    return jsonResponse({ success: true, triggered });
  }
}

// POST - set reveal trigger (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { triggered?: boolean };
    const triggered = body.triggered !== false; // default to true

    try {
      const { getDb, setRevealTriggered } = await import('@/lib/db');
      const db = getDb();
      await setRevealTriggered(db, triggered);
    } catch {
      const { setRevealTriggered } = await import('@/lib/mock-data');
      setRevealTriggered(triggered);
    }

    return jsonResponse({ success: true, triggered });
  } catch (error) {
    console.error('Error setting trigger:', error);
    return jsonResponse({ success: false, error: 'Failed to set trigger' }, 500);
  }
}
