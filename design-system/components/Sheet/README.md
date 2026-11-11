# Sheet

The mobile form of Dialog: slides up from the bottom edge (320ms, `cubic-bezier(0.2,0,0,1)`) over the `scrim`, full width, square top corners with a 32×3 `line-strong` handle. Same title, body and actions as Dialog, but the actions stack full-width with the primary on top, each `control-lg` (48px) tall. Dismiss by dragging down or tapping the scrim, except for destructive confirmations.

The consumer provides the same props as Dialog. Don't: rounded top corners; more than one screen of content (that is a page, not a sheet).
