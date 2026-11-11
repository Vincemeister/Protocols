# ProfileHeader

The top of a creator page: Avatar 144 with `shadow-sm` (72 on mobile), the display name in `display` (`heading-3` on mobile), @handle in `body-sm` `ink-muted`, a short bio in `body` capped at 56 characters per line, a row of up to four outbound links in `accent`, each with its Lucide icon (`youtube`, `instagram`, `globe`, `link`) and a short label (a handle or a bare domain on mobile, the full address on desktop), and a counts row (followers · following · lists) in `body-sm` with the numbers in `ink` 600. Actions sit top right: Follow (primary) or, on your own profile, Edit profile (tertiary), plus a Share icon button. Tabs follow directly beneath.

The consumer provides the creator (name, handle, avatar, bio, link, counts), `own`, `following` and handlers. Don't: add a cover photo behind it (the list covers carry the imagery); more than four links, or links as icon-only buttons (the label is what makes them trustworthy); put pink anywhere but the Follow button.
