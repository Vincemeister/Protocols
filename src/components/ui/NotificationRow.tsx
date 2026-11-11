import Link from "next/link";
import { Avatar } from "./Avatar";
import { cx } from "./cx";

export interface NotificationRowProps {
  actor: { name: string; avatar?: string };
  /** "started following you." */
  message: string;
  time: string;
  read?: boolean;
  href?: string;
}

export function NotificationRow({ actor, message, time, read, href = "#" }: NotificationRowProps) {
  const cls = cx("fv-notification", read && "is-read");
  const content = (
    <>
      <Avatar name={actor.name} src={actor.avatar} size={40} />
      <div>
        <div className="fv-text"><b>{actor.name}</b>{" " + (message || "")}</div>
        <div className="fv-time">{time}</div>
      </div>
      <span className="fv-dot" />
    </>
  );
  return href.startsWith("/") ? <Link className={cls} href={href}>{content}</Link> : <a className={cls} href={href}>{content}</a>;
}
