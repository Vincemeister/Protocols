/* eslint-disable @next/next/no-img-element */
import type { MouseEventHandler } from "react";
import { APP_NAME } from "@/lib/config";
import { Icon, type IconName } from "./Icon";
import { Mark } from "./Mark";

export interface TopBarAction {
  icon: IconName;
  label: string;
  onClick?: MouseEventHandler<HTMLElement>;
  /** accent dot (unread). */
  badge?: boolean;
}

export interface TopBarProps {
  /** Brand form: mark + wordmark instead of back + title. */
  brand?: boolean;
  /** URL of a specific mark file. Leave out to get the mark that follows the theme. */
  mark?: string;
  homeHref?: string;
  title?: string;
  backLabel?: string;
  onBack?: MouseEventHandler<HTMLElement>;
  action?: TopBarAction;
}

export function TopBar({ brand, mark, homeHref = "/", title, backLabel = "Back", onBack, action }: TopBarProps) {
  return (
    <header className="fv-topbar">
      {brand ? (
        <a className="fv-topbar-brand" href={homeHref} style={{ gridColumn: "1 / 3" }}>
          {mark ? <img src={mark} alt="" /> : <Mark />}
          <span>{APP_NAME}</span>
        </a>
      ) : (
        <>
          <button className="fv-icon-btn" type="button" aria-label={backLabel} onClick={onBack}>
            <Icon name="chevron-left" />
          </button>
          <h1 className="fv-topbar-title">{title}</h1>
        </>
      )}
      {action ? (
        <button className="fv-icon-btn" type="button" aria-label={action.label} onClick={action.onClick} style={{ position: "relative" }}>
          <Icon name={action.icon} />
          {action.badge ? (
            <span
              className="fv-dot"
              style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: "var(--radius-full)", background: "var(--accent)" }}
            />
          ) : null}
        </button>
      ) : (
        <span />
      )}
    </header>
  );
}
