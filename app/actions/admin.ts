"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { comments, posts, projectUpdates, reports, users } from "@/lib/db/schema";

export async function resolveReportAction(form: FormData) {
  const admin = await requireAdmin();
  const reportId = String(form.get("reportId") ?? "");
  const decision = form.get("decision") === "hide" ? "hide" : "dismiss";
  const db = getDb();
  const report = db.select().from(reports).where(eq(reports.id, reportId)).get();
  if (!report || report.status !== "open") return;
  if (decision === "hide") {
    if (report.targetType === "post") db.update(posts).set({ hidden: true }).where(eq(posts.id, report.targetId)).run();
    if (report.targetType === "comment") db.update(comments).set({ hidden: true }).where(eq(comments.id, report.targetId)).run();
    if (report.targetType === "project_update") db.update(projectUpdates).set({ hidden: true }).where(eq(projectUpdates.id, report.targetId)).run();
  }
  db.update(reports)
    .set({ status: decision === "hide" ? "actioned" : "dismissed", resolvedBy: admin.id })
    .where(eq(reports.id, reportId))
    .run();
  audit(admin.id, `report.${decision === "hide" ? "actioned" : "dismissed"}`, report.targetId, { targetType: report.targetType });
  revalidatePath("/admin", "layout");
  revalidatePath("/community", "layout");
}

export async function setRoleAction(form: FormData) {
  const admin = await requireAdmin();
  const userId = String(form.get("userId") ?? "");
  const role = form.get("role") === "admin" ? "admin" : "member";
  if (userId === admin.id) return; // Never demote yourself by accident.
  getDb().update(users).set({ role }).where(eq(users.id, userId)).run();
  audit(admin.id, "user.role_changed", userId, { role });
  revalidatePath("/admin/members");
}
