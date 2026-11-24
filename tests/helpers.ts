import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getDb } from "../lib/db";
import * as s from "../lib/db/schema";
import { newId } from "../lib/ids";
import { runMigrations } from "../scripts/migrate";

/** A fresh SQLite file per test file (the runner isolates files in separate processes). */
export function freshDb(name: string) {
  const file = path.join(os.tmpdir(), `mystical-test-${name}-${process.pid}.db`);
  for (const f of [file, `${file}-wal`, `${file}-shm`]) if (fs.existsSync(f)) fs.rmSync(f);
  process.env.DATABASE_PATH = file;
  process.env.PAYMENTS_PROVIDER = "local-test";
  runMigrations();
  return getDb();
}

export function makeUser(name = "Test Member") {
  const id = newId("usr");
  getDb()
    .insert(s.users)
    .values({ id, email: `${id}@test.local`, name, passwordHash: "x" })
    .run();
  getDb().insert(s.journeys).values({ userId: id }).run();
  return id;
}

export function makeRetreat(opts: { capacity: number; maxPerBooking?: number; startDate?: string }) {
  const retreatId = newId("rtr");
  const roomId = newId("rom");
  getDb()
    .insert(s.retreats)
    .values({
      id: retreatId,
      slug: retreatId,
      title: "Test Retreat",
      summary: "s",
      description: "d",
      location: "Here",
      country: "There",
      studyArea: "meditation",
      startDate: opts.startDate ?? "2099-01-10",
      endDate: "2099-01-15",
      hostName: "Host",
      itinerary: [],
      includes: [],
      notIncluded: [],
      cancellationPolicy: "p",
    })
    .run();
  getDb()
    .insert(s.retreatRooms)
    .values({ id: roomId, retreatId, name: "Room", description: "r", priceCents: 100000, capacity: opts.capacity, maxGuestsPerBooking: opts.maxPerBooking ?? 4 })
    .run();
  return { retreatId, roomId };
}

export function makeCourse(priceCents = 5000) {
  const id = newId("crs");
  getDb()
    .insert(s.courses)
    .values({
      id,
      slug: id,
      title: "Test Course",
      subtitle: "s",
      description: "d",
      studyArea: "meditation",
      level: "foundation",
      priceCents,
      teacherName: "T",
      teacherBio: "b",
      durationLabel: "1 week",
      outcomes: [],
    })
    .run();
  return id;
}
