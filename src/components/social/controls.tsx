"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { Button, FollowButton, Icon, ProfileHeader, Toast, UserCard, type IconName, type ProfileHeaderProps, type UserCardProps } from "@/components/ui";
import { useSyncedState } from "@/components/ui/useSyncedState";
import { setFollow, setLike, setSaved } from "@/lib/actions/social";

// The interactive bits of the public pages. Each shows the new state at once
// and runs its server action in a transition; if the visitor is signed out the
// action sends them to sign in.

/** Share through the phone's share sheet where there is one, otherwise copy the link. */
function useShare(title: string) {
  const [copies, setCopies] = useState(0); // counts copies, so each one shows a fresh toast
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopies((n) => n + 1);
      }
    } catch {
      // closed the share sheet, or the clipboard is unavailable: nothing to do
    }
  }
  const toast = copies ? <div className="app-toast"><Toast key={copies} tone="success" message="Link copied." /></div> : null;
  return { share, toast };
}

/** The share icon in a top bar. */
export function ShareIcon({ title, label }: { title: string; label: string }) {
  const { share, toast } = useShare(title);
  return (
    <>
      <button className="fv-icon-btn" type="button" aria-label={label} onClick={share}>
        <Icon name="share" size="lg" />
      </button>
      {toast}
    </>
  );
}

/** ProfileHeader with Follow and Share wired up. */
export function LiveProfileHeader({ profileId, ...props }: ProfileHeaderProps & { profileId: string }) {
  const [, start] = useTransition();
  const { share, toast } = useShare(props.name);
  return (
    <>
      <ProfileHeader {...props} onFollow={(on) => start(() => setFollow(profileId, on))} onShare={share} />
      {toast}
    </>
  );
}

/** The small Follow / Following button next to a creator's name. */
export function FollowSmall({ profileId, following }: { profileId: string; following: boolean }) {
  const [on, setOn] = useSyncedState(following);
  const [, start] = useTransition();
  return (
    <Button
      size="sm" variant={on ? "secondary" : "tertiary"} label={on ? "Following" : "Follow"}
      onClick={() => {
        setOn(!on);
        start(() => setFollow(profileId, !on));
      }}
    />
  );
}

/** The morphing Follow button, standalone. */
export function FollowMorph({ profileId, following }: { profileId: string; following: boolean }) {
  const [, start] = useTransition();
  return <FollowButton following={following} onToggle={(on) => start(() => setFollow(profileId, on))} />;
}

/** A creator row in the suggestions rail. */
export function LiveUserCard({ profileId, ...props }: UserCardProps & { profileId: string }) {
  const [on, setOn] = useSyncedState(!!props.following);
  const [, start] = useTransition();
  return (
    <UserCard
      {...props} following={on}
      onFollow={() => {
        setOn(!on);
        start(() => setFollow(profileId, !on));
      }}
    />
  );
}

interface ToggleProps {
  target: { like: string } | { saveProduct: string } | { saveList: string };
  on: boolean;
  /** For likes: the count shown next to the heart. */
  count?: number;
  /** "128 likes" instead of "128". */
  countWord?: string;
}

function useToggle({ target, on: initial, count }: ToggleProps) {
  const [on, setOn] = useSyncedState(initial);
  const [, start] = useTransition();
  const shown = count == null ? undefined : count + (on === initial ? 0 : on ? 1 : -1);
  function toggle() {
    setOn(!on);
    start(() =>
      "like" in target ? setLike(target.like, !on)
        : "saveProduct" in target ? setSaved({ productId: target.saveProduct }, !on)
          : setSaved({ listId: target.saveList }, !on),
    );
  }
  return { on, shown, toggle };
}

/** Heart or bookmark in a card's action row. */
export function IconToggle(props: ToggleProps & { icon: IconName; label: string }) {
  const { on, shown, toggle } = useToggle(props);
  const text = shown ? (props.countWord ? `${shown} ${props.countWord}${shown === 1 ? "" : "s"}` : shown) : null;
  return (
    <button className="fv-icon-btn" type="button" aria-pressed={on} aria-label={text ? undefined : props.label} title={props.label} onClick={toggle}>
      <Icon name={props.icon} />
      {text}
    </button>
  );
}

/** "Save list" on the list page, and the square Save button on the product page. */
export function SaveButton(props: ToggleProps & { label?: string; size?: "sm" | "lg"; ariaLabel?: string; style?: CSSProperties }) {
  const { on, toggle } = useToggle(props);
  return (
    <Button
      size={props.size} variant={props.label ? "secondary" : "tertiary"} icon="bookmark"
      label={props.label ? (on ? "Saved" : props.label) : undefined}
      ariaLabel={props.ariaLabel} className={on ? "is-on" : undefined} style={props.style} onClick={toggle}
    />
  );
}
