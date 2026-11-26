"use client";

import { useId } from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { cx } from "./cx";
import { FieldShell, type FieldProps } from "./Field";
import { Icon } from "./Icon";
import { useSyncedState } from "./useSyncedState";

export interface TextAreaProps extends FieldProps {
  value?: string;
  placeholder?: string;
  rows?: number;
  /** Adds the Speak button; the review field always sets it. */
  voice?: boolean;
  /** Shows the Listening bar and turns Speak into Stop. */
  recording?: boolean;
  /** "0:14" */
  recordingTime?: string;
  /** Shows the "Tidied from your recording" badge and the revert link. */
  tidied?: boolean;
  onChange?: (value: string) => void;
  onRecord?: (recording: boolean) => void;
  onRevert?: () => void;
  // --- Beyond index.d.ts (phase 3) ---
  /** Bar heights from the microphone, each 0 to 1. Without it the wave shows its resting shape. */
  levels?: number[];
  /** Grows to fill its column, as on the review screen. */
  fill?: boolean;
  /** Greys out Speak while a recording is being written down. */
  micDisabled?: boolean;
  /** "Record again" once there is a recording. */
  micLabel?: string;
}

// Resting shape of the level wave, used when no live levels are passed.
const WAVE = [6, 10, 14, 8, 16, 12, 6, 10, 18, 8, 12, 6, 14, 10, 8, 16, 6, 12, 10, 8, 14, 6, 10, 16, 8, 12];

export function TextArea(props: TextAreaProps) {
  const { value = "", placeholder, rows = 4, voice, recording = false, recordingTime, tidied, onChange, onRecord, onRevert, levels, fill, micDisabled, micLabel, ...field } = props;
  const auto = useId();
  const id = field.id || auto;
  const [text, setText] = useSyncedState(value);
  const [on, setOn] = useSyncedState(recording);

  const control = (
    <textarea
      className="fv-textarea"
      id={id}
      name={field.name}
      value={text}
      placeholder={placeholder}
      maxLength={field.maxLength}
      rows={rows}
      disabled={field.disabled}
      aria-invalid={field.error ? true : undefined}
      aria-describedby={field.error || field.help ? `${id}-help` : undefined}
      style={fill ? { flex: "1 1 auto", minHeight: 200, resize: "none" } : undefined}
      onChange={(e) => {
        setText(e.target.value);
        onChange?.(e.target.value);
      }}
    />
  );

  if (!voice) return <FieldShell {...field} id={id} length={text.length}>{control}</FieldShell>;

  return (
    <FieldShell
      {...field}
      id={id}
      length={text.length}
      before={
        on ? (
          <div className="fv-rec-bar" role="status" aria-live="polite">
            <span className="fv-rec-dot" />
            Listening
            <span className="fv-rec-wave" aria-hidden="true">
              {WAVE.map((h, i) => <i key={i} style={{ height: levels ? 4 + Math.round(Math.min(1, levels[i] ?? 0) * 14) : h }} />)}
            </span>
            <span className="fv-rec-time">{recordingTime || "0:00"}</span>
          </div>
        ) : null
      }
      after={
        tidied ? (
          <div className="fv-tidy-bar">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Badge label="Tidied from your recording" tone="accent" icon="wand" />
            </span>
            <Button variant="link" size="sm" label="Use my words as spoken" icon="undo" onClick={onRevert} />
          </div>
        ) : null
      }
    >
      <div className="fv-voice-wrap" style={fill ? { flex: "1 1 auto", minHeight: 0, display: "flex" } : undefined}>
        {control}
        <button
          className={cx("fv-mic", on && "is-recording")}
          type="button"
          aria-label={on ? "Stop recording" : micLabel || "Record your review"}
          aria-pressed={on}
          disabled={micDisabled}
          style={micDisabled ? { opacity: "var(--opacity-disabled)", cursor: "default" } : undefined}
          onClick={() => {
            // With a handler, the parent decides when recording really starts
            // (the microphone may be refused) and passes `recording` back down.
            if (!onRecord) setOn(!on);
            onRecord?.(!on);
          }}
        >
          <Icon name={on ? "square" : "mic"} size="sm" />
          {on ? "Stop" : "Speak"}
        </button>
      </div>
    </FieldShell>
  );
}
