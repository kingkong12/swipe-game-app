import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  try {
    const { getDb, getRoomByCode, listRooms, listScenarios } = await import('@/lib/db');
    const db = getDb();

    if (code) {
      const room = await getRoomByCode(db, code);
      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }
      const scenarios = await listScenarios(db, room.setId);
      return NextResponse.json({ success: true, room, scenarios });
    }

    const rooms = await listRooms(db);
    return NextResponse.json({ success: true, rooms });
  } catch {
    // Fallback to mock data
    const mock = await import('@/lib/mock-data');

    if (code) {
      const room = mock.getRoomByCode(code);
      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }
      const scenarios = mock.getScenariosForRoom(code);
      return NextResponse.json({ success: true, room, scenarios });
    }

    const rooms = mock.getAllRooms();
    return NextResponse.json({ success: true, rooms });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { title?: string; setId?: string; scenarioIds?: string[] };
    const { title, setId, scenarioIds } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title required' }, { status: 400 });
    }

    try {
      const { getDb, createRoom } = await import('@/lib/db');
      const db = getDb();
      const room = await createRoom(db, title, setId);
      return NextResponse.json({ success: true, room });
    } catch {
      const { createRoom } = await import('@/lib/mock-data');
      const room = createRoom(title, scenarioIds);
      return NextResponse.json({ success: true, room });
    }
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ success: false, error: 'Failed to create room' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as { id?: string; title?: string; scenarioIds?: string[]; isActive?: boolean };

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    try {
      const { updateRoom } = await import('@/lib/mock-data');
      const room = updateRoom(body.id, {
        title: body.title,
        scenarioIds: body.scenarioIds,
        isActive: body.isActive,
      });
      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, room });
    } catch {
      const { updateRoom } = await import('@/lib/mock-data');
      const room = updateRoom(body.id, {
        title: body.title,
        scenarioIds: body.scenarioIds,
        isActive: body.isActive,
      });
      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, room });
    }
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ success: false, error: 'Failed to update room' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
  }

  try {
    const { deleteRoom } = await import('@/lib/mock-data');
    const success = deleteRoom(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete room' }, { status: 500 });
  }
}
