# Alert

An inline message that belongs to the page: a Lucide icon, an optional bold lead, one or two `body-sm` sentences, and an optional dismiss. Neutral on `surface-sunken` in `ink`; `success`, `warning` and `danger` on their `-soft` grounds with text and icon in the matching colour — always a word plus an icon, never colour alone. Square corners, `space-3`/`space-4` padding, full width of its column. Use it above a form for state the user needs to know before acting (private profile, failed fetch, missing review); for a brief confirmation after an action use Toast.

The consumer provides `tone`, `title`, `message`, `dismissible`, `onDismiss`. Don't: stack alerts; animate them in; use an alert for marketing.
