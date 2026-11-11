# MarkLoader

The mark assembling, as the splash and the page loader: three squares slide in from the edges over 320ms, the fourth square arrives and splits into four over 200ms, and the bottom pair flush `accent-vivid`. It holds for a moment, fades, and runs again (a 2.6s cycle). Sizes 32, 64 and 128px; the geometry is the mark's own (60-unit squares, 8-unit gutters, 26-unit small squares on a 128 grid), so at rest it is the logo.

Use it for a whole-screen or whole-column load: the first paint of a profile, a list, the search results. Inside a list use Skeleton; at the end of a list use LoadMore; inside a button use the disabled label. With `prefers-reduced-motion` it renders the finished mark, still.

The consumer provides `size` and an accessible `label` ("Loading your lists"). Don't: show it for loads under 300ms; place two on one screen; recolour it.
