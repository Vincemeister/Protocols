import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { safeFetch } from "@/lib/scrape/safe-fetch";

// Pictures always end up in our own storage (the "images" bucket), never as a
// link to someone else's server: a store can move or block a hotlinked file
// at any time, and the creator's page would lose its pictures.

const MAX_BYTES = 8 * 1024 * 1024;

/** What the bytes really are, whatever the sender claimed. */
export function sniffImage(bytes: Uint8Array): { type: string; ext: string } | null {
  const hex = (n: number) => Array.from(bytes.slice(0, n)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (hex(3) === "ffd8ff") return { type: "image/jpeg", ext: "jpg" };
  if (hex(8) === "89504e470d0a1a0a") return { type: "image/png", ext: "png" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { type: "image/webp", ext: "webp" };
  if (ascii(0, 3) === "GIF") return { type: "image/gif", ext: "gif" };
  if (ascii(4, 8) === "ftyp" && /avif|avis/.test(ascii(8, 12))) return { type: "image/avif", ext: "avif" };
  return null;
}

async function store(db: SupabaseClient, uid: string, bytes: Uint8Array) {
  const kind = sniffImage(bytes);
  if (!kind || bytes.byteLength > MAX_BYTES) return null;
  const path = `${uid}/${randomUUID()}.${kind.ext}`;
  const { error } = await db.storage.from("images").upload(path, bytes, { contentType: kind.type, cacheControl: "31536000" });
  if (error) {
    console.error("Image upload failed", error.message);
    return null;
  }
  return db.storage.from("images").getPublicUrl(path).data.publicUrl;
}

/** A picture the creator picked from their device (already scaled down in the browser). */
export async function storeImageFile(db: SupabaseClient, uid: string, file: FormDataEntryValue | null) {
  if (!(file instanceof Blob) || file.size === 0) return null;
  return store(db, uid, new Uint8Array(await file.arrayBuffer()));
}

/** A picture found on the product's page: fetched once and copied into our storage. Null when it cannot be had. */
export async function storeImageFromUrl(db: SupabaseClient, uid: string, url: string) {
  try {
    const res = await safeFetch(url, { signal: AbortSignal.timeout(8000), accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8", maxBytes: MAX_BYTES });
    return res.status === 200 ? await store(db, uid, res.body) : null;
  } catch {
    return null;
  }
}
