export type ItemKind = "product" | "tool" | "book" | "step";

export type SocialPlatform =
  | "instagram"
  | "youtube"
  | "x"
  | "tiktok"
  | "podcast"
  | "newsletter"
  | "website";

export type SocialLink = { platform: SocialPlatform; url: string };

// A list as it appears on a profile: enough for the card, not the full items.
export type ListSummary = {
  slug: string;
  title: string;
  description: string | null;
  itemCount: number;
  coverImages: string[]; // item images in list order, already trimmed to the grid
};

export type Profile = {
  handle: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  about: string | null;
  socialLinks: SocialLink[];
  lists: ListSummary[];
};
