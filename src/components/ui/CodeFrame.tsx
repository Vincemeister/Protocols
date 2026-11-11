"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface CodeFrameProps {
  code: string;
  /** e.g. "10% off with" */
  label?: string;
  onCopy?: (code: string) => void;
}

/** Referral code with copy. On copy the frame flips to "Copied" for two seconds: the only flip in the system. */
export function CodeFrame({ code, label = "Code", onCopy }: CodeFrameProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function copy() {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
    onCopy?.(code);
  }

  return (
    <div className={cx("fv-code-frame", copied && "is-copied")}>
      <span className="fv-code-label">{label}</span>
      <code>{code}</code>
      <div className="fv-code-back" aria-hidden="true">
        <Icon name="check" size="sm" />
        Copied
        <code>{code}</code>
      </div>
      <button className="fv-icon-btn" type="button" aria-label="Copy code" onClick={copy}>
        <Icon name="copy" size="sm" />
      </button>
      <span className="fv-visually-hidden" role="status">{copied ? "Code copied" : ""}</span>
    </div>
  );
}
