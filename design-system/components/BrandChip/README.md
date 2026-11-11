# BrandChip

The brand behind a product, as a 32px chip on `surface-raised` with `shadow-sm` and `radius-xs`: the brand's logo at 20px tall (`object-fit: contain`) when one was fetched, otherwise the brand name in `overline`. Sits at the top right of a ProductCard and beside the title on the product page.

The consumer provides `name` and optional `logo`. Don't: colour the chip; crop logos; show it when the brand is unknown — leave the slot empty instead.
