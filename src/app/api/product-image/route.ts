import { NextResponse, type NextRequest } from "next/server";
import { storeImageFile, storeImageFromUrl } from "@/lib/creator/images";
import { normaliseUrl } from "@/lib/scrape/extract";
import { hasSupabase } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";

// One picture into the creator's storage folder, answering its address:
// either a file they picked (already scaled down in the browser) or the
// address of a picture found on the product's page, which is fetched and
// copied. The details form calls this once per picture before it saves, so a
// product with twenty pictures is twenty small requests rather than one huge
// one, and the save itself only carries addresses.
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (!hasSupabase()) return NextResponse.json({ error: "signed_out" }, { status: 401 });
  const db = await createUserClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "signed_out" }, { status: 401 });

  let stored: string | null = null;
  if (request.headers.get("content-type")?.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
    const url = normaliseUrl(typeof body?.url === "string" ? body.url.slice(0, 2000) : "");
    if (!url) return NextResponse.json({ error: "bad_request" }, { status: 400 });
    stored = await storeImageFromUrl(db, user.id, url);
  } else {
    const form = await request.formData().catch(() => null);
    stored = await storeImageFile(db, user.id, form?.get("file") ?? null);
  }
  // 422: we understood the request, but what came back was not a usable picture.
  return stored ? NextResponse.json({ url: stored }) : NextResponse.json({ error: "not_a_picture" }, { status: 422 });
}
