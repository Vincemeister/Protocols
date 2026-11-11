import Link from "next/link";
import { Icon, type IconName } from "./Icon";

export interface BottomBarItem { icon: IconName; label: string; href?: string; current?: boolean; unread?: boolean }

export function BottomBar({ items }: { items: BottomBarItem[] }) {
  return (
    <nav className="fv-bottombar" aria-label="Main">
      {items.map((it) => {
        const props = { className: "fv-bottombar-item", "aria-current": it.current ? ("page" as const) : undefined };
        const content = (
          <>
            <Icon name={it.icon} />
            {it.label}
            {it.unread ? <span className="fv-dot" /> : null}
          </>
        );
        return it.href?.startsWith("/") ? (
          <Link key={it.label} href={it.href} {...props}>{content}</Link>
        ) : (
          <a key={it.label} href={it.href || "#"} {...props}>{content}</a>
        );
      })}
    </nav>
  );
}
