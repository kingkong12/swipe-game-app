// Cloudflare D1 Database Utilities
import { nanoid } from 'nanoid';

// Types
export interface Scenario {
  id: string;
  set_id: string;
  text: string;
  short_label: string | null;
  category: string | null;
  sort_order: number;
  is_active: number;
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
}

export interface Room {
  id: string;
  code: string;
  title: string;
  set_id: string;
  allow_insights: number;
  is_active: number;
  created_at: string;
}

export interface UserAnswer {
  id: string;
  session_id: string;
  room_id: string;
  scenario_id: string;
  answer: number; // 1 = yes, 0 = no
  answered_at: string;
}

export interface RoomAggregate {
  room_id: string;
  scenario_id: string;
  yes_count: number;
  no_count: number;
}

// Generate IDs
export function generateId(): string {
  return nanoid(12);
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Database query helpers (for use in API routes with D1 binding)
export class SwipeDB {
  constructor(private db: D1Database) {}

  // ============ Scenarios ============
  async getActiveScenarios(setId: string = 'default'): Promise<Scenario[]> {
    const result = await this.db
      .prepare('SELECT * FROM scenarios WHERE set_id = ? AND is_active = 1 ORDER BY sort_order')
      .bind(setId)
      .all<Scenario>();
    return result.results || [];
  }

  async getAllScenarios(setId: string = 'default'): Promise<Scenario[]> {
    const result = await this.db
      .prepare('SELECT * FROM scenarios WHERE set_id = ? ORDER BY sort_order')
      .bind(setId)
      .all<Scenario>();
    return result.results || [];
  }

  async createScenario(data: Omit<Scenario, 'id'>): Promise<Scenario> {
    const id = generateId();
    await this.db
      .prepare(
        'INSERT INTO scenarios (id, set_id, text, short_label, category, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, data.set_id, data.text, data.short_label, data.category, data.sort_order, data.is_active)
      .run();
    return { id, ...data };
  }

  async updateScenario(id: string, data: Partial<Scenario>): Promise<void> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.text !== undefined) { updates.push('text = ?'); values.push(data.text); }
    if (data.short_label !== undefined) { updates.push('short_label = ?'); values.push(data.short_label); }
    if (data.category !== undefined) { updates.push('category = ?'); values.push(data.category); }
    if (data.sort_order !== undefined) { updates.push('sort_order = ?'); values.push(data.sort_order); }
    if (data.is_active !== undefined) { updates.push('is_active = ?'); values.push(data.is_active); }

    if (updates.length > 0) {
      values.push(id);
      await this.db
        .prepare(`UPDATE scenarios SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`)
        .bind(...values)
        .run();
    }
  }

  async deleteScenario(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM scenarios WHERE id = ?').bind(id).run();
  }

  // ============ Reveal Slides ============
  async getRevealSlides(setId: string = 'default'): Promise<RevealSlide[]> {
    const result = await this.db
      .prepare('SELECT * FROM reveal_slides WHERE set_id = ? ORDER BY sort_order')
      .bind(setId)
      .all<RevealSlide>();
    return result.results || [];
  }

  async createRevealSlide(data: Omit<RevealSlide, 'id'>): Promise<RevealSlide> {
    const id = generateId();
    await this.db
      .prepare(
        'INSERT INTO reveal_slides (id, set_id, title, body, image_url, quote, quote_author, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, data.set_id, data.title, data.body, data.image_url, data.quote, data.quote_author, data.sort_order)
      .run();
    return { id, ...data };
  }

  async updateRevealSlide(id: string, data: Partial<RevealSlide>): Promise<void> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
    if (data.body !== undefined) { updates.push('body = ?'); values.push(data.body); }
    if (data.image_url !== undefined) { updates.push('image_url = ?'); values.push(data.image_url); }
    if (data.quote !== undefined) { updates.push('quote = ?'); values.push(data.quote); }
    if (data.quote_author !== undefined) { updates.push('quote_author = ?'); values.push(data.quote_author); }
    if (data.sort_order !== undefined) { updates.push('sort_order = ?'); values.push(data.sort_order); }

    if (updates.length > 0) {
      values.push(id);
      await this.db
        .prepare(`UPDATE reveal_slides SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`)
        .bind(...values)
        .run();
    }
  }

  async deleteRevealSlide(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM reveal_slides WHERE id = ?').bind(id).run();
  }

  // ============ Rooms ============
  async getRoomByCode(code: string): Promise<Room | null> {
    const result = await this.db
      .prepare('SELECT * FROM rooms WHERE code = ? AND is_active = 1')
      .bind(code)
      .first<Room>();
    return result || null;
  }

  async getAllRooms(): Promise<Room[]> {
    const result = await this.db
      .prepare('SELECT * FROM rooms ORDER BY created_at DESC')
      .all<Room>();
    return result.results || [];
  }

  async createRoom(title: string, setId: string = 'default'): Promise<Room> {
    const id = generateId();
    const code = generateRoomCode();
    await this.db
      .prepare(
        'INSERT INTO rooms (id, code, title, set_id, allow_insights, is_active) VALUES (?, ?, ?, ?, 1, 1)'
      )
      .bind(id, code, title, setId)
      .run();
    
    const room = await this.db.prepare('SELECT * FROM rooms WHERE id = ?').bind(id).first<Room>();
    return room!;
  }

  async closeRoom(id: string): Promise<void> {
    await this.db
      .prepare("UPDATE rooms SET is_active = 0, closed_at = datetime('now') WHERE id = ?")
      .bind(id)
      .run();
  }

  // ============ User Sessions ============
  async ensureSession(sessionId: string): Promise<void> {
    await this.db
      .prepare('INSERT OR IGNORE INTO user_sessions (id) VALUES (?)')
      .bind(sessionId)
      .run();
  }

  // ============ Answers ============
  async upsertAnswer(
    sessionId: string,
    roomId: string,
    scenarioId: string,
    answer: 'yes' | 'no'
  ): Promise<{ previousAnswer: 'yes' | 'no' | null }> {
    await this.ensureSession(sessionId);

    // Check for existing answer
    const existing = await this.db
      .prepare('SELECT answer FROM user_answers WHERE session_id = ? AND room_id = ? AND scenario_id = ?')
      .bind(sessionId, roomId, scenarioId)
      .first<{ answer: number }>();

    const previousAnswer = existing ? (existing.answer === 1 ? 'yes' : 'no') : null;
    const answerValue = answer === 'yes' ? 1 : 0;

    if (existing) {
      // Update existing answer
      await this.db
        .prepare(
          "UPDATE user_answers SET answer = ?, answered_at = datetime('now') WHERE session_id = ? AND room_id = ? AND scenario_id = ?"
        )
        .bind(answerValue, sessionId, roomId, scenarioId)
        .run();
    } else {
      // Insert new answer
      const id = generateId();
      await this.db
        .prepare(
          'INSERT INTO user_answers (id, session_id, room_id, scenario_id, answer) VALUES (?, ?, ?, ?, ?)'
        )
        .bind(id, sessionId, roomId, scenarioId, answerValue)
        .run();
    }

    // Update aggregates
    await this.updateAggregates(roomId, scenarioId, answer, previousAnswer);

    return { previousAnswer };
  }

  async removeAnswer(sessionId: string, roomId: string, scenarioId: string): Promise<void> {
    const existing = await this.db
      .prepare('SELECT answer FROM user_answers WHERE session_id = ? AND room_id = ? AND scenario_id = ?')
      .bind(sessionId, roomId, scenarioId)
      .first<{ answer: number }>();

    if (existing) {
      const previousAnswer = existing.answer === 1 ? 'yes' : 'no';

      await this.db
        .prepare('DELETE FROM user_answers WHERE session_id = ? AND room_id = ? AND scenario_id = ?')
        .bind(sessionId, roomId, scenarioId)
        .run();

      // Update aggregates (decrement)
      await this.updateAggregates(roomId, scenarioId, null, previousAnswer);
    }
  }

  async getSessionAnswers(
    sessionId: string,
    roomId: string
  ): Promise<{ scenarioId: string; answer: 'yes' | 'no' }[]> {
    const result = await this.db
      .prepare('SELECT scenario_id, answer FROM user_answers WHERE session_id = ? AND room_id = ?')
      .bind(sessionId, roomId)
      .all<{ scenario_id: string; answer: number }>();

    return (result.results || []).map((r) => ({
      scenarioId: r.scenario_id,
      answer: r.answer === 1 ? 'yes' : 'no',
    }));
  }

  // ============ Aggregates ============
  private async updateAggregates(
    roomId: string,
    scenarioId: string,
    newAnswer: 'yes' | 'no' | null,
    previousAnswer: 'yes' | 'no' | null
  ): Promise<void> {
    // Ensure aggregate row exists
    await this.db
      .prepare(
        'INSERT OR IGNORE INTO room_aggregates (id, room_id, scenario_id, yes_count, no_count) VALUES (?, ?, ?, 0, 0)'
      )
      .bind(generateId(), roomId, scenarioId)
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
      await this.db
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

  async getRoomAggregates(roomId: string): Promise<Record<string, { yes: number; no: number }>> {
    const result = await this.db
      .prepare('SELECT scenario_id, yes_count, no_count FROM room_aggregates WHERE room_id = ?')
      .bind(roomId)
      .all<{ scenario_id: string; yes_count: number; no_count: number }>();

    const aggregates: Record<string, { yes: number; no: number }> = {};
    for (const row of result.results || []) {
      aggregates[row.scenario_id] = { yes: row.yes_count, no: row.no_count };
    }
    return aggregates;
  }

  // ============ Global Aggregates (for demo mode) ============
  async getGlobalAggregates(): Promise<Record<string, { yes: number; no: number }>> {
    const result = await this.db
      .prepare(
        `SELECT scenario_id, SUM(yes_count) as yes_count, SUM(no_count) as no_count 
         FROM room_aggregates GROUP BY scenario_id`
      )
      .all<{ scenario_id: string; yes_count: number; no_count: number }>();

    const aggregates: Record<string, { yes: number; no: number }> = {};
    for (const row of result.results || []) {
      aggregates[row.scenario_id] = { yes: row.yes_count, no: row.no_count };
    }
    return aggregates;
  }
}

// D1Database types are provided by @cloudflare/workers-types
