"use client";

import { useEffect, useState } from "react";
import { cx } from "./cx";

export interface FollowButtonProps {
  following?: boolean;
  size?: "sm" | "md" | "lg";
  onToggle?: (following: boolean) => void;
}

/** Follow that morphs into Following in place: the fill drains, the label crossfades, the width never changes. */
export function FollowButton({ following = false, size, onToggle }: FollowButtonProps) {
  const [on, setOn] = useState(following);
  useEffect(() => setOn(following), [following]);
  return (
    <button
      type="button"
      className={cx("fv-btn fv-btn-follow", size === "sm" && "fv-btn-sm", size === "lg" && "fv-btn-lg", on && "is-following")}
      aria-pressed={on}
      onClick={() => {
        setOn(!on);
        onToggle?.(!on);
      }}
    >
      <span className="fv-lbl fv-lbl-main">Follow</span>
      <span className="fv-lbl fv-lbl-alt">Following</span>
    </button>
  );
}
