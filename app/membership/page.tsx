import { Check } from "lucide-react";
import { startMembershipAction } from "@/app/actions/checkout";
import { Geometry } from "@/components/geometry";
import { PendingButton } from "@/components/pending-button";
import { Badge, Card, Container, LinkButton, PageHeader } from "@/components/ui";
import { currentUser } from "@/lib/auth/session";
import { shortDate } from "@/lib/format";
import { activeSubscription } from "@/lib/membership";
import { INITIATE_PRICES, PLAN_FEATURES, PLANS } from "@/lib/plans";

export const metadata = { title: "Membership" };

export default async function MembershipPage() {
  const user = await currentUser();
  const sub = user ? activeSubscription(user.id) : null;

  return (
    <Container className="py-14">
      <PageHeader eyebrow="Membership" title="Guidance at the depth you need">
        Everyone can begin free. The Initiate plan deepens your time with Sophia. Courses and retreats are separate, so you only pay
        for what serves you.
      </PageHeader>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col p-8">
          <p className="text-sm font-medium text-muted">{PLANS.seeker.name}</p>
          <p className="font-display mt-2 text-5xl font-semibold">Free</p>
          <p className="mt-2 text-muted">{PLANS.seeker.tagline}</p>
          <ul className="mt-8 space-y-3 text-[0.95rem]">
            {PLAN_FEATURES.map((f) => (
              <li key={f.label} className="flex gap-3">
                <Check className={`mt-0.5 size-4 shrink-0 ${f.seeker === "—" ? "text-line-strong" : "text-sage"}`} />
                <span>
                  <span className="text-ink">{f.label}</span>
                  <span className="block text-sm text-muted">{f.seeker}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-8">
            {user ? (
              !sub ? <Badge>Your current plan</Badge> : null
            ) : (
              <LinkButton href="/sign-up" variant="secondary">
                Begin free
              </LinkButton>
            )}
          </div>
        </Card>

        <Card className="relative flex flex-col overflow-hidden border-gold/40 p-8">
          <Geometry motif="flower" className="pointer-events-none absolute -right-16 -top-16 size-72 text-gold/15" strokeWidth={0.7} />
          <p className="text-sm font-medium text-gold">{PLANS.initiate.name}</p>
          <p className="font-display mt-2 text-5xl font-semibold">
            $19<span className="text-xl font-normal text-muted"> / month</span>
          </p>
          <p className="mt-2 text-muted">{PLANS.initiate.tagline} Or $190 a year (two months free).</p>
          <ul className="mt-8 space-y-3 text-[0.95rem]">
            {PLAN_FEATURES.map((f) => (
              <li key={f.label} className="flex gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>
                  <span className="text-ink">{f.label}</span>
                  <span className="block text-sm text-muted">{f.initiate}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-8">
            {sub ? (
              <div className="space-y-2">
                <Badge tone="gold">Your current plan</Badge>
                <p className="text-sm text-muted">
                  {sub.cancelAtPeriodEnd ? "Ends" : "Renews"} on {shortDate(sub.currentPeriodEnd)}.{" "}
                  <a href="/account" className="underline underline-offset-4">
                    Manage
                  </a>
                </p>
              </div>
            ) : user ? (
              <div className="flex flex-wrap gap-2">
                <form action={startMembershipAction}>
                  <input type="hidden" name="interval" value="month" />
                  <PendingButton variant="gold" pendingLabel="Opening checkout…">
                    Become an Initiate · {INITIATE_PRICES.month.label}
                  </PendingButton>
                </form>
                <form action={startMembershipAction}>
                  <input type="hidden" name="interval" value="year" />
                  <PendingButton variant="secondary" pendingLabel="Opening checkout…">
                    {INITIATE_PRICES.year.label}
                  </PendingButton>
                </form>
              </div>
            ) : (
              <LinkButton href="/sign-up" variant="gold">
                Join, then upgrade
              </LinkButton>
            )}
          </div>
        </Card>
      </div>
      <p className="mt-6 text-sm text-muted">
        Prices shown are placeholders for this local preview. Payments are simulated; cancel any time and keep access until the end of
        the period.
      </p>
    </Container>
  );
}
