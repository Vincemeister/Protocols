import { NextResponse, type NextRequest } from "next/server";
import { hasSupabase } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";

// Google and the emailed link both come back here with a one-time code,
// which is exchanged for a session cookie.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const home = new URL("/", request.url);
  const failed = new URL("/sign-in?error=link", request.url);
  if (!code || !hasSupabase()) return NextResponse.redirect(failed);

  const supabase = await createUserClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(failed);
  // Someone signing in for the first time has no profile yet: they choose a name and username first.
  const { data: profile } = await supabase.rpc("my_profile").maybeSingle();
  return NextResponse.redirect(profile ? home : new URL("/welcome", request.url));
}
