import { desc } from "drizzle-orm";
import { setRoleAction } from "@/app/actions/admin";
import { Badge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { shortDate } from "@/lib/format";
import { planFor } from "@/lib/membership";

export const metadata = { title: "Members · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMembers() {
  const me = await requireAdmin();
  const all = getDb()
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(500)
    .all();
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Member</th>
            <th className="px-4 py-3 font-medium">Plan</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {all.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3">
                {u.name}
                <span className="block text-xs text-muted">{u.email}</span>
              </td>
              <td className="px-4 py-3">{planFor(u.id) === "initiate" ? <Badge tone="gold">Initiate</Badge> : <Badge>Seeker</Badge>}</td>
              <td className="px-4 py-3 text-muted">{shortDate(u.createdAt)}</td>
              <td className="px-4 py-3">
                {u.id === me.id ? (
                  <Badge tone="indigo">admin (you)</Badge>
                ) : (
                  <form action={setRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="role" value={u.role === "admin" ? "member" : "admin"} />
                    <span className="text-ink-2">{u.role}</span>
                    <button className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-muted hover:bg-surface-2 hover:text-ink">
                      {u.role === "admin" ? "Make member" : "Make admin"}
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
