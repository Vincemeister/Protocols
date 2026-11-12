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
- **Next: phase 3, Creator loop** (brief, section 5). Then phases 4 and 5, one pull request per phase.
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
- Supabase project "favolist" (ref `affixoepqkhypnmjtfpq`, Singapore). `.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`). Without them the app still runs; sign-in says it is not connected.
- Sign-in set-up that lives in the Supabase dashboard, not in code: the Google provider (needs a Google OAuth client), and the allowed redirect addresses (`http://localhost:3000/**` and the production address) under Authentication → URL configuration.
