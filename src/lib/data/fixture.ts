import tim from "../../../supabase/seed/tim.json";
import { pickCoverImages } from "@/lib/cover";
import type { Profile, SocialLink } from "@/lib/types";

// Local fallback used when no Supabase project is configured, so the public
// pages render straight after `npm install`. Reads the same JSON the seed
// script loads into Supabase, with images served from /public/seed.

type SeedUser = typeof tim;

const seeds: SeedUser[] = [tim];

const imagePath = (handle: string, file?: string) =>
  file ? `/seed/${handle}/${file}` : null;

export function fixtureProfile(handle: string): Profile | null {
  const seed = seeds.find((s) => s.handle === handle.toLowerCase());
  if (!seed) return null;

  return {
    handle: seed.handle,
    name: seed.name,
    avatarUrl: imagePath(seed.handle, seed.avatar),
    bio: seed.bio,
    about: seed.about,
    socialLinks: seed.social_links as SocialLink[],
    lists: seed.lists.map((list) => ({
      slug: list.slug,
      title: list.title,
      description: list.description,
      itemCount: list.items.length,
      coverImages: pickCoverImages(
        list.items.map((item) => imagePath(seed.handle, "image" in item ? item.image : undefined)),
      ),
    })),
  };
}
