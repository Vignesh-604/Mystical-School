import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { closeDb, databaseFile, getDb } from "../lib/db";

export function runMigrations() {
  migrate(getDb(), { migrationsFolder: path.resolve(process.cwd(), "lib/db/migrations") });
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("migrate.ts")) {
  runMigrations();
  console.log(`Database ready: ${path.relative(process.cwd(), databaseFile())}`);
  closeDb();
}
