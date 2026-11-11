"use client";

import { useRef, useState } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface SearchFieldProps {
  placeholder?: string;
  value?: string;
  size?: "md" | "lg";
  name?: string;
  onChange?: (value: string) => void;
}

export function SearchField({ placeholder, value = "", size, name, onChange }: SearchFieldProps) {
  const [text, setText] = useState(value);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={cx("fv-search", size === "lg" && "fv-search-lg")} role="search">
      <Icon name="search" />
      <input
        ref={input}
        type="search"
        name={name}
        placeholder={placeholder || "Search creators, lists and products"}
        aria-label={placeholder || "Search"}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange?.(e.target.value);
        }}
      />
      <button
        className="fv-icon-btn"
        type="button"
        aria-label="Clear search"
        style={text ? undefined : { display: "none" }}
        onClick={() => {
          setText("");
          onChange?.("");
          input.current?.focus();
        }}
      >
        <Icon name="x-circle" size="sm" />
      </button>
    </div>
  );
}
