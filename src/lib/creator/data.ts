import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// What a creator sees of their own things: drafts included. These read as the
// signed-in user (row-level security lets an owner see their unpublished
// lists and unreviewed products), so nothing here is cached.

export interface MyList { id: string; name: string; slug: string; isPublic: boolean; numbered: boolean; intro: string; cover?: string }
export interface MyProduct {
  id: string; slug: string; name: string; brand: string; logo?: string; image?: string; sourceUrl: string; sourceDomain: string;
  list: { id: string; name: string; slug: string };
  code: string; benefit: string;
  review: { body: string; raw: string; audioPath: string; tidied: boolean; published: boolean } | null;
}
export interface ListProduct { id: string; slug: string; name: string; brand: string; image?: string; reviewed: boolean }
export interface RecentProduct { id: string; name: string; image?: string; listName: string; createdAt: string }

type ListRow = { id: string; name: string; slug: string; is_public: boolean; numbered: boolean; intro: string | null; cover_url: string | null };
const LIST_COLUMNS = "id, name, slug, is_public, numbered, intro, cover_url";
const toList = (l: ListRow): MyList => ({ id: l.id, name: l.name, slug: l.slug, isPublic: l.is_public, numbered: l.numbered, intro: l.intro ?? "", cover: l.cover_url ?? undefined });

export async function getMyLists(db: SupabaseClient, profileId: string): Promise<MyList[]> {
  const { data } = await db.from("lists").select(LIST_COLUMNS).eq("owner_id", profileId).order("position");
  return ((data ?? []) as ListRow[]).map(toList);
}

/** One list with all of its products, reviewed or not, in order (the edit and reorder screen). */
export async function getMyList(db: SupabaseClient, profileId: string, listId: string): Promise<{ list: MyList; products: ListProduct[] } | null> {
  const { data: list } = await db.from("lists").select(LIST_COLUMNS).eq("owner_id", profileId).eq("id", listId).maybeSingle<ListRow>();
  if (!list) return null;
  const { data: products } = await db.from("products")
    .select("id, slug, name, brand, image_url, reviews(published_at)").eq("list_id", listId).order("position").order("created_at");
  type Row = { id: string; slug: string; name: string; brand: string | null; image_url: string | null; reviews: { published_at: string | null } | { published_at: string | null }[] | null };
  return {
    list: toList(list),
    products: ((products ?? []) as Row[]).map((p) => {
      const review = Array.isArray(p.reviews) ? p.reviews[0] : p.reviews;
      return { id: p.id, slug: p.slug, name: p.name, brand: p.brand ?? "", image: p.image_url ?? undefined, reviewed: Boolean(review?.published_at) };
    }),
  };
}

/** One of the creator's products with its review and code, for the details and review steps. */
export async function getMyProduct(db: SupabaseClient, profileId: string, productId: string): Promise<MyProduct | null> {
  if (!/^[0-9a-f-]{36}$/i.test(productId)) return null;
  const { data: p } = await db.from("products")
    .select("id, slug, name, brand, brand_logo_url, image_url, source_url, source_domain, list_id").eq("owner_id", profileId).eq("id", productId)
    .maybeSingle<{ id: string; slug: string; name: string; brand: string | null; brand_logo_url: string | null; image_url: string | null; source_url: string | null; source_domain: string | null; list_id: string }>();
  if (!p) return null;
  const [list, review, code] = await Promise.all([
    db.from("lists").select("id, name, slug").eq("id", p.list_id).maybeSingle<{ id: string; name: string; slug: string }>(),
    db.from("reviews").select("body_text, raw_transcript, audio_url, tidied, published_at").eq("product_id", p.id)
      .maybeSingle<{ body_text: string; raw_transcript: string | null; audio_url: string | null; tidied: boolean; published_at: string | null }>(),
    db.from("referral_codes").select("code, benefit_text").eq("product_id", p.id).maybeSingle<{ code: string | null; benefit_text: string | null }>(),
  ]);
  if (!list.data) return null;
  return {
    id: p.id, slug: p.slug, name: p.name, brand: p.brand ?? "", logo: p.brand_logo_url ?? undefined, image: p.image_url ?? undefined,
    sourceUrl: p.source_url ?? "", sourceDomain: p.source_domain ?? "", list: list.data,
    code: code.data?.code ?? "", benefit: code.data?.benefit_text ?? "",
    review: review.data
      ? { body: review.data.body_text, raw: review.data.raw_transcript ?? "", audioPath: review.data.audio_url ?? "", tidied: review.data.tidied, published: Boolean(review.data.published_at) }
      : null,
  };
}

/** "Recently added by you" on the paste-a-link screen. */
export async function getRecentProducts(db: SupabaseClient, profileId: string, limit = 2): Promise<RecentProduct[]> {
  const { data } = await db.from("products").select("id, name, image_url, created_at, lists(name)").eq("owner_id", profileId)
    .order("created_at", { ascending: false }).limit(limit);
  type Row = { id: string; name: string; image_url: string | null; created_at: string; lists: { name: string } | { name: string }[] | null };
  return ((data ?? []) as Row[]).map((p) => ({
    id: p.id, name: p.name, image: p.image_url ?? undefined, createdAt: p.created_at,
    listName: (Array.isArray(p.lists) ? p.lists[0]?.name : p.lists?.name) ?? "",
  }));
}
