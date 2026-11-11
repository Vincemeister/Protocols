"use client";

import { useId, useState, type CSSProperties } from "react";
import { FieldShell, type FieldProps } from "./Field";

export interface TextFieldProps extends FieldProps {
  type?: "text" | "email" | "url" | "number";
  value?: string;
  placeholder?: string;
  autocomplete?: string;
  required?: boolean;
  inputStyle?: CSSProperties;
  onChange?: (value: string) => void;
}

export function TextField(props: TextFieldProps) {
  const { type = "text", value = "", placeholder, autocomplete, required, inputStyle, onChange, ...field } = props;
  const auto = useId();
  const id = field.id || auto;
  const [text, setText] = useState(value);
  const described = field.error || field.help ? `${id}-help` : undefined;
  return (
    <FieldShell {...field} id={id} length={text.length}>
      <input
        className="fv-input"
        id={id}
        name={field.name}
        type={type}
        value={text}
        placeholder={placeholder}
        maxLength={field.maxLength}
        autoComplete={autocomplete}
        required={required}
        disabled={field.disabled}
        aria-invalid={field.error ? true : undefined}
        aria-describedby={described}
        style={inputStyle}
        onChange={(e) => {
          setText(e.target.value);
          onChange?.(e.target.value);
        }}
      />
    </FieldShell>
  );
}
