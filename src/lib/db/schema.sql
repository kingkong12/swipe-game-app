-- Swipe Game Database Schema for Cloudflare D1

-- Scenario Sets (collections of scenarios)
CREATE TABLE IF NOT EXISTS scenario_sets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Scenarios (individual swipe questions)
CREATE TABLE IF NOT EXISTS scenarios (
  id TEXT PRIMARY KEY,
  set_id TEXT NOT NULL REFERENCES scenario_sets(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  short_label TEXT,
  category TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scenarios_set_id ON scenarios(set_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_sort ON scenarios(set_id, sort_order);

-- Reveal Slides (post-game slideshow)
CREATE TABLE IF NOT EXISTS reveal_slides (
  id TEXT PRIMARY KEY,
  set_id TEXT NOT NULL REFERENCES scenario_sets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  quote TEXT,
  quote_author TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reveal_slides_set ON reveal_slides(set_id, sort_order);

-- Rooms (game sessions)
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  set_id TEXT NOT NULL REFERENCES scenario_sets(id),
  allow_insights INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  closed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);

-- User Sessions (anonymous players)
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT (datetime('now'))
);

-- User Answers (individual responses - idempotent via unique constraint)
CREATE TABLE IF NOT EXISTS user_answers (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES user_sessions(id),
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id),
  answer INTEGER NOT NULL, -- 1 = YES, 0 = NO
  answered_at TEXT DEFAULT (datetime('now')),
  UNIQUE(session_id, room_id, scenario_id)
);

CREATE INDEX IF NOT EXISTS idx_user_answers_session ON user_answers(session_id, room_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_room ON user_answers(room_id, scenario_id);

-- Room Aggregates (pre-computed counts per scenario)
CREATE TABLE IF NOT EXISTS room_aggregates (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id),
  yes_count INTEGER DEFAULT 0,
  no_count INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(room_id, scenario_id)
);

CREATE INDEX IF NOT EXISTS idx_room_aggregates ON room_aggregates(room_id);
