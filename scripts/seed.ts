// Loads supabase/seed/*.json into Supabase: uploads images to the `images`
// Storage bucket, then replaces the creator's lists, items and referrals.
//
//   npm run db:seed
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
// Re-running is safe: the user is upserted on handle and their lists are rebuilt.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

type SeedItem = {
  kind: "product" | "tool" | "book" | "step";
  title: string;
  image?: string;
  url?: string;
  source?: string;
  price?: string;
  review: string;
  description?: string;
  referral?: { code?: string; url?: string; pitch?: string };
};
type SeedList = { slug: string; title: string; description: string; items: SeedItem[] };
type SeedUser = {
  handle: string;
  name: string;
  avatar?: string;
  bio: string;
  about: string;
  social_links: { platform: string; url: string }[];
  lists: SeedList[];
};

const root = path.resolve(import.meta.dirname, "..");
const BUCKET = "images";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

function check<T>(result: { data: T; error: unknown }, what: string): NonNullable<T> {
  if (result.error) throw new Error(`${what}: ${JSON.stringify(result.error)}`);
  return result.data as NonNullable<T>;
}

async function upload(handle: string, file: string): Promise<string> {
  const body = await readFile(path.join(root, "public/seed", handle, file));
  const key = `seed/${handle}/${file}`;
  check(
    await supabase.storage.from(BUCKET).upload(key, body, { contentType: "image/jpeg", upsert: true }),
    `upload ${key}`,
  );
  return supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}

async function seedUser(seed: SeedUser) {
  const avatarUrl = seed.avatar ? await upload(seed.handle, seed.avatar) : null;

  const user = check(
    await supabase
      .from("users")
      .upsert(
        {
          handle: seed.handle,
          name: seed.name,
          avatar_url: avatarUrl,
          bio: seed.bio,
          about: seed.about,
          social_links: seed.social_links,
        },
        { onConflict: "handle" },
      )
      .select("id")
      .single(),
    `upsert user ${seed.handle}`,
  );

  check(await supabase.from("lists").delete().eq("user_id", user.id), "clear lists");

  for (const [listPos, list] of seed.lists.entries()) {
    const listRow = check(
      await supabase
        .from("lists")
        .insert({
          user_id: user.id,
          slug: list.slug,
          title: list.title,
          description: list.description,
          position: listPos,
          published: true,
        })
        .select("id")
        .single(),
      `insert list ${list.slug}`,
    );

    const usedSlugs = new Set<string>();
    for (const [itemPos, item] of list.items.entries()) {
      let slug = slugify(item.title);
      while (usedSlugs.has(slug)) slug = `${slug}-${itemPos}`;
      usedSlugs.add(slug);

      const itemRow = check(
        await supabase
          .from("items")
          .insert({
            list_id: listRow.id,
            slug,
            kind: item.kind,
            title: item.title,
            url: item.url ?? null,
            image_url: item.image ? await upload(seed.handle, item.image) : null,
            price: item.price ?? null,
            source: item.source ?? null,
            review: item.review,
            description: item.description ?? null,
            position: itemPos,
          })
          .select("id")
          .single(),
        `insert item ${slug}`,
      );

      if (item.referral) {
        check(
          await supabase.from("referrals").insert({
            item_id: itemRow.id,
            code: item.referral.code ?? null,
            url: item.referral.url ?? null,
            pitch: item.referral.pitch ?? null,
          }),
          `insert referral ${slug}`,
        );
      }
    }
    console.log(`  ${list.title}: ${list.items.length} items`);
  }
}

const seedDir = path.join(root, "supabase/seed");
for (const file of (await readdir(seedDir)).filter((f) => f.endsWith(".json"))) {
  const seed: SeedUser = JSON.parse(await readFile(path.join(seedDir, file), "utf8"));
  console.log(`Seeding @${seed.handle}`);
  await seedUser(seed);
}
console.log("Done.");
