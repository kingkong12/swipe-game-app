import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { nanoid } from 'nanoid';

export const runtime = 'edge';

interface Room {
  id: string;
  code: string;
  title: string;
  set_id: string;
  allow_insights: number;
  is_active: number;
  created_at: string;
  closed_at: string | null;
}

interface CreateRoomBody {
  title?: string;
  setId?: string;
  allowInsights?: boolean;
}

interface UpdateRoomBody {
  id?: string;
  isActive?: boolean;
}

// GET - Get room by code or list all rooms
export async function GET(request: Request) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      // Get specific room by code
      const room = await db
        .prepare('SELECT * FROM rooms WHERE code = ? AND is_active = 1')
        .bind(code)
        .first<Room>();

      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        room: {
          id: room.id,
          code: room.code,
          title: room.title,
          setId: room.set_id,
          allowInsights: room.allow_insights === 1,
          isActive: room.is_active === 1,
          createdAt: room.created_at,
        },
      });
    } else {
      // List all rooms
      const result = await db
        .prepare('SELECT * FROM rooms ORDER BY created_at DESC')
        .all<Room>();

      return NextResponse.json({
        success: true,
        rooms: (result.results || []).map((r) => ({
          id: r.id,
          code: r.code,
          title: r.title,
          setId: r.set_id,
          allowInsights: r.allow_insights === 1,
          isActive: r.is_active === 1,
          createdAt: r.created_at,
          closedAt: r.closed_at,
        })),
      });
    }
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

// POST - Create a new room
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const body: CreateRoomBody = await request.json();
    const { title, setId = 'default', allowInsights = true } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const id = nanoid(12);
    const code = generateRoomCode();

    await db
      .prepare('INSERT INTO rooms (id, code, title, set_id, allow_insights) VALUES (?, ?, ?, ?, ?)')
      .bind(id, code, title, setId, allowInsights ? 1 : 0)
      .run();

    return NextResponse.json({
      success: true,
      room: {
        id,
        code,
        title,
        setId,
        allowInsights,
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ success: false, error: 'Failed to create room' }, { status: 500 });
  }
}

// PATCH - Update room (close/archive)
export async function PATCH(request: Request) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const body: UpdateRoomBody = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      );
    }

    if (isActive === false) {
      await db
        .prepare("UPDATE rooms SET is_active = 0, closed_at = datetime('now') WHERE id = ?")
        .bind(id)
        .run();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ success: false, error: 'Failed to update room' }, { status: 500 });
  }
}

// Generate random room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
