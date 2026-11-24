import { requireAdmin } from "@/lib/auth/session";
import { asc, desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui";
import { getDb } from "@/lib/db";
import { bookings, retreatRooms, retreats, users } from "@/lib/db/schema";
import { dateRange, money } from "@/lib/format";
import { getRetreat } from "@/lib/retreats";

export const metadata = { title: "Bookings · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminBookings() {
  await requireAdmin();
  const db = getDb();
  const all = db.select().from(retreats).orderBy(asc(retreats.startDate)).all();
  return (
    <div className="space-y-12">
      {all.map((r) => {
        const detail = getRetreat(r.slug);
        const rows = db
          .select({ b: bookings, guest: users.name, email: users.email, room: retreatRooms.name })
          .from(bookings)
          .innerJoin(users, eq(users.id, bookings.userId))
          .innerJoin(retreatRooms, eq(retreatRooms.id, bookings.roomId))
          .where(eq(bookings.retreatId, r.id))
          .orderBy(desc(bookings.createdAt))
          .all()
          .filter((x) => x.b.status === "confirmed" || x.b.status === "cancelled");
        return (
          <section key={r.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-3xl">{r.title}</h2>
              <p className="text-sm text-muted">
                {r.location} · {dateRange(r.startDate, r.endDate)}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {detail?.rooms.map((room) => (
                <Badge key={room.id} tone={room.remaining === 0 ? "rose" : "neutral"}>
                  {room.name}: {room.capacity - room.remaining}/{room.capacity}
                </Badge>
              ))}
            </div>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Ref</th>
                    <th className="px-4 py-3 font-medium">Guest</th>
                    <th className="px-4 py-3 font-medium">Room</th>
                    <th className="px-4 py-3 font-medium">Guests</th>
                    <th className="px-4 py-3 font-medium">Paid / total</th>
                    <th className="px-4 py-3 font-medium">Needs</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.length ? (
                    rows.map(({ b, guest, email, room }) => (
                      <tr key={b.id}>
                        <td className="px-4 py-3 font-mono text-xs">{b.reference}</td>
                        <td className="px-4 py-3">
                          {guest}
                          <span className="block text-xs text-muted">{email}</span>
                        </td>
                        <td className="px-4 py-3">{room}</td>
                        <td className="px-4 py-3">{b.guests}</td>
                        <td className="px-4 py-3 tabular-nums">
                          {money(b.paidCents)} / {money(b.totalCents)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">
                          {[b.contact.dietary, b.contact.accessibility].filter(Boolean).join(" · ") || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={b.status === "confirmed" ? "sage" : "neutral"}>{b.status}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-muted">
                        No bookings yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

