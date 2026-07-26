import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Determine where to store the DB. In development, project root is fine.
const dbDir = path.join(process.cwd(), ".nexus_data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "nexus.db");

// Singleton connection
let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    db = new Database(dbPath, { verbose: console.log });
    db.pragma("journal_mode = WAL"); // Better concurrency
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  // Initialization of enterprise tables
  const createTables = `
    CREATE TABLE IF NOT EXISTS owner (
      id TEXT PRIMARY KEY,
      master_password_hash TEXT NOT NULL,
      face_data_hash TEXT,
      voice_data_hash TEXT,
      setup_completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      device_id TEXT,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(owner_id) REFERENCES owner(id)
    );

    CREATE TABLE IF NOT EXISTS trusted_devices (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      device_name TEXT NOT NULL,
      device_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(owner_id) REFERENCES owner(id)
    );

    CREATE TABLE IF NOT EXISTS vault_files (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      extension TEXT,
      path TEXT NOT NULL,
      size INTEGER,
      is_encrypted INTEGER DEFAULT 1,
      is_pinned INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      is_hidden INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(owner_id) REFERENCES owner(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(owner_id) REFERENCES owner(id)
    );
  `;

  database.exec(createTables);
}
