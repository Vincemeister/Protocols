"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Recording a spoken review in the browser:
//   * MediaRecorder captures the audio (kept with the review for good);
//   * an AnalyserNode reads the loudness for the level wave;
//   * where the browser offers it, SpeechRecognition writes the words into
//     the field while the creator talks ("Your words appear as you speak").
//
// The live words are a preview. When a transcription service is set up on
// the server, its transcript replaces them on Stop; when none is, they are
// the transcript.

export type RecorderProblem = "unsupported" | "denied";
export interface Recording { audio: Blob | null; live: string }

const BARS = 26;
const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

// The Web Speech API is not in TypeScript's DOM types.
interface SpeechResult { isFinal: boolean; 0: { transcript: string } }
interface SpeechRecognitionLike {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((e: { results: ArrayLike<SpeechResult> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type SpeechCtor = new () => SpeechRecognitionLike;

function speechCtor(): SpeechCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Phones give the microphone to one listener at a time, so live words and a recording cannot be relied on together there. */
const isPhone = () => typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

interface Options {
  /** Called with everything heard so far, many times a second. */
  onLive?: (text: string) => void;
  /**
   * Whether the server will transcribe the recording itself. If it will, live
   * words are skipped on phones (see isPhone) so the recording stays clean;
   * if it will not, live words are the only transcript and are always tried.
   */
  serverTranscribes: boolean;
}

export function useRecorder({ onLive, serverTranscribes }: Options) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0));
  const [problem, setProblem] = useState<RecorderProblem | null>(null);
  const [live, setLive] = useState(false);

  // Everything that must be shut down again, kept outside React state.
  const session = useRef<{
    stream: MediaStream; recorder: MediaRecorder; chunks: Blob[]; context?: AudioContext; speech?: SpeechRecognitionLike;
    timers: ReturnType<typeof setInterval>[]; heard: string; active: boolean;
  } | null>(null);
  const onLiveRef = useRef(onLive);
  useEffect(() => { onLiveRef.current = onLive; }, [onLive]);

  type Session = NonNullable<typeof session.current>;
  const shutDown = useCallback((s: Session | null) => {
    if (!s) return;
    s.active = false;
    s.timers.forEach(clearInterval);
    try { s.speech?.abort(); } catch { /* already stopped */ }
    s.stream.getTracks().forEach((t) => t.stop());
    void s.context?.close().catch(() => undefined);
  }, []);
  // Leaving the screen mid-recording releases the microphone.
  useEffect(() => () => { shutDown(session.current); session.current = null; }, [shutDown]);

  const start = useCallback(async () => {
    setProblem(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setProblem("unsupported");
      return false;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setProblem("denied");
      return false;
    }

    const mimeType = MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const s = { stream, recorder, chunks: [] as Blob[], timers: [] as ReturnType<typeof setInterval>[], heard: "", active: true } as NonNullable<typeof session.current>;
    session.current = s;
    recorder.ondataavailable = (e) => { if (e.data.size) s.chunks.push(e.data); };
    recorder.start(1000);

    // The level wave: loudness ten times a second, newest bar on the right.
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new Ctx();
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      s.context = context;
      s.timers.push(setInterval(() => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const v of samples) sum += ((v - 128) / 128) ** 2;
        const loudness = Math.min(1, Math.sqrt(sum / samples.length) * 6);
        setLevels((prev) => [...prev.slice(1), loudness]);
      }, 100));
    } catch {
      // No wave, but the recording still works.
    }

    const began = Date.now();
    setSeconds(0);
    s.timers.push(setInterval(() => setSeconds(Math.floor((Date.now() - began) / 1000)), 250));

    // Live words, where the browser can do it.
    const Speech = speechCtor();
    const useLive = Boolean(Speech) && (!serverTranscribes || !isPhone());
    setLive(useLive);
    if (Speech && useLive) {
      let finished = ""; // what earlier recognition sessions heard (the browser ends one after a pause)
      let quickEnds = 0; // sessions that ended at once: the sign that recognition is not available here
      const listen = () => {
        const speech = new Speech();
        speech.continuous = true;
        speech.interimResults = true;
        speech.lang = navigator.language || "en-US";
        let current = "";
        const opened = Date.now();
        speech.onresult = (e) => {
          current = Array.from(e.results).map((r) => r[0].transcript).join(" ");
          s.heard = `${finished} ${current}`.replace(/\s+/g, " ").trim();
          onLiveRef.current?.(s.heard);
        };
        speech.onerror = () => undefined;
        speech.onend = () => {
          finished = `${finished} ${current}`.trim();
          quickEnds = Date.now() - opened < 1000 && !current ? quickEnds + 1 : 0;
          if (!s.active) return;
          // Recognition that keeps ending straight away (no service, no permission) is not restarted for ever.
          if (quickEnds >= 3) return setLive(Boolean(s.heard));
          try { listen(); } catch { /* give up on live words */ }
        };
        s.speech = speech;
        speech.start();
      };
      try { listen(); } catch { setLive(false); }
    }

    setLevels(Array(BARS).fill(0));
    setRecording(true);
    return true;
  }, [serverTranscribes]);

  /** Ends the recording and hands back the audio and whatever the browser heard. */
  const stop = useCallback(async (): Promise<Recording> => {
    const s = session.current;
    if (!s) return { audio: null, live: "" };
    session.current = null;
    s.active = false; // so the speech recogniser is not restarted when it ends
    setRecording(false);
    const audio = await new Promise<Blob | null>((resolve) => {
      if (s.recorder.state === "inactive") return resolve(null);
      s.recorder.onstop = () => resolve(s.chunks.length ? new Blob(s.chunks, { type: s.recorder.mimeType || s.chunks[0].type }) : null);
      s.recorder.stop();
    });
    // Give the speech recogniser a moment to settle its last words.
    try { s.speech?.stop(); } catch { /* already stopped */ }
    if (s.speech) await new Promise((r) => setTimeout(r, 400));
    shutDown(s);
    return { audio, live: s.heard };
  }, [shutDown]);

  return { recording, seconds, levels, live, problem, start, stop };
}
