import { NextResponse, type NextRequest } from "next/server";
import { scrapeProduct } from "@/lib/scrape";
import { hasSupabase } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";

// C4 "Fetch details": reads a product page for a signed-in creator and
// answers within 8 seconds, with the product or with a reason the screen can
// turn into the manual path. (A Route Handler is Next's plain HTTP endpoint,
// like a Rails API controller action.)
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  if (!hasSupabase()) return NextResponse.json({ ok: false, reason: "signed_out" }, { status: 401 });
  const db = await createUserClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, reason: "signed_out" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const result = await scrapeProduct(typeof body?.url === "string" ? body.url.slice(0, 2000) : "");
  return NextResponse.json(result);
}
