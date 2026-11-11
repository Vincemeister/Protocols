# Button

Five styles, three heights, one primary per view. **Primary** (`accent` fill, `on-accent` label) is for the single thing the screen is for: Create a list, Save to list. **Secondary** (`accent-soft` ground, `accent` label) is the pink follow-up: Follow, Following. **Tertiary** (`line-strong` border, `ink` label) is the neutral default for everything else. **Link** is text-only `accent` for "View all" and inline actions. **Danger** (`danger` fill, `on-danger` label) only inside a confirmation step.

Heights are `control-sm` 32px (`label-sm`), `control` 40px (`label`) and `control-lg` 48px (`label-lg`); the large size is the mobile primary action. Corners are `radius-xs`. Labels are sentence case, verb first; an icon sits `space-2` before the label at 20px (16px in small). Hover moves fills to `accent-hover` or tints tertiary with `surface-sunken`; focus shows `focus-ring`; disabled is the whole button at `opacity-disabled` with the label changed ("Saving…"), never a spinner.

The consumer provides the label, an optional leading icon, `onClick`, `disabled`, and `type`. Full-width (`fv-btn-block`) only in modals and on mobile sheets.

Don't: two primaries in one view; pink text on the hot `accent-vivid`; rounded or pill buttons; icon-only buttons without `aria-label`.
