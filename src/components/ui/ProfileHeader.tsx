import type { MouseEventHandler } from "react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { cx } from "./cx";
import { FollowButton } from "./FollowButton";
import { Icon, type IconName } from "./Icon";

export interface ProfileLink { href: string; label?: string; icon?: IconName }

export interface ProfileHeaderProps {
  name: string;
  handle?: string;
  avatar?: string;
  bio?: string;
  /** Up to four, in the creator's order; icon is a Lucide name (youtube, instagram, globe, link). */
  links?: ProfileLink[];
  /** One link; kept for compatibility. */
  link?: ProfileLink;
  counts?: { value: string; label: string }[];
  /** 144px avatar and display type (desktop). */
  large?: boolean;
  /** Your own profile: Edit instead of Follow. */
  own?: boolean;
  following?: boolean;
  onFollow?: (following: boolean) => void;
  onEdit?: MouseEventHandler<HTMLElement>;
  onShare?: MouseEventHandler<HTMLElement>;
}

export function ProfileHeader({
  name, handle, avatar, bio, links, link, counts, large, own, following, onFollow, onEdit, onShare,
}: ProfileHeaderProps) {
  const allLinks = links || (link ? [link] : []);
  return (
    <header className={cx("fv-profile", large && "fv-profile-lg")}>
      <div className="fv-profile-top">
        <Avatar name={name} src={avatar} size={large ? 144 : 72} bordered={!!avatar} />
        <div className="fv-profile-actions">
          {own ? (
            <Button variant="tertiary" label="Edit profile" icon="pencil" onClick={onEdit} />
          ) : (
            <FollowButton following={!!following} onToggle={onFollow} />
          )}
          <Button variant="tertiary" icon="share" ariaLabel="Share profile" onClick={onShare} />
        </div>
      </div>
      <div>
        <h1 className="fv-profile-name">{name}</h1>
        {handle ? <p className="fv-profile-handle">{handle}</p> : null}
      </div>
      {bio ? <p className="fv-profile-bio">{bio}</p> : null}
      {allLinks.length ? (
        <div className="fv-profile-links">
          {allLinks.slice(0, 4).map((l) => (
            <a key={l.href} className="fv-profile-link" href={l.href} target="_blank" rel="noopener">
              <Icon name={l.icon || "link"} size="sm" />
              {l.label || l.href}
            </a>
          ))}
        </div>
      ) : null}
      {counts ? (
        <ul className="fv-profile-counts">
          {counts.map((c) => (
            <li key={c.label}><b>{c.value}</b>{c.label}</li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
