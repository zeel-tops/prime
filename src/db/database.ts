import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface RevokedToken {
  token: string;
  revoked_at: string;
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}

export function initDb(dbPath: string = ":memory:"): Database.Database {
  if (dbPath !== ":memory:") {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS revoked_tokens (
      token TEXT PRIMARY KEY,
      revoked_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function findUserByEmail(email: string): User | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as User | undefined;
}

export function createUser(email: string, passwordHash: string): User {
  const stmt = getDb().prepare(
    "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING *"
  );
  return stmt.get(email, passwordHash) as User;
}

export function revokeToken(token: string): void {
  getDb()
    .prepare("INSERT OR IGNORE INTO revoked_tokens (token) VALUES (?)")
    .run(token);
}

export function isTokenRevoked(token: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM revoked_tokens WHERE token = ?")
    .get(token);
  return row !== undefined;
}
