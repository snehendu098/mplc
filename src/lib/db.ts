import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
