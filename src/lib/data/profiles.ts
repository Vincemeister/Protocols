import { cacheLife, cacheTag } from "next/cache";
import { pickCoverImages } from "@/lib/cover";
import { createPublicClient, hasSupabase } from "@/lib/supabase/public";
import type { Profile, SocialLink } from "@/lib/types";
import { fixtureProfile } from "./fixture";

// `'use cache'` (Next 16 Cache Components) memoises the result per handle
// across requests, so public profiles render from cache instead of hitting
// Postgres on every bio-link tap. Creator edits will call
// revalidateTag(`profile:<handle>`) to refresh it.
export async function getProfile(handle: string): Promise<Profile | null> {
  "use cache";
  cacheTag(`profile:${handle.toLowerCase()}`);
  cacheLife("hours");

  if (!hasSupabase()) return fixtureProfile(handle);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      `handle, name, avatar_url, bio, about, social_links,
       lists ( slug, title, description, position, published,
               items ( image_url, position ) )`,
    )
    .eq("handle", handle.toLowerCase())
    .eq("lists.published", true)
    .order("position", { referencedTable: "lists" })
    .order("position", { referencedTable: "lists.items" })
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    handle: data.handle,
    name: data.name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    about: data.about,
    socialLinks: (data.social_links ?? []) as SocialLink[],
    lists: (data.lists ?? []).map((list) => ({
      slug: list.slug,
      title: list.title,
      description: list.description,
      itemCount: list.items.length,
      coverImages: pickCoverImages(list.items.map((item) => item.image_url)),
    })),
  };
}
