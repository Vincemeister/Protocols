import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// The signed-in creator's private views (phase 4): notifications, who follows
// whom, their referral codes, their own profile as stored. Read as the user;
// never cached.

export interface MyProfile {
  id: string; username: string; name: string; avatar?: string; bio: string; about: string;
  links: { kind: string; url: string }[]; isPublic: boolean; theme: "light" | "dark" | null;
}

export async function getMyProfile(db: SupabaseClient): Promise<MyProfile | null> {
  const { data } = await db.rpc("my_profile").maybeSingle<{
    id: string; username: string; display_name: string; avatar_url: string | null; bio: string | null; about: string | null;
    links: { kind: string; url: string }[] | null; is_public: boolean; theme: "light" | "dark" | null;
  }>();
  if (!data) return null;
  return {
    id: data.id, username: data.username, name: data.display_name, avatar: data.avatar_url ?? undefined, bio: data.bio ?? "",
    about: data.about ?? "", links: data.links ?? [], isPublic: data.is_public, theme: data.theme,
  };
}

export interface MyNotification {
  id: string; kind: "follow" | "save"; actorId: string; read: boolean; createdAt: string;
  productId: string | null; listId: string | null;
}

export async function getNotifications(db: SupabaseClient, profileId: string, limit = 50): Promise<MyNotification[]> {
  const { data } = await db.from("notifications")
    .select("id, kind, actor_id, read_at, created_at, target_product_id, target_list_id")
    .eq("user_id", profileId).order("created_at", { ascending: false }).limit(limit);
  type Row = { id: string; kind: "follow" | "save"; actor_id: string; read_at: string | null; created_at: string; target_product_id: string | null; target_list_id: string | null };
  return ((data ?? []) as Row[]).map((n) => ({
    id: n.id, kind: n.kind, actorId: n.actor_id, read: Boolean(n.read_at), createdAt: n.created_at, productId: n.target_product_id, listId: n.target_list_id,
  }));
}

export async function countUnread(db: SupabaseClient, profileId: string) {
  const { count } = await db.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", profileId).is("read_at", null);
  return count ?? 0;
}

/** Ids of the profiles that follow the creator, and of those the creator follows, newest first. */
export async function getFollowIds(db: SupabaseClient, profileId: string) {
  const [followers, following] = await Promise.all([
    db.from("follows").select("follower_id").eq("followee_id", profileId).order("created_at", { ascending: false }),
    db.from("follows").select("followee_id").eq("follower_id", profileId).order("created_at", { ascending: false }),
  ]);
  return {
    followers: (followers.data ?? []).map((r) => r.follower_id as string),
    following: (following.data ?? []).map((r) => r.followee_id as string),
  };
}

export interface MyReferral {
  productId: string; name: string; image?: string; listName: string; code: string; benefit: string; reviewed: boolean;
}

/** C10: every product of the creator's with its code, products with a code first. */
export async function getMyReferrals(db: SupabaseClient, profileId: string): Promise<MyReferral[]> {
  const { data } = await db.from("products")
    .select("id, name, image_url, created_at, lists(name), referral_codes(code, benefit_text), reviews(published_at)")
    .eq("owner_id", profileId).order("created_at", { ascending: false });
  type One<T> = T | T[] | null;
  type Row = { id: string; name: string; image_url: string | null; lists: One<{ name: string }>; referral_codes: One<{ code: string | null; benefit_text: string | null }>; reviews: One<{ published_at: string | null }> };
  const one = <T,>(v: One<T>) => (Array.isArray(v) ? v[0] : v) ?? null;
  const rows = ((data ?? []) as Row[]).map((p) => ({
    productId: p.id, name: p.name, image: p.image_url ?? undefined, listName: one(p.lists)?.name ?? "",
    code: one(p.referral_codes)?.code ?? "", benefit: one(p.referral_codes)?.benefit_text ?? "", reviewed: Boolean(one(p.reviews)?.published_at),
  }));
  return [...rows.filter((r) => r.code), ...rows.filter((r) => !r.code)];
}
