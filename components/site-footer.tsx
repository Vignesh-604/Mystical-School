import Link from "next/link";
import { CORE_VALUES } from "@/lib/study-areas";
import { LogoMark } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const groups = [
  {
    label: "Explore",
    links: [
      ["/guide", "Sophia, your guide"],
      ["/courses", "Courses"],
      ["/retreats", "Retreats"],
      ["/community", "Community"],
    ],
  },
  {
    label: "The school",
    links: [
      ["/membership", "Membership"],
      ["/about-sophia", "How Sophia works"],
      ["/support", "If you need support now"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-28 overflow-hidden bg-night text-on-night">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-[radial-gradient(circle,rgb(201_154_74/0.18),transparent_65%)]" />
      <div className="relative mx-auto max-w-[76rem] px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <LogoMark className="size-12 text-on-night" />
            <p className="font-display mt-6 max-w-md text-[2.4rem] leading-[1.08]">
              The true measure of wisdom is the good it brings <em className="text-[#e2bd78]">into other lives.</em>
            </p>
          </div>
          {groups.map((g) => (
            <nav key={g.label} aria-label={g.label}>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#e2bd78]">{g.label}</p>
              <ul className="mt-5 space-y-3">
                {g.links.map(([href, name]) => (
                  <li key={href}>
                    <Link href={href} className="text-[0.95rem] text-on-night/75 transition-colors hover:text-on-night">
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <ul className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-8 font-display text-lg italic text-on-night/55">
          {CORE_VALUES.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-4 text-xs text-on-night/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© Mystical School · Local preview with sample content and simulated payments.</p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
