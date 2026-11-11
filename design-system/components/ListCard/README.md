# ListCard

A square cover with the list name on it. The photo (the creator's own, or the first product image) fills the square `object-fit: cover` under `scrim` at `opacity-scrim`; text is `on-image`. Top-left: `Avatar` 32 with username (`body-sm` 600) and follower count (`caption`); bottom-left: the list name in `heading-3` and "12 products" in `body-sm` 500. The whole card is one link; focus shows `focus-ring`.

In a two-column mobile grid or the suggestions rail use `fv-list-card-sm`: avatar 24, title in `heading-5`, `space-3` insets. Grids use `space-4` gaps, 2 columns on mobile, 3 on desktop, always square.

The consumer provides the cover image, list name, product count, creator and `href`. With no photo, use the `surface-sunken` frame and `ink` text with no scrim.

Don't: rounded covers; gradients instead of the flat scrim; text on an unscrimmed photo; more than two lines of title (clamp).
