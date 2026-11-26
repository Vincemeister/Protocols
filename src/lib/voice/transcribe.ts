import "server-only";
import { TIDY_PROMPT, isFaithful, tidyTranscript } from "./tidy";

// Speech to text for the voice review. One provider, one key:
//   OPENAI_API_KEY            turns transcription on (without it the browser's
//                             own live transcript is used, see ReviewForm)
//   OPENAI_TRANSCRIBE_MODEL   default "gpt-transcribe"
//   OPENAI_TIDY_MODEL         optional. When set, a language model does the
//                             tidy pass and the result is checked word by
//                             word; when unset (the default) the tidy pass is
//                             the rule-based one in tidy.ts, which cannot add
//                             a word by construction.

const API = "https://api.openai.com/v1";

export const canTranscribe = () => Boolean(process.env.OPENAI_API_KEY);

export async function transcribe(audio: Blob, filename: string, signal: AbortSignal): Promise<string | null> {
  const form = new FormData();
  form.set("file", audio, filename);
  form.set("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-transcribe");
  form.set("response_format", "json");
  const res = await fetch(`${API}/audio/transcriptions`, {
    method: "POST", signal, body: form, headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  });
  if (!res.ok) {
    console.error("Transcription failed", res.status, (await res.text()).slice(0, 300));
    return null;
  }
  const text = ((await res.json()) as { text?: string }).text?.trim();
  return text || null;
}

/** The tidy pass: returns the tidied text, or null when there is nothing to tidy or the result cannot be trusted. */
export async function tidy(raw: string, signal: AbortSignal): Promise<string | null> {
  let tidied = tidyTranscript(raw);
  const model = process.env.OPENAI_TIDY_MODEL;
  if (model && canTranscribe()) {
    try {
      const res = await fetch(`${API}/chat/completions`, {
        method: "POST", signal,
        headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ model, messages: [{ role: "system", content: TIDY_PROMPT }, { role: "user", content: raw }] }),
      });
      const answer = res.ok ? ((await res.json()) as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content?.trim() : null;
      // The model's version is used only if every word of it is the creator's, in order.
      if (answer && isFaithful(raw, answer)) tidied = answer;
    } catch {
      // Keep the rule-based version.
    }
  }
  if (!tidied || tidied === raw.trim() || !isFaithful(raw, tidied)) return null;
  return tidied;
}
