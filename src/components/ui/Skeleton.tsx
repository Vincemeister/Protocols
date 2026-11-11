import { cx } from "./cx";

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  text?: boolean;
  round?: boolean;
}

export function Skeleton({ width = "100%", height, text, round }: SkeletonProps) {
  return (
    <div
      className={cx("fv-skeleton", text && "fv-skeleton-text", round && "fv-skeleton-round")}
      aria-hidden="true"
      style={{ width, height }}
    />
  );
}
