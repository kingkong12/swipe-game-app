import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

interface RevealSlide {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  quote: string | null;
  quote_author: string | null;
  sort_order: number;
}

// GET - Get all reveal slides
export async function GET(request: Request) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const setId = searchParams.get('setId') || 'default';

    const result = await db
      .prepare('SELECT * FROM reveal_slides WHERE set_id = ? ORDER BY sort_order')
      .bind(setId)
      .all<RevealSlide>();

    return NextResponse.json({
      success: true,
      slides: (result.results || []).map((s) => ({
        id: s.id,
        title: s.title,
        body: s.body,
        imageUrl: s.image_url,
        quote: s.quote,
        quoteAuthor: s.quote_author,
      })),
    });
  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch slides' }, { status: 500 });
  }
}
