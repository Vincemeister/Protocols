import { cx } from "./cx";

export interface AvatarProps {
  /** The creator's name: alt text, and the source of initials and tone when there is no image. */
  name: string;
  src?: string;
  size?: 24 | 32 | 40 | 48 | 56 | 72 | 144;
  /** shadow-sm and a surface-coloured ring; for the 144px profile avatar over a cover. */
  bordered?: boolean;
}

export function initials(name: string) {
  return String(name || "").split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

/** One of three placeholder tones, stable per name (same hash as the design system's bundle). */
export function tone(name: string) {
  let h = 0;
  for (let i = 0; i < String(name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return 1 + (h % 3);
}

export function Avatar({ name, src, size = 40, bordered }: AvatarProps) {
  const cls = cx("fv-avatar", `fv-avatar-${size}`, bordered && "fv-avatar-bordered", !src && `fv-avatar-tone-${tone(name)}`);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- sized by the fv-avatar class; sources are already small
    return <img className={cls} src={src} alt={name || ""} />;
  }
  return (
    <span className={cls} role="img" aria-label={name || ""}>
      <span>{initials(name)}</span>
    </span>
  );
}
