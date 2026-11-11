/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Avatar } from "./Avatar";
import { cx } from "./cx";

export interface ListCardProps {
  name: string;
  /** "12 products" */
  count: string;
  cover?: string;
  creator: { name: string; avatar?: string; followers?: string };
  href?: string;
  /** sm for 2-column mobile grids and the suggestions rail. */
  size?: "md" | "sm";
}

export function ListCard({ name, count, cover, creator, href = "#", size }: ListCardProps) {
  const cls = cx("fv-list-card", size === "sm" && "fv-list-card-sm");
  const content = (
    <>
      {cover ? <img src={cover} alt="" /> : null}
      <div className="fv-list-top">
        <Avatar name={creator.name} src={creator.avatar} size={size === "sm" ? 24 : 32} />
        <div>
          <div className="fv-name">{creator.name}</div>
          {creator.followers ? <div className="fv-followers">{creator.followers}</div> : null}
        </div>
      </div>
      <div className="fv-list-bottom">
        <h3 className="fv-list-title">{name}</h3>
        <p className="fv-list-count">{count}</p>
      </div>
    </>
  );
  return href.startsWith("/") ? <Link className={cls} href={href}>{content}</Link> : <a className={cls} href={href}>{content}</a>;
}
