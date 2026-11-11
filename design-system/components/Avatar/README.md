# Avatar

Round, always. Seven sizes: 24 (comments, list-card meta on mobile), 32 (list cards, rail footer on small screens), 40 (product cards, rail footer, default), 48 and 56 (profile rows and the suggestions rail), 72 (mobile profile header) and 144 (desktop profile header, usually `fv-avatar-bordered` with `shadow-sm` over a cover).

The consumer provides `src` and `alt` (the creator's name). With no image, render the creator's initials in `label` weight on `accent-soft`/`success-soft`/`warning-soft` with the matching text colour, chosen from a stable hash of the username so a creator keeps their colour. Never a grey silhouette icon.

Don't: square avatars (the old `.avatar-square` is retired; brands use the brand chip instead); rings or status dots; cropping that is not `object-fit: cover`.
