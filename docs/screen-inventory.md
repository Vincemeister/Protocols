# Favolist rebuild — screen inventory and component gaps

Draft 3, 25 Oct 2026 (decisions in section F settled; voice review added). Grounded in the Favolist 4.0 routes and views (`config/routes.rb`, `app/views`) and the new design system. Purpose: agree the full list of screens before any screen is designed, and name the components the design system still needs so every screen can be assembled from parts that already exist.

(Copy of the Project doc `favolist/screen-inventory.md`, added to the repo 11 Nov 2026 so every session can read it. The Project doc is the master; update both.)

Two decisions carried over from the rebuild notes: the public viewer comes first (someone arriving from a Linktree on a phone), and every product carries the creator's own review.

## A. Public viewer (no account)

| # | Screen | Old app equivalent | Must accomplish | Primary action | Notes |
|---|---|---|---|---|---|
| A1 | Creator profile | `users#show` | In three seconds: who this is, that they're real, and what they recommend. Tabs Lists · Products · Codes · About. | Follow | The screen the whole product is judged on. Design mobile first, then the desktop three-column frame. |
| A2 | List page | `lists#show` | Show one list as a reading experience: cover, intro, products in the creator's order. | Save list | Products stacked as ProductCards separated by hairlines, not a grid. |
| A3 | Product page | `products#show` | The full review, product image, brand, referral code, comments. | Go to product | Review in `body-lg`, never clamped. Code frame with copy. |
| A4 | Comments thread | `products#comments`, `comments#show` | Read a discussion under a product; replies one level deep. | Reply (asks to sign in) | **Deferred to v2.** Can be a section of A3 on desktop, its own screen on mobile. |
| A5 | Search | `pages#search` | Find a creator, list or product by name. | — | Results grouped by type. Empty and "no results" states. |
| A6 | Creators directory | `pages#creators`, `users#index` | Browse creators when you didn't arrive via a link. | Follow | Grid of creator cards (UserCard). Possibly folded into Search for v1. |
| A7 | Home feed (signed out) | `pages#home` | — | — | **Dropped.** The root URL shows A8 Landing for signed-out visitors and C1 Home feed for signed-in creators. |
| A8 | Landing / About | `pages#about` | Explain Favolist in one screen: for creators (put it in your Linktree) and for viewers. | Create your Favolist | Marketing page; uses `display` type and `accent-vivid` cover blocks. |
| A9 | Legal | `settings#terms_and_conditions`, `#privacy_policy` | Readable long text. | — | One text-page template (`text_page.scss` in the old app). |
| A10 | Contact | `contacts#new`, `#sent` | Reach you. | Send | Low priority; could be a mailto. |
| A11 | Not found / no permission | `pages#no_permission`, 404 | Say what happened, offer a way back. | Go home | Empty-state pattern. |

## B. Account

| # | Screen | Old app equivalent | Must accomplish | Primary action | Notes |
|---|---|---|---|---|---|
| B1 | Sign up / sign in | `devise/registrations#new`, `sessions#new` | Start or return with the least friction. | Continue with Google / Send me a link | One screen for both: Google button, email field for a Supabase magic link. No passwords. |
| B2 | Check your email | *(new)* | Tell them the link is on its way; let them resend. | Resend link | Confirmation state of B1. |
| B3 | Forgot / reset password | `devise/passwords#*` | — | — | **Dropped** (no passwords). |
| B4 | Email confirmation | `devise/confirmations#new` | — | — | **Dropped** (the magic link is the confirmation). |
| B5 | Onboarding | *(new)* | Get to a non-empty profile fast: username, avatar, one-line bio, first list name. | Continue | Three steps at most. The old app had no onboarding; the empty profile was the first thing a new creator saw. |
| B6 | Transactional emails | `devise/mailer/*` | The magic-link email; email changed. | Open Favolist | Plain, one template. Design last. |

## C. Creator (signed in)

| # | Screen | Old app equivalent | Must accomplish | Primary action | Notes |
|---|---|---|---|---|---|
| C1 | Home feed | `pages#home` | Products from creators you follow, newest first. | — | ProductCard feed, infinite scroll. Suggested creators and lists in the right rail on desktop. |
| C2 | Own profile | `users#show` (self) | A1 plus edit affordances. | Edit profile / New list | Same screen as A1 with the Follow button swapped for Edit. |
| C3 | New list / edit list | `lists#new`, `#edit`, `_form` | Name, description, cover image, visibility. | Save | Modal on desktop, full screen on mobile. |
| C4 | Add product — choose a source | `products#search_or_manual_product_upload`, `#search_or_manual_app_upload` | Paste a URL (Amazon, Shopify, any store, app or website) or add manually. | Fetch | The scrape flow is the most complex screen in the app; design the loading and failure states. |
| C5 | Add product — details | `products#new`, `_form` | Confirm fetched name, image, brand; pick the list; set a referral code. | Next | Image picker with Dropzone-style upload. |
| C6 | Add product — review | *(new, from the mandatory-review decision)* | Say or write the review. Cannot be skipped. | Publish | **Voice first:** a Speak button in the field records and transcribes; a tidy pass removes filler and fixes punctuation and nothing else; "Use my words as spoken" restores the raw transcript; the audio is stored. Typing is the fallback. Prompt chips ("Why did you buy it?"), counter. Three states designed: empty, listening, tidied. |
| C7 | Edit product | `products#edit` | Change any of C5/C6. | Save | Reuse C5 + C6. |
| C8 | Reorder list | `lists#show` (sortable) | Drag products into order. | — | Drag handle (`grip-horizontal`) on desktop; move up/down on mobile. |
| C9 | Saved (bookmarks) | `bookmarks#index` | Products you saved from others. | — | ProductCard grid; empty state. |
| C10 | Referrals | `referrals#index`, `#show` | Manage referral codes and links across products. | Edit code | ReferralCard list; the old app had a sortable version. |
| C11 | Notifications | `notifications#index` | Follows (comments and replies in v2). | Mark all read | Row list with avatars; unread indicator; empty state. |
| C12 | Followers / following | `users#follows` | See and manage connections. | Follow / Remove | Tabbed UserCard list. |
| C13 | Settings home | `settings#index`, `_settings_menu` | Account, Profile, Privacy, About, Sign out. | — | A menu on mobile, a left sub-nav on desktop. |
| C14 | Settings — profile | `settings#profile` | Name, username, avatar, bio, links. | Save | Form page. |
| C15 | Settings — email & password | `settings#email_password` | Change credentials. | Save | Form page. |
| C16 | Settings — privacy | `settings#privacy` | Visibility and data choices. | Save | Toggles. |
| C17 | Destructive confirmations | `*#destroy` | Delete list / product / account without regret. | Delete | One Dialog pattern, danger button, object named in the copy. |

After the decisions below: 9 public screens (A4 deferred, A7 dropped), 3 account screens (B1, B2, B5) plus the email template, and 17 creator screens, 29 in all; about half are variants of the same few templates (form page, text page, list page, dialog).

## D. Design order

1. A1 Creator profile, mobile, light and dark. Then its desktop version with the two rails.
2. A2 List page and A3 Product page, mobile then desktop.
3. A5 Search and A8 Landing.
4. C1 Home feed and C2 own profile.
5. C4–C6 Add product flow, then C3 lists and C8 reorder.
6. C9–C12 Saved, Referrals, Notifications, Follows.
7. B1, B2 and B5 auth and onboarding.
8. Settings, legal, errors, emails.

## E. Components the design system still needs

Built 24–25 Oct 2026: all of the components below except the v2 ones, plus the TextArea voice states (Speak/Stop, Listening bar, Tidied badge and revert). The table is kept as the original spec.

| Component | Needed by | Spec in one line |
|---|---|---|
| TextField / TextArea (+ voice states) | B1–B5, C3, C5, C6, C14–C16, A5 | 40px, `radius-xs`, `line-strong` border, `body` 16px text, label above, helper or error text below in `caption`; error state uses `danger` + `danger-soft`. |
| SearchField | A5, C4, SideNav | TextField with a leading `search` icon on `surface-sunken`, clears with `x-circle`. |
| Select / Toggle / Checkbox | C3, C16 | Same height and border as TextField; toggle knob is `radius-full`, the only round control. |
| BottomBar | every mobile screen | `bar-mobile` 56px, five items, icons 24px with `caption` labels, active icon in `accent`. |
| TopBar (mobile) | A1–A3, C-screens | Back chevron, title in `heading-6`, one action at the right. The old sticky `nav-header`. |
| AsideRail | desktop A1, C1 | The right-hand suggestions rail: creator UserCard, "Suggested lists", "Suggested profiles" under `overline`. |
| UserCard | A6, C12, AsideRail | Avatar 48 + name + handle + follower count + Follow button. |
| ProfileHeader | A1, C2 | Avatar 144 (72 mobile), display name, @handle, bio, counts, Follow/Edit. |
| BrandChip | ProductCard, A3 | Pull out of ProductCard as its own component. |
| CodeFrame | ProductCard, A3, C10 | Pull out of ProductCard; label + code + copy with a "Copied" success state. |
| ReferralCard | C10 | Product thumbnail, code, link, edit. |
| "Watch the moment" link (timestamped YouTube/TikTok link on a product) | A3, ProductCard | **v2.** A `play`-style link under the review to the creator's existing video at the second they talk about the product; no native video reviews (decided 25 Oct: text is the format, voice the input). |
| "Still using it" re-confirmation | A3, C7 | **v2.** Every six months per product the creator gets a nudge to confirm or remove; the product page then shows "Still using it · confirmed Oct 2026". The living version of "if I stopped using something, it comes off the list". |
| AudioPlayer (creator's voice on the product page) | A3 | **v2.** 30-second clip of the recorded review; plays inline under the written review; audio is captured in v1 so nothing needs re-recording. |
| CommentRow + CommentForm | A4 | **v2.** Avatar 32, name, time in `caption`, body `body-sm`, Reply as `label-sm` link; one nesting level. |
| NotificationRow | C11 | Avatar, sentence, time, unread dot in `accent`. |
| Dialog / Sheet | C3, C17, C4 | Modal on desktop (`shadow-lg`, `radius-none`), bottom sheet on mobile; scrim at `opacity-scrim`. |
| Toast / Alert | saves, errors | Inline Alert on `*-soft` grounds with icon + word; Toast at `z-toast`, bottom-centre, 4s. |
| EmptyState | C9, C11, A5, C2 | Lucide icon in `ink-faint`, one sentence, one button. |
| Badge | counts, "New" | `caption` on `accent-soft` or `surface-sunken`, `radius-none`. |
| ImageUploader | C3, C5, C14 | Dropzone replacement: square target on `surface-sunken`, preview, replace/remove. |
| Skeleton / loading | C1, C4 | Blocks on `surface-sunken`, no spinners except the scrape fetch. |
| Pagination / infinite scroll sentinel | C1, A1 tabs | A "Loading more" row; no page numbers. |

## F. Decisions (settled 24 Oct 2026)

1. **Auth: magic link + Google via Supabase.** No passwords, so no reset or confirmation screens. B1 is one combined sign-up/sign-in screen, B2 its "check your email" state.
2. **Signed-out root URL shows the landing page (A8).** Signed-in creators land on the home feed (C1). The old public feed (A7) is dropped.
3. **Comments ship in v2.** A4, CommentRow, CommentForm and the comment notification variants are deferred; the product page leaves room for them below the review.
4. **Referral codes stay on the public profile as a fourth tab**, labelled **Codes** for viewers (the creator-side screen keeps the name Referrals). Three conditions: the tab appears only when the creator has at least one code (new creators see Lists · Products · About); it is the Products tab filtered to items with a code, same ProductCards, review still the loudest element and the code frame second, no deal badges or discount sorting; and it is named Codes, never Referrals, on the public side. Rationale: referral revenue is the business model for creators and deserves real estate; the conditions keep it from reading as a coupon site. Alternative kept in reserve: no tab, a "3 codes" line in the ProfileHeader that filters Products.
5. **Name:** Favolist for now; the design system is titled Favolist and can be retitled.
6. **Voice review is v1 (25 Oct 2026).** The review field records and transcribes; an AI tidy pass may remove filler, fix punctuation and sentence breaks and drop repeats, and may do nothing else — never add, reorder, soften or shorten (the rule is written into the design system's brand book). The tidied text is labelled and one tap restores the words as spoken. Audio and raw transcript are stored from day one; playing the creator's voice on the product page is v2. Transcription via a hosted speech API (Whisper or equivalent), tidy via one strict LLM prompt; cents per review.
7. **Dates (25 Oct 2026).** Recency shows on the list page ("12 products · updated last week") and the product page ("Added 3 months ago", plus "edited <when>" only if the review changed after publishing). No date on the profile header, list cards or feed cards. Relative wording up to a year, then month and year; exact date in the hover title on desktop. "Still using it" re-confirmation is the stronger signal and is v2.
