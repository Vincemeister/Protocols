import "server-only";
import {
  appStoreLookupUrl, extractProduct, fromAppStoreJson, fromShopifyJson, normaliseUrl, shopifyJsonUrl, type ProductDetails,
} from "./extract";
import { FetchError, safeFetch } from "./safe-fetch";

export type ScrapeResult =
  | { ok: true; product: ProductDetails }
  | { ok: false; reason: "bad_link" | "blocked" | "not_found" | "timeout" };

const text = (bytes: Uint8Array) => new TextDecoder("utf-8", { fatal: false }).decode(bytes);

/**
 * Paste a link, get the product (C4). Always answers within `budgetMs`
 * (8 seconds, build brief section 2) or fails cleanly so the screen can offer
 * the manual path.
 */
export async function scrapeProduct(input: string, budgetMs = 8000): Promise<ScrapeResult> {
  const address = normaliseUrl(input);
  if (!address) return { ok: false, reason: "bad_link" };

  const deadline = AbortSignal.timeout(budgetMs);
  const get = (url: string, accept: string, maxBytes: number) => safeFetch(url, { signal: deadline, accept, maxBytes });

  try {
    // Apple's lookup API is the dependable source for App Store links.
    const lookup = appStoreLookupUrl(address);
    if (lookup) {
      const res = await get(lookup, "application/json", 500_000).catch(() => null);
      const app = res && res.status === 200 ? fromAppStoreJson(text(res.body), address) : null;
      if (app) return { ok: true, product: app };
    }

    // The page itself and, when the address looks like a Shopify product, its JSON twin, side by side.
    const shopify = shopifyJsonUrl(address);
    const [page, json] = await Promise.allSettled([
      get(address, "text/html,application/xhtml+xml", 1_500_000),
      shopify ? get(shopify, "application/json", 500_000) : Promise.reject(new Error("not shopify")),
    ]);

    const fromJson = json.status === "fulfilled" && json.value.status === 200 && json.value.contentType.includes("json")
      ? fromShopifyJson(text(json.value.body), address)
      : null;

    if (page.status === "rejected") {
      if (fromJson) return { ok: true, product: fromJson };
      throw page.reason;
    }
    const fromPage = page.value.status < 400 ? extractProduct(text(page.value.body), page.value.url) : null;

    if (fromJson) {
      // Shopify's JSON has the cleanest name, vendor and full picture set; keep the page's canonical address.
      return { ok: true, product: { ...fromJson, url: fromPage?.url ?? fromJson.url, images: fromJson.images.length ? fromJson.images : fromPage?.images ?? [] } };
    }
    if (fromPage) return { ok: true, product: fromPage };
    return { ok: false, reason: [401, 403, 429, 503].includes(page.value.status) ? "blocked" : "not_found" };
  } catch (e) {
    if (e instanceof FetchError) {
      if (e.kind === "timeout") return { ok: false, reason: "timeout" };
      if (e.kind === "blocked") return { ok: false, reason: "bad_link" };
      return { ok: false, reason: "not_found" };
    }
    return { ok: false, reason: deadline.aborted ? "timeout" : "not_found" };
  }
}
