export function money(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function dateRange(startIso: string, endIso: string): string {
  const s = new Date(startIso + "T12:00:00Z");
  const e = new Date(endIso + "T12:00:00Z");
  const sameYear = s.getUTCFullYear() === e.getUTCFullYear();
  const sameMonth = sameYear && s.getUTCMonth() === e.getUTCMonth();
  const day = (d: Date) => d.getUTCDate();
  const month = (d: Date) => d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  if (sameMonth) return `${day(s)}–${day(e)} ${month(s)} ${s.getUTCFullYear()}`;
  if (sameYear) return `${day(s)} ${month(s)} – ${day(e)} ${month(e)} ${s.getUTCFullYear()}`;
  return `${day(s)} ${month(s)} ${s.getUTCFullYear()} – ${day(e)} ${month(e)} ${e.getUTCFullYear()}`;
}

export function nights(startIso: string, endIso: string): number {
  return Math.round((Date.parse(endIso) - Date.parse(startIso)) / 86_400_000);
}

export function shortDate(d: Date | number): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function dateTime(d: Date | number): string {
  return new Date(d).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(d: Date | number): string {
  const diff = Date.now() - new Date(d).getTime();
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return diff > 0 ? `${m} min ago` : `in ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return diff > 0 ? `${h} h ago` : `in ${h} h`;
  const days = Math.round(h / 24);
  if (days < 14) return diff > 0 ? `${days} d ago` : `in ${days} d`;
  return shortDate(d);
}

export function minutes(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return m === 1 ? "1 minute" : `${m} minutes`;
}

export function plural(n: number, one: string, many = one + "s") {
  return `${n} ${n === 1 ? one : many}`;
}
