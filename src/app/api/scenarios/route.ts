import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

interface Scenario {
  id: string;
  text: string;
  short_label: string | null;
  category: string | null;
  is_active: number;
  sort_order: number;
}

export async function GET(request: Request) {
  try {
    const ctx = getRequestContext();
    const db = ctx?.env?.DB;

    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not configured',
        debug: {
          hasContext: !!ctx,
          hasEnv: !!ctx?.env,
          envKeys: ctx?.env ? Object.keys(ctx.env) : [],
        }
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';
    const setId = searchParams.get('setId') || 'default';

    let query = 'SELECT * FROM scenarios WHERE set_id = ?';
    if (!includeInactive) {
      query += ' AND is_active = 1';
    }
    query += ' ORDER BY sort_order';

    const result = await db.prepare(query).bind(setId).all<Scenario>();

    return NextResponse.json({
      success: true,
      scenarios: (result.results || []).map((s) => ({
        id: s.id,
        text: s.text,
        shortLabel: s.short_label,
        category: s.category,
        isActive: s.is_active === 1,
      })),
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch scenarios',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
