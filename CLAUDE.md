# Favolist — CLAUDE.md

Read this before any work in this repo. It replaces the Oct 18 "Protocols" version: the product is called Favolist (for now), the design is finished, and the plan is `docs/build-brief.md`.

## What this is

Favolist is where a creator keeps the products they actually use, with their own review on every item, and shares that page next to their other socials. Next.js + Supabase, built from a finished design. **Nothing visual is yours to invent.**

## Read first, in this order

1. `docs/build-brief.md` — the plan: sources of truth, stack, data model, visual rules, five build phases, the voice-review pipeline, working agreements.
2. `design-system/README.md` — the brand book and rules. Then `design-system/tokens.json`, `design-system/components/bundle.css` (keep the `fv-` class names), `design-system/components/index.d.ts` (the prop contract) and `design-system/components/bundle.js` (reference markup and behaviour). Each `design-system/components/<Name>/README.md` says when to use a component.
3. `docs/screen-inventory.md` — every screen, what it must do, the decisions behind it.
4. `design/screens/*.dc.html` — the designed screens. The markup inside `<x-dc>` is the layout spec; the `support.js` tag and the `{{theme}}` / `{{mark}}` holes belong to the design tool. `design/screens/canvas.json` maps each file to its screen number.

If these disagree: the design system wins over the brief, and the brief wins over the inventory. `design-system/` is committed unchanged; a re-export from the design system artifact must be a drop-in replacement.

## Where the build is

- **Phase 1, Foundation: done** (11 Nov 2026). Tokens, the component library, `/dev/components`, sign-in (B1, B2), the database schema.
- **Phase 2, Public viewer: done** (12 Nov 2026). A1 profile with its four tabs, A2 list page, A3 product page, the desktop frame with both rails, follow / like / save, three demo profiles. Not yet tested signed in against the live project: the build environment cannot reach Supabase, so follow, like and save have only been type-checked.
- **Phase 3, Creator loop: done** (27 Nov 2026). B5 step one (name and username), C3 new / edit list, C4 paste a link with its fetching and failed states, C5 details, C6 review with voice, C7 edit, C8 reorder. Checked in a browser on `/dev/screens` (made-up data, both themes, 390px and 1280px) and by `npm test`. Not yet run signed in against the live project, and the voice review has not been tried with a real microphone on a phone: the build environment can reach neither.
- **Phase 4, Creator surfaces without designs: built** (27 Nov 2026), in its own pull request on top of phase 3. C1 home feed, C2 own-profile controls, C9 saved, C10 referral codes, C11 notifications, C12 followers / following, C13–C16 settings (profile, account, privacy, theme), C17 delete confirmations (product, list, account), A5 search with the creators directory (A6) as its starting state. Checked on `/dev/screens` and, for search and the sign-in gates, on the real routes. **Its migration (`20261127010000_creator_surfaces.sql`) is not applied to the live database yet**: it needs Vini's confirmation because it contains a function that deletes. Until it is applied, "Remove" on a follower does nothing and deleting an account fails with a message.
- **Next: phase 5, Edges** (brief, section 5): A8 landing (designed: `design/screens/Landing.dc.html`), A9 legal pages, B6 the magic-link email, share images, analytics events.
- **Before a public launch:** delete the demo profiles (`supabase/seed/demo-content.mjs`: invented people, invented reviews, mostly invented brands).

Update this section at the end of each phase.

## How the code is laid out

- `scripts/build-tokens.mjs` → `src/styles/tokens.css` and `scripts/build-icons.mjs` → `src/components/ui/icons.generated.ts`. Both are generated from `design-system/` before `dev` and `build` (`npm run tokens`); never edit the outputs.
- `src/app/layout.tsx` loads `tokens.css`, then `design-system/components/bundle.css` unchanged, then `src/styles/app.css` (glue only: no colours, sizes or radii of its own).
- `src/components/ui/` — one React component per design-system component, props as in `index.d.ts`, styled only by `fv-` classes. Import from `@/components/ui`. Screens are built from these only.
- `src/app/dev/components/` — every component in both themes; `previews.tsx` mirrors the design system's `preview.html` files. `npm run compare` (with the built app on port 3111) diffs each preview against `bundle.js` pixel by pixel.
- `src/lib/supabase/` — `createUserClient()` (the signed-in user, reads cookies) and `createPublicClient()` (anonymous, safe inside `'use cache'`). `src/proxy.ts` keeps the session fresh.
- `src/lib/auth/actions.ts` — server actions for the magic link, Google and sign-out. `src/app/auth/callback` exchanges the code for a session.
- `supabase/migrations/` — the schema. `20261111000000_favolist_v1.sql` is the brief's data model with its access rules; `20261112000000_public_viewer.sql` adds slugs, likes and the count views.
- `src/lib/data/` — what signed-out visitors may see. `dataset.ts` reads the whole public dataset once and caches it (tag `public-data`); `public.ts` shapes it per page (`getProfilePage`, `getListPage`, `getProductPage`, `getSuggestions`). Without Supabase values it serves `supabase/seed/demo.json`.
- `src/lib/viewer.ts` — who is looking (`getViewer()`), and `src/components/frame/ForViewer.tsx`, which renders the signed-out version first and swaps in the signed-in one. `src/lib/actions/social.ts` — follow, like, save.
- `src/components/frame/AppFrame.tsx` + `frame.css` — the page frame: navigation rail and suggestions rail on desktop, bottom bar (or the visitor bar) on a phone. Every public page sits in it.
- `src/app/[username]/` — `(profile)/` is the profile with its tab pages (Lists at the root, `products`, `codes`, `about`); `[list]/` the list page; `[list]/[product]/` the product page.
- `src/lib/creator/` — the creator's side (phase 3). `session.ts`: `requireCreator()`, the gate for every creator screen and action (signed out → sign-in, no username yet → `/welcome`). `actions.ts`: the Server Actions that write (profile, list, product, review, reorder). `data.ts`: the creator's own lists and products, drafts included, read as the signed-in user and never cached. `images.ts`: pictures are copied into our storage, never hotlinked. `slug.ts`, `limits.ts`.
- `src/lib/scrape/` — paste a link, get the product. `extract.ts` is pure (JSON-LD, Open Graph, Amazon markup, Shopify JSON, the App Store lookup); `safe-fetch.ts` refuses private addresses on every hop; `index.ts` puts them together under one 8-second deadline. `src/app/api/fetch-product` is the endpoint.
- `src/lib/voice/` — `tidy.ts` (pure: the rule-based tidy pass and the validator that refuses any added, changed or reordered word) and `transcribe.ts` (speech to text). `src/app/api/voice` keeps the recording, transcribes and tidies.
- `src/components/creator/` — the creator screens, one focused form each inside `CreatorScreen` (no rails, no bottom bar; a raised sheet on desktop). `AddProduct` holds C4 and C5 together because they hand state to each other; `ReviewForm` + `useRecorder` are C6; `ListForm` is C3 with C8 inside it.
- `src/app/welcome`, `src/app/lists/…`, `src/app/create/…` — their pages: `/welcome`, `/lists` (every list, drafts included), `/lists/new`, `/lists/<id>/edit`, `/create` (`?list=` preselects a list, `?url=` fetches a link at once), `/create/<product>` (details), `/create/<product>/review`.
- `src/lib/me/` — the signed-in creator's private side (phase 4). `data.ts`: notifications, follower ids, referral codes, the profile as stored. `actions.ts`: referral codes, mark all read, remove a follower, the settings saves, the three deletions.
- `src/components/me/` — the signed-in screens: `Screen` (page frame + top bar + the part that needs the session behind Suspense), `Modal` (the design system's Dialog over the page: a sheet on a phone, a box on desktop), `ConfirmDelete`, `ReferralList`, `People`, `NotificationRows`, `SettingsMenu`, `SettingsForms`, `AutoMore` (the feed's "Loading more"), `SearchBox`.
- `src/app/page.tsx` is two screens: the home feed for someone signed in, a placeholder for a visitor until the landing page exists. `src/app/saved`, `/notifications`, `/referrals`, `/follows`, `/follows/following`, `/settings/…`, `/search`.
- `src/app/dev/screens/` — every creator and signed-in screen with made-up data, for looking at without signing in.
- `tests/` — `npm test` (Node's own test runner, no dependency): slugs, the link reader against a fake network, the tidy pass and its validator. `tests/register.mjs` lets the tests import server modules as written.
- `supabase/seed/demo-content.mjs` — the demo profiles. `npm run seed:build` regenerates `demo.json`, `demo.sql` and the placeholder covers from it.

## Decisions made while building (and why)

- **Outfit is self-hosted** (`@fontsource-variable/outfit` through `next/font/local`), not fetched by `next/font/google`: same font files, but builds do not depend on reaching Google Fonts.
- **Icons are drawn from the design system's own outlines** (generated from `bundle.js`) so they match it exactly; they are Lucide's drawings at the version the system was built with. `lucide-react` supplies names the bundle lacks (`settings`, `log-out`); add new names in `Icon.tsx`.
- **Theme**: an inline script in `<head>` sets `data-theme` before first paint from the `fv-theme` cookie, else from the device. `setTheme()` in `src/lib/theme.ts` writes the cookie. (The brief says the server renders the theme from the cookie; the inline script gives the same result without making every page dynamic.)
- **`profiles.id` is its own id with `auth_user_id` beside it**, not the auth user's id as the brief sketched: the seed pipeline creates curated profiles before their creator has an account. `auth_user_id` is not readable through the API; use the `my_profile()` function to find the signed-in user's profile, and always name columns when selecting from `profiles` (`select *` fails by design).
- **Addresses**: `/username`, `/username/list-slug`, `/username/list-slug/product-slug`. Lists and products have a `slug` column for this; a list may not be called `products`, `codes` or `about`, and usernames that would collide with the app's own pages are refused by the database.
- **Likes exist** (`likes` table) although the brief's first-cut data model left them out: the designed product cards have a heart with a count.
- **Component props beyond `index.d.ts`**, each marked in its file: `ProductCard` (`number`, `href`, `imageRatio`, `actions`; `creator` optional), `Tabs` items (`href`), `TopBar` (`backHref`, `trailing`), `UserCard` (`href`). Fold them into the design system at the next re-export.
- **Pressed heart and bookmark** fill in `ink` (`frame.css`); the design system has no pressed state for icon buttons yet.
- **Home, Search, Create, Saved, Notifications** in the rail and bottom bar lead to the home page (signed in) or sign-in (visitor) until phase 4 builds them.
- **The public dataset is loaded whole and cached** (see `dataset.ts`). Fine for a seeded launch; switch to per-page queries when there are thousands of products.
- **Form components take a `name`** (not in `index.d.ts`) so their values submit with a form.
- **The welcome screen (B5, step one) was built in phase 3**, ahead of the rest of onboarding: nothing in the creator loop works without a profile. First sign-in lands on `/welcome`; it leads to the new-list screen, which leads to the first product.
- **A product is saved as soon as its details are confirmed, and published by its review.** Until then it is a draft only its owner sees (the database rule from phase 1 does the hiding). Drafts are reachable from the list's edit screen, marked "Needs a review".
- **A list's address (slug) never changes after it is created**, even when the list is renamed: shared links must keep working. Products likewise.
- **Reorder saves by itself** (no Save button to forget): arrows on a phone, a grip to drag from 992px, put back if saving fails.
- **Voice.** Speech to text is OpenAI's transcription endpoint when `OPENAI_API_KEY` is set (model `gpt-transcribe`, changeable by env). Without a key, the browser's own live recognition is the transcript where the browser has it. **The tidy pass is rule-based by default** (fillers and stumbled repeats out, capital and full stop in): it cannot add a word by construction, costs nothing and needs no second model. Setting `OPENAI_TIDY_MODEL` lets a language model do it instead; its answer is used only if every word is the creator's, in order (`isFaithful`), otherwise the rule-based version stands.
- **Live words while speaking** use the browser's SpeechRecognition. On phones it is switched off when the server transcribes, because a phone gives the microphone to one listener at a time and the recording matters more; the help line then says "We'll write it down when you tap Stop."
- **A review longer than 600 characters is not cut for the creator**: the field turns red and Publish waits until they trim it. Recordings stop by themselves at two minutes.
- **Pictures**: a phone photo is scaled down in the browser (longest side 1600px, JPEG) before upload; a picture chosen from the product's page is fetched once on save and copied to storage. If that copy fails the product is saved without a picture rather than not at all.
- **The "share the page to Favolist" tip on the paste-a-link screen is left out** until the app can be installed and receive shares (phase 5). `/create?url=…` already accepts a link, so only the manifest is missing.
- **The username prefix shows the site's real address** (the host of the request) instead of the design's "favolist.com/", which is not ours.
- **Component props beyond `index.d.ts` added in phase 3**: `FieldProps` (`success`, `hideCount`), `TextField` (`prefix`, `inputMode`, `autoCapitalize`, `spellCheck`), `TextArea` (`levels`, `fill`, `micDisabled`, `micLabel`; with `onRecord` the parent controls `recording`), `TopBar` (`backIcon`).
- **The database is kept awake.** Supabase pauses a free project after a week without activity; it was paused between 12 and 27 Nov 2026, which took the site and every build down. `vercel.json` has Vercel call `/api/keepalive` once a day. If builds ever fail with "Could not load the public data", check first whether the project is paused.
- **Next.js 16.4.6**, up from 16.4.2, for the published cache advisories (several concern Cache Components, which this app uses).
- **Phase 4 screens have no artboards**, as the brief says: they are assembled from the components on the list-page and form-page templates. Nothing visual was invented; `me.css` is layout glue with tokens only.
- **The feed grows by address**: `/?pages=3` renders three pages of cards, and the "Loading more" row asks for the next one when it scrolls into view. No client-side product state, and Back returns to the same depth.
- **Search is a plain GET form** (`/search?q=…`), open to visitors, over the cached public data: every word typed must appear in the name (creators: name, username, one-liner; lists: name, intro; products: name, brand). With nothing typed it lists the creators (A6 folded in).
- **Settings on desktop is the same menu in the column**, not a left sub-navigation: with seven rows a second navigation would only repeat it.
- **Account settings has no password section** (there are none). Changing the email sends a confirmation link to the new address; nothing changes until it is opened.
- **Privacy is one switch** (show my page to everyone). Per-list drafts live on the list; products are never public before their review.
- **Deleting an account** needs the username typed, empties the creator's storage folders, then calls `delete_my_account()`, which removes the profile (everything else follows by foreign key) and the sign-in.
- **Notifications are marked read by the button**, not by opening the screen, so a glance does not lose the dots. The bell shows a dot while something is unread (`viewer.unread`).
- **Props beyond `index.d.ts` added in phase 4**: `SideNavItem.unread`.
- **Known design-system bug**: in the light theme `bundle.css` shows both mark files side by side in the rail and top bar (`.fv-rail-brand img` outranks `.fv-mark-dark`). `app.css` works around it; fix it in the design system at the next re-export.

## Working agreements

- Components before screens; screens from components only. Something new gets a `design-system/components/<Name>/README.md` first.
- Check every screen at 390px and 1280px, in both themes, before calling it done.
- Never add a colour, radius, shadow or type size that is not in `tokens.json`. If one seems necessary, stop and say so.
- Copy in the artboards is the copy. Sentence case, verb-first buttons, no exclamation marks, no emoji in the interface.
- Schema changes go in a new migration file; nothing dashboard-only.
- Small commits: one component or screen each. One pull request per phase.
- Not in v1: comments, audio playback on the product page, creator analytics, business accounts, ads.

## Working with Vini

- He is a Le Wagon instructor and knows Rails well; Next.js is newer to him. Explain non-obvious React/Next patterns briefly in comments when introducing them.
- He prefers "minimum lovable product" over "minimum viable": polish is welcome, scope creep is not.
- He has little time for this project. Make reasonable calls yourself, write down what you decided and why (here or in the pull request), and keep questions for things only he can decide.

## Running it

- On Vini's Mac, Node lives in `~/.local/node/bin` (no Homebrew): `export PATH="$HOME/.local/node/bin:$PATH"`, then `npm install` and `npm run dev`.
- Next.js 16 with Cache Components (`cacheComponents: true`): public data goes through `'use cache'` functions; anything that reads cookies or `searchParams` sits behind `<Suspense>`. Read `node_modules/next/dist/docs/` before using an API you aren't sure about (see AGENTS.md).
- `npm test` runs the unit tests; `npm run typecheck` and `npm run lint` the rest. `/dev/screens` and `/dev/components` need no sign-in.
- Supabase project "favolist" (ref `affixoepqkhypnmjtfpq`, Singapore). `.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`). Without them the app still runs; sign-in says it is not connected.
- Sign-in set-up that lives in the Supabase dashboard, not in code: the Google provider (needs a Google OAuth client), and the allowed redirect addresses (`http://localhost:3000/**` and the production address) under Authentication → URL configuration.
