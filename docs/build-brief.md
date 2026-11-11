# Favolist rebuild — build brief for Claude Code

25 Oct 2026. The hand-off from design to code. Read this first, then the sources in section 1, then build in the order of section 5. Everything visual is already decided; the job is to make it real in Next.js + Supabase without inventing a second visual language.

(Copy of the Project doc `favolist/build-brief.md`, added to the repo 11 Nov 2026 so every session can read it. The Project doc is the master; update both.)

## 1. Sources of truth, in order of authority

1. **The design system** (Claude artifact "Favolist", https://claude.ai/code/artifact/0374b604-cc98-40e0-8b3c-31c5409e0ead). Its `project/README.md` is the brand book and the rules. `project/tokens.json` holds every colour (light and dark), type style, spacing step, radius, shadow, z-index and layout size. `project/components/bundle.css` is the component stylesheet, `project/components/bundle.js` the reference implementation of every component as a plain-DOM factory, and `project/components/index.d.ts` the prop contract each React component must mirror. Each `project/components/<Name>/README.md` says when to use the component and what not to do. If the design system and this brief disagree, the design system wins.
2. **The screens** (Claude Design canvas "Favolist screens", https://claude.ai/artifact/9efaC2TCnfoLbhkRAQx7zk). Fifteen artboards, each a self-contained HTML page using the system's classes; the markup in them is the layout spec. Rows: creator profile (mobile light, products tab, dark); the visitor path (signed-out profile, list page, product page); the desktop profile with both rails; the creator loop (paste a link, fetching, failed, details, review empty, review listening, review tidied, new list).
3. **The screen inventory** (`favolist/screen-inventory.md` in this project): every screen, what it must accomplish, the decisions behind it, and which components it uses.
4. **The archive salvage** (`favolist/archive-salvage.md`): positioning sentences, Sebastian's testing feedback, v2 backlog. Reference, not spec.

Getting the system files into the repo: open the design system artifact, Files view, and download `README.md`, `tokens.json`, `components/bundle.css`, `components/bundle.js`, `components/index.d.ts` and every `components/<Name>/README.md` into `/design-system/` at the repo root. Commit them unchanged; they are the contract, and a later re-export must be a drop-in replacement.

## 2. Stack

- Next.js (App Router, TypeScript, React 18+), deployed on Vercel.
- Supabase: Postgres, Auth (magic link + Google only; no password auth anywhere), Storage for product images, list covers, avatars and review audio.
- Styling: **no Tailwind, no component library.** Generate `tokens.css` from `tokens.json` (CSS custom properties on `:root` and `[data-theme="dark"]`, plus one class per type style) and ship it as the global stylesheet, then port `bundle.css` as-is into CSS Modules or a global file, keeping the `fv-` class names so the canvas markup maps one-to-one. Components are React wrappers over those classes with the props from `index.d.ts`.
- Theme: `data-theme` on `<html>`, default from `prefers-color-scheme`, user override in settings, persisted in a cookie so the server renders the right theme.
- Font: Outfit via `next/font/google`, weights 400–700, `--font-sans` points at it.
- Icons: `lucide-react`, 1.5px stroke, sizes 16 / 20 / 24 exactly as the brand book says. The icon names per use are listed under Iconography in the README.
- Scraping: a server route that fetches a URL and extracts name, images, brand and canonical link (Open Graph and JSON-LD first, then site-specific adapters for Amazon, Shopify stores and the app stores). Always returns within 8 seconds or fails cleanly to the manual path.
- Voice: client records with MediaRecorder; upload the audio to Storage; a server route transcribes (OpenAI Whisper or equivalent) and runs one tidy pass with a fixed prompt. See section 6.

## 3. Data model (first cut)

`profiles` (id = auth user, username, display_name, avatar_url, bio, links jsonb [{kind, url}], theme, is_public) ·
`lists` (id, owner_id, name, intro, cover_url, is_public, numbered bool, position) ·
`products` (id, list_id, owner_id, name, brand, image_url, source_url, source_domain, position) ·
`reviews` (product_id unique, body_text, raw_transcript, audio_url, tidied bool, published_at) ·
`referral_codes` (product_id unique, code, benefit_text, status enum active|expired) ·
`follows` (follower_id, followee_id) · `saves` (user_id, product_id | list_id) ·
`notifications` (user_id, actor_id, kind enum follow|save, target, read_at).

Rules enforced in the database, not only the UI: a product is visible publicly only if it has a review with `published_at`; the Codes tab exists only when a profile has at least one active referral code; usernames are `[a-z0-9._]{3,30}` and unique.

## 4. Visual rules that must survive the port

- One accent per screen. `accent` on the primary action, the active tab underline and Follow; everything else `ink` / `ink-muted`. `accent-vivid` only on the mark and display-size type.
- Corners `radius-none` everywhere except `radius-xs` on buttons, inputs and menus, and `radius-full` on avatars, the tab-count pill and the toggle knob. No rounded cards, images, covers or modals.
- Structure by `line` hairlines and whitespace; shadows only on things that float (modals, sheets, toasts, the sticky tab bar).
- Text contrast 4.5:1 on its stated ground in both themes; `on-accent` on accent fills (it is dark in the dark theme, never hard-coded white).
- Inputs 16px so iOS does not zoom. Hit targets 40px minimum, 44px on the bottom bar. Focus ring on every interactive element.
- Reviews clamp to three lines in cards and never on the product page. No stars, no prices, no "Buy" fills, no deal badges.
- Copy: sentence case, verb-first buttons, no exclamation marks, no emoji in UI.

## 5. Build order

Each phase ends with the screens working on a phone and on desktop, in both themes, with real data from Supabase, before the next phase starts.

1. **Foundation.** Repo, Supabase project, auth (B1 + B2), `tokens.css` generation, the component library with a Storybook-style page that renders every component in both themes next to the design system's previews. Acceptance: side by side, no visible difference.
2. **Public viewer.** A1 creator profile (mobile, desktop with SideNav and AsideRail, signed-in and signed-out variants), A2 list page, A3 product page, the Codes tab filter, A11 not-found. Seed three creator profiles by script (the "DEMO list" outreach tactic from the archive note) so the pages are never empty.
3. **Creator loop.** C3 new list, C4 paste a link with fetching and failed states, C5 details with image choice and referral code, C6 review with voice (section 6), C7 edit, C8 reorder. This is the phase where the product succeeds or fails; budget the most time here.
4. **Creator surfaces without designs.** Build these straight from the components and the inventory rows; the designs would only repeat the form-page and list-page templates. C1 home feed, C2 own profile, C9 saved, C10 referrals, C11 notifications, C12 follows, C13–C16 settings (profile, account, privacy, theme), C17 delete confirmations, B5 onboarding (three steps: username, avatar and bio, first list), A5 search.
5. **Edges.** A8 landing, A9 legal text pages, B6 the magic-link email, Open Graph images for profiles and lists (the share card is how Favolist spreads), analytics events on follow, save, copy code and go-to-product.

Not in v1: comments, audio playback on the product page, creator analytics, business accounts, ads.

## 6. The voice review, precisely

1. The review field is the TextArea voice variant from the system: a Speak button inside the field. Tapping it asks for the microphone once, then shows the Listening bar (blinking dot, level wave, mono timer) and the transcript streaming into the field as the creator talks. Stop ends the recording. Nothing auto-starts.
2. On stop: upload the audio to Storage (`reviews.audio_url`), transcribe, store the raw transcript (`reviews.raw_transcript`), then run the tidy pass and put its output in the field with the "Tidied from your recording" badge and the "Use my words as spoken" link. The link swaps the field content back to the raw transcript and clears `tidied`.
3. The tidy prompt is fixed and short. It may: remove filler words and false starts, add punctuation and sentence breaks, remove an immediately repeated word or phrase. It may not: add any word, change a word, reorder sentences, remove a sentence, shorten, summarise, change tone or correct an opinion. If in doubt, leave the text as is. Validate the output: the tidied text's word sequence, minus filler, must be a subsequence of the raw transcript's; if it is not, discard the tidy and show the raw transcript.
4. Keep audio and raw transcript forever with the review; they are the v2 audio feature and the fraud defence.
5. Typing stays a first-class path: the same field, no mic required, same counter and prompts.

## 7. Working agreements for Claude Code

- Build components before screens, and screens from components only. A screen that needs something new gets a component in `/design-system/components/<Name>/README.md` first, then code.
- Check every new screen in both themes at 390px and 1280px before calling it done.
- Never introduce a second colour, radius, shadow or type size that is not in `tokens.json`. If one seems necessary, stop and say so; it is a design-system change, made there first.
- Copy in the artboards is the copy. Do not paraphrase button labels, helper text or empty-state sentences.
- Keep the Supabase schema in migrations from day one; no dashboard-only changes.
- Commit small; one screen or one component per commit.
