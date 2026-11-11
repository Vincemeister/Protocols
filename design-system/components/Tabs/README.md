# Tabs

Underline tabs on a `line` hairline, `space-6` apart, `control` tall. Labels are `label` in `ink-muted`; the selected tab turns `ink` with a 2px `accent` underline flush on the hairline. Counts sit in a `radius-full` pill after the label: `surface-sunken` with `ink-muted` at rest, `accent-soft` with `accent` when selected.

Use them for the profile page (Lists, Products, Saved, About) and the product page (Review, Comments). A tab bar below a profile header becomes sticky at `z-sticky` and gains `shadow-sm` once it sticks. The consumer provides the tab list with optional counts, the selected id and `onChange`; render the active panel with `role="tabpanel"`.

Don't: more than five tabs (use a select on mobile); filled or boxed tabs; a pink label — the underline is the only pink.
