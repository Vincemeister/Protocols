// Readable addresses for lists and products: /vince.rehms/camera-bag-essentials/everyday-sling-6l
// Pure functions (no database), so they are unit-tested in tests/slug.test.ts.

/** A list may not shadow the profile tabs. */
export const RESERVED_LIST_SLUGS = ["products", "codes", "about"];

/** "Everyday Sling 6L" → "everyday-sling-6l". Accents are folded; anything else becomes a dash. */
export function slugify(text: string, fallback = "item") {
  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // the accents split off by NFKD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || fallback;
}

/** The slug itself when it is free, otherwise slug-2, slug-3, … */
export function uniqueSlug(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
}

export const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

/** A first suggestion for the username field, from a name or an email address. */
export function suggestUsername(from: string) {
  const base = from.split("@")[0].normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9._]+/g, ".").replace(/\.{2,}/g, ".").replace(/^\.+|\.+$/g, "").slice(0, 30);
  return base.length >= 3 ? base : "";
}
