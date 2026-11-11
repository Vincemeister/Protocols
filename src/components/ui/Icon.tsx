import type { CSSProperties } from "react";
import { LogOut, Settings, type LucideIcon } from "lucide-react";
import { cx } from "./cx";
import { DS_ICONS, type DsIconName } from "./icons.generated";

// Icons the brand book names that the design system's bundle does not carry
// yet. They come straight from lucide-react; add a name here when a screen
// needs one, and to the design system when it is re-exported.
const EXTRA = { settings: Settings, "log-out": LogOut } satisfies Record<string, LucideIcon>;

/** Lucide names, classic kebab-case (home, plus-square, alert-triangle, …). */
export type IconName = DsIconName | keyof typeof EXTRA;

export interface IconProps {
  name: IconName;
  /** sm = 16px (small buttons, captions), default 20px, lg = 24px (rail, bottom bar). */
  size?: "sm" | "lg";
  className?: string;
  style?: CSSProperties;
}

/**
 * One icon style everywhere: Lucide outlines, 1.5px stroke, sized and coloured
 * by .fv-icon in bundle.css. Decorative by design: the accessible name comes
 * from a visible label or the button's aria-label.
 */
export function Icon({ name, size, className, style }: IconProps) {
  const cls = cx("fv-icon", size === "sm" && "fv-icon-sm", size === "lg" && "fv-icon-lg", className);
  if (name in EXTRA) {
    const Lucide = EXTRA[name as keyof typeof EXTRA];
    return <Lucide className={cls} style={style} aria-hidden="true" />;
  }
  return (
    <svg
      className={cls}
      style={style}
      viewBox="0 0 24 24"
      aria-hidden="true"
      // The markup is generated from the design system at build time, not user input.
      dangerouslySetInnerHTML={{ __html: DS_ICONS[name as DsIconName] }}
    />
  );
}
