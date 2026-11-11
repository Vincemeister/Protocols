"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabase } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";

export interface SignInState {
  /** Shown under the email field, in the design system's error style. */
  error?: string;
}

/** Where Supabase sends the browser back to after Google or the emailed link. */
async function callbackUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/auth/callback`;
}

const NOT_CONNECTED = "Sign-in isn't connected yet: add the Supabase values to .env.local.";

/** B1 "Send me a link": emails a magic link, new or returning, then shows B2. */
export async function sendLink(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter your email address, like you@example.com." };
  if (!hasSupabase()) return { error: NOT_CONNECTED };

  const supabase = await createUserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: await callbackUrl(), shouldCreateUser: true },
  });
  if (error) {
    return {
      error: error.status === 429
        ? "We just sent you a link. Give it a minute before asking for another."
        : "We couldn't send the link. Check the address and try again.",
    };
  }
  redirect(`/sign-in/check-email?email=${encodeURIComponent(email)}`);
}

/** B1 "Continue with Google": hands over to Google, which returns to /auth/callback. */
export async function continueWithGoogle(): Promise<void> {
  if (!hasSupabase()) redirect("/sign-in?error=not-connected");
  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: await callbackUrl() },
  });
  if (error || !data.url) redirect("/sign-in?error=google");
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  if (hasSupabase()) {
    const supabase = await createUserClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
