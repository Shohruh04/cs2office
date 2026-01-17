import initSqlJs, { Database } from 'sql.js';

type SqlJsDatabase = Database;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/fizmasoft_cs.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: SqlJsDatabase;

// Initialize database
export async function initDatabase(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  try {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  } catch {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      steam_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      avatar_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      map TEXT NOT NULL,
      mode TEXT,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      team_ct_score INTEGER NOT NULL DEFAULT 0,
      team_t_score INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ongoing',
      rounds_played INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS match_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      team TEXT NOT NULL,
      kills INTEGER NOT NULL DEFAULT 0,
      deaths INTEGER NOT NULL DEFAULT 0,
      assists INTEGER NOT NULL DEFAULT 0,
      headshots INTEGER NOT NULL DEFAULT 0,
      mvps INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0,
      damage INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      round_number INTEGER NOT NULL,
      winner_team TEXT,
      win_reason TEXT,
      bomb_planted INTEGER NOT NULL DEFAULT 0,
      bomb_defused INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS round_kills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
      match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      killer_player_id INTEGER REFERENCES players(id),
      victim_player_id INTEGER NOT NULL REFERENCES players(id),
      weapon TEXT NOT NULL,
      headshot INTEGER NOT NULL DEFAULT 0,
      wallbang INTEGER NOT NULL DEFAULT 0,
      noscope INTEGER NOT NULL DEFAULT 0,
      through_smoke INTEGER NOT NULL DEFAULT 0,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_match_players_match ON match_players(match_id);
    CREATE INDEX IF NOT EXISTS idx_match_players_player ON match_players(player_id);
    CREATE INDEX IF NOT EXISTS idx_rounds_match ON rounds(match_id);
    CREATE INDEX IF NOT EXISTS idx_round_kills_round ON round_kills(round_id);
    CREATE INDEX IF NOT EXISTS idx_round_kills_match ON round_kills(match_id);
  `);

  console.log('Database initialized successfully');
  saveDatabase();
  return db;
}

// Save database to file
export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Get database instance
export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Helper function to run a query and get results as objects
export function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

// Helper function to run a query and get first result
export function queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | null {
  const results = query<T>(sql, params);
  return results[0] || null;
}

// Helper function to run an insert/update/delete
export function run(sql: string, params: unknown[] = []): { changes: number; lastInsertRowId: number } {
  db.run(sql, params);
  const changes = db.getRowsModified();
  const lastId = query<{ id: number }>('SELECT last_insert_rowid() as id')[0]?.id || 0;
  saveDatabase();
  return { changes, lastInsertRowId: lastId };
}

export { db };
