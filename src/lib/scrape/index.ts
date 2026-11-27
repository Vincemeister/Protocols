import "server-only";
import {
  amazonAsin, appStoreLookupUrl, extractProduct, fromAmazonAddress, fromAppStoreJson, fromAxesso, fromGoogleBooks, fromOpenLibrary, fromShopifyJson,
  googleBooksUrl, isAmazon, isIsbn10, normaliseUrl, openLibraryUrl, shopifyJsonUrl, type BookFacts, type ProductDetails,
} from "./extract";
import { FetchError, safeFetch, type SafeResponse } from "./safe-fetch";

export type ScrapeResult =
  | { ok: true; product: ProductDetails }
  | { ok: false; reason: "bad_link" | "blocked" | "not_found" | "timeout" };

const text = (bytes: Uint8Array) => new TextDecoder("utf-8", { fatal: false }).decode(bytes);

// How link previews in chat apps introduce themselves. Some shops that turn
// an unknown server away still answer these, because they want their links to
// unfurl. Tried alongside the ordinary request, never instead of it.
const PREVIEW_AGENT = { "user-agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" };

/**
 * Paste a link, get the product (C4). Always answers within `budgetMs`
 * (8 seconds, build brief section 2) or fails cleanly so the screen can offer
 * the manual path.
 */
export async function scrapeProduct(input: string, budgetMs = 8000): Promise<ScrapeResult> {
  const address = normaliseUrl(input);
  if (!address) return { ok: false, reason: "bad_link" };

  const deadline = AbortSignal.timeout(budgetMs);
  const get = (url: string, accept: string, maxBytes: number, headers?: Record<string, string>) => safeFetch(url, { signal: deadline, accept, maxBytes, headers });
  const json = async (url: string, headers?: Record<string, string>) => {
    const res = await get(url, "application/json", 500_000, headers).catch(() => null);
    return res && res.status === 200 ? text(res.body) : null;
  };
  /** The public book catalogues, asked by ISBN: Google Books first, Open Library when it has nothing. */
  const book = async (isbn: string): Promise<BookFacts | null> => {
    const google = await json(googleBooksUrl(isbn));
    const found = google ? fromGoogleBooks(google) : null;
    if (found) return found;
    const open = await json(openLibraryUrl(isbn));
    return open ? fromOpenLibrary(open) : null;
  };

  try {
    // Apple's lookup API is the dependable source for App Store links.
    const lookup = appStoreLookupUrl(address);
    if (lookup) {
      const body = await json(lookup);
      const app = body ? fromAppStoreJson(body, address) : null;
      if (app) return { ok: true, product: app };
    }

    // Amazon with a data-service key: ask the service, as the first Favolist did.
    if (isAmazon(address) && process.env.RAPIDAPI_KEY) {
      const host = "axesso-axesso-amazon-data-service-v1.p.rapidapi.com";
      const body = await json(`https://${host}/amz/amazon-lookup-product?url=${encodeURIComponent(address)}`, { "x-rapidapi-key": process.env.RAPIDAPI_KEY, "x-rapidapi-host": host });
      const product = body ? fromAxesso(body, address) : null;
      if (product) return { ok: true, product };
    }

    // The page itself; as a link preview would ask for it; and, when the
    // address looks like a Shopify product, its JSON twin. Side by side.
    const shopify = shopifyJsonUrl(address);
    const asinAtStart = isAmazon(address) ? amazonAsin(address) : null;
    const [page, preview, shopJson, bookAtStart] = await Promise.allSettled([
      get(address, "text/html,application/xhtml+xml", 1_500_000),
      get(address, "text/html,application/xhtml+xml", 1_500_000, PREVIEW_AGENT),
      shopify ? get(shopify, "application/json", 500_000) : Promise.reject(new Error("not shopify")),
      asinAtStart && isIsbn10(asinAtStart) ? book(asinAtStart) : Promise.resolve(null),
    ]);

    const fromJson = shopJson.status === "fulfilled" && shopJson.value.status === 200 && shopJson.value.contentType.includes("json")
      ? fromShopifyJson(text(shopJson.value.body), address)
      : null;

    const read = (res: PromiseSettledResult<SafeResponse>) =>
      res.status === "fulfilled" && res.value.status < 400 ? extractProduct(text(res.value.body), res.value.url) : null;
    const fromPage = read(page) ?? read(preview);

    if (fromJson) {
      // Shopify's JSON has the cleanest name, vendor and full picture set; the page adds its canonical address and the logo.
      return { ok: true, product: { ...fromJson, url: fromPage?.url ?? fromJson.url, images: fromJson.images.length ? fromJson.images : fromPage?.images ?? [], logo: fromPage?.logo } };
    }
    if (fromPage) {
      // A book's catalogue entry fills what the shop page left out (the author, a cover).
      const facts = bookAtStart.status === "fulfilled" ? bookAtStart.value : null;
      if (facts && isAmazon(fromPage.url)) {
        return { ok: true, product: { ...fromPage, brand: facts.author ?? fromPage.brand, images: fromPage.images.length ? fromPage.images : facts.images, kind: "book" } };
      }
      return { ok: true, product: fromPage };
    }

    // Amazon turned us away. A short link (a.co, amzn.to) has by now led to the
    // real address, and the address alone still gives a name and a picture.
    const landed = [page, preview].flatMap((r) => (r.status === "fulfilled" ? [r.value.url] : []));
    const amazonUrls = [...landed, address].filter(isAmazon);
    const amazonUrl = amazonUrls.find((u) => amazonAsin(u)) ?? amazonUrls[0] ?? null;
    if (amazonUrl) {
      const asin = amazonAsin(amazonUrl);
      const facts = bookAtStart.status === "fulfilled" && bookAtStart.value ? bookAtStart.value : asin && isIsbn10(asin) && asin !== asinAtStart ? await book(asin).catch(() => null) : null;
      const pieced = fromAmazonAddress(amazonUrl, facts);
      if (pieced) return { ok: true, product: pieced };
      return { ok: false, reason: "blocked" };
    }

    if (page.status === "rejected") throw page.reason;
    return { ok: false, reason: [401, 403, 429, 503].includes(page.value.status) || /captcha|robot/i.test(text(page.value.body).slice(0, 4000)) ? "blocked" : "not_found" };
  } catch (e) {
    if (e instanceof FetchError) {
      if (e.kind === "timeout") return { ok: false, reason: "timeout" };
      if (e.kind === "blocked") return { ok: false, reason: "bad_link" };
      return { ok: false, reason: "not_found" };
    }
    return { ok: false, reason: deadline.aborted ? "timeout" : "not_found" };
  }
}
