# BottomBar

Mobile navigation below 992px: five equal items (Home, Search, Create, Saved, Profile) in a `bar-mobile` 56px bar fixed to the bottom at `z-nav`, on `surface-raised` with a `line` hairline on top. Icons are Lucide at 24px with `caption` labels under them; the current item is `ink` with its icon in `accent`; an unread dot in `accent` may sit on Profile (for notifications) and nowhere else. Content above gets `space-16` bottom padding so nothing hides behind the bar.

The consumer provides the five items with `href`, `icon`, `current` and `unread`. Don't: fewer than four or more than five items; labels off; a raised or pill-shaped bar.
