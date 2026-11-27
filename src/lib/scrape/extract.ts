// Reads a product out of a web page: name, brand, pictures, canonical link.
// Pure functions over strings (no network), unit-tested in tests/extract.test.ts.
//
// Order of trust (build brief, section 2): JSON-LD Product data, then Open
// Graph / Twitter tags, then site-specific markup (Amazon), then <title>.
// Regular expressions rather than an HTML parser: we only need <meta>, <title>
// and <script type="application/ld+json">, and it keeps the server route small.

export interface ProductDetails {
  name: string;
  brand?: string;
  /** Absolute https addresses, best first, at most eight. */
  images: string[];
  /** The address to keep: the page's canonical link when it has one. */
  url: string;
  /** "peakdesign.com" */
  domain: string;
  /** The brand's own logo or the shop's icon, when the page offers one (never for a marketplace, which is not the brand). */
  logo?: string;
  /** A book's "brand" is its author; the form labels the field accordingly. */
  kind?: "book";
  /** True when the page itself could not be read and this was pieced together from the address (Amazon). The form says so. */
  partial?: boolean;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", reg: "®", trade: "™" };

export function decodeEntities(text: string) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (whole, name) => ENTITIES[name.toLowerCase()] ?? whole);
}

const clean = (text: string | undefined | null) => (text ? decodeEntities(text).replace(/\s+/g, " ").trim() : "");

/** "www.peakdesign.com" → "peakdesign.com" */
export function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^(www|m|smile)\./, "");
  } catch {
    return "";
  }
}

/** The attributes of one tag, lower-cased names. */
function attributes(tag: string) {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return out;
}

/** Every <meta property|name|itemprop="…" content="…">, keys lower-cased; a key may repeat (og:image). */
export function metaTags(html: string) {
  const out = new Map<string, string[]>();
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attributes(m[0]);
    const key = (a.property || a.name || a.itemprop || "").toLowerCase();
    const value = clean(a.content);
    if (!key || !value) continue;
    out.set(key, [...(out.get(key) ?? []), value]);
  }
  return out;
}

type Json = Record<string, unknown>;

/** Every object inside the page's JSON-LD blocks, @graph and arrays flattened. */
export function jsonLd(html: string): Json[] {
  const found: Json[] = [];
  const walk = (node: unknown, depth = 0) => {
    if (!node || depth > 6) return;
    if (Array.isArray(node)) return node.forEach((n) => walk(n, depth + 1));
    if (typeof node !== "object") return;
    const obj = node as Json;
    found.push(obj);
    if (obj["@graph"]) walk(obj["@graph"], depth + 1);
    if (obj.mainEntity) walk(obj.mainEntity, depth + 1);
  };
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walk(JSON.parse(m[1].trim()));
    } catch {
      // Broken JSON-LD is common; the other sources still apply.
    }
  }
  return found;
}

const typesOf = (obj: Json) => ([] as unknown[]).concat(obj["@type"] ?? []).map((t) => String(t).toLowerCase());
const PRODUCT_TYPES = ["product", "productgroup", "softwareapplication", "mobileapplication", "webapplication", "book", "videogame", "course"];

function textOf(value: unknown): string {
  if (typeof value === "string") return clean(value);
  if (Array.isArray(value)) return textOf(value[0]);
  if (value && typeof value === "object") return textOf((value as Json).name);
  return "";
}

function imagesOf(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(imagesOf);
  if (value && typeof value === "object") return imagesOf((value as Json).url ?? (value as Json).contentUrl);
  return [];
}

/** Absolute https addresses, in order, without repeats, data: links or tracking pixels. */
export function tidyImages(candidates: string[], base: string) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of candidates) {
    let url: URL;
    try {
      url = new URL(decodeEntities(raw.trim()), base);
    } catch {
      continue;
    }
    if (url.protocol === "http:") url.protocol = "https:";
    if (url.protocol !== "https:") continue;
    if (/\.(svg|ico)(\?|$)/i.test(url.pathname)) continue;
    const key = url.origin + url.pathname;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url.toString());
    if (out.length === 8) break;
  }
  return out;
}

/** "Everyday Sling 6L | Peak Design" → "Everyday Sling 6L" when the tail is the site's own name. */
export function stripSiteName(title: string, siteNames: string[]) {
  const names = siteNames.map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, "")).filter(Boolean);
  const parts = title.split(/\s+[|–—·:-]\s+/);
  if (parts.length < 2) return title;
  const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  // The tail may carry extra words ("Peak Design Official Site"); the head must be the site name itself,
  // or "Sony WH-1000XM5 - Black" would lose its product name.
  const matches = (s: string, loose: boolean) => {
    const q = squash(s);
    return q.length > 2 && names.some((n) => n === q || n.startsWith(q) || (loose && (q.startsWith(n) || q.endsWith(n))));
  };
  if (matches(parts[parts.length - 1], true)) return parts.slice(0, -1).join(" – ");
  if (matches(parts[0], false)) return parts.slice(1).join(" – ");
  return title;
}

/** Amazon keeps the good data in its own markup rather than in tags. */
function amazon(html: string) {
  const title = clean(html.match(/<span[^>]*id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i)?.[1]);
  const byline = clean(html.match(/<a[^>]*id=["']bylineInfo["'][^>]*>([\s\S]*?)<\/a>/i)?.[1]);
  const brand = byline.replace(/^Visit the\s+/i, "").replace(/\s+Store$/i, "").replace(/^Brand:\s*/i, "");
  const images: string[] = [];
  const hires = html.match(/data-old-hires=["']([^"']+)["']/i)?.[1];
  if (hires) images.push(hires);
  const dynamic = html.match(/data-a-dynamic-image=["']([^"']+)["']/i)?.[1];
  if (dynamic) {
    try {
      const sizes = JSON.parse(decodeEntities(dynamic)) as Record<string, [number, number]>;
      images.push(...Object.entries(sizes).sort((a, b) => b[1][0] - a[1][0]).map(([url]) => url));
    } catch {
      // ignore
    }
  }
  return { title, brand, images };
}

/** What a "prove you are human" page says instead of the product. */
const WALL = /validateCaptcha|api-services-support@amazon|Enter the characters you see|Type the characters you see|automated access to Amazon data|captcha-delivery\.com|px-captcha|cf-challenge|cf_chl_opt|Checking your browser before|Pardon Our Interruption|unusual traffic from your (computer )?network/i;

/** True when the page is a robot check rather than content. */
export function isWall(html: string) {
  return WALL.test(html);
}

const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

/** The brand's logo, or failing that the site's own large icon. Never an SVG or .ico: storage keeps photos-and-PNG types only. */
function findLogo(html: string, meta: Map<string, string[]>, ld: Json[], product: Json | undefined, pageUrl: string) {
  const fromLd = (obj: Json | undefined) => (obj ? imagesOf(obj.logo) : []);
  const brand = product && typeof product.brand === "object" && !Array.isArray(product.brand) ? (product.brand as Json) : undefined;
  const org = ld.find((o) => typesOf(o).some((t) => t === "organization" || t === "brand" || t === "onlinestore" || t === "store" || t === "corporation"));
  const icons: { href: string; size: number }[] = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const a = attributes(m[0]);
    const rel = (a.rel ?? "").toLowerCase();
    if (!a.href || !/(^|\s)(apple-touch-icon(-precomposed)?|icon)(\s|$)/.test(rel)) continue;
    const size = Number((a.sizes ?? "").match(/(\d+)x\d+/)?.[1] ?? (rel.includes("apple-touch-icon") ? 180 : 0));
    if (size >= 64) icons.push({ href: a.href, size });
  }
  icons.sort((a, b) => b.size - a.size);
  const candidates = [...fromLd(brand), ...fromLd(org), ...(meta.get("og:logo") ?? []), ...icons.map((i) => i.href)];
  return tidyImages(candidates, pageUrl)[0];
}

/** Marketplaces and app stores: the site is not the brand. */
const NOT_A_BRAND = /(^|\.)(amazon\.[a-z.]+|ebay\.[a-z.]+|etsy\.com|aliexpress\.com|tokopedia\.com|shopee\.[a-z.]+|lazada\.[a-z.]+|walmart\.com|target\.com|bestbuy\.com|apple\.com|google\.com|youtube\.com)$/;

/**
 * Reads the product out of a page. Returns null when the page has no usable
 * name (a blocked page, a captcha, an empty shell rendered by JavaScript).
 */
export function extractProduct(html: string, pageUrl: string): ProductDetails | null {
  if (isWall(html)) return null;
  const meta = metaTags(html);
  const first = (key: string) => meta.get(key)?.[0] ?? "";
  const ld = jsonLd(html);
  const product = ld.find((o) => typesOf(o).some((t) => PRODUCT_TYPES.includes(t)));
  const host = domainOf(pageUrl);
  const isAmazon = /(^|\.)amazon\.[a-z.]+$/.test(host);
  const amz = isAmazon ? amazon(html) : null;

  const siteName = first("og:site_name") || first("application-name");
  const pageTitle = clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  const siteNames = [siteName, host.split(".")[0], host];

  let name = amz?.title || textOf(product?.name);
  if (!name) {
    const tagged = first("og:title") || first("twitter:title") || pageTitle;
    name = stripSiteName(tagged, siteNames)
      .replace(/^Amazon\.[a-z.]+\s*:\s*/i, "")
      .replace(/\s+[-–]\s+Apps on Google Play$/i, "")
      .replace(/\s+on the App\s?Store$/i, "");
  }
  name = name.replace(/\s+/g, " ").trim().slice(0, 80).trim();
  // Pages that answer with a wall instead of the product.
  if (!name || /^(access denied|just a moment|attention required|robot check|page not found|404|403|error|sign in|log in|are you a human)/i.test(name)) return null;
  // On a marketplace, a page whose only name is the marketplace's own ("Amazon.com") is its home page or a robot check, never a product.
  if (NOT_A_BRAND.test(host) && (squash(name) === squash(host) || squash(name) === squash(host.split(".")[0]))) return null;

  const isBook = Boolean(product && typesOf(product).includes("book"));

  const brand = (
    (isBook ? textOf(product?.author) : "") ||
    amz?.brand || textOf(product?.brand) || textOf(product?.manufacturer) || first("product:brand") || first("og:brand") ||
    textOf(product?.author) || (NOT_A_BRAND.test(host) ? "" : siteName)
  ).slice(0, 60);
  const logo = NOT_A_BRAND.test(host) ? undefined : findLogo(html, meta, ld, product, pageUrl);

  const images = tidyImages(
    [
      ...(amz?.images ?? []),
      ...imagesOf(product?.image),
      ...(meta.get("og:image:secure_url") ?? []),
      ...(meta.get("og:image") ?? []),
      ...(meta.get("twitter:image") ?? []),
      ...(meta.get("twitter:image:src") ?? []),
    ],
    pageUrl,
  );

  const canonicalTag = html.match(/<link\b[^>]*rel\s*=\s*["']?canonical["']?[^>]*>/i)?.[0];
  let url = pageUrl;
  const canonical = (canonicalTag && attributes(canonicalTag).href) || first("og:url");
  if (canonical) {
    try {
      const resolved = new URL(decodeEntities(canonical), pageUrl);
      // Only trust a canonical link on the same site, and never one that points at the home page.
      if (domainOf(resolved.toString()) === host && resolved.pathname.length > 1) url = resolved.toString();
    } catch {
      // keep the pasted address
    }
  }

  return { name, brand: brand || undefined, images, url, domain: host, ...(logo ? { logo } : {}), ...(isBook ? { kind: "book" as const } : {}) };
}

/** A Shopify store serves every product as JSON at /products/<handle>.js. */
export function shopifyJsonUrl(pageUrl: string) {
  const url = new URL(pageUrl);
  const handle = url.pathname.match(/\/products\/([^/?#]+)/)?.[1];
  return handle ? `${url.origin}/products/${handle.replace(/\.(js|json)$/, "")}.js` : null;
}

export function fromShopifyJson(body: string, pageUrl: string): ProductDetails | null {
  try {
    const p = JSON.parse(body) as { title?: string; vendor?: string; images?: string[]; featured_image?: string };
    if (!p.title) return null;
    return {
      name: clean(p.title).slice(0, 80),
      brand: clean(p.vendor) || undefined,
      images: tidyImages([p.featured_image ?? "", ...(p.images ?? [])].filter(Boolean), pageUrl),
      url: pageUrl.split(/[?#]/)[0],
      domain: domainOf(pageUrl),
    };
  } catch {
    return null;
  }
}

/** An App Store address → Apple's lookup API, which is reliable where the page itself is not. */
export function appStoreLookupUrl(pageUrl: string) {
  const url = new URL(pageUrl);
  if (!/^(apps|itunes)\.apple\.com$/.test(url.hostname)) return null;
  const id = url.pathname.match(/\/id(\d+)/)?.[1];
  if (!id) return null;
  const country = url.pathname.match(/^\/([a-z]{2})\//)?.[1];
  return `https://itunes.apple.com/lookup?id=${id}${country ? `&country=${country}` : ""}`;
}

export function fromAppStoreJson(body: string, pageUrl: string): ProductDetails | null {
  try {
    const app = (JSON.parse(body) as { results?: { trackName?: string; sellerName?: string; artistName?: string; artworkUrl512?: string; artworkUrl100?: string; trackViewUrl?: string }[] }).results?.[0];
    if (!app?.trackName) return null;
    return {
      name: clean(app.trackName).slice(0, 80),
      brand: clean(app.sellerName || app.artistName) || undefined,
      images: tidyImages([app.artworkUrl512 ?? "", app.artworkUrl100 ?? ""].filter(Boolean), pageUrl),
      url: (app.trackViewUrl ?? pageUrl).split("?")[0],
      domain: "apps.apple.com",
    };
  } catch {
    return null;
  }
}

/** What someone pasted → an address we can fetch, or null. Accepts "peakdesign.com/…" without the scheme. */
export function normaliseUrl(input: string) {
  const text = input.trim();
  if (!text || /\s/.test(text)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Amazon. Its pages are closed to servers more often than not, so a product
// can also be pieced together from the address: the ASIN in it, the name in
// its slug, and for a printed book (whose ASIN is its ISBN) the public book
// catalogues.
// ---------------------------------------------------------------------------

export const isAmazon = (url: string) => /(^|\.)amazon\.[a-z.]+$/.test(domainOf(url));

/** "B0CFPJYX7P" from /dp/…, /gp/product/…, /gp/aw/d/… and friends. */
export function amazonAsin(url: string) {
  try {
    return new URL(url).pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d|product|d|exec\/obidos\/ASIN|o\/ASIN)\/([A-Z0-9]{10})(?:[/?]|$)/i)?.[1].toUpperCase() ?? null;
  } catch {
    return null;
  }
}

/** A printed book's ASIN is its ISBN-10 (nine digits and a check digit that may be X). */
export function isIsbn10(asin: string) {
  if (!/^\d{9}[\dX]$/.test(asin)) return false;
  const sum = asin.split("").reduce((total, ch, i) => total + (ch === "X" ? 10 : Number(ch)) * (10 - i), 0);
  return sum % 11 === 0;
}

/** "Project Hail Mary Andy Weir" from /Project-Hail-Mary-Andy-Weir/dp/0593135202. A starting point the creator will tidy. */
export function nameFromAmazonSlug(url: string) {
  try {
    const first = decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean)[0] ?? "");
    if (!first || /^(dp|gp|d|product|exec|o|s|b|stores|hz|ap)$/i.test(first) || /^[A-Z0-9]{10}$/.test(first) || !/[a-z]/i.test(first)) return null;
    const name = first.replace(/[-_+]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80).trim();
    return name.length >= 3 ? name : null;
  } catch {
    return null;
  }
}

/** Where Amazon has long served a product's main picture by ASIN alone. It answers a 1×1 blank when it has none, which the form filters out. */
export const amazonImageByAsin = (asin: string) => `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`;
export const openLibraryCover = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
export const googleBooksUrl = (isbn: string) => `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`;
export const openLibraryUrl = (isbn: string) => `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

export interface BookFacts { title: string; author?: string; images: string[] }

export function fromGoogleBooks(body: string): BookFacts | null {
  try {
    const info = (JSON.parse(body) as { items?: { volumeInfo?: { title?: string; authors?: string[]; imageLinks?: { thumbnail?: string; smallThumbnail?: string } } }[] }).items?.[0]?.volumeInfo;
    if (!info?.title) return null;
    const thumb = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
    // zoom=0 asks for the largest scan; edge=curl draws a page curl on it.
    const cover = thumb ? thumb.replace(/^http:/, "https:").replace(/&edge=curl/, "").replace(/zoom=\d/, "zoom=0") : undefined;
    return { title: clean(info.title).slice(0, 80), author: info.authors?.length ? clean(info.authors.slice(0, 2).join(", ")).slice(0, 60) : undefined, images: cover ? [cover] : [] };
  } catch {
    return null;
  }
}

export function fromOpenLibrary(body: string): BookFacts | null {
  try {
    const book = Object.values(JSON.parse(body) as Record<string, { title?: string; authors?: { name?: string }[]; cover?: { large?: string; medium?: string } }>)[0];
    if (!book?.title) return null;
    const author = (book.authors ?? []).map((a) => a.name).filter(Boolean).slice(0, 2).join(", ");
    return { title: clean(book.title).slice(0, 80), author: clean(author).slice(0, 60) || undefined, images: [book.cover?.large ?? book.cover?.medium ?? ""].filter(Boolean) };
  } catch {
    return null;
  }
}

/**
 * The product as far as the address alone gives it away, for when Amazon
 * would not show the page. Null when there is not even a name to start from.
 */
export function fromAmazonAddress(pageUrl: string, book: BookFacts | null): ProductDetails | null {
  const asin = amazonAsin(pageUrl);
  const name = book?.title ?? nameFromAmazonSlug(pageUrl);
  if (!name) return null;
  const origin = new URL(pageUrl).origin;
  const images = asin
    ? [...(isIsbn10(asin) ? [openLibraryCover(asin)] : []), amazonImageByAsin(asin), ...(book?.images ?? [])]
    : book?.images ?? [];
  return {
    name, brand: book?.author, images: tidyImages(images, pageUrl), url: asin ? `${origin}/dp/${asin}` : pageUrl.split(/[?#]/)[0],
    domain: domainOf(pageUrl), partial: true, ...(book || (asin && isIsbn10(asin)) ? { kind: "book" as const } : {}),
  };
}

/**
 * The paid Amazon data service the first Favolist used (Axesso, through
 * RapidAPI): the dependable route when a key is set. Field names as that
 * service returns them.
 */
export function fromAxesso(body: string, pageUrl: string): ProductDetails | null {
  try {
    const p = JSON.parse(body) as { productTitle?: string; imageUrlList?: string[]; manufacturer?: string; soldBy?: string; asin?: string };
    if (!p.productTitle) return null;
    const asin = p.asin ?? amazonAsin(pageUrl);
    const book = Boolean(asin && isIsbn10(asin));
    return {
      name: clean(p.productTitle).slice(0, 80).trim(),
      brand: clean(p.manufacturer).replace(/^(Visit the|Brand:)\s+/i, "").replace(/\s+Store$/i, "").slice(0, 60) || undefined,
      images: tidyImages(p.imageUrlList ?? [], pageUrl),
      url: asin ? `${new URL(pageUrl).origin}/dp/${asin}` : pageUrl.split(/[?#]/)[0],
      domain: domainOf(pageUrl), ...(book ? { kind: "book" as const } : {}),
    };
  } catch {
    return null;
  }
}
