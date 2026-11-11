"use client";

import { useState } from "react";
import type { Tone } from "./Badge";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export interface AlertProps {
  tone?: Tone;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const ICONS: Record<Tone, IconName> = { success: "check-circle", warning: "alert-triangle", danger: "x-circle" };

export function Alert({ tone, title, message, dismissible, onDismiss }: AlertProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className={cx("fv-alert", tone && `fv-alert-${tone}`)} role={tone === "danger" ? "alert" : "status"}>
      <Icon name={tone ? ICONS[tone] : "info"} />
      <div className="fv-alert-text">
        {title ? <><b>{title}</b>{" "}</> : null}
        {message}
      </div>
      {dismissible ? (
        <button
          className="fv-icon-btn"
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            setOpen(false);
            onDismiss?.();
          }}
        >
          <Icon name="x" size="sm" />
        </button>
      ) : null}
    </div>
  );
}
