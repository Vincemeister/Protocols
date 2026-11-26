import "server-only";
import { redirect } from "next/navigation";
import { createUserClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

/**
 * The gate for every creator screen and action: someone signed in who has a
 * profile. A visitor goes to sign-in; someone signed in without a username
 * yet goes to the welcome screen first.
 */
export async function requireCreator() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  if (!viewer.profile) redirect("/welcome");
  const db = await createUserClient();
  // Storage folders are named after the auth user's id (see the storage policies).
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/sign-in");
  return { profile: viewer.profile, uid: user.id, db };
}

/** The same gate for screens that only read: the viewer, with a profile for sure. */
export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  if (!viewer.profile) redirect("/welcome");
  return { ...viewer, profile: viewer.profile };
}

export type Creator = Awaited<ReturnType<typeof requireCreator>>;
