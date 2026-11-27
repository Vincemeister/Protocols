import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Fetching an address that a user typed is the classic way to get a server to
// talk to things it should not (its own network, cloud metadata). So every
// hop is checked: http(s) only, default ports only, and the host must resolve
// to public addresses. Redirects are followed by hand so each one is checked too.
//
// Known limit: the name is resolved here and again by fetch(), so a hostile
// DNS server could answer differently the second time. On Vercel there is no
// private network behind the function, which is why this is acceptable for v1.

const PRIVATE_V4 = [
  /^0\./, /^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^192\.0\.[02]\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^198\.1[89]\./, /^(22[4-9]|2[3-5]\d)\./,
];

export function isPublicAddress(ip: string) {
  if (isIP(ip) === 4) return !PRIVATE_V4.some((re) => re.test(ip));
  const v6 = ip.toLowerCase();
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (mapped) return isPublicAddress(mapped);
  return !(v6 === "::" || v6 === "::1" || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6) || /^ff/.test(v6) || v6.startsWith("64:ff9b:"));
}

async function assertPublic(url: URL) {
  if (!/^https?:$/.test(url.protocol)) throw new FetchError("blocked", "Only web addresses can be read.");
  if (url.port && url.port !== "80" && url.port !== "443") throw new FetchError("blocked", "Unusual port.");
  if (url.username || url.password) throw new FetchError("blocked", "Addresses with a login are not read.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new FetchError("blocked", "Not a public address.");
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true }).catch(() => [])).map((a) => a.address);
  if (!addresses.length) throw new FetchError("not_found", "That site does not exist.");
  if (!addresses.every(isPublicAddress)) throw new FetchError("blocked", "Not a public address.");
}

export type FetchFailure = "blocked" | "not_found" | "timeout" | "too_large" | "failed";
export class FetchError extends Error {
  kind: FetchFailure;
  constructor(kind: FetchFailure, message: string) {
    super(message);
    this.kind = kind;
  }
}

// A plain desktop browser. Many stores answer nothing useful to an unknown client.
const HEADERS = {
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "accept-language": "en-US,en;q=0.9",
};

export interface SafeResponse { url: string; status: number; contentType: string; body: Uint8Array }

/**
 * GET a public address. `signal` carries the overall deadline (the product
 * fetch must answer within 8 seconds whatever happens); `maxBytes` stops a
 * huge page or a video from being read into memory.
 */
export async function safeFetch(address: string, opts: { signal: AbortSignal; maxBytes: number; accept: string }): Promise<SafeResponse> {
  let url = new URL(address);
  for (let hop = 0; hop < 5; hop++) {
    await assertPublic(url);
    let res: Response;
    try {
      res = await fetch(url, { redirect: "manual", signal: opts.signal, headers: { ...HEADERS, accept: opts.accept }, cache: "no-store" });
    } catch (e) {
      if (opts.signal.aborted) throw new FetchError("timeout", "The site took too long.");
      throw new FetchError("failed", e instanceof Error ? e.message : "Could not connect.");
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = new URL(res.headers.get("location")!, url);
      continue;
    }
    const declared = Number(res.headers.get("content-length") ?? 0);
    if (declared > opts.maxBytes) throw new FetchError("too_large", "That file is too big.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    const reader = res.body?.getReader();
    try {
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > opts.maxBytes) {
          await reader.cancel();
          // A long page is still worth reading: the tags we want sit in <head>.
          if (opts.accept.includes("text/html")) break;
          throw new FetchError("too_large", "That file is too big.");
        }
        chunks.push(value);
      }
    } catch (e) {
      if (e instanceof FetchError) throw e;
      if (opts.signal.aborted) throw new FetchError("timeout", "The site took too long.");
      throw new FetchError("failed", "The connection dropped.");
    }
    const body = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0));
    let at = 0;
    for (const c of chunks) { body.set(c, at); at += c.byteLength; }
    return { url: url.toString(), status: res.status, contentType: (res.headers.get("content-type") ?? "").toLowerCase(), body };
  }
  throw new FetchError("failed", "Too many redirects.");
}
