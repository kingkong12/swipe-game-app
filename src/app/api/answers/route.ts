import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { nanoid } from 'nanoid';

export const runtime = 'edge';

interface AnswerBody {
  sessionId?: string;
  scenarioId?: string;
  answer?: string;
  roomId?: string;
}

// POST - Submit an answer
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const body: AnswerBody = await request.json();
    const { sessionId, scenarioId, answer, roomId = 'default' } = body;

    if (!sessionId || !scenarioId || !answer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (answer !== 'yes' && answer !== 'no') {
      return NextResponse.json(
        { success: false, error: 'Answer must be "yes" or "no"' },
        { status: 400 }
      );
    }

    const answerValue = answer === 'yes' ? 1 : 0;

    // Ensure user session exists
    await db.prepare('INSERT OR IGNORE INTO user_sessions (id) VALUES (?)').bind(sessionId).run();

    // Check for existing answer
    const existing = await db
      .prepare('SELECT answer FROM user_answers WHERE session_id = ? AND room_id = ? AND scenario_id = ?')
      .bind(sessionId, roomId, scenarioId)
      .first<{ answer: number }>();

    const previousAnswer = existing ? (existing.answer === 1 ? 'yes' : 'no') : null;

    if (existing) {
      // Update existing answer
      await db
        .prepare("UPDATE user_answers SET answer = ?, answered_at = datetime('now') WHERE session_id = ? AND room_id = ? AND scenario_id = ?")
        .bind(answerValue, sessionId, roomId, scenarioId)
        .run();
    } else {
      // Insert new answer
      const id = nanoid(12);
      await db
        .prepare('INSERT INTO user_answers (id, session_id, room_id, scenario_id, answer) VALUES (?, ?, ?, ?, ?)')
        .bind(id, sessionId, roomId, scenarioId, answerValue)
        .run();
    }

    // Update aggregates
    await updateAggregates(db, roomId, scenarioId, answer as 'yes' | 'no', previousAnswer as 'yes' | 'no' | null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit answer' }, { status: 500 });
  }
}

// DELETE - Remove an answer (undo)
export async function DELETE(request: Request) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const scenarioId = searchParams.get('scenarioId');
    const roomId = searchParams.get('roomId') || 'default';

    if (!sessionId || !scenarioId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get existing answer before deleting
    const existing = await db
      .prepare('SELECT answer FROM user_answers WHERE session_id = ? AND room_id = ? AND scenario_id = ?')
      .bind(sessionId, roomId, scenarioId)
      .first<{ answer: number }>();

    if (existing) {
      const previousAnswer = existing.answer === 1 ? 'yes' : 'no';

      // Delete the answer
      await db
        .prepare('DELETE FROM user_answers WHERE session_id = ? AND room_id = ? AND scenario_id = ?')
        .bind(sessionId, roomId, scenarioId)
        .run();

      // Update aggregates (decrement)
      await updateAggregates(db, roomId, scenarioId, null, previousAnswer as 'yes' | 'no');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing answer:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove answer' }, { status: 500 });
  }
}

// GET - Get session answers
export async function GET(request: Request) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const roomId = searchParams.get('roomId') || 'default';

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    const result = await db
      .prepare('SELECT scenario_id, answer FROM user_answers WHERE session_id = ? AND room_id = ?')
      .bind(sessionId, roomId)
      .all<{ scenario_id: string; answer: number }>();

    const answers = (result.results || []).map((r) => ({
      scenarioId: r.scenario_id,
      answer: r.answer === 1 ? 'yes' : 'no',
    }));

    return NextResponse.json({ success: true, answers });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch answers' }, { status: 500 });
  }
}

// Helper function to update aggregates
async function updateAggregates(
  db: D1Database,
  roomId: string,
  scenarioId: string,
  newAnswer: 'yes' | 'no' | null,
  previousAnswer: 'yes' | 'no' | null
): Promise<void> {
  // Ensure aggregate row exists
  const id = nanoid(12);
  await db
    .prepare('INSERT OR IGNORE INTO room_aggregates (id, room_id, scenario_id, yes_count, no_count) VALUES (?, ?, ?, 0, 0)')
    .bind(id, roomId, scenarioId)
    .run();

  let yesChange = 0;
  let noChange = 0;

  // Decrement old answer
  if (previousAnswer === 'yes') yesChange--;
  if (previousAnswer === 'no') noChange--;

  // Increment new answer
  if (newAnswer === 'yes') yesChange++;
  if (newAnswer === 'no') noChange++;

  if (yesChange !== 0 || noChange !== 0) {
    await db
      .prepare(
        `UPDATE room_aggregates 
         SET yes_count = MAX(0, yes_count + ?), 
             no_count = MAX(0, no_count + ?),
             updated_at = datetime('now')
         WHERE room_id = ? AND scenario_id = ?`
      )
      .bind(yesChange, noChange, roomId, scenarioId)
      .run();
  }
}
