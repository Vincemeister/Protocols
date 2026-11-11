"use client";

import { useId } from "react";
import { FieldShell, type FieldProps } from "./Field";
import { Icon } from "./Icon";

export interface SelectProps extends FieldProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

export function Select({ options, value, onChange, ...field }: SelectProps) {
  const auto = useId();
  const id = field.id || auto;
  return (
    <FieldShell {...field} id={id}>
      <div className="fv-select-wrap">
        <select
          className="fv-select"
          id={id}
          name={field.name}
          defaultValue={value}
          disabled={field.disabled}
          onChange={(e) => onChange?.(e.target.value)}
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Icon name="chevron-down" />
      </div>
    </FieldShell>
  );
}
