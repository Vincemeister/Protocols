# ProductCard

The unit of the feed and of every list. Top row: the creator (`Avatar` 40, username in `body-sm` 600, the list name under it in `caption` `ink-muted`) on the left, the brand chip (32px tall, `shadow-sm`, logo `object-fit: contain` or the brand name in `overline`) on the right. Then the product image in a 1:1 `surface-sunken` frame, `object-fit: contain`. Then the product name in `heading-5`, the creator's review in `body` clamped to three lines, the referral code frame when there is one, and the action row (`heart` and `message-circle` with counts, `share`, and "Go to product" with `external-link` in `accent` at the far right).

Cards sit on `surface-raised` with `space-6` padding (`space-4` on mobile) and are separated by `line` hairlines, never gaps or shadows, up to `content-max` wide. Tapping the image or title opens the product page where the review shows in full as `body-lg`.

The consumer provides the product (name, image, brand, URL, referral code), the creator (avatar, username), the list name, counts and handlers. Every product has a review; the card has no state without one.

Don't: price, rating stars or "Buy" fills; a review truncated without an ellipsis; cropping the product image to cover; a pink anything other than "Go to product".
