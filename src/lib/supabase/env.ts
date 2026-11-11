// Supabase connection settings. Both values are public by design (the key is
// the publishable one; row-level security is what protects the data).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** False when .env.local has no Supabase values: pages render, sign-in explains what is missing. */
export function hasSupabase() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}
