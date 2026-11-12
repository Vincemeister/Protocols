"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { PUBLIC_DATA } from "@/lib/data/dataset";
import { createUserClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

// Follow, like and save. Each is one row added or removed as the signed-in
// user; the database's row-level rules make sure nobody can do it for someone
// else. A signed-out visitor is sent to sign in.

async function me() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  // Signed in but no username yet: onboarding (phase 4) will take over here.
  if (!viewer.profile) redirect("/");
  return { id: viewer.profile.id, db: await createUserClient() };
}

export async function setFollow(profileId: string, on: boolean) {
  const { id, db } = await me();
  if (id === profileId) return;
  if (on) await db.from("follows").upsert({ follower_id: id, followee_id: profileId }, { ignoreDuplicates: true });
  else await db.from("follows").delete().match({ follower_id: id, followee_id: profileId });
  updateTag(PUBLIC_DATA); // follower counts are part of the cached public data
}

export async function setLike(productId: string, on: boolean) {
  const { id, db } = await me();
  if (on) await db.from("likes").upsert({ user_id: id, product_id: productId }, { ignoreDuplicates: true });
  else await db.from("likes").delete().match({ user_id: id, product_id: productId });
  updateTag(PUBLIC_DATA);
}

export async function setSaved(target: { productId: string } | { listId: string }, on: boolean) {
  const { id, db } = await me();
  const row: Record<string, string> = "productId" in target ? { user_id: id, product_id: target.productId } : { user_id: id, list_id: target.listId };
  if (on) {
    const { count } = await db.from("saves").select("id", { count: "exact", head: true }).match(row);
    if (!count) await db.from("saves").insert(row);
  } else {
    await db.from("saves").delete().match(row);
  }
  updateTag(PUBLIC_DATA);
}
