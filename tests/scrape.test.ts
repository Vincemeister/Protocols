import assert from "node:assert/strict";
import dns from "node:dns";
import { syncBuiltinESMExports } from "node:module";
import { afterEach, test } from "node:test";
import { scrapeProduct } from "../src/lib/scrape/index.ts";
import { isPublicAddress } from "../src/lib/scrape/safe-fetch.ts";

// The link reader end to end, with the network replaced: each test says what
// every address answers. Hosts are IP addresses so no DNS is involved.
const HOST = "https://93.184.216.34";
// Named hosts (amazon.com, the book catalogues) resolve to a public address without asking a real DNS server.
dns.promises.lookup = (async () => [{ address: "93.184.216.34", family: 4 }]) as unknown as typeof dns.promises.lookup;
syncBuiltinESMExports();
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

type Reply = { status?: number; body?: string; type?: string; location?: string; hang?: boolean };
function network(routes: Record<string, Reply>) {
  const asked: string[] = [];
  globalThis.fetch = (async (input: URL | string, init?: RequestInit) => {
    const url = String(input);
    asked.push(url);
    const reply = routes[url] ?? { status: 404, body: "<title>Page not found</title>" };
    if (reply.hang) {
      // A real connection keeps Node alive while it waits; this timer stands in for it.
      const open = setTimeout(() => undefined, 10_000);
      await new Promise((_, reject) => init?.signal?.addEventListener("abort", () => { clearTimeout(open); reject(new Error("aborted")); }));
    }
    const headers = new Headers({ "content-type": reply.type ?? "text/html; charset=utf-8" });
    if (reply.location) headers.set("location", reply.location);
    return new Response(reply.location ? null : reply.body ?? "", { status: reply.status ?? 200, headers });
  }) as typeof fetch;
  return asked;
}

const PAGE = `<html><head><title>Everyday Sling | Peak Design</title><meta property="og:site_name" content="Peak Design">
<meta property="og:image" content="${HOST}/og.jpg"><link rel="canonical" href="${HOST}/products/everyday-sling"></head></html>`;

test("a plain page: name, brand and picture from its tags", async () => {
  network({ [`${HOST}/gear/sling?ref=ig`]: { body: PAGE.replace("/products/everyday-sling", "/gear/sling") } });
  const result = await scrapeProduct(`${HOST}/gear/sling?ref=ig`);
  assert.deepEqual(result, { ok: true, product: { name: "Everyday Sling", brand: "Peak Design", images: [`${HOST}/og.jpg`], url: `${HOST}/gear/sling`, domain: "93.184.216.34" } });
});

test("a Shopify product: the JSON twin supplies name, vendor and all pictures", async () => {
  const asked = network({
    [`${HOST}/products/everyday-sling?variant=2`]: { body: PAGE },
    [`${HOST}/products/everyday-sling.js`]: { type: "application/json", body: JSON.stringify({ title: "Everyday Sling 6L", vendor: "Peak Design", images: [`${HOST}/a.jpg`, `${HOST}/b.jpg`] }) },
  });
  const result = await scrapeProduct(`${HOST}/products/everyday-sling?variant=2`);
  assert.ok(result.ok);
  assert.equal(result.product.name, "Everyday Sling 6L");
  assert.deepEqual(result.product.images, [`${HOST}/a.jpg`, `${HOST}/b.jpg`]);
  assert.equal(result.product.url, `${HOST}/products/everyday-sling`);
  assert.equal(asked.length, 3); // the page twice (as a browser, as a link preview) and the JSON
});

test("a page that blocks us still works when the Shopify JSON answers", async () => {
  network({
    [`${HOST}/products/mug`]: { status: 403, body: "<title>Access denied</title>" },
    [`${HOST}/products/mug.js`]: { type: "application/json", body: JSON.stringify({ title: "Mug", vendor: "Potter", images: [] }) },
  });
  const result = await scrapeProduct(`${HOST}/products/mug`);
  assert.ok(result.ok && result.product.name === "Mug");
});

test("redirects are followed, and each hop is checked", async () => {
  network({ [`${HOST}/short`]: { status: 302, location: "/gear/sling" }, [`${HOST}/gear/sling`]: { body: PAGE } });
  assert.ok((await scrapeProduct(`${HOST}/short`)).ok);

  const asked = network({ [`${HOST}/evil`]: { status: 302, location: "http://169.254.169.254/latest/meta-data/" } });
  assert.deepEqual(await scrapeProduct(`${HOST}/evil`), { ok: false, reason: "bad_link" });
  assert.deepEqual([...new Set(asked)], [`${HOST}/evil`]); // the private address was never requested
});

test("private and odd addresses are refused without a request", async () => {
  const asked = network({});
  for (const link of ["http://localhost:3000/x", "http://127.0.0.1/x", "http://10.0.0.5/x", "http://192.168.1.1/admin", "http://[::1]/x", "https://93.184.216.34:8443/x", "https://user:pw@93.184.216.34/x", "ftp://93.184.216.34/x", "nonsense"]) {
    assert.deepEqual(await scrapeProduct(link), { ok: false, reason: "bad_link" }, link);
  }
  assert.equal(asked.length, 0);
});

test("walls, missing pages and slow sites fail with a reason", async () => {
  network({ [`${HOST}/p/1`]: { status: 403, body: "<title>Just a moment...</title>" } });
  assert.deepEqual(await scrapeProduct(`${HOST}/p/1`), { ok: false, reason: "blocked" });
  network({});
  assert.deepEqual(await scrapeProduct(`${HOST}/p/2`), { ok: false, reason: "not_found" });
  network({ [`${HOST}/p/3`]: { hang: true } });
  const began = Date.now();
  assert.deepEqual(await scrapeProduct(`${HOST}/p/3`, 300), { ok: false, reason: "timeout" });
  assert.ok(Date.now() - began < 2000);
});

test("isPublicAddress", () => {
  for (const ip of ["8.8.8.8", "93.184.216.34", "2606:4700:4700::1111"]) assert.ok(isPublicAddress(ip), ip);
  for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.0.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:10.0.0.1", "224.0.0.1"]) assert.ok(!isPublicAddress(ip), ip);
});

const AMAZON_WALL = `<html><head><title>Amazon.com</title></head><body><form action="/errors/validateCaptcha">Enter the characters you see below</form></body></html>`;

test("Amazon behind its robot check: a printed book comes from the book catalogues", async () => {
  const link = "https://www.amazon.com/Project-Hail-Mary-Andy-Weir/dp/0593135202/ref=sr_1_1?crid=x";
  network({
    [link]: { body: AMAZON_WALL },
    "https://www.googleapis.com/books/v1/volumes?q=isbn:0593135202&maxResults=1": {
      type: "application/json",
      body: JSON.stringify({ items: [{ volumeInfo: { title: "Project Hail Mary", authors: ["Andy Weir"], imageLinks: { thumbnail: "http://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" } } }] }),
    },
  });
  const result = await scrapeProduct(link);
  assert.deepEqual(result, {
    ok: true,
    product: {
      name: "Project Hail Mary", brand: "Andy Weir", kind: "book", partial: true, domain: "amazon.com", url: "https://www.amazon.com/dp/0593135202",
      images: [
        "https://covers.openlibrary.org/b/isbn/0593135202-L.jpg?default=false",
        "https://m.media-amazon.com/images/P/0593135202.01._SCLZZZZZZZ_.jpg",
        "https://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=0&source=gbs_api",
      ],
    },
  });
});

test("Amazon behind its robot check: anything else gets its name from the address", async () => {
  const link = "https://www.amazon.com/Anker-Charger-Compact-Foldable-MacBook/dp/B0C5XBKZ1J?th=1";
  network({ [link]: { body: AMAZON_WALL } });
  const result = await scrapeProduct(link);
  assert.ok(result.ok);
  assert.equal(result.product.name, "Anker Charger Compact Foldable MacBook");
  assert.equal(result.product.partial, true);
  assert.equal(result.product.kind, undefined);
  assert.deepEqual(result.product.images, ["https://m.media-amazon.com/images/P/B0C5XBKZ1J.01._SCLZZZZZZZ_.jpg"]);
  assert.equal(result.product.url, "https://www.amazon.com/dp/B0C5XBKZ1J");
});

test("Amazon: a short link is followed to the real address first; no name at all means blocked", async () => {
  network({
    "https://a.co/d/abc123": { status: 301, location: "https://www.amazon.com/Kindle-Paperwhite-16-GB/dp/B0CFPJYX7P?ref=x" },
    "https://www.amazon.com/Kindle-Paperwhite-16-GB/dp/B0CFPJYX7P?ref=x": { body: AMAZON_WALL },
  });
  const viaShort = await scrapeProduct("https://a.co/d/abc123");
  assert.ok(viaShort.ok && viaShort.product.name === "Kindle Paperwhite 16 GB" && viaShort.product.domain === "amazon.com");

  network({ "https://www.amazon.com/dp/B0CFPJYX7P": { body: AMAZON_WALL } });
  assert.deepEqual(await scrapeProduct("https://www.amazon.com/dp/B0CFPJYX7P"), { ok: false, reason: "blocked" });
});

test("Amazon answering a link preview: the real page is read", async () => {
  const link = "https://www.amazon.com/dp/B0CFPJYX7P";
  let previews = 0;
  const realFetchNow = globalThis.fetch;
  globalThis.fetch = (async (input: URL | string, init?: RequestInit) => {
    const agent = new Headers(init?.headers).get("user-agent") ?? "";
    const isPreview = agent.startsWith("facebookexternalhit");
    if (isPreview) previews++;
    const body = isPreview ? `<title>Amazon.com: Kindle Paperwhite : Electronics</title><span id="productTitle"> Kindle Paperwhite (16 GB) </span>` : AMAZON_WALL;
    return new Response(body, { status: 200, headers: { "content-type": "text/html" } });
  }) as typeof fetch;
  const result = await scrapeProduct(link);
  globalThis.fetch = realFetchNow;
  assert.ok(result.ok && result.product.name === "Kindle Paperwhite (16 GB)" && !result.product.partial);
  assert.equal(previews, 1);
});
