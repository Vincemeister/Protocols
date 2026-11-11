import { cx } from "./cx";

export interface MarkLoaderProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const PARTS = ["fv-mq fv-mq-a", "fv-mq fv-mq-b", "fv-mq fv-mq-c", "fv-mq fv-mq-d", "fv-ms fv-ms-1", "fv-ms fv-ms-2", "fv-ms fv-ms-3", "fv-ms fv-ms-4"];

/** The mark assembling: the splash, the page loader and the only spinner besides LoadMore's. */
export function MarkLoader({ size, label = "Loading" }: MarkLoaderProps) {
  return (
    <div
      className={cx("fv-mark-loader", size === "lg" && "fv-mark-loader-lg", size === "sm" && "fv-mark-loader-sm")}
      role="status"
      aria-label={label}
    >
      {PARTS.map((c) => <i key={c} className={c} />)}
    </div>
  );
}
