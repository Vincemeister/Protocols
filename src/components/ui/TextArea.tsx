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
}

// Resting shape of the level wave. Phase 3 drives these heights from the microphone.
const WAVE = [6, 10, 14, 8, 16, 12, 6, 10, 18, 8, 12, 6, 14, 10, 8, 16, 6, 12, 10, 8, 14, 6, 10, 16, 8, 12];

export function TextArea(props: TextAreaProps) {
  const { value = "", placeholder, rows = 4, voice, recording = false, recordingTime, tidied, onChange, onRecord, onRevert, ...field } = props;
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
              {WAVE.map((h, i) => <i key={i} style={{ height: h }} />)}
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
      <div className="fv-voice-wrap">
        {control}
        <button
          className={cx("fv-mic", on && "is-recording")}
          type="button"
          aria-label={on ? "Stop recording" : "Record your review"}
          aria-pressed={on}
          onClick={() => {
            setOn(!on);
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
