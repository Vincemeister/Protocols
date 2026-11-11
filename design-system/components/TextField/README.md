# TextField

A single-line input with its label above, helper or error text below. `control` (40px) tall, `surface-raised` with a 1px `line-strong` border and `radius-xs`; text is `body` 16px so iOS never zooms. Label is `body-sm` 500 with an optional "Optional" in `ink-muted`; helper text is `caption` `ink-muted`; a character counter sits at the right of the helper line. Hover darkens the border to `ink-muted`; focus shows an `accent` border plus the `focus-ring`. Error: border `danger`, ground `danger-soft`, helper text in `danger` with an `alert-triangle` icon. Disabled: the field at `opacity-disabled` on `surface-sunken`.

The consumer provides `label`, `value`, `placeholder`, `help`, `error`, `maxLength`, `optional`, `type` and `disabled`. Don't: a label inside the field; a required asterisk (mark optional fields instead); error text in a toast only.
