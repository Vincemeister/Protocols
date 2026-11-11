# AsideRail

The right-hand rail of the desktop frame from 1200px up: `rail-aside` (320px) wide, sticky and full height, on `surface-raised` with a `line` hairline on its left, `space-8` top padding and `space-12` between groups, the same rhythm as SideNav. Top: the signed-in creator as a UserCard without a button. Then "Suggested lists" (an `overline` header over a 2-column grid of small ListCards) and "Suggested profiles" (UserCards with Follow, then a "See all" link button). Signed out, the top slot shows a short "Create your Favolist" prompt instead.

The consumer provides `user`, `lists`, `people` and `onSeeAll`. Don't: more than two small list cards or four profiles; ads or external links; hairlines between the rows inside a group.
