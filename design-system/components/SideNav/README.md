# SideNav

The desktop navigation rail: `rail-nav` wide, sticky and full height, on `surface-raised` with a `line` hairline on the right, `space-8` top padding and `space-12` between groups. The mark (24px) with the "Favolist" wordmark in `heading-4` weight 700 sits at the top; the items (Home, Search, Create, Saved, Notifications, Profile) use Lucide at 24px with `body` 500 labels in `ink-muted`; the current item is `ink` 600 with its icon in `accent`. The account (Avatar 40, name, @handle) is pinned to the bottom.

Below 992px the rail is replaced by the mobile bottom bar (`bar-mobile`, same items minus Profile, icons only with labels under them at `caption`). The right-hand suggestions rail (`rail-aside`) uses the same padding and `overline` headers for "Suggested lists" and "Suggested profiles".

The consumer provides the items with `href`, icon and `aria-current`, and the signed-in creator. Swap the mark for `favolist-mark-light.svg` in the dark theme.

Don't: collapse the rail into a top bar on desktop; fill the active item pink (only its icon is pink); add badges with counts to more than Notifications.
