# FollowButton

Follow that becomes Following in place. At rest it is the primary pink button; on tap the fill drains to `accent-soft` and the label crossfades to "Following" in `accent` over 200ms. The button keeps its width (112px, 88px small), so nothing around it shifts. Tapping again unfollows with the same motion in reverse; no confirmation.

It is the Follow on ProfileHeader and on the list page's creator row. UserCard rows in long lists keep the plain tertiary Follow from Button, because a column of pink buttons breaks the one-spark rule.

The consumer provides `following`, `size` and `onToggle`. Don't: a heart or plus icon; "Unfollow" as a label (the Following state is the affordance); any width change.
