import type { CSSProperties, ReactNode } from "react";
import {
  Bell, Bookmark, Check, ChevronDown, ChevronLeft, ChevronRight, CircleCheckBig, CircleX, Copy,
  Ellipsis, ExternalLink, Globe, GripHorizontal, Heart, House, Image as ImageIcon, Info, Link as LinkIcon,
  List, LogOut, Mail, MessageCircle, Mic, Pencil, Plus, Search, Settings, Share, Square, SquarePlus,
  Trash2, TriangleAlert, Undo, Upload, User, Wand, X, type LucideIcon,
} from "lucide-react";

// The icon names of the design system (index.d.ts), plus the two the brand
// book lists for settings. Names are Lucide's classic kebab-case names.
export type IconName =
  | "home" | "search" | "plus-square" | "bookmark" | "bell" | "user" | "heart" | "message-circle"
  | "share" | "copy" | "external-link" | "image" | "plus" | "check" | "x" | "x-circle" | "check-circle"
  | "chevron-left" | "chevron-right" | "chevron-down" | "alert-triangle" | "info" | "more-horizontal"
  | "upload" | "grip-horizontal" | "pencil" | "trash-2" | "link" | "mail" | "list" | "mic" | "square"
  | "wand" | "undo" | "youtube" | "instagram" | "globe" | "settings" | "log-out";

const LUCIDE: Partial<Record<IconName, LucideIcon>> = {
  home: House, search: Search, "plus-square": SquarePlus, bookmark: Bookmark, bell: Bell, user: User,
  heart: Heart, "message-circle": MessageCircle, share: Share, copy: Copy, "external-link": ExternalLink,
  image: ImageIcon, plus: Plus, check: Check, x: X, "x-circle": CircleX, "check-circle": CircleCheckBig,
  "chevron-left": ChevronLeft, "chevron-right": ChevronRight, "chevron-down": ChevronDown,
  "alert-triangle": TriangleAlert, info: Info, "more-horizontal": Ellipsis, upload: Upload,
  "grip-horizontal": GripHorizontal, pencil: Pencil, "trash-2": Trash2, link: LinkIcon, mail: Mail,
  list: List, mic: Mic, square: Square, wand: Wand, undo: Undo, globe: Globe, settings: Settings,
  "log-out": LogOut,
};

// Lucide dropped brand icons in v1. These two are the outlines the design
// system's bundle.js carries, drawn in the same 24px / 1.5px-stroke style.
const BRAND: Partial<Record<IconName, ReactNode>> = {
  youtube: (
    <>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </>
  ),
  instagram: (
    <>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </>
  ),
};

export interface IconProps {
  name: IconName;
  /** sm = 16px (small buttons, captions), default 20px, lg = 24px (rail, bottom bar). */
  size?: "sm" | "lg";
  className?: string;
  style?: CSSProperties;
}

/** Decorative by design: the accessible name comes from a visible label or the button's aria-label. */
export function Icon({ name, size, className, style }: IconProps) {
  const cls = ["fv-icon", size === "sm" ? "fv-icon-sm" : size === "lg" ? "fv-icon-lg" : "", className]
    .filter(Boolean)
    .join(" ");
  const Lucide = LUCIDE[name];
  // Size, stroke colour and the 1.5px stroke come from .fv-icon in bundle.css.
  if (Lucide) return <Lucide className={cls} style={style} aria-hidden="true" />;
  return (
    <svg className={cls} style={style} viewBox="0 0 24 24" aria-hidden="true">
      {BRAND[name]}
    </svg>
  );
}
