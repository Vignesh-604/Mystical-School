import Link from "next/link";
import { CORE_VALUES } from "@/lib/study-areas";
import { Geometry } from "./geometry";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Geometry motif="seed" className="size-7 text-gold" strokeWidth={1.4} />
            <span className="font-display text-xl font-semibold">Mystical School</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            &ldquo;The true measure of mystical knowledge is how much love, wisdom, harmony and goodness one brings into
            the lives of others.&rdquo;
          </p>
          <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            {CORE_VALUES.map((v) => (
              <span key={v}>{v}</span>
            ))}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">The school</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href="/guide">Sophia, your guide</Link></li>
            <li><Link className="hover:text-ink" href="/courses">Courses</Link></li>
            <li><Link className="hover:text-ink" href="/retreats">Retreats</Link></li>
            <li><Link className="hover:text-ink" href="/community">Community</Link></li>
            <li><Link className="hover:text-ink" href="/membership">Membership</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Care</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href="/about-sophia">How Sophia works</Link></li>
            <li><Link className="hover:text-ink" href="/support">If you need support now</Link></li>
          </ul>
          <p className="mt-6 rounded-lg border border-dashed border-line-strong px-3 py-2 text-xs text-muted">
            Local preview. Content is sample material and payments are simulated.
          </p>
        </div>
      </div>
    </footer>
  );
}
