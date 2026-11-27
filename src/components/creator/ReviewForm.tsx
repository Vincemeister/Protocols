"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Icon, TextArea } from "@/components/ui";
import { publishReview, type FormState } from "@/lib/creator/actions";
import { MAX_RECORDING_SECONDS, MAX_REVIEW, MIN_REVIEW } from "@/lib/creator/limits";
import { tidyTranscript } from "@/lib/voice/tidy";
import { CreatorScreen } from "./CreatorScreen";
import { useRecorder } from "./useRecorder";

const PROMPTS = ["Why did you buy it?", "What surprised you?", "Who is it not for?", "How long have you had it?"];

interface ReviewFormProps {
  product: { id: string; name: string; brand?: string; image?: string; listName: string };
  /** The review as it stands, when there is one. */
  review?: { body: string; raw: string; audioPath: string; tidied: boolean; published: boolean } | null;
  /** Whether the server has a transcription service (see src/lib/voice/transcribe.ts). */
  serverTranscribes: boolean;
  backHref: string;
  /** For /dev/screens only: show a given state without a microphone. */
  demo?: { recording?: boolean; seconds?: number; text?: string; tidied?: boolean };
}

const join = (a: string, b: string) => [a.trim(), b.trim()].filter(Boolean).join(" ");
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * C6 Your review. Voice first: Speak records, the words are written down and
 * tidied (ums out, full stops in, nothing else), and "Use my words as spoken"
 * puts the raw transcript back. Typing is the same field. A product cannot be
 * published without it.
 */
export function ReviewForm({ product, review, serverTranscribes, backHref, demo }: ReviewFormProps) {
  const [text, setText] = useState(demo?.text ?? review?.body ?? "");
  const [raw, setRaw] = useState(review?.raw ?? "");
  const [audioPath, setAudioPath] = useState(review?.audioPath ?? "");
  const [tidied, setTidied] = useState(demo?.tidied ?? false);
  // Until the creator records or reverts on this visit, the saved "tidied" flag stands.
  const [voiceUsed, setVoiceUsed] = useState(false);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [prompt, setPrompt] = useState(0);
  // What was in the field before Speak was tapped: speech is added after it, never over it.
  const base = useRef("");

  const recorder = useRecorder({ serverTranscribes, onLive: (heard) => setText(join(base.current, heard)) });
  const recording = demo?.recording ?? recorder.recording;
  const seconds = demo?.seconds ?? recorder.seconds;

  const [state, submit, pending] = useActionState<FormState, FormData>(publishReview, {});

  async function startRecording() {
    setNotice(undefined);
    base.current = text;
    const ok = await recorder.start();
    if (ok) {
      setVoiceUsed(true);
      setTidied(false);
      setPrompt(0);
    }
  }

  async function stopRecording() {
    setWorking(true);
    const { audio, live } = await recorder.stop();
    let result: { audioPath: string | null; raw: string; tidied: string | null } = { audioPath: null, raw: live, tidied: null };
    try {
      if (audio) {
        const form = new FormData();
        form.set("audio", audio, "review");
        form.set("product", product.id);
        form.set("live", live);
        const res = await fetch("/api/voice", { method: "POST", body: form });
        if (res.ok) result = await res.json();
      }
    } catch {
      // Offline or the server failed: fall back to what the browser heard.
    }
    if (!result.tidied && result.raw) {
      const local = tidyTranscript(result.raw);
      if (local && local !== result.raw.trim()) result.tidied = local;
    }
    if (!result.raw) {
      setText(base.current);
      setNotice("We couldn't make out any words. Try again, or type your review.");
    } else {
      setRaw(join(base.current, result.raw));
      setText(join(base.current, result.tidied ?? result.raw));
      setTidied(Boolean(result.tidied));
      if (result.audioPath) setAudioPath(result.audioPath);
    }
    setWorking(false);
  }

  // A recording stops by itself at the limit; and while it runs, the highlighted prompt moves along.
  const stopRef = useRef(stopRecording);
  useEffect(() => { stopRef.current = stopRecording; });
  useEffect(() => {
    if (recorder.recording && recorder.seconds >= MAX_RECORDING_SECONDS) void stopRef.current();
  }, [recorder.recording, recorder.seconds]);
  useEffect(() => {
    if (!recorder.recording) return;
    const timer = setInterval(() => setPrompt((p) => (p + 1) % PROMPTS.length), 8000);
    return () => clearInterval(timer);
  }, [recorder.recording]);

  const length = text.trim().length;
  const tooLong = text.length > MAX_REVIEW;
  const micProblem =
    recorder.problem === "denied" ? "We can't use your microphone. Allow it in your browser's settings, or type your review."
    : recorder.problem === "unsupported" ? "This browser can't record. Type your review instead."
    : undefined;

  const heading = tidied ? "Read it back" : "Why is it on your list?";
  const intro = tidied
    ? "We took out the ums and added full stops. Every word is still yours; edit anything."
    : recording ? "Talk about one of these if you're stuck."
    : "Say it like you'd tell a friend who asked. Thirty seconds is plenty; we'll tidy the ums, not your words.";
  const help = tooLong ? undefined
    : working ? "Writing down what you said…"
    : recording ? (recorder.live || demo ? "Your words appear as you speak." : "We'll write it down when you tap Stop.")
    : tidied ? "Why did you buy it? What would you tell a friend?"
    : "At least a couple of sentences.";
  const footnote = recording ? "Tap Stop when you're done. We keep the recording."
    : audioPath || tidied ? "We keep your recording so you can add your voice to the page later."
    : "Products without a review stay hidden from your profile.";

  return (
    <CreatorScreen title="Your review" step="3 of 3" backHref={backHref}>
      <form action={submit}>
        <input type="hidden" name="product" value={product.id} />
        <input type="hidden" name="raw" value={raw} />
        <input type="hidden" name="audio_path" value={audioPath} />
        <input type="hidden" name="tidied" value={(voiceUsed ? tidied : review?.tidied) ? "1" : "0"} />

        <div className="creator-item">
          <div className="fv-referral-thumb creator-thumb-md">{product.image ? <img src={product.image} alt="" /> : <Icon name="image" />}</div>
          <div className="creator-item-text">
            <div className="body" style={{ fontWeight: 600 }}>{product.name}</div>
            <div className="caption creator-muted">{[product.brand, product.listName].filter(Boolean).join(" · ")}</div>
          </div>
        </div>

        <div className="creator-intro is-tight">
          <h2 className="heading-4">{heading}</h2>
          <p className="body-sm creator-muted">{intro}</p>
        </div>

        {state.error ? <Alert tone="danger" message={state.error} /> : null}
        {micProblem || notice ? <Alert tone="warning" message={(micProblem || notice)!} /> : null}

        <div className="creator-grow">
          <TextArea
            id="review" name="body" label="Your review" voice fill maxLength={recording || tooLong ? undefined : MAX_REVIEW}
            placeholder="Tap Speak, or type here." value={text} onChange={(v) => { setText(v); }}
            recording={recording} recordingTime={clock(seconds)} levels={demo ? undefined : recorder.levels}
            tidied={tidied && !recording} micDisabled={working || pending} micLabel={raw ? "Record again" : undefined}
            onRecord={(on) => (on ? startRecording() : stopRecording())}
            onRevert={() => { setText(raw); setTidied(false); setVoiceUsed(true); }}
            help={help}
            error={tooLong ? `That's ${text.length - MAX_REVIEW} characters too long. Trim it to ${MAX_REVIEW}.` : state.fields?.body}
          />
        </div>

        {tidied && !recording ? null : (
          <div className="creator-chips">
            {PROMPTS.map((label, i) => <Badge key={label} label={label} tone={recording && i === prompt ? "accent" : undefined} />)}
          </div>
        )}

        <div className="creator-foot" style={{ marginTop: 0 }}>
          <Button
            type="submit" variant="primary" size="lg" block
            disabled={pending || working || recording || tooLong || length < MIN_REVIEW}
            label={pending ? "Publishing…" : review?.published ? "Save your review" : `Publish to ${product.listName}`}
          />
          <p className="caption">{footnote}</p>
        </div>
      </form>
    </CreatorScreen>
  );
}
