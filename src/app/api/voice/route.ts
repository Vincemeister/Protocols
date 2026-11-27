import { NextResponse, type NextRequest } from "next/server";
import { hasSupabase } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";
import { clampReview } from "@/lib/voice/tidy";
import { canTranscribe, tidy, transcribe } from "@/lib/voice/transcribe";

// C6, on Stop: keep the recording, turn it into text, tidy it (build brief,
// section 6). Also plain dictation for other fields, when no product is named. Answers { audioPath, raw, tidied } where `tidied` is null when
// there was nothing to tidy or the tidy pass could not be trusted.
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = { "audio/webm": "webm", "audio/mp4": "m4a", "audio/mpeg": "mp3", "audio/ogg": "ogg", "audio/wav": "wav", "audio/x-m4a": "m4a", "audio/aac": "aac" };

export async function POST(request: NextRequest) {
  if (!hasSupabase()) return NextResponse.json({ error: "signed_out" }, { status: 401 });
  const db = await createUserClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "signed_out" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  const productId = String(form?.get("product") ?? "");
  // What the browser heard while the creator spoke; used when no transcription service is set up.
  const live = String(form?.get("live") ?? "").replace(/\s+/g, " ").trim().slice(0, 4000);
  // With a product this is a review: the recording is kept with it. Without one it is plain dictation
  // (a list's intro): transcribed, tidied, and nothing kept.
  const forReview = productId !== "";
  if (!(audio instanceof Blob) || !audio.size || (forReview && !/^[0-9a-f-]{36}$/i.test(productId))) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (audio.size > MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });

  // "audio/webm;codecs=opus" → "audio/webm"
  const type = audio.type.split(";")[0].trim().toLowerCase();
  const ext = EXTENSIONS[type];
  if (!ext) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  let audioPath: string | null = null;
  if (forReview) {
    // Only for a product of theirs (row-level security hides everyone else's drafts).
    const { data: product } = await db.from("products").select("id").eq("id", productId).maybeSingle();
    if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const path = `${user.id}/${productId}-${Date.now()}.${ext}`;
    const upload = await db.storage.from("audio").upload(path, audio, { contentType: type });
    audioPath = upload.error ? null : path;
    if (upload.error) console.error("Audio upload failed", upload.error.message);
  }

  const deadline = AbortSignal.timeout(45_000);
  let raw = live;
  let source: "service" | "browser" = "browser";
  if (canTranscribe()) {
    const heard = await transcribe(audio, `review.${ext}`, deadline).catch(() => null);
    if (heard) {
      raw = heard;
      source = "service";
    }
  }
  if (!raw) return NextResponse.json({ audioPath, raw: "", tidied: null, source });

  raw = clampReview(raw, 4000);
  const tidied = await tidy(raw, deadline).catch(() => null);
  return NextResponse.json({ audioPath, raw, tidied, source });
}
