import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

export type DB = BetterSQLite3Database<typeof schema>;

type Holder = { sqlite: Database.Database; db: DB; file: string };

const globalForDb = globalThis as unknown as { __mysticalDb?: Holder };

export function databaseFile(): string {
  return path.resolve(process.cwd(), process.env.DATABASE_PATH ?? "./data/mystical-school.db");
}

function open(file: string): Holder {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  return { sqlite, db: drizzle(sqlite, { schema }), file };
}

/** One connection per process (survives Next.js dev reloads). */
export function getDb(): DB {
  const file = databaseFile();
  if (!globalForDb.__mysticalDb || globalForDb.__mysticalDb.file !== file) {
    globalForDb.__mysticalDb = open(file);
  }
  return globalForDb.__mysticalDb.db;
}

export function getSqlite(): Database.Database {
  getDb();
  return globalForDb.__mysticalDb!.sqlite;
}

export function closeDb() {
  globalForDb.__mysticalDb?.sqlite.close();
  globalForDb.__mysticalDb = undefined;
}

export { schema };
