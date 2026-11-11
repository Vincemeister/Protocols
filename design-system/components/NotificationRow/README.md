# NotificationRow

One event in the Notifications screen: Avatar 40, a `body-sm` sentence with the actor's name in 600 ("Mira Kusuma started following you."), the time in `caption` `ink-muted`, and an 8px `accent` dot at the right while unread. The whole row is a link to the actor or the list; hover tints it `surface-sunken`; rows are separated by `line` hairlines. v1 events are follows and saves; comments and replies arrive with comments in v2.

The consumer provides `actor`, `message`, `time`, `read`, `href`. Don't: icons for event types (the sentence says it); grouping into "Today / Earlier" until there are enough events to need it.
