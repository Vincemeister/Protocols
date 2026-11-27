"use client";

import { useId, type CSSProperties } from "react";
import { FieldShell, type FieldProps } from "./Field";
import { useSyncedState } from "./useSyncedState";

export interface TextFieldProps extends FieldProps {
  type?: "text" | "email" | "url" | "number";
  value?: string;
  placeholder?: string;
  autocomplete?: string;
  required?: boolean;
  inputStyle?: CSSProperties;
  // --- Beyond index.d.ts (phase 3) ---
  /** Fixed text joined to the left of the input: "favolist.com/" before a username. */
  prefix?: string;
  inputMode?: "text" | "url" | "email";
  autoCapitalize?: "none" | "sentences" | "words";
  spellCheck?: boolean;
  onChange?: (value: string) => void;
}

export function TextField(props: TextFieldProps) {
  const { type = "text", value = "", placeholder, autocomplete, required, inputStyle, prefix, inputMode, autoCapitalize, spellCheck, onChange, ...field } = props;
  const auto = useId();
  const id = field.id || auto;
  const [text, setText] = useSyncedState(value);
  const described = field.error || field.help ? `${id}-help` : undefined;
  const input = (
    <input
      className="fv-input"
      id={id}
      name={field.name}
      type={type}
      value={text}
      placeholder={placeholder}
      maxLength={field.maxLength}
      autoComplete={autocomplete}
      inputMode={inputMode}
      autoCapitalize={autoCapitalize}
      spellCheck={spellCheck}
      required={required}
      disabled={field.disabled}
      aria-invalid={field.error ? true : undefined}
      aria-describedby={described}
      style={prefix ? { borderRadius: "0 var(--radius-xs) var(--radius-xs) 0", minWidth: 0, flex: 1, ...inputStyle } : inputStyle}
      onChange={(e) => {
        setText(e.target.value);
        onChange?.(e.target.value);
      }}
    />
  );
  return (
    <FieldShell {...field} id={id} length={text.length}>
      {prefix ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            className="body-sm"
            style={{
              height: "var(--control)", display: "inline-flex", alignItems: "center", padding: "0 10px", boxSizing: "border-box",
              border: "1px solid var(--line-strong)", borderRight: 0, borderRadius: "var(--radius-xs) 0 0 var(--radius-xs)",
              background: "var(--surface-sunken)", color: "var(--ink-muted)", whiteSpace: "nowrap", maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {prefix}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
    </FieldShell>
  );
}
