import { connection, NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";

// Supabase pauses a free project after a week without activity, and a paused
// database takes the site and every new build down with it (it happened
// between 12 and 27 Nov 2026). Vercel calls this address once a day
// (vercel.json), which is activity enough. It reads one public row and says
// nothing about the data.
export async function GET() {
  // connection() marks this as "run on every request": without it the answer could be cached at build time.
  await connection();
  if (!hasSupabase()) return NextResponse.json({ ok: false, reason: "not_connected" });
  const { error } = await createPublicClient().from("profiles").select("id").limit(1);
  return NextResponse.json({ ok: !error }, { status: error ? 503 : 200 });
}
