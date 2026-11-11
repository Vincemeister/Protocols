# SearchField

One field for creators, lists and products. `control` (40px) tall, `surface-sunken` ground with no border at rest, a leading `search` icon in `ink-muted`, `body` 16px text, and an `x-circle` clear button once there is a query. On focus the ground turns `surface-raised` with a `line-strong` border and the `focus-ring`. The 48px `size: lg` variant is the hero field at the top of the Search screen.

The consumer provides `placeholder`, `value` and `onChange` (debounce it; results appear as you type). Don't: a submit button; placeholder text that is an instruction ("Type here"); a pill shape.
