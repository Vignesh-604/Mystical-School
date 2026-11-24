import { requireAdmin } from "@/lib/auth/session";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { Card } from "@/components/ui";
import { getDb } from "@/lib/db";
import { auditLog, bookings, enrollments, guideMessages, orders, reports, subscriptions, users } from "@/lib/db/schema";
import { money, relativeTime } from "@/lib/format";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

function count(q: { get: () => { n: number } | undefined }) {
  return Number(q.get()?.n ?? 0);
}

export default async function AdminOverview() {
  await requireAdmin();
  const db = getDb();
  const n = sql<number>`count(*)`;
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const stats = [
    { label: "Members", value: count(db.select({ n }).from(users)) },
    {
      label: "Initiates",
      value: count(db.select({ n }).from(subscriptions).where(and(eq(subscriptions.status, "active"), gt(subscriptions.currentPeriodEnd, new Date())))),
    },
    { label: "Enrolments", value: count(db.select({ n }).from(enrollments)) },
    { label: "Confirmed bookings", value: count(db.select({ n }).from(bookings).where(eq(bookings.status, "confirmed"))) },
    { label: "Guide messages this week", value: count(db.select({ n }).from(guideMessages).where(and(eq(guideMessages.role, "user"), gt(guideMessages.createdAt, weekAgo)))) },
    { label: "Safety flags this week", value: count(db.select({ n }).from(guideMessages).where(and(sql`${guideMessages.safetyFlag} is not null`, gt(guideMessages.createdAt, weekAgo)))) },
    { label: "Open reports", value: count(db.select({ n }).from(reports).where(eq(reports.status, "open"))) },
    {
      label: "Test revenue (all time)",
      value: money(Number(db.select({ s: sql<number>`coalesce(sum(${orders.amountCents}), 0)` }).from(orders).where(eq(orders.status, "paid")).get()?.s ?? 0)),
    },
  ];
  const recentOrders = db
    .select({ o: orders, name: users.name })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .where(eq(orders.status, "paid"))
    .orderBy(desc(orders.paidAt))
    .limit(8)
    .all();
  const log = db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(15).all();

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="font-display mt-1 text-3xl font-semibold tabular-nums">{s.value}</p>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted">
        Safety flags count messages the screen matched (self-harm, harm from others, medical). Content isn&rsquo;t shown here; open the
        member&rsquo;s record only with a clear reason.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold">Recent payments</h2>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface text-sm">
            {recentOrders.length ? (
              recentOrders.map(({ o, name }) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span>
                    <span className="block text-ink">{o.description}</span>
                    <span className="block text-xs text-muted">
                      {name} · {o.paidAt ? relativeTime(o.paidAt) : ""}
                    </span>
                  </span>
                  <span className="font-medium">{money(o.amountCents)}</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-muted">No payments yet.</li>
            )}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold">Activity log</h2>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface font-mono text-xs">
            {log.map((e) => (
              <li key={e.id} className="flex justify-between gap-3 px-4 py-2.5">
                <span className="truncate text-ink-2">{e.action}</span>
                <span className="shrink-0 text-muted">{relativeTime(e.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
