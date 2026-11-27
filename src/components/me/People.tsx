"use client";

import { useState, useTransition } from "react";
import { FollowSmall } from "@/components/social/controls";
import { Button, UserCard } from "@/components/ui";
import { removeFollower } from "@/lib/me/actions";

export interface Person { id: string; name: string; username: string; avatar?: string; meta?: string; following: boolean }

/**
 * C12: a list of people with Follow / Following and, for your own followers,
 * Remove. `self` is the viewer's own id (no Follow button on yourself).
 */
export function People({ people, removable, self }: { people: Person[]; removable?: boolean; self?: string }) {
  const [gone, setGone] = useState<string[]>([]);
  const [, start] = useTransition();
  return (
    <div>
      {people.filter((p) => !gone.includes(p.id)).map((p) => (
        <div className="me-person" key={p.id}>
          <UserCard name={p.name} handle={`@${p.username}`} meta={p.meta} avatar={p.avatar} href={`/${p.username}`} action={false} />
          {p.id === self ? null : <FollowSmall profileId={p.id} following={p.following} />}
          {removable ? (
            <Button
              variant="link" size="sm" label="Remove" ariaLabel={`Remove ${p.name} from your followers`}
              onClick={() => {
                setGone((g) => [...g, p.id]);
                start(() => removeFollower(p.id));
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
