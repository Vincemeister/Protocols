import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/**
 * Supabase for the signed-in user, in Server Components, Server Actions and
 * Route Handlers. It reads the session from cookies, so anything that calls
 * it renders at request time (keep it behind <Suspense> on cached pages).
 */
export async function createUserClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; src/proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Anonymous, cookie-less Supabase for public pages. It reads nothing from the
 * request, so it is safe inside `'use cache'` functions; row-level security
 * limits it to public profiles, lists and reviewed products.
 */
export function createPublicClient() {
  return createClient(SUPABASE_URL!, SUPABASE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
