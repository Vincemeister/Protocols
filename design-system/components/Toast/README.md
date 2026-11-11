# Toast

A brief confirmation that floats at `z-toast`, bottom centre (above the BottomBar on mobile), for four seconds: `surface-raised` with a `line` border and `shadow-lg`, `radius-xs`, an icon in `success`/`danger`/`ink-muted`, one `body-sm` sentence, an optional link-style action ("View", "Undo", "Retry") and a dismiss. One toast at a time; a new one replaces the old. Use it for things that just happened and need no decision: saved, copied, followed, link sent.

The consumer provides `tone`, `message`, `action`, `duration` (0 keeps it). Don't: toasts for errors the user must fix (use Alert under the field); stacked toasts; toasts that cover the primary action.
