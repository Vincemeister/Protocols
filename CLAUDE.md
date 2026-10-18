# Protocols (codename) — CLAUDE.md

Read this before any work in this repo.

## What this is

A rebuild of Favolist as a single lovable creator page: a trusted person's
curated lists of tools, products and routines, with a personal note on every
item, designed to live in a link-in-bio slot. One engine serves both
"Favolist-style" product lists and "Protocols-style" routines; the difference
is the `kind` of the items.

The product name is undecided. "Protocols" is a codename. Do not hard-code a
brand name anywhere; use a single `APP_NAME` constant.

## Source of truth

- **v1 spec (scope, data model, screens, tokens, stack, test plan):**
  https://claude.ai/code/artifact/469c26a1-f930-407c-bed9-49533daf7ae2
- **Background (what the old code, pitch deck and Figma taught us):**
  https://claude.ai/code/artifact/e5f81046-072b-4b30-aded-5e15dcaa4fd8
- **Figma (design reference, view-only):**
  https://www.figma.com/design/VpIdHAUzzSP0mezojWdRfM/Favolist-4.0
  The file opens on an empty "Stylesheet" page. The real frames are on the
  mobile page (node 5-14) and the desktop page (node 120-7363). On desktop,
  "User lists" is 185:27484, "User profile" is 367:17191, and the Cards
  section is 405:17107. The mobile page is too large for the Figma MCP to
  return its metadata; ask Vini for a node link to a specific mobile frame.
- **Old codebase (reference only, do not copy code):**
  https://github.com/Vincemeister/Favolist_4.0

If the spec and this file disagree, the spec wins. Update this file.

## Stack

Next.js (App Router, TypeScript) · Tailwind · Supabase (Postgres, Auth, Storage)
· Vercel. Outfit via `next/font`. `next/og` for Open Graph images.

## Scope guardrails

v1 is seven screens: Profile, List, Item (public); Landing; Dashboard,
Edit list, Add/edit item (creator). See the spec for the full table.

**Never add in v1, even if asked casually mid-session:** follows, feeds,
Explore, comments, notifications, bookmarks, search across creators,
marketplace scrapers, payments, business accounts. If a request touches one
of these, stop and point at the "Not in v1" list in the spec.

No framework upgrades or refactors that are not on the critical path to a
public creator page.

## Data model

`users` → `lists` → `items` → `referrals` (0 or 1 per item).
`items.kind` ∈ product | tool | book | step. `items.review` is NOT NULL.
Public read on published lists/items via RLS; creators write their own rows.

## Design rules

- Tokens come from the Figma, not from memory. Primary `#6366F1`, hover
  `#4F46E5`, neutral ramp 50–900 per the spec, cover overlay `#19070C`.
- Outfit everywhere. Headings use letter-spacing -2.
- The public pages carry the design effort. Creator screens can be plain.
- Tiled list covers are CSS/SVG grids (1, 2x2, 3x3, 4x4 by item count), never
  server-side image processing.
- Mobile first: almost all traffic arrives from a bio link on a phone.

## Conventions

- Server components by default; client components only where interaction
  needs them.
- One server action for URL extraction: fetch page → Open Graph / JSON-LD →
  LLM fallback on page text. No third-party scraper APIs.
- Re-host item images in Supabase Storage on paste; never hotlink.
- Log page views and outbound clicks to a Supabase table. No third-party
  analytics in v1.
- Commit small, commit often. Each PR should leave a public page deployable.

## Working with Vini

- He is a Le Wagon instructor and knows Rails well; Next.js is newer to him.
  Explain non-obvious React/Next patterns briefly when introducing them.
- He prefers "minimum lovable product" over "minimum viable": polish is
  welcome, scope creep is not.
- Decisions that change scope or stack go back to the spec first, then here.

## Running it

- Node lives in `~/.local/node/bin` (no Homebrew on this Mac). Put it on PATH:
  `export PATH="$HOME/.local/node/bin:$PATH"`. Then `npm run dev`.
- Next.js 16 with Cache Components (`cacheComponents: true`). Public data goes
  through `'use cache'` functions in `src/lib/data/`; pages read `params`
  inside `<Suspense>`. Read `node_modules/next/dist/docs/` before using an API
  you aren't sure about (see AGENTS.md).
- Without Supabase env vars, `getProfile` reads the seed fixture
  (`supabase/seed/*.json`, images in `public/seed/`). With them, it reads
  Postgres. `npm run db:seed` loads the fixture into Supabase (service role
  key, uploads images to the `images` bucket).
- Schema: `supabase/migrations/`. Apply it with the Supabase CLI or the SQL editor.
- Tim's seed images are slices of the Figma's flattened list covers. They are
  for demos only; real items get their images re-hosted on paste.
