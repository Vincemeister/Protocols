# UserCard

A creator in a row: Avatar 48 (40 in the rails), display name in `body-sm` 600, handle and follower count in `caption` `ink-muted`, and a small Follow button at the right (tertiary at rest, secondary "Following" once followed). Rows are separated by `line` hairlines in lists (Followers, Following, Search results, the creators directory) and sit bare in the AsideRail.

The consumer provides `name`, `handle`, `meta`, `avatar`, `following` and `onFollow`; pass `action: false` for the signed-in creator's own card. Don't: put a bio in the row; make the whole row pink when followed.
