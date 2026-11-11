Favolist is where a creator keeps the products they genuinely use, with their own review on every single item, and shares that page next to their other socials. The system serves two surfaces in this order: the **public creator page**, opened on a phone from a Linktree or bio link by someone who has never heard of Favolist, and the **creator's editor**, denser and mostly on desktop. Design the first for trust and speed; design the second for control.

## Principles

- **The review is the hero.** Product photos and brand logos support the creator's words, never the other way round. Nothing on a product card may be louder than the review text.
- **Square, hairlined, white.** Structure comes from `line` hairlines and whitespace, not from fills, shadows or rounded containers. Corners are `radius-none`; controls get `radius-xs`; only avatars are `radius-full`.
- **One spark per screen.** `accent` appears on the single most important action in view (Follow, Save, the active tab). Everything else is `ink` and `ink-muted`. If two things on a screen are pink, one of them is wrong.
- **A person, not a store.** No price tags in the feed, no star ratings, no "Buy now" fills, no badges shouting "Deal". Referral codes sit quietly in a `code` frame under the review.
- **Lists of lists.** The mark is four squares, one of them subdivided. Grids of squares (list covers, product images) are the native layout; carry that geometry wherever content repeats.

## Voice and content

Write as the creator, to one reader. Second person for the product ("Add your first product"), first person belongs to the creator's reviews and is never generated or paraphrased by the product. Sentence case everywhere, including buttons and tabs: "Create a list", not "Create A List". No exclamation marks in UI copy. No emoji in the interface; creators may use them inside their own reviews. Numbers are plain and short: "12 products", "1.2k followers", "updated last week".

Button labels are verb first and name the object when there is room: "Follow", "Save to list", "Copy code", "Delete list". Destructive confirmations repeat the object: "Delete 'Camera bag essentials'? This removes 12 products and their reviews."

Empty states describe what will appear, in one sentence, and offer one action: "Your lists show up here. Create your first list." Errors say what happened and what to do, in `danger` text under the field, never in a toast alone.

Reviews are spoken as often as typed. A creator can record a review and Favolist transcribes it; a tidy pass may then remove filler ("um", false starts), fix punctuation and sentence breaks and drop a repeated phrase, and it may do nothing else. It never adds a word, a claim or an adjective the creator did not say, never reorders points, never smooths an opinion or changes its tone, and never shortens for length. The tidied text is marked "Tidied from your recording" and one tap restores the words as spoken; the raw transcript and the audio are kept. A review that reads like an assistant wrote it is a failure of the product, not a polish.

## Color

Use only the semantic tokens; never a raw hex and never the old `primary-500`/`neutral-700` ramp names.

- Pages sit on `surface`; cards, menus and rails on `surface-raised`, separated from the page by `line` hairlines, not by colour (the two are identical in light). Recessed inputs, code frames and image placeholders use `surface-sunken`.
- Text is `ink`. Metadata, counts, section labels and the list name under a product are `ink-muted`. `ink-faint` is for placeholders and disabled labels only; it does not pass for body copy.
- `accent` is the working pink for fills and text: primary buttons, the active tab underline, Follow, links (`link` aliases it). Its hover and pressed state is `accent-hover`. Text on an accent fill is `on-accent`, never literal white: in the dark theme the accent lightens and the label turns to ink.
- `accent-vivid` is the brand pink exactly as the mark uses it. Spend it on the logo, cover art, display type at 24px and above, and progress fills. It fails 4.5:1 on white, so it never labels a button and never sets body text.
- `accent-soft` tints the ground behind accent text: secondary buttons, selected rows, the tab-count pill.
- Status is always a colour plus a word or an icon: `success` with `success-soft`, `warning` with `warning-soft`, `danger` with `danger-soft` and `on-danger` on a danger fill. Success and danger differ in lightness as well as hue, so they survive colour-blindness; still, never rely on the colour alone.
- Photos in list covers sit under `scrim` at `opacity-scrim`, and text on them is `on-image`. Never place text on an unscrimmed photo.
- The dark theme is first-class, not an inversion: `surface` is the mark's plum-black deepened, hairlines warm with it, and the accent lightens to `#fd6b97` so it still reads at 7:1. Every token has a value in both themes; check the dark values when you add one.

## Typography

One family: **Outfit**, loaded from Google Fonts (`family=Outfit:wght@300..700`). Weights 400, 500, 600 and 700; 300 only in long-form "About" text. Never a second typeface, and no system serif fallback for display.

- Headings use `display` and `heading-1` … `heading-6`, bold or semibold, tracked at −0.02em. Below 768px every heading renders one step smaller (a `display` becomes `heading-1`), which keeps the desktop and mobile scales in one list.
- Running text is `body` (16px/24px). The full review on a product page is `body-lg`. Secondary lines are `body-sm`; usernames inside cards are `body-sm` at weight 600. `caption` carries metadata; `overline` (uppercase, tracked 0.06em, `ink-muted`) labels rail sections and card groups.
- Controls use `label`, `label-lg` and `label-sm` at weight 500, sentence case.
- Referral codes use `code` on `surface-sunken` inside a `radius-xs` frame.
- Inputs are set at `body` (16px) so iOS Safari does not zoom on focus.
- Clamp reviews in cards to three lines with an ellipsis; show the full text on the product page. Never clamp a heading.

## Layout

Desktop (992px and up) is a three-column frame, `page-max` wide and centred: a `rail-nav` navigation rail on the left with the mark, the main items and the account at the bottom; a content column up to `content-max`; and from 1200px a `rail-aside` suggestions rail on the right with the creator card, suggested lists and suggested profiles under `overline` headers. Both rails are sticky, full height, with `space-8` top padding and `space-12` between groups, and are separated from the content by a `line` hairline. Rails are what makes the desktop feel professional; do not collapse them into a top bar.

Below 992px the rails disappear. Navigation becomes a fixed `bar-mobile` (56px) bottom bar on `surface-raised` with a `line` hairline on top; content gets `space-16` bottom padding so nothing hides behind it. Page gutters are `space-4` on mobile and `space-6` on desktop.

Grids of squares: list covers and product images are always 1:1. List cards sit in a 2-column grid on mobile and 3 on desktop with `space-4` gaps; product cards stack in one column at `content-max` on desktop and full width on mobile, separated by `line` hairlines rather than gaps.

## Spacing, borders, radii, shadows

Everything sits on the 4px scale `space-1` … `space-20`. Card padding is `space-4` on mobile and `space-6` on desktop. Button padding is `space-5` horizontally. Avatar-to-name gap is `space-2`.

Borders are 1px. Decorative separation (cards, rails, tabs at rest) uses `line`; a border that tells the user where a control is (inputs, tertiary buttons, checkboxes) uses `line-strong`, which holds 3:1 on surface in both themes.

Corners are `radius-none` by default, `radius-xs` on buttons, inputs and menus, `radius-full` on avatars and the count pill. Never round a card, an image or a modal.

Shadows mark only things that float: `shadow-lg` on modals, sheets, popovers and toasts; `shadow-sm` on a bordered avatar, the brand-logo chip and a tab bar once it sticks. Nothing at rest in the page flow has a shadow.

## Imagery

Product images are the brand's own product shot on a white or transparent ground, shown `object-fit: contain` inside a 1:1 frame on `surface` (dark theme: keep the frame `surface-raised`, do not invert the photo). A missing image shows the `surface-sunken` frame with a Lucide `image` icon in `ink-faint`, never a stock photo.

List covers are a creator photo or the first product image, cropped `object-fit: cover` to 1:1, under `scrim` at `opacity-scrim`, with the list name in `heading-3` (desktop) or `heading-5` (mobile) and the creator's avatar and username in `on-image`.

Avatars are round at 24, 32, 40, 48, 56, 72 and 144px (`Avatar`). The brand logo inside a product card is a 32px-tall chip, `object-fit: contain`, on `surface-raised` with `shadow-sm`.

## Iconography

Use **Lucide** (`lucide-react` in the Next.js build) in one style only: 1.5px stroke, round caps, 20px by default, 24px in the navigation rail and bottom bar, 16px inside small buttons and captions. Icons take the text colour of their context (`ink`, `ink-muted`, `on-accent`) and sit `space-2` from their label. An icon never appears without an accessible name: a visible label, or `aria-label` on an icon-only button.

Navigation icons: `home`, `search`, `plus-square` (create), `bookmark` (saved), `bell`, `user`. Actions: `heart` (like), `message-circle` (comment), `share`, `copy` (referral code), `grip-horizontal` (drag to reorder), `pencil`, `trash-2`, `settings`, `log-out`, `chevron-left` (back), `chevron-down` (select), `x` (close), `upload` (add image), `link` (outbound link), `external-link` (go to product). Status: `check`, `check-circle`, `alert-triangle`, `x-circle`, `info`. Empty states: `list`, `search`, `bookmark`, `bell`, `image`.

Favolist 4.0 drew its icons from Font Awesome Pro in five mixed styles (Sharp, Regular, Light, Thin, Solid); those are not carried into this system and are not substituted one for one. No emoji as icons.

## Motion

Motion comes from the mark: squares that slide, split and settle. Every animation in Favolist is built from that one idea, so the app feels designed rather than decorated, and there are few of them. Three durations and nothing else: `120ms` for hover, pressed and colour changes; `200ms` for tabs, toggles, the tidy badge and anything that moves within a screen; `320ms` for sheets, modals and screen transitions. Easing `cubic-bezier(0.2, 0, 0, 1)` entering and `cubic-bezier(0.4, 0, 1, 1)` leaving; one spring, `cubic-bezier(0.34, 1.56, 0.64, 1)` over `320ms`, reserved for the two moments below that earn it. Animate opacity and transform only, never layout. `prefers-reduced-motion: reduce` collapses every animation to a fade or nothing; the components already do this. Nothing ever makes a person wait for an animation.

The named moments, and nothing beyond them without adding to this list:

- **The mark assembles** (`MarkLoader`): three squares slide in from the edges over `320ms`, the fourth square splits into four over `200ms` and the bottom pair flush pink. This is the splash, the page loader and the only spinner besides LoadMore's. Loops at rest with a `1.6s` pause between runs.
- **Code copied** (`CodeFrame`): on copy the frame flips on its x axis over `200ms`; the back face shows "Copied" with the code in `success`, then flips back after two seconds. The only flip in the system.
- **Follow becomes Following** (`Button` `fv-btn-follow`): the pink fill drains to `accent-soft` over `200ms` as the label crossfades; the button never changes width, so nothing around it moves.
- **Publish settles** (the review step, built in code): the new product tile drops 12px into its place in the list on the spring, the mark's small pink square blinks once in the top bar, and the Toast reads "It's live".
- **Tabs slide**: the `accent` underline travels to the selected tab over `200ms` instead of jumping.
- **Covers rise**: list and product tiles enter a grid with a 40ms stagger, `opacity 0 → 1` and `translateY 8px → 0` over `200ms`; never more than twelve staggered, the rest appear at once.
- **Listening breathes**: the wave in the Listening bar follows the microphone level; the dot blinks at `1.2s`.
- **Sheets spring**: a Sheet rises from the bottom on the spring with the scrim fading in over `200ms`; a Dialog fades and scales from `0.98` over `200ms`.
- **Hover on a cover** (desktop): the scrim lightens by a tenth and the title lifts 2px over `120ms`.
- **The product wall drifts** (sign in and check-your-email): four to five full-width rows of square product photos (one row per roughly 170px of screen height: five on a phone, four on a desktop), real ones from the catalogue, drift sideways at about 3px a second with slightly different speeds per row, alternate rows in opposite directions, under `scrim` at `opacity-scrim`, with the sign-in card floating on `surface-raised` with `shadow-lg`. Carried over from Favolist 4.0, where it was the sign-in screen. A row's loop is seamless (the tiles repeat once); nothing else on the screen moves; under `prefers-reduced-motion` the wall stands still.

No loading spinners inside buttons: disable the button at `opacity-disabled` and change its label ("Saving…"). No bouncing icons, no confetti, no parallax, no animated gradients, no motion on the product image.

## States and accessibility

- Every interactive element shows `focus-ring` on `:focus-visible`, with `outline: none`. Never remove focus without replacing it.
- Hover darkens fills to `accent-hover` or tints neutral controls with `surface-sunken`; pressed states add nothing beyond hover plus a 120ms transition.
- Disabled is the whole element at `opacity-disabled`, with `cursor: not-allowed`; never a lighter colour that could be mistaken for a secondary style.
- Text meets 4.5:1 on the grounds its token note names in both themes; 3:1 is accepted only for `ink-faint`, `accent-vivid` as display type, and for borders, focus rings and icons that carry meaning.
- Hit targets are at least 40×40px (`control`), 44px on the mobile bottom bar.
- Images carry alt text that names the product or list; decorative scrims and covers use empty alt.

## Components

Thirty components live in `components/`, grouped as the Components view shows them. Identity: Avatar, Badge, BrandChip, UserCard, ProfileHeader. Actions: Button, CodeFrame. Navigation: Tabs, TopBar, BottomBar, SideNav, AsideRail, SearchField. Forms: TextField, TextArea (with its voice states), Select, Checkbox, Toggle, ImageUploader. Content: ProductCard, ListCard, ReferralCard, NotificationRow. Feedback: Dialog, Sheet, Alert, Toast, EmptyState, Skeleton, LoadMore, MarkLoader. Each has a guideline that says when to use it, what the consumer provides and what not to do; read it before placing the component. Build screens from these parts only; a screen that needs something new gets a new component here first, never a one-off.

## Logos

The mark is four squares on a 128-unit grid: three large squares of 60 units with an 8-unit gutter, and a fourth quadrant subdivided into four 26-unit squares, the top pair in `mark-ink` and the bottom pair in `accent-vivid`. Draw it at 16, 24, 32 or 64px only; below 16px use a single `accent-vivid` square. Clear space is one small square (26/128 of the width) on every side. Use the uploaded SVGs in `assets/Logos` rather than redrawing: `favolist-mark.svg` on light surfaces, `favolist-mark-light.svg` on dark surfaces and over scrims, `favolist-mark-ink.svg` where only one ink is allowed. The wordmark is the word "Favolist" set in Outfit 700 at −0.02em, in `ink`, with the mark to its left at cap height and a `space-2` gap. Never recolour the pink squares, never rotate the mark, never place it on a pink ground.
