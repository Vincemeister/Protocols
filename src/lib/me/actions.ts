"use server";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/creator/actions";
import { storeImageFile } from "@/lib/creator/images";
import { requireCreator } from "@/lib/creator/session";
import { USERNAME_PATTERN } from "@/lib/creator/slug";
import { PUBLIC_DATA } from "@/lib/data/dataset";
import { normaliseUrl } from "@/lib/scrape/extract";
import { createUserClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

// The writes behind the phase 4 screens: referral codes, notifications,
// followers, settings, and the three deletions. As everywhere, row-level
// security is the guard; the checks here are for readable messages.

const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const isId = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/** What a form shows after a save that stays on the same screen. */
export interface SavedState extends FormState { saved?: boolean }

// --- C10 Referrals ---------------------------------------------------------

/** Sets, changes or (with an empty code) removes the referral code of one product. */
export async function saveCode(_prev: SavedState, form: FormData): Promise<SavedState> {
  const me = await requireCreator();
  const productId = text(form, "product", 40);
  if (!isId(productId)) return { error: "That product no longer exists." };
  const code = text(form, "code", 40);
  const benefit = text(form, "benefit", 40);
  const { error } = code
    ? await me.db.from("referral_codes").upsert({ product_id: productId, code, benefit_text: benefit || null, status: "active" })
    : await me.db.from("referral_codes").delete().eq("product_id", productId);
  if (error) return { error: "We couldn't save the code. Try again." };
  updateTag(PUBLIC_DATA);
  return { saved: true };
}

// --- C11 Notifications -----------------------------------------------------

export async function markAllRead(): Promise<void> {
  const me = await requireCreator();
  await me.db.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", me.profile.id).is("read_at", null);
}

// --- C12 Followers ---------------------------------------------------------

export async function removeFollower(followerId: string): Promise<void> {
  const me = await requireCreator();
  if (!isId(followerId)) return;
  await me.db.from("follows").delete().match({ follower_id: followerId, followee_id: me.profile.id });
  updateTag(PUBLIC_DATA);
}

// --- C14 Settings: profile -------------------------------------------------

const LINK_KINDS = ["youtube", "instagram", "tiktok", "x", "website"];

function linkKind(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (/(^|\.)youtube\.com$|^youtu\.be$/.test(host)) return "youtube";
  if (/(^|\.)instagram\.com$/.test(host)) return "instagram";
  if (/(^|\.)tiktok\.com$/.test(host)) return "tiktok";
  if (/^(x|twitter)\.com$/.test(host)) return "x";
  return "website";
}

export async function saveProfile(_prev: SavedState, form: FormData): Promise<SavedState> {
  const me = await requireCreator();
  const name = text(form, "name", 60);
  const username = text(form, "username", 30).toLowerCase();
  const fields: Record<string, string> = {};
  if (!name) fields.name = "Enter the name people know you by.";
  if (!USERNAME_PATTERN.test(username)) fields.username = "3 to 30 characters: letters, numbers, dots and underscores.";

  // Up to four links, in the order given; the kind (and so the icon) follows the address.
  const links: { kind: string; url: string }[] = [];
  form.getAll("link").map(String).forEach((raw, i) => {
    if (!raw.trim()) return;
    const url = normaliseUrl(raw);
    if (!url) fields[`link${i}`] = "That doesn't look like a web address.";
    else if (links.length < 4) links.push({ kind: linkKind(url), url });
  });
  if (Object.keys(fields).length) return { fields };

  const changes: Record<string, unknown> = {
    display_name: name, username, bio: text(form, "bio", 80) || null,
    about: String(form.get("about") ?? "").replace(/\r\n/g, "\n").trim().slice(0, 1500) || null,
    links: links.filter((l) => LINK_KINDS.includes(l.kind)),
  };
  const avatar = await storeImageFile(me.db, me.uid, form.get("avatar_file"));
  if (avatar) changes.avatar_url = avatar;
  else if (form.get("avatar_removed") === "1") changes.avatar_url = null;

  const { error } = await me.db.from("profiles").update(changes).eq("id", me.profile.id);
  if (error) {
    if (error.code === "23505" || error.code === "23514") return { fields: { username: "That username is taken. Try another." } };
    return { error: "We couldn't save that. Try again." };
  }
  updateTag(PUBLIC_DATA);
  // A new username is a new address for every page of theirs: start again from the settings screen.
  if (username !== me.profile.username) redirect("/settings/profile?saved=1");
  return { saved: true };
}

// --- C15 Settings: account -------------------------------------------------

export async function changeEmail(_prev: SavedState, form: FormData): Promise<SavedState> {
  const me = await requireCreator();
  const email = text(form, "email", 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { fields: { email: "Enter an email address, like you@example.com." } };
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  // Supabase emails a link to the new address; the change takes effect when it is opened.
  const { error } = await me.db.auth.updateUser({ email }, { emailRedirectTo: `${proto}://${host}/auth/callback` });
  if (error) {
    return { fields: { email: error.status === 422 ? "That address is already in use, or is the one you have now." : "We couldn't send the confirmation. Try again in a minute." } };
  }
  return { saved: true };
}

// --- C16 Settings: privacy, and the theme ----------------------------------

export async function savePrivacy(_prev: SavedState, form: FormData): Promise<SavedState> {
  const me = await requireCreator();
  const { error } = await me.db.from("profiles").update({ is_public: form.get("is_public") === "on" }).eq("id", me.profile.id);
  if (error) return { error: "We couldn't save that. Try again." };
  updateTag(PUBLIC_DATA);
  return { saved: true };
}

/**
 * Remembers the theme with the account too, so it follows the creator to
 * another device. The cookie has already applied it on this one, so this
 * never redirects or complains: signed out, it simply does nothing.
 */
export async function saveTheme(theme: "light" | "dark" | null): Promise<void> {
  const viewer = await getViewer();
  if (!viewer?.profile) return;
  const db = await createUserClient();
  await db.from("profiles").update({ theme }).eq("id", viewer.profile.id);
}

// --- C17 Deletions ---------------------------------------------------------

export async function deleteProduct(productId: string): Promise<{ error: string } | void> {
  const me = await requireCreator();
  if (!isId(productId)) return { error: "That product no longer exists." };
  const { data: product } = await me.db.from("products").select("list_id").eq("id", productId).eq("owner_id", me.profile.id).maybeSingle<{ list_id: string }>();
  if (!product) return { error: "That product no longer exists." };
  const { error } = await me.db.from("products").delete().eq("id", productId).eq("owner_id", me.profile.id);
  if (error) return { error: "We couldn't delete it. Try again." };
  updateTag(PUBLIC_DATA);
  redirect(`/lists/${product.list_id}/edit`);
}

export async function deleteList(listId: string): Promise<{ error: string } | void> {
  const me = await requireCreator();
  if (!isId(listId)) return { error: "That list no longer exists." };
  // Its products, with their reviews and codes, go with it (foreign keys).
  const { error } = await me.db.from("lists").delete().eq("id", listId).eq("owner_id", me.profile.id);
  if (error) return { error: "We couldn't delete it. Try again." };
  updateTag(PUBLIC_DATA);
  redirect("/lists");
}

/** Empties one of the user's storage folders, a hundred files at a time. */
async function emptyFolder(me: Awaited<ReturnType<typeof requireCreator>>, bucket: string) {
  for (let round = 0; round < 20; round++) {
    const { data } = await me.db.storage.from(bucket).list(me.uid, { limit: 100 });
    if (!data?.length) return;
    const { error } = await me.db.storage.from(bucket).remove(data.map((f) => `${me.uid}/${f.name}`));
    if (error) return;
  }
}

export async function deleteAccount(confirmation: string): Promise<{ error: string } | void> {
  const me = await requireCreator();
  if (confirmation.trim().toLowerCase() !== me.profile.username.toLowerCase()) return { error: "Type your username exactly to confirm." };
  // Pictures and recordings first (the database function cannot reach storage), then everything else.
  await Promise.all([emptyFolder(me, "images"), emptyFolder(me, "audio")]);
  const { error } = await me.db.rpc("delete_my_account");
  if (error) return { error: "We couldn't delete the account. Try again." };
  await me.db.auth.signOut();
  updateTag(PUBLIC_DATA);
  redirect("/");
}
