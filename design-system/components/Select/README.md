# Select

The native select dressed as a TextField, with a `chevron-down` in `ink-muted` at the right. Use it for short, known lists: choosing the list a product goes into, list visibility, country. Over roughly eight options, or when the options need avatars or images, use a Dialog with a searchable list instead.

The consumer provides `label`, `options` ({value, label}), `value`, `onChange`. Don't: a placeholder option that cannot be re-selected; custom dropdowns on mobile.
