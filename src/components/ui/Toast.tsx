"use client";

import { useEffect, useState, type MouseEventHandler } from "react";
import { Button } from "./Button";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface ToastProps {
  tone?: "success" | "danger";
  message: string;
  action?: { label: string; onClick?: MouseEventHandler<HTMLElement> };
  /** ms; 0 keeps it. Default 4000. */
  duration?: number;
}

export function Toast({ tone, message, action, duration = 4000 }: ToastProps) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (duration === 0) return;
    const t = setTimeout(() => setOpen(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  if (!open) return null;
  return (
    <div className={cx("fv-toast", tone && `fv-toast-${tone}`)} role="status">
      <Icon name={tone === "success" ? "check-circle" : tone === "danger" ? "x-circle" : "info"} />
      <span className="fv-toast-text">{message}</span>
      {action ? <Button variant="link" size="sm" label={action.label} onClick={action.onClick} /> : null}
      <button className="fv-icon-btn" type="button" aria-label="Dismiss" onClick={() => setOpen(false)}>
        <Icon name="x" size="sm" />
      </button>
    </div>
  );
}
