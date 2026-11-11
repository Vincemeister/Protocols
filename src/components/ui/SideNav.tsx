/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { Avatar } from "./Avatar";
import { Icon, type IconName } from "./Icon";
import { Mark } from "./Mark";

export interface SideNavItem { label: string; icon: IconName; href?: string; current?: boolean }

export interface SideNavProps {
  items: SideNavItem[];
  /** URL of a specific mark file. Leave out to get the mark that follows the theme. */
  mark?: string;
  homeHref?: string;
  user?: { name: string; handle?: string; avatar?: string };
}

export function SideNav({ items, mark, homeHref = "/", user }: SideNavProps) {
  return (
    <nav className="fv-rail" aria-label="Main">
      <a className="fv-rail-brand" href={homeHref}>
        {mark ? <img src={mark} alt="" /> : <Mark />}
        <span className="fv-wordmark">{APP_NAME}</span>
      </a>
      <div className="fv-rail-items">
        {items.map((it) => {
          const props = { className: "fv-rail-item", "aria-current": it.current ? ("page" as const) : undefined };
          const content = (
            <>
              <Icon name={it.icon} size="lg" />
              {it.label}
            </>
          );
          return it.href?.startsWith("/") ? (
            <Link key={it.label} href={it.href} {...props}>{content}</Link>
          ) : (
            <a key={it.label} href={it.href || "#"} {...props}>{content}</a>
          );
        })}
      </div>
      {user?.name ? (
        <div className="fv-rail-foot">
          <Avatar name={user.name} src={user.avatar} size={40} />
          <div>
            <div className="fv-name">{user.name}</div>
            {user.handle ? <div className="fv-handle">{user.handle}</div> : null}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
