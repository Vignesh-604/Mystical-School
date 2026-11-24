import fs from "node:fs";
import { closeDb, databaseFile } from "../lib/db";

// Deletes the local database so `npm run setup` can rebuild it. Local data only.
closeDb();
const file = databaseFile();
for (const f of [file, `${file}-wal`, `${file}-shm`]) {
  if (fs.existsSync(f)) fs.rmSync(f);
}
console.log(`Removed ${file}. Run \`npm run setup\` to recreate and seed it.`);
