import { getRequestContext } from '@cloudflare/next-on-pages';
import { nanoid } from 'nanoid';

// Get D1 database instance
export function getDB(): D1Database {
  return getRequestContext().env.DB;
}

// Generate IDs
export const generateId = () => nanoid(12);
export const generateRoomCode = () => nanoid(6).toUpperCase();

// Types
export interface ScenarioSet {
  id: string;
  name: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  set_id: string;
  text: string;
  short_label: string | null;
  category: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface RevealSlide {
  id: string;
  set_id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  quote: string | null;
  quote_author: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  code: string;
  title: string;
  set_id: string;
  allow_insights: number;
  is_active: number;
  created_at: string;
  closed_at: string | null;
}

export interface UserSession {
  id: string;
  created_at: string;
}

export interface UserAnswer {
  id: string;
  session_id: string;
  room_id: string;
  scenario_id: string;
  answer: number;
  answered_at: string;
}

export interface RoomAggregate {
  id: string;
  room_id: string;
  scenario_id: string;
  yes_count: number;
  no_count: number;
  updated_at: string;
}

// Queries
export async function getScenarioSets(db: D1Database): Promise<ScenarioSet[]> {
  const result = await db
    .prepare('SELECT * FROM scenario_sets ORDER BY created_at DESC')
    .all<ScenarioSet>();
  return result.results;
}

export async function getScenarioSet(db: D1Database, id: string): Promise<ScenarioSet | null> {
  return db.prepare('SELECT * FROM scenario_sets WHERE id = ?').bind(id).first<ScenarioSet>();
}

export async function getScenarios(db: D1Database, setId: string): Promise<Scenario[]> {
  const result = await db
    .prepare('SELECT * FROM scenarios WHERE set_id = ? AND is_active = 1 ORDER BY sort_order ASC')
    .bind(setId)
    .all<Scenario>();
  return result.results;
}

export async function getAllScenarios(db: D1Database, setId: string): Promise<Scenario[]> {
  const result = await db
    .prepare('SELECT * FROM scenarios WHERE set_id = ? ORDER BY sort_order ASC')
    .bind(setId)
    .all<Scenario>();
  return result.results;
}

export async function getRevealSlides(db: D1Database, setId: string): Promise<RevealSlide[]> {
  const result = await db
    .prepare('SELECT * FROM reveal_slides WHERE set_id = ? ORDER BY sort_order ASC')
    .bind(setId)
    .all<RevealSlide>();
  return result.results;
}

export async function getRoomByCode(db: D1Database, code: string): Promise<Room | null> {
  return db
    .prepare('SELECT * FROM rooms WHERE code = ? AND is_active = 1')
    .bind(code)
    .first<Room>();
}

export async function getRoom(db: D1Database, id: string): Promise<Room | null> {
  return db.prepare('SELECT * FROM rooms WHERE id = ?').bind(id).first<Room>();
}

export async function getRooms(db: D1Database): Promise<Room[]> {
  const result = await db
    .prepare('SELECT * FROM rooms ORDER BY created_at DESC')
    .all<Room>();
  return result.results;
}

export async function getUserAnswers(
  db: D1Database,
  sessionId: string,
  roomId: string
): Promise<UserAnswer[]> {
  const result = await db
    .prepare('SELECT * FROM user_answers WHERE session_id = ? AND room_id = ?')
    .bind(sessionId, roomId)
    .all<UserAnswer>();
  return result.results;
}

export async function getRoomAggregates(
  db: D1Database,
  roomId: string
): Promise<RoomAggregate[]> {
  const result = await db
    .prepare('SELECT * FROM room_aggregates WHERE room_id = ?')
    .bind(roomId)
    .all<RoomAggregate>();
  return result.results;
}

// Mutations
export async function createScenarioSet(
  db: D1Database,
  data: { name: string; description?: string }
): Promise<ScenarioSet> {
  const id = generateId();
  await db
    .prepare(
      'INSERT INTO scenario_sets (id, name, description) VALUES (?, ?, ?)'
    )
    .bind(id, data.name, data.description || null)
    .run();
  return getScenarioSet(db, id) as Promise<ScenarioSet>;
}

export async function updateScenarioSet(
  db: D1Database,
  id: string,
  data: { name?: string; description?: string; is_active?: number }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active);
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await db
    .prepare(`UPDATE scenario_sets SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function deleteScenarioSet(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM scenario_sets WHERE id = ?').bind(id).run();
}

export async function createScenario(
  db: D1Database,
  data: {
    set_id: string;
    text: string;
    short_label?: string;
    category?: string;
    sort_order?: number;
  }
): Promise<Scenario> {
  const id = generateId();
  const sortOrder = data.sort_order ?? 0;

  await db
    .prepare(
      'INSERT INTO scenarios (id, set_id, text, short_label, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(id, data.set_id, data.text, data.short_label || null, data.category || null, sortOrder)
    .run();

  return db.prepare('SELECT * FROM scenarios WHERE id = ?').bind(id).first<Scenario>() as Promise<Scenario>;
}

export async function updateScenario(
  db: D1Database,
  id: string,
  data: {
    text?: string;
    short_label?: string;
    category?: string;
    sort_order?: number;
    is_active?: number;
  }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.text !== undefined) {
    updates.push('text = ?');
    values.push(data.text);
  }
  if (data.short_label !== undefined) {
    updates.push('short_label = ?');
    values.push(data.short_label || null);
  }
  if (data.category !== undefined) {
    updates.push('category = ?');
    values.push(data.category || null);
  }
  if (data.sort_order !== undefined) {
    updates.push('sort_order = ?');
    values.push(data.sort_order);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active);
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await db
    .prepare(`UPDATE scenarios SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function deleteScenario(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM scenarios WHERE id = ?').bind(id).run();
}

export async function reorderScenarios(
  db: D1Database,
  setId: string,
  orderedIds: string[]
): Promise<void> {
  const batch = orderedIds.map((id, index) =>
    db.prepare('UPDATE scenarios SET sort_order = ? WHERE id = ? AND set_id = ?').bind(index, id, setId)
  );
  await db.batch(batch);
}

export async function createRevealSlide(
  db: D1Database,
  data: {
    set_id: string;
    title: string;
    body?: string;
    image_url?: string;
    quote?: string;
    quote_author?: string;
    sort_order?: number;
  }
): Promise<RevealSlide> {
  const id = generateId();
  const sortOrder = data.sort_order ?? 0;

  await db
    .prepare(
      'INSERT INTO reveal_slides (id, set_id, title, body, image_url, quote, quote_author, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(
      id,
      data.set_id,
      data.title,
      data.body || null,
      data.image_url || null,
      data.quote || null,
      data.quote_author || null,
      sortOrder
    )
    .run();

  return db.prepare('SELECT * FROM reveal_slides WHERE id = ?').bind(id).first<RevealSlide>() as Promise<RevealSlide>;
}

export async function updateRevealSlide(
  db: D1Database,
  id: string,
  data: {
    title?: string;
    body?: string;
    image_url?: string;
    quote?: string;
    quote_author?: string;
    sort_order?: number;
  }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.body !== undefined) {
    updates.push('body = ?');
    values.push(data.body || null);
  }
  if (data.image_url !== undefined) {
    updates.push('image_url = ?');
    values.push(data.image_url || null);
  }
  if (data.quote !== undefined) {
    updates.push('quote = ?');
    values.push(data.quote || null);
  }
  if (data.quote_author !== undefined) {
    updates.push('quote_author = ?');
    values.push(data.quote_author || null);
  }
  if (data.sort_order !== undefined) {
    updates.push('sort_order = ?');
    values.push(data.sort_order);
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await db
    .prepare(`UPDATE reveal_slides SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function deleteRevealSlide(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM reveal_slides WHERE id = ?').bind(id).run();
}

export async function reorderRevealSlides(
  db: D1Database,
  setId: string,
  orderedIds: string[]
): Promise<void> {
  const batch = orderedIds.map((id, index) =>
    db.prepare('UPDATE reveal_slides SET sort_order = ? WHERE id = ? AND set_id = ?').bind(index, id, setId)
  );
  await db.batch(batch);
}

export async function createRoom(
  db: D1Database,
  data: { title: string; set_id: string; allow_insights?: boolean }
): Promise<Room> {
  const id = generateId();
  const code = generateRoomCode();

  await db
    .prepare(
      'INSERT INTO rooms (id, code, title, set_id, allow_insights) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(id, code, data.title, data.set_id, data.allow_insights ? 1 : 0)
    .run();

  return getRoom(db, id) as Promise<Room>;
}

export async function updateRoom(
  db: D1Database,
  id: string,
  data: { title?: string; allow_insights?: number; is_active?: number }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.allow_insights !== undefined) {
    updates.push('allow_insights = ?');
    values.push(data.allow_insights);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active);
    if (data.is_active === 0) {
      updates.push("closed_at = datetime('now')");
    }
  }

  values.push(id);

  await db
    .prepare(`UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function getOrCreateSession(db: D1Database, sessionId?: string): Promise<UserSession> {
  if (sessionId) {
    const existing = await db
      .prepare('SELECT * FROM user_sessions WHERE id = ?')
      .bind(sessionId)
      .first<UserSession>();
    if (existing) return existing;
  }

  const id = sessionId || generateId();
  await db.prepare('INSERT INTO user_sessions (id) VALUES (?)').bind(id).run();
  return { id, created_at: new Date().toISOString() };
}

export async function upsertAnswer(
  db: D1Database,
  data: {
    session_id: string;
    room_id: string;
    scenario_id: string;
    answer: number;
  }
): Promise<{ isNew: boolean; previousAnswer: number | null }> {
  // Check for existing answer
  const existing = await db
    .prepare(
      'SELECT * FROM user_answers WHERE session_id = ? AND room_id = ? AND scenario_id = ?'
    )
    .bind(data.session_id, data.room_id, data.scenario_id)
    .first<UserAnswer>();

  if (existing) {
    if (existing.answer === data.answer) {
      // Same answer, no change needed
      return { isNew: false, previousAnswer: existing.answer };
    }

    // Update existing answer
    await db
      .prepare(
        "UPDATE user_answers SET answer = ?, answered_at = datetime('now') WHERE id = ?"
      )
      .bind(data.answer, existing.id)
      .run();

    // Update aggregates (decrement old, increment new)
    await updateAggregates(db, data.room_id, data.scenario_id, existing.answer, data.answer);

    return { isNew: false, previousAnswer: existing.answer };
  }

  // Insert new answer
  const id = generateId();
  await db
    .prepare(
      'INSERT INTO user_answers (id, session_id, room_id, scenario_id, answer) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(id, data.session_id, data.room_id, data.scenario_id, data.answer)
    .run();

  // Update aggregates (increment new)
  await updateAggregates(db, data.room_id, data.scenario_id, null, data.answer);

  return { isNew: true, previousAnswer: null };
}

async function updateAggregates(
  db: D1Database,
  roomId: string,
  scenarioId: string,
  oldAnswer: number | null,
  newAnswer: number
): Promise<void> {
  // Ensure aggregate row exists
  await db
    .prepare(
      `INSERT INTO room_aggregates (id, room_id, scenario_id, yes_count, no_count)
       VALUES (?, ?, ?, 0, 0)
       ON CONFLICT (room_id, scenario_id) DO NOTHING`
    )
    .bind(generateId(), roomId, scenarioId)
    .run();

  // Build update query
  let yesChange = 0;
  let noChange = 0;

  // Decrement old answer
  if (oldAnswer === 1) yesChange -= 1;
  if (oldAnswer === 0) noChange -= 1;

  // Increment new answer
  if (newAnswer === 1) yesChange += 1;
  if (newAnswer === 0) noChange += 1;

  await db
    .prepare(
      `UPDATE room_aggregates 
       SET yes_count = yes_count + ?, no_count = no_count + ?, updated_at = datetime('now')
       WHERE room_id = ? AND scenario_id = ?`
    )
    .bind(yesChange, noChange, roomId, scenarioId)
    .run();
}

export async function deleteAnswer(
  db: D1Database,
  sessionId: string,
  roomId: string,
  scenarioId: string
): Promise<boolean> {
  const existing = await db
    .prepare(
      'SELECT * FROM user_answers WHERE session_id = ? AND room_id = ? AND scenario_id = ?'
    )
    .bind(sessionId, roomId, scenarioId)
    .first<UserAnswer>();

  if (!existing) return false;

  // Delete the answer
  await db.prepare('DELETE FROM user_answers WHERE id = ?').bind(existing.id).run();

  // Update aggregates (decrement)
  const yesChange = existing.answer === 1 ? -1 : 0;
  const noChange = existing.answer === 0 ? -1 : 0;

  await db
    .prepare(
      `UPDATE room_aggregates 
       SET yes_count = yes_count + ?, no_count = no_count + ?, updated_at = datetime('now')
       WHERE room_id = ? AND scenario_id = ?`
    )
    .bind(yesChange, noChange, roomId, scenarioId)
    .run();

  return true;
}
