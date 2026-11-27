"use client";

import { useEffect, useRef, useState } from "react";
import { tidyTranscript } from "@/lib/voice/tidy";
import { useRecorder } from "./useRecorder";

const join = (a: string, b: string) => [a.trim(), b.trim()].filter(Boolean).join(" ");
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

interface Options {
  /** The field's text now, and how to change it. */
  value: string;
  onChange: (text: string) => void;
  /** Whether the server has a transcription service (see src/lib/voice/transcribe.ts). */
  serverTranscribes: boolean;
  /** Stops by itself after this long. */
  maxSeconds?: number;
}

/**
 * Speak instead of type, for any text field (a list's intro, say). The same
 * recorder and tidy pass as the review, without what belongs to a review:
 * nothing is kept, and there is no "as spoken" version to go back to.
 *
 * Spread `field` onto a <TextArea voice …>.
 */
export function useDictation({ value, onChange, serverTranscribes, maxSeconds = 60 }: Options) {
  const base = useRef(""); // what was in the field before Speak: speech is added after it
  const [working, setWorking] = useState(false);
  // A notice belongs to the text it was about: it goes away as soon as the creator types.
  const [notice, setNotice] = useState<{ text: string; about: string }>();
  const recorder = useRecorder({ serverTranscribes, onLive: (heard) => onChange(join(base.current, heard)) });

  async function start() {
    setNotice(undefined);
    base.current = value;
    await recorder.start();
  }

  async function stop() {
    setWorking(true);
    const { audio, live } = await recorder.stop();
    let raw = live;
    let tidied: string | null = null;
    try {
      if (audio) {
        const form = new FormData();
        form.set("audio", audio, "dictation");
        form.set("live", live);
        const res = await fetch("/api/voice", { method: "POST", body: form });
        if (res.ok) ({ raw, tidied } = (await res.json()) as { raw: string; tidied: string | null });
      }
    } catch {
      // Offline or the server failed: what the browser heard is used.
    }
    const spoken = tidied ?? (raw ? tidyTranscript(raw) || raw : "");
    if (spoken) onChange(join(base.current, spoken));
    else {
      onChange(base.current);
      setNotice({ text: "We couldn't make out any words. Try again, or type it.", about: base.current });
    }
    setWorking(false);
  }

  const stopRef = useRef(stop);
  useEffect(() => { stopRef.current = stop; });
  useEffect(() => {
    if (recorder.recording && recorder.seconds >= maxSeconds) void stopRef.current();
  }, [recorder.recording, recorder.seconds, maxSeconds]);

  const problem =
    recorder.problem === "denied" ? "We can't use your microphone. Allow it in your browser's settings, or type instead."
    : recorder.problem === "unsupported" ? "This browser can't record. Type instead."
    : notice && notice.about === value ? notice.text : undefined;

  return {
    recording: recorder.recording,
    working,
    /** A sentence for the field's help line while something is happening, else undefined. */
    status: working ? "Writing down what you said…" : recorder.recording ? (recorder.live ? "Your words appear as you speak." : "We'll write it down when you tap Stop.") : undefined,
    /** Why speaking did not work, when it did not. */
    problem,
    field: {
      voice: true as const,
      recording: recorder.recording,
      recordingTime: clock(recorder.seconds),
      levels: recorder.levels,
      micDisabled: working,
      onRecord: (on: boolean) => void (on ? start() : stop()),
    },
  };
}
