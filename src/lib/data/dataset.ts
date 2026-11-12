import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import demo from "../../../supabase/seed/demo.json";
import { hasSupabase } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";

// Everything a signed-out visitor may see, as plain rows. Row-level security
// decides what that is (public profiles and lists, products with a published
// review), so this file never filters for privacy itself.
//
// The whole public dataset is read in one go and cached; the pages pick what
// they need from it (src/lib/data/public.ts). That is deliberate for now: with
// a handful of creators it is seven small queries per cache refresh instead of
// several per page view. Move to per-page queries when the catalogue grows
// past a few thousand products.

export interface ProfileRow {
  id: string; username: string; display_name: string; avatar_url: string | null; bio: string | null;
  about: string | null; links: { kind: string; url: string }[]; is_public: boolean; created_at: string;
}
export interface ListRow {
  id: string; owner_id: string; slug: string; name: string; intro: string | null; cover_url: string | null;
  is_public: boolean; numbered: boolean; position: number; created_at: string; updated_at: string;
}
export interface ProductRow {
  id: string; list_id: string; owner_id: string; slug: string; name: string; brand: string | null;
  image_url: string | null; source_url: string | null; source_domain: string | null; position: number; created_at: string;
}
export interface ReviewRow { product_id: string; body_text: string; tidied: boolean; published_at: string | null; updated_at: string }
export interface CodeRow { product_id: string; code: string | null; link: string | null; benefit_text: string | null; status: string }
export interface Dataset {
  profiles: ProfileRow[]; lists: ListRow[]; products: ProductRow[]; reviews: ReviewRow[]; referral_codes: CodeRow[];
  follow_counts: { profile_id: string; followers: number; following: number }[];
  like_counts: { product_id: string; likes: number }[];
}

/** Server actions call updateTag(PUBLIC_DATA) after a follow, like or save so counts refresh at once. */
export const PUBLIC_DATA = "public-data";

export async function loadDataset(): Promise<Dataset> {
  // 'use cache' stores the result on the server and shares it between requests
  // (Next 16 Cache Components). It is refreshed every few minutes, or at once
  // when the tag is updated.
  "use cache";
  cacheTag(PUBLIC_DATA);
  cacheLife("minutes");

  // Without Supabase (a fresh checkout, CI) the app shows the demo profiles.
  if (!hasSupabase()) return demo as Dataset;

  const db = createPublicClient();
  const [profiles, lists, products, reviews, codes, follows, likes] = await Promise.all([
    db.from("profiles").select("id, username, display_name, avatar_url, bio, about, links, is_public, created_at"),
    db.from("lists").select("id, owner_id, slug, name, intro, cover_url, is_public, numbered, position, created_at, updated_at"),
    db.from("products").select("id, list_id, owner_id, slug, name, brand, image_url, source_url, source_domain, position, created_at"),
    db.from("reviews").select("product_id, body_text, tidied, published_at, updated_at"),
    db.from("referral_codes").select("product_id, code, link, benefit_text, status"),
    db.from("profile_follow_counts").select("profile_id, followers, following"),
    db.from("product_like_counts").select("product_id, likes"),
  ]);
  const failed = [profiles, lists, products, reviews, codes, follows, likes].find((r) => r.error);
  if (failed?.error) throw new Error(`Could not load the public data: ${failed.error.message}`);

  return {
    profiles: (profiles.data ?? []) as ProfileRow[],
    lists: (lists.data ?? []) as ListRow[],
    products: (products.data ?? []) as ProductRow[],
    reviews: (reviews.data ?? []) as ReviewRow[],
    referral_codes: (codes.data ?? []) as CodeRow[],
    follow_counts: (follows.data ?? []) as Dataset["follow_counts"],
    like_counts: (likes.data ?? []) as Dataset["like_counts"],
  };
}
