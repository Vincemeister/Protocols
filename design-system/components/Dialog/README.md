# Dialog

A modal on desktop: 480px wide, `surface-raised`, `shadow-lg`, square corners, over a `scrim` at `opacity-scrim`. Title in `heading-4` with an `x` close button, body in `body`, and the actions right-aligned in the footer with the primary (or danger) action last. Used for New list / Edit list, choosing a list, and every destructive confirmation (C17), whose copy names the object and the consequence: "Delete 'Camera bag essentials'? This removes 12 products and their reviews."

On mobile the same content renders as a Sheet. The consumer provides `title`, `body` (text or an element), `actions` (Button props), `onClose`, and `alert` for confirmations. Don't: more than two actions; a dialog inside a dialog; closing on scrim tap for destructive confirmations.
