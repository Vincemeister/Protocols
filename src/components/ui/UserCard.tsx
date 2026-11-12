import Link from "next/link";
import type { MouseEventHandler } from "react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { cx } from "./cx";

export interface UserCardProps {
  name: string;
  handle?: string;
  /** "2.4k followers" */
  meta?: string;
  avatar?: string;
  size?: 40 | 48;
  following?: boolean;
  /** false hides the Follow button (your own card). */
  action?: boolean;
  lined?: boolean;
  /** Beyond index.d.ts: the creator's profile; the name becomes a link. */
  href?: string;
  onFollow?: MouseEventHandler<HTMLElement>;
}

export function UserCard({ name, handle, meta, avatar, size = 48, following, action, lined, href, onFollow }: UserCardProps) {
  return (
    <div className={cx("fv-user-card", lined && "fv-user-card-lined")}>
      <Avatar name={name} src={avatar} size={size} />
      <div className="fv-user-text">
        <div className="fv-name">
          {href ? <Link href={href} style={{ color: "inherit", textDecoration: "none" }}>{name}</Link> : name}
        </div>
        {handle ? <div className="fv-handle">{handle}</div> : null}
        {meta ? <div className="fv-meta">{meta}</div> : null}
      </div>
      {action !== false ? (
        <Button variant={following ? "secondary" : "tertiary"} size="sm" label={following ? "Following" : "Follow"} onClick={onFollow} />
      ) : null}
    </div>
  );
}
