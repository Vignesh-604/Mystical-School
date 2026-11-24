"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { enrollmentFor } from "@/lib/courses";
import { getDb } from "@/lib/db";
import { courses, subscriptions } from "@/lib/db/schema";
import { audit } from "@/lib/audit";
import { activeSubscription } from "@/lib/membership";
import { cancelOrder, checkoutUrl, createOrder, fulfilOrder, PaymentError, subscriptionOrderRef } from "@/lib/payments";
import { INITIATE_PRICES } from "@/lib/plans";

export async function buyCourseAction(form: FormData) {
  const courseId = String(form.get("courseId") ?? "");
  const user = await requireUser();
  const course = getDb().select().from(courses).where(and(eq(courses.id, courseId), eq(courses.published, true))).get();
  if (!course) redirect("/courses");
  if (enrollmentFor(user.id, course.id)) redirect(`/courses/${course.slug}`);
  const order = createOrder({
    userId: user.id,
    kind: "course",
    refId: course.id,
    description: `Course: ${course.title}`,
    amountCents: course.priceCents,
  });
  redirect(checkoutUrl(order));
}

export async function startMembershipAction(form: FormData) {
  const interval = form.get("interval") === "year" ? "year" : "month";
  const user = await requireUser("/membership");
  const { refId, amountCents } = subscriptionOrderRef(interval);
  const order = createOrder({
    userId: user.id,
    kind: "subscription",
    refId,
    description: `Initiate membership (${INITIATE_PRICES[interval].label})`,
    amountCents,
  });
  redirect(checkoutUrl(order));
}

export async function cancelMembershipAction() {
  const user = await requireUser("/account");
  const sub = activeSubscription(user.id);
  if (sub) {
    getDb().update(subscriptions).set({ cancelAtPeriodEnd: true }).where(eq(subscriptions.id, sub.id)).run();
    audit(user.id, "subscription.cancel_requested", sub.id);
  }
  revalidatePath("/account");
  redirect("/account?saved=membership");
}

export async function resumeMembershipAction() {
  const user = await requireUser("/account");
  const sub = activeSubscription(user.id);
  if (sub) getDb().update(subscriptions).set({ cancelAtPeriodEnd: false }).where(eq(subscriptions.id, sub.id)).run();
  revalidatePath("/account");
  redirect("/account");
}

export type CheckoutState = { error?: string } | undefined;

export async function completeTestPaymentAction(_prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const user = await requireUser();
  const orderId = String(form.get("orderId") ?? "");
  let order;
  try {
    order = fulfilOrder(orderId, user.id);
  } catch (err) {
    return { error: err instanceof PaymentError ? err.message : "Payment couldn't be completed." };
  }
  revalidatePath("/", "layout");
  redirect(`/checkout/${order.id}/done`);
}

export async function cancelCheckoutAction(form: FormData) {
  const user = await requireUser();
  const orderId = String(form.get("orderId") ?? "");
  const back = String(form.get("back") ?? "/");
  cancelOrder(orderId, user.id);
  redirect(back.startsWith("/") && !back.startsWith("//") ? back : "/");
}
