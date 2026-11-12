// Numbers and dates the way the brand book writes them: plain and short.

/** 86 → "86", 1234 → "1.2k", 15000 → "15k". */
export function compact(n: number) {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k < 10 ? Math.round(k * 10) / 10 : Math.round(k)}k`;
}

/** 1 → "1 product", 12 → "12 products". */
export function plural(n: number, word: string) {
  return `${compact(n)} ${word}${n === 1 ? "" : "s"}`;
}

/** "01", "02", … for numbered lists. */
export function ordinal(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Relative wording up to a year, then month and year (screen inventory, decision 7):
 * "today", "yesterday", "3 days ago", "last week", "3 weeks ago", "last month",
 * "3 months ago", "Aug 2025".
 */
export function ago(iso: string, now: Date) {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "last week";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "last month";
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

/** The exact date, for the hover title on desktop. */
export function exactDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
