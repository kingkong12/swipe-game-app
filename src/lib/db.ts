import { getRequestContext } from '@cloudflare/next-on-pages';
import type { D1Database } from '@cloudflare/workers-types';
import { CHARACTERS, type Character } from '@/lib/mock-data';

const DEFAULT_SET_ID = 'default';
const DEFAULT_ROOM_ID = 'room1';
const CATEGORY_FALLBACK = 'Service';

interface ScenarioRow {
  id: string;
  text: string;
  short_label: string | null;
  category: string | null;
  quality: string | null;
  is_active: number | null;
}

interface RevealSlideRow {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  quote: string | null;
  quote_author: string | null;
}

interface RoomRow {
  id: string;
  code: string;
  title: string;
  set_id: string;
  allow_insights: number | null;
  is_active: number | null;
  created_at: string | null;
}

interface AnswerRow {
  scenario_id: string;
  answer: number;
}

interface AggregateRow {
  scenario_id: string;
  yes_count: number;
  no_count: number;
}

export function getDb(): D1Database {
  try {
    const { env } = getRequestContext();
    if (!env?.DB) {
      throw new Error('D1 DB binding not found');
    }
    return env.DB;
  } catch (error) {
    throw new Error('D1 DB unavailable. Use `wrangler pages dev` or deploy to Cloudflare.');
  }
}

function mapCharacter(category: string | null): Character {
  if (category && CHARACTERS[category]) {
    return CHARACTERS[category];
  }
  return CHARACTERS[CATEGORY_FALLBACK] || Object.values(CHARACTERS)[0];
}

function mapRoom(row: RoomRow) {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    setId: row.set_id,
    allowInsights: Boolean(row.allow_insights),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function generateUniqueRoomCode(db: D1Database): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateRoomCode();
    const { results } = await db.prepare('SELECT id FROM rooms WHERE code = ?')
      .bind(code)
      .all();
    if (results.length === 0) {
      return code;
    }
  }
  return generateRoomCode();
}

export async function listScenarios(db: D1Database, setId = DEFAULT_SET_ID) {
  const { results } = await db.prepare(
    `SELECT id, text, short_label, category, quality, is_active
     FROM scenarios
     WHERE set_id = ? AND is_active = 1
     ORDER BY sort_order ASC`
  ).bind(setId).all<ScenarioRow>();

  return results.map((row) => ({
    id: row.id,
    text: row.text,
    shortLabel: row.short_label ?? null,
    category: row.category ?? null,
    quality: row.quality ?? null,
    isActive: Boolean(row.is_active),
    character: mapCharacter(row.category),
  }));
}

export async function createScenario(
  db: D1Database,
  data: { text: string; shortLabel?: string; category?: string; setId?: string }
) {
  const setId = data.setId || DEFAULT_SET_ID;
  const id = `scenario-${crypto.randomUUID()}`;

  // Get next sort order
  const maxRow = await db.prepare(
    'SELECT MAX(sort_order) as max_order FROM scenarios WHERE set_id = ?'
  ).bind(setId).first<{ max_order: number | null }>();
  const sortOrder = (maxRow?.max_order ?? 0) + 1;

  await db.prepare(
    `INSERT INTO scenarios (id, set_id, text, short_label, category, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`
  ).bind(id, setId, data.text, data.shortLabel || null, data.category || null, sortOrder).run();

  return {
    id,
    text: data.text,
    shortLabel: data.shortLabel ?? null,
    category: data.category ?? null,
    isActive: true,
    character: mapCharacter(data.category ?? null),
  };
}

export async function updateScenario(
  db: D1Database,
  id: string,
  data: { text?: string; shortLabel?: string; category?: string; isActive?: boolean }
) {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.text !== undefined) { updates.push('text = ?'); values.push(data.text); }
  if (data.shortLabel !== undefined) { updates.push('short_label = ?'); values.push(data.shortLabel || null); }
  if (data.category !== undefined) { updates.push('category = ?'); values.push(data.category || null); }
  if (data.isActive !== undefined) { updates.push('is_active = ?'); values.push(data.isActive ? 1 : 0); }

  if (updates.length === 0) return;

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await db.prepare(
    `UPDATE scenarios SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();
}

export async function deleteScenario(db: D1Database, id: string) {
  // Delete related user_answers first to avoid foreign key constraint failures
  await db.prepare('DELETE FROM user_answers WHERE scenario_id = ?').bind(id).run();
  // Then delete the scenario itself
  await db.prepare('DELETE FROM scenarios WHERE id = ?').bind(id).run();
}

export async function listRevealSlides(db: D1Database, setId = DEFAULT_SET_ID) {
  const { results } = await db.prepare(
    `SELECT id, title, body, image_url, quote, quote_author
     FROM reveal_slides
     WHERE set_id = ?
     ORDER BY sort_order ASC`
  ).bind(setId).all<RevealSlideRow>();

  return results.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body ?? null,
    imageUrl: row.image_url ?? null,
    quote: row.quote ?? null,
    quoteAuthor: row.quote_author ?? null,
  }));
}

export async function listRooms(db: D1Database) {
  const { results } = await db.prepare(
    `SELECT id, code, title, set_id, allow_insights, is_active, created_at
     FROM rooms
     WHERE is_active = 1
     ORDER BY created_at DESC`
  ).all<RoomRow>();

  return results.map(mapRoom);
}

export async function getRoomByCode(db: D1Database, code: string) {
  const room = await db.prepare(
    `SELECT id, code, title, set_id, allow_insights, is_active, created_at
     FROM rooms
     WHERE code = ? AND is_active = 1`
  ).bind(code).first<RoomRow>();

  return room ? mapRoom(room) : null;
}

export async function getRoomById(db: D1Database, id: string) {
  const room = await db.prepare(
    `SELECT id, code, title, set_id, allow_insights, is_active, created_at
     FROM rooms
     WHERE id = ? AND is_active = 1`
  ).bind(id).first<RoomRow>();

  return room ? mapRoom(room) : null;
}

export async function resolveRoom(db: D1Database, roomId?: string | null, roomCode?: string | null) {
  if (roomId) {
    return getRoomById(db, roomId);
  }
  if (roomCode) {
    return getRoomByCode(db, roomCode);
  }
  return getRoomById(db, DEFAULT_ROOM_ID);
}

export async function createRoom(db: D1Database, title: string, setId = DEFAULT_SET_ID) {
  const id = `room-${crypto.randomUUID()}`;
  const code = await generateUniqueRoomCode(db);

  await db.prepare(
    `INSERT INTO rooms (id, code, title, set_id, allow_insights, is_active)
     VALUES (?, ?, ?, ?, 1, 1)`
  ).bind(id, code, title, setId).run();

  return {
    id,
    code,
    title,
    setId,
    allowInsights: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

export async function getSessionAnswers(db: D1Database, sessionId: string, roomId: string) {
  const { results } = await db.prepare(
    `SELECT scenario_id, answer
     FROM user_answers
     WHERE session_id = ? AND room_id = ?
     ORDER BY answered_at ASC`
  ).bind(sessionId, roomId).all<AnswerRow>();

  return results.map((row) => ({
    scenarioId: row.scenario_id,
    answer: row.answer === 1 ? 'yes' : 'no',
  }));
}

async function ensureSession(db: D1Database, sessionId: string) {
  await db.prepare('INSERT OR IGNORE INTO user_sessions (id) VALUES (?)')
    .bind(sessionId)
    .run();
}

export async function saveAnswer(
  db: D1Database,
  sessionId: string,
  roomId: string,
  scenarioId: string,
  answer: 'yes' | 'no'
) {
  await ensureSession(db, sessionId);
  const answerValue = answer === 'yes' ? 1 : 0;

  await db.prepare(
    `INSERT INTO user_answers (id, session_id, room_id, scenario_id, answer)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(session_id, room_id, scenario_id)
     DO UPDATE SET answer = excluded.answer, answered_at = datetime('now')`
  ).bind(`answer-${crypto.randomUUID()}`, sessionId, roomId, scenarioId, answerValue).run();
}

export async function deleteAnswer(
  db: D1Database,
  sessionId: string,
  roomId: string,
  scenarioId: string
) {
  await db.prepare(
    `DELETE FROM user_answers
     WHERE session_id = ? AND room_id = ? AND scenario_id = ?`
  ).bind(sessionId, roomId, scenarioId).run();
}

export async function getAggregates(db: D1Database, roomId: string) {
  const { results } = await db.prepare(
    `SELECT scenario_id,
      SUM(CASE WHEN answer = 1 THEN 1 ELSE 0 END) as yes_count,
      SUM(CASE WHEN answer = 0 THEN 1 ELSE 0 END) as no_count
     FROM user_answers
     WHERE room_id = ?
     GROUP BY scenario_id`
  ).bind(roomId).all<AggregateRow>();

  const aggregates: Record<string, { yes: number; no: number }> = {};
  results.forEach((row) => {
    aggregates[row.scenario_id] = {
      yes: row.yes_count || 0,
      no: row.no_count || 0,
    };
  });

  const totalParticipantsRow = await db.prepare(
    `SELECT COUNT(DISTINCT session_id) as total
     FROM user_answers
     WHERE room_id = ?`
  ).bind(roomId).first<{ total: number }>();

  return {
    aggregates,
    totalParticipants: totalParticipantsRow?.total ?? 0,
  };
}

// ============ App State / Trigger Functions ============

export async function getRevealTriggered(db: D1Database): Promise<boolean> {
  const row = await db.prepare(
    "SELECT value FROM app_state WHERE key = 'reveal_triggered'"
  ).first<{ value: string }>();
  return row?.value === 'true';
}

export async function setRevealTriggered(db: D1Database, triggered: boolean): Promise<void> {
  await db.prepare(
    `INSERT INTO app_state (key, value, updated_at)
     VALUES ('reveal_triggered', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).bind(triggered ? 'true' : 'false').run();
}
