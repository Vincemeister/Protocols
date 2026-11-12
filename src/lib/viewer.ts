import "server-only";
import { cache } from "react";
import { hasSupabase } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";

// Who is looking at the page, and what they already follow, like and saved.
// It reads the session cookie, so anything that calls it renders per request:
// keep it behind <ForViewer> / <Suspense> so the rest of the page stays cached.

export interface Viewer {
  email?: string;
  /** Null until the person has chosen a username (onboarding, phase 4). */
  profile: { id: string; username: string; name: string; avatar?: string } | null;
  following: Set<string>;
  likedProducts: Set<string>;
  savedProducts: Set<string>;
  savedLists: Set<string>;
}

// React's cache() makes this run once per request however many components ask.
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!hasSupabase()) return null;
  const db = await createUserClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;

  const empty = { following: new Set<string>(), likedProducts: new Set<string>(), savedProducts: new Set<string>(), savedLists: new Set<string>() };
  const { data: me } = await db.rpc("my_profile").maybeSingle<{ id: string; username: string; display_name: string; avatar_url: string | null }>();
  if (!me) return { email: user.email, profile: null, ...empty };

  const [follows, likes, saves] = await Promise.all([
    db.from("follows").select("followee_id").eq("follower_id", me.id),
    db.from("likes").select("product_id").eq("user_id", me.id),
    db.from("saves").select("product_id, list_id").eq("user_id", me.id),
  ]);
  return {
    email: user.email,
    profile: { id: me.id, username: me.username, name: me.display_name, avatar: me.avatar_url ?? undefined },
    following: new Set((follows.data ?? []).map((r) => r.followee_id as string)),
    likedProducts: new Set((likes.data ?? []).map((r) => r.product_id as string)),
    savedProducts: new Set((saves.data ?? []).flatMap((r) => (r.product_id ? [r.product_id as string] : []))),
    savedLists: new Set((saves.data ?? []).flatMap((r) => (r.list_id ? [r.list_id as string] : []))),
  };
});
