import type { MouseEventHandler } from "react";
import { Button } from "./Button";
import { ListCard, type ListCardProps } from "./ListCard";
import { UserCard, type UserCardProps } from "./UserCard";

export interface AsideRailProps {
  user?: { name: string; handle?: string; avatar?: string };
  lists?: ListCardProps[];
  people?: UserCardProps[];
  onSeeAll?: MouseEventHandler<HTMLElement>;
}

/** The right-hand suggestions rail of the desktop frame (1200px and up). */
export function AsideRail({ user, lists, people, onSeeAll }: AsideRailProps) {
  return (
    <aside className="fv-aside" aria-label="Suggestions">
      {user ? <UserCard name={user.name} handle={user.handle} avatar={user.avatar} size={48} action={false} /> : null}
      {lists?.length ? (
        <section className="fv-aside-section">
          <h2 className="fv-overline">Suggested lists</h2>
          <div className="fv-aside-grid">
            {lists.map((l) => <ListCard key={l.name} {...l} size="sm" />)}
          </div>
        </section>
      ) : null}
      {people?.length ? (
        <section className="fv-aside-section">
          <h2 className="fv-overline">Suggested profiles</h2>
          {people.map((u) => <UserCard key={u.handle || u.name} {...u} size={40} />)}
          <Button variant="link" size="sm" label="See all" onClick={onSeeAll} className="fv-aside-more" />
        </section>
      ) : null}
    </aside>
  );
}
