import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "../../voteblock.db");

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    options TEXT NOT NULL,
    created_by TEXT NOT NULL,
    ends_at INTEGER,
    is_open INTEGER DEFAULT 1,
    head_hash TEXT NOT NULL,
    total_votes INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vote_blocks (
    id TEXT PRIMARY KEY,
    block_index INTEGER NOT NULL,
    poll_id TEXT NOT NULL,
    voter_id TEXT NOT NULL,
    choice TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    previous_hash TEXT NOT NULL,
    hash TEXT UNIQUE NOT NULL,
    nonce TEXT NOT NULL,
    UNIQUE(poll_id, voter_id)
  );
`);

// Migration: add role column if it doesn't exist
const userColumns = db.pragma("table_info(users)") as any[];
if (!userColumns.some((col: any) => col.name === "role")) {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
}

console.log("SQLite database ready!");

export default db;
