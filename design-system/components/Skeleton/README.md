# Skeleton

Loading placeholders that keep the layout still: `surface-sunken` blocks in the exact shape of what is coming (a round 40px avatar, a 1:1 image, 14px text lines), pulsing between opacity 1 and 0.55 every 1.6s, and not pulsing at all under `prefers-reduced-motion`. Use them for the home feed, a profile's tabs and the product fetch step; show real content card by card as it arrives rather than waiting for everything.

The consumer provides `width`, `height`, `text`, `round`. Don't: spinners for page loads (the only spinner is LoadMore); shimmering gradients; skeletons for anything that loads in under 300ms.
