import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
  }

  try {
    const { getDb, getSessionAnswers, resolveRoom } = await import('@/lib/db');
    const db = getDb();
    const roomId = searchParams.get('roomId');
    const roomCode = searchParams.get('roomCode');
    const room = await resolveRoom(db, roomId, roomCode);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }
    const answers = await getSessionAnswers(db, sessionId, room.id);
    return NextResponse.json({ success: true, answers });
  } catch {
    // Fallback to mock data
    const { getSessionAnswers } = await import('@/lib/mock-data');
    const answers = getSessionAnswers(sessionId);
    return NextResponse.json({ success: true, answers });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      sessionId?: string;
      scenarioId?: string;
      answer?: 'yes' | 'no';
      roomId?: string;
      roomCode?: string;
    };
    const { sessionId, scenarioId, answer, roomId, roomCode } = body;

    if (!sessionId || !scenarioId || !answer) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const { getDb, saveAnswer, resolveRoom } = await import('@/lib/db');
      const db = getDb();
      const room = await resolveRoom(db, roomId, roomCode);
      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }
      await saveAnswer(db, sessionId, room.id, scenarioId, answer);
    } catch {
      // Fallback to mock data
      const { setAnswer } = await import('@/lib/mock-data');
      setAnswer(sessionId, scenarioId, answer);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving answer:', error);
    return NextResponse.json({ success: false, error: 'Failed to save answer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const scenarioId = searchParams.get('scenarioId');

  if (!sessionId || !scenarioId) {
    return NextResponse.json({ success: false, error: 'Session ID and Scenario ID required' }, { status: 400 });
  }

  try {
    const { getDb, deleteAnswer, resolveRoom } = await import('@/lib/db');
    const db = getDb();
    const roomId = searchParams.get('roomId');
    const roomCode = searchParams.get('roomCode');
    const room = await resolveRoom(db, roomId, roomCode);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }
    await deleteAnswer(db, sessionId, room.id, scenarioId);
  } catch {
    // Fallback to mock data
    const { removeAnswer } = await import('@/lib/mock-data');
    removeAnswer(sessionId, scenarioId);
  }

  return NextResponse.json({ success: true });
}
