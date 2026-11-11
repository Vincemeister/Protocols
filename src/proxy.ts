import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, hasSupabase } from "@/lib/supabase/env";

// Runs before every page request (Next 16 calls this file "proxy"; it was
// "middleware" before). Two jobs:
//   1. keep the Supabase session cookie fresh, so Server Components always
//      see a valid session;
//   2. catch a sign-in link that landed on the home page (Supabase falls back
//      to the site URL when a redirect address is not on its allow-list) and
//      send it to /auth/callback, where the code is exchanged for a session.
export async function proxy(request: NextRequest) {
  if (!hasSupabase()) return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/" && searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // Validates the token with Supabase and refreshes it when it is about to expire.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Everything except static files, images, the brand assets and the dev pages.
  matcher: ["/((?!_next/static|_next/image|brand/|dev/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
