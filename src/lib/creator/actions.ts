"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { PUBLIC_DATA } from "@/lib/data/dataset";
import { domainOf, normaliseUrl } from "@/lib/scrape/extract";
import { hasSupabase } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";
import { storeImageFile, storeImageFromUrl } from "./images";
import { MAX_REVIEW, MIN_REVIEW } from "./limits";
import { requireCreator, type Creator } from "./session";
import { RESERVED_LIST_SLUGS, USERNAME_PATTERN, slugify, uniqueSlug } from "./slug";

// The creator loop's writes (phase 3): the profile, lists, products, reviews.
// Each is a Server Action: a function that runs on the server and is called
// straight from a <form action={…}> (Rails: a controller action without the
// route). Row-level security in the database is the real guard; the checks
// here exist to give a readable message.

/** What a form gets back when it cannot be saved: a message per field, or one for the whole form. */
export interface FormState {
  fields?: Record<string, string>;
  error?: string;
}

const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const long = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);
const isId = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// ---------------------------------------------------------------------------
// B5, first step: who are you
// ---------------------------------------------------------------------------

/** Live "Available" check under the username field. */
export async function checkUsername(candidate: string): Promise<"available" | "taken" | "invalid"> {
  const username = candidate.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(username)) return "invalid";
  if (!hasSupabase()) return "available";
  const db = await createUserClient();
  const { data, error } = await db.rpc("username_available", { candidate: username });
  if (error) return "available"; // could not ask: the save itself still refuses a taken name
  return data ? "available" : "taken";
}

export async function createProfile(_prev: FormState, form: FormData): Promise<FormState> {
  if (!hasSupabase()) return { error: "Sign-in isn't connected yet: add the Supabase values to .env.local." };
  const db = await createUserClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/sign-in");

  const name = text(form, "name", 60);
  const username = text(form, "username", 30).toLowerCase();
  const bio = text(form, "bio", 80);
  const fields: Record<string, string> = {};
  if (!name) fields.name = "Enter the name people know you by.";
  if (!USERNAME_PATTERN.test(username)) fields.username = "3 to 30 characters: letters, numbers, dots and underscores.";
  if (Object.keys(fields).length) return { fields };

  const avatar = await storeImageFile(db, user.id, form.get("avatar_file"));
  const { error } = await db.from("profiles").insert({ auth_user_id: user.id, username, display_name: name, bio: bio || null, avatar_url: avatar });
  if (error) {
    // 23505 unique (the username, or this person already has a profile), 23514 a reserved word.
    if (error.code === "23505" && /auth_user_id/.test(error.message)) redirect("/lists/new");
    if (error.code === "23505" || error.code === "23514") return { fields: { username: "That username is taken. Try another." } };
    return { error: "We couldn't save that. Try again." };
  }
  updateTag(PUBLIC_DATA);
  redirect("/lists/new");
}

// ---------------------------------------------------------------------------
// C3: new list / edit list
// ---------------------------------------------------------------------------

async function insertList(me: Creator, values: { name: string; intro?: string; cover?: string | null; isPublic?: boolean; numbered?: boolean }) {
  const { data: mine } = await me.db.from("lists").select("slug, position").eq("owner_id", me.profile.id);
  const slug = uniqueSlug(slugify(values.name, "list"), [...(mine ?? []).map((l) => l.slug as string), ...RESERVED_LIST_SLUGS]);
  const position = Math.max(0, ...(mine ?? []).map((l) => (l.position as number) + 1));
  return me.db.from("lists").insert({
    owner_id: me.profile.id, name: values.name, slug, intro: values.intro || null, cover_url: values.cover ?? null,
    is_public: values.isPublic ?? true, numbered: values.numbered ?? false, position,
  }).select("id, slug").single<{ id: string; slug: string }>();
}

export async function saveList(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireCreator();
  const id = text(form, "id", 40);
  const name = text(form, "name", 60);
  if (!name) return { fields: { name: "Give the list a name." } };
  const intro = long(form, "intro", 300);
  const isPublic = form.get("is_public") === "on";
  const numbered = form.get("numbered") === "on";
  // No cover to save: a list's cover is made of its products' pictures (CoverMosaic).

  if (!id) {
    const { data, error } = await insertList(me, { name, intro, isPublic, numbered });
    if (error || !data) return { error: "We couldn't create the list. Try again." };
    updateTag(PUBLIC_DATA);
    redirect(`/create?list=${data.id}`);
  }

  if (!isId(id)) return { error: "That list no longer exists." };
  // The address (slug) stays as it was: links people have shared must keep working.
  const changes: Record<string, unknown> = { name, intro: intro || null, is_public: isPublic, numbered };
  const { error } = await me.db.from("lists").update(changes).eq("id", id).eq("owner_id", me.profile.id);
  if (error) return { error: "We couldn't save the list. Try again." };
  updateTag(PUBLIC_DATA);
  redirect(`/lists/${id}/edit?saved=1`);
}

/** C8: the products of a list in their new order. */
export async function reorderProducts(listId: string, orderedIds: string[]): Promise<{ ok: boolean }> {
  const me = await requireCreator();
  if (!isId(listId) || !orderedIds.every(isId)) return { ok: false };
  const { error } = await me.db.rpc("reorder_products", { target_list: listId, ordered_ids: orderedIds });
  if (error) return { ok: false };
  updateTag(PUBLIC_DATA);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// C5 / C7: the product's details
// ---------------------------------------------------------------------------

export async function saveProduct(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireCreator();
  const id = text(form, "id", 40);
  const name = text(form, "name", 80);
  const brand = text(form, "brand", 60);
  const code = text(form, "code", 40);
  const benefit = text(form, "benefit", 40);
  const listChoice = text(form, "list", 40);
  const newListName = text(form, "new_list", 60);
  const sourceUrl = normaliseUrl(String(form.get("source_url") ?? ""));

  const fields: Record<string, string> = {};
  if (!name) fields.name = "Give the product a name.";
  if (listChoice === "new" && !newListName) fields.new_list = "Give the new list a name.";
  if (listChoice !== "new" && !isId(listChoice)) fields.list = "Choose a list.";
  if (id && !isId(id)) return { error: "That product no longer exists." };
  if (Object.keys(fields).length) return { fields };

  // The list: an existing one of theirs, or one made on the spot.
  let listId = listChoice;
  if (listChoice === "new") {
    const { data, error } = await insertList(me, { name: newListName });
    if (error || !data) return { fields: { new_list: "We couldn't create that list. Try again." } };
    listId = data.id;
  }

  // The picture: one they uploaded, else one they chose from the page, else the one already saved.
  const remote = normaliseUrl(String(form.get("image_remote") ?? ""));
  let image: string | null | undefined; // undefined = leave as it is
  const uploaded = await storeImageFile(me.db, me.uid, form.get("image_file"));
  if (uploaded) image = uploaded;
  else if (remote) image = await storeImageFromUrl(me.db, me.uid, remote);
  else if (form.get("image_removed") === "1") image = null;

  const { data: siblings } = await me.db.from("products").select("id, slug, position").eq("list_id", listId).eq("owner_id", me.profile.id);
  const others = (siblings ?? []).filter((p) => p.id !== id);
  const values: Record<string, unknown> = {
    name, brand: brand || null, source_url: sourceUrl, source_domain: sourceUrl ? domainOf(sourceUrl) : null,
  };
  if (image !== undefined && (image !== null || !remote)) values.image_url = image;

  // The brand's logo, found on the product's page: copied to our storage like the picture.
  const logoRemote = normaliseUrl(String(form.get("logo_remote") ?? ""));
  if (logoRemote) {
    const logo = await storeImageFromUrl(me.db, me.uid, logoRemote);
    if (logo) values.brand_logo_url = logo;
  } else if (form.get("logo_removed") === "1" || !brand) {
    values.brand_logo_url = null;
  }

  let productId = id;
  if (!id) {
    const { data, error } = await me.db.from("products").insert({
      ...values, list_id: listId, owner_id: me.profile.id,
      slug: uniqueSlug(slugify(name, "product"), others.map((p) => p.slug as string)),
      position: Math.max(0, ...others.map((p) => (p.position as number) + 1)),
    }).select("id").single<{ id: string }>();
    if (error || !data) return { error: "We couldn't save the product. Try again." };
    productId = data.id;
  } else {
    const { data: current } = await me.db.from("products").select("list_id, slug").eq("id", id).eq("owner_id", me.profile.id).maybeSingle<{ list_id: string; slug: string }>();
    if (!current) return { error: "That product no longer exists." };
    if (current.list_id !== listId) {
      // Moved to another list: it goes to the end there, and its address must be free in that list.
      values.list_id = listId;
      values.position = Math.max(0, ...others.map((p) => (p.position as number) + 1));
      values.slug = uniqueSlug(current.slug, others.map((p) => p.slug as string));
    }
    const { error } = await me.db.from("products").update(values).eq("id", id).eq("owner_id", me.profile.id);
    if (error) return { error: "We couldn't save the product. Try again." };
  }

  if (code) {
    const { error } = await me.db.from("referral_codes").upsert({ product_id: productId, code, benefit_text: benefit || null, status: "active" });
    if (error) return { error: "We couldn't save the referral code. Try again." };
  } else if (id) {
    await me.db.from("referral_codes").delete().eq("product_id", productId);
  }

  updateTag(PUBLIC_DATA);
  redirect(`/create/${productId}/review`);
}

// ---------------------------------------------------------------------------
// C6: the review. Publishing it is what makes the product public.
// ---------------------------------------------------------------------------

export async function publishReview(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireCreator();
  const productId = text(form, "product", 40);
  if (!isId(productId)) return { error: "That product no longer exists." };
  const body = long(form, "body", 4000);
  if (body.length < MIN_REVIEW) return { fields: { body: "Say a little more: at least a couple of sentences." } };
  // Too long is the creator's to trim; cutting it here would decide for them which words go.
  if (body.length > MAX_REVIEW) return { fields: { body: `Trim it to ${MAX_REVIEW} characters.` } };

  const { data: product } = await me.db.from("products").select("id").eq("id", productId).eq("owner_id", me.profile.id).maybeSingle();
  if (!product) return { error: "That product no longer exists." };
  const { data: existing } = await me.db.from("reviews").select("published_at").eq("product_id", productId).maybeSingle<{ published_at: string | null }>();

  // The recording and its raw transcript are kept with the review for good.
  // Only this user's own storage folder is accepted as the audio's location.
  const audioPath = String(form.get("audio_path") ?? "");
  const raw = long(form, "raw", 4000);
  const values: Record<string, unknown> = {
    product_id: productId, body_text: body, tidied: form.get("tidied") === "1",
    published_at: existing?.published_at ?? new Date().toISOString(),
  };
  if (audioPath.startsWith(`${me.uid}/`) && !audioPath.includes("..")) values.audio_url = audioPath;
  if (raw) values.raw_transcript = raw;

  const { error } = await me.db.from("reviews").upsert(values);
  if (error) return { error: "We couldn't publish that. Try again." };
  updateTag(PUBLIC_DATA);
  redirect(`/${me.profile.username}/products`);
}
