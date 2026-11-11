import Link from "next/link";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export interface ButtonProps {
  /** Sentence case, verb first. */
  label?: string;
  /** primary: one per view. secondary: pink follow-up. tertiary (default): neutral. link: text only. danger: inside a confirmation. */
  variant?: "primary" | "secondary" | "tertiary" | "link" | "danger";
  /** sm = 32px, md (default) = 40px, lg = 48px. */
  size?: "sm" | "md" | "lg";
  /** Leading Lucide icon, 20px (16px in sm). */
  icon?: IconName;
  /** Renders a link instead of a button. */
  href?: string;
  /** Required on icon-only buttons. */
  ariaLabel?: string;
  /** Whole element at opacity-disabled; change the label too ("Saving…"). */
  disabled?: boolean;
  block?: boolean;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function Button({
  label, variant = "tertiary", size, icon, href, ariaLabel, disabled, block, type = "button",
  onClick, className, style, children,
}: ButtonProps) {
  const cls = cx(
    "fv-btn",
    `fv-btn-${variant}`,
    size === "sm" && "fv-btn-sm",
    size === "lg" && "fv-btn-lg",
    block && "fv-btn-block",
    className,
  );
  const content = (
    <>
      {icon ? <Icon name={icon} /> : null}
      {label}
      {children}
    </>
  );
  if (href) {
    const shared = { className: cls, style, "aria-label": ariaLabel, "aria-disabled": disabled || undefined, onClick };
    // next/link for in-app routes (client-side navigation); a plain anchor otherwise.
    return href.startsWith("/") ? (
      <Link href={href} {...shared}>{content}</Link>
    ) : (
      <a href={href} {...shared}>{content}</a>
    );
  }
  return (
    <button type={type} className={cls} style={style} aria-label={ariaLabel} disabled={disabled} onClick={onClick}>
      {content}
    </button>
  );
}
