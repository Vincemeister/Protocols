# ReferralCard

One product's referral deal in the creator's Referrals screen: a 56px product thumbnail on `surface-sunken`, the product name in `body-sm` 600 with the list name in `caption`, the CodeFrame (`control-sm` tall) or "No code yet" in `ink-muted`, and at the right a `pencil` edit button and, when the list is sortable, a `grip-horizontal` handle in `ink-faint`. Rows are separated by `line` hairlines.

The consumer provides `product`, `listName`, `code`, `codeLabel`, `onEdit`, `sortable`. Don't: show earnings or click counts here in v1; colour rows with codes differently from rows without.
