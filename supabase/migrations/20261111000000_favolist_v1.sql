-- Favolist v1 data model (build brief, section 3). Replaces the Oct 18
-- prototype schema (users / lists / items / referrals), which never held data.
--
--   profiles -> lists -> products -> reviews (1) / referral_codes (0..1)
--   follows, saves, notifications
--
-- Rules that live here, not only in the UI:
--   * a product is public only once it has a published review;
--   * usernames are [a-z0-9._]{3,30} and unique;
--   * profile_code_counts says whether a profile has an active code (the Codes tab).

-- ---------------------------------------------------------------------------
-- Remove the prototype schema
-- ---------------------------------------------------------------------------
drop table if exists public.referrals, public.items, public.lists, public.users cascade;
drop function if exists public.owns_user(uuid);
drop function if exists public.owns_list(uuid);
drop function if exists public.list_is_published(uuid);
drop function if exists public.item_list_id(uuid);
drop type if exists public.item_kind;

create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- A profile has its own id, with the auth user attached. The seed pipeline
-- creates curated profiles before their creator has an account, so
-- auth_user_id is nullable.
create table public.profiles (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users (id) on delete set null,
  username      citext not null unique check (username::text ~ '^[a-z0-9._]{3,30}$'),
  display_name  text not null check (length(btrim(display_name)) > 0),
  avatar_url    text,
  bio           text,
  links         jsonb not null default '[]'::jsonb check (jsonb_typeof(links) = 'array'),  -- [{ "kind": "youtube", "url": "…" }], up to four
  theme         text check (theme in ('light', 'dark')),                                  -- null = follow the device
  is_public     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.lists (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  name        text not null check (length(btrim(name)) > 0),
  intro       text,
  cover_url   text,
  is_public   boolean not null default true,
  numbered    boolean not null default false,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index lists_owner_position_idx on public.lists (owner_id, position);

create table public.products (
  id             uuid primary key default gen_random_uuid(),
  list_id        uuid not null references public.lists (id) on delete cascade,
  owner_id       uuid not null references public.profiles (id) on delete cascade,
  name           text not null check (length(btrim(name)) > 0),
  brand          text,
  image_url      text,          -- always a Supabase Storage URL, never a hotlink
  source_url     text,
  source_domain  text,
  position       integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index products_list_position_idx on public.products (list_id, position);
create index products_owner_idx on public.products (owner_id);

-- One review per product, in the creator's own words. raw_transcript and
-- audio_url are kept for good: they are the v2 audio feature and the proof
-- that the words are the creator's.
create table public.reviews (
  product_id      uuid primary key references public.products (id) on delete cascade,
  body_text       text not null check (length(btrim(body_text)) > 0),
  raw_transcript  text,
  audio_url       text,
  tidied          boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create type public.referral_status as enum ('active', 'expired');

create table public.referral_codes (
  product_id    uuid primary key references public.products (id) on delete cascade,
  code          text,
  link          text,
  benefit_text  text,          -- "10% off"
  status        public.referral_status not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (code is not null or link is not null)
);

create table public.follows (
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  followee_id  uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index follows_followee_idx on public.follows (followee_id);

-- A save points at a product or at a list, never both.
create table public.saves (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  product_id  uuid references public.products (id) on delete cascade,
  list_id     uuid references public.lists (id) on delete cascade,
  created_at  timestamptz not null default now(),
  check (num_nonnulls(product_id, list_id) = 1)
);
create unique index saves_user_product_idx on public.saves (user_id, product_id) where product_id is not null;
create unique index saves_user_list_idx on public.saves (user_id, list_id) where list_id is not null;

create type public.notification_kind as enum ('follow', 'save');

create table public.notifications (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,   -- who is told
  actor_id           uuid not null references public.profiles (id) on delete cascade,   -- who did it
  kind               public.notification_kind not null,
  target_product_id  uuid references public.products (id) on delete cascade,
  target_list_id     uuid references public.lists (id) on delete cascade,
  read_at            timestamptz,
  created_at         timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at bookkeeping
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger lists_touch before update on public.lists
  for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create trigger reviews_touch before update on public.reviews
  for each row execute function public.touch_updated_at();
create trigger referral_codes_touch before update on public.referral_codes
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Helpers for the access rules. They live in a private schema so they are not
-- callable through the API, and run as definer so policies can look across
-- tables without recursing through each other's row-level security.
-- ---------------------------------------------------------------------------
create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- The signed-in user's profile id (null when signed out or before onboarding).
create function private.current_profile_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select p.id from public.profiles p where p.auth_user_id = (select auth.uid());
$$;

create function private.profile_is_public(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = target and p.is_public);
$$;

create function private.list_is_public(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.lists l
    join public.profiles p on p.id = l.owner_id
    where l.id = target and l.is_public and p.is_public
  );
$$;

-- The mandatory-review rule: no published review, no public product.
create function private.product_is_public(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.products pr
    join public.lists l on l.id = pr.list_id
    join public.profiles p on p.id = pr.owner_id
    join public.reviews r on r.product_id = pr.id
    where pr.id = target and l.is_public and p.is_public and r.published_at is not null
  );
$$;

create function private.owns_product(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.products pr
    where pr.id = target and pr.owner_id = (select private.current_profile_id())
  );
$$;

create function private.owns_list(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.lists l
    where l.id = target and l.owner_id = (select private.current_profile_id())
  );
$$;

-- The signed-in user's own profile, for the app to find out who is signed in
-- (auth_user_id itself is not readable through the API, see below).
create function public.my_profile() returns setof public.profiles
language sql stable security definer set search_path = '' as $$
  select p.* from public.profiles p where p.auth_user_id = (select auth.uid());
$$;
revoke execute on function public.my_profile() from public, anon;
grant execute on function public.my_profile() to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.lists          enable row level security;
alter table public.products       enable row level security;
alter table public.reviews        enable row level security;
alter table public.referral_codes enable row level security;
alter table public.follows        enable row level security;
alter table public.saves          enable row level security;
alter table public.notifications  enable row level security;

-- profiles: public ones are readable by anyone; a creator sees and edits their own.
-- The auth id is nobody's business: column privileges hide it, so API queries
-- must name their columns (select * on profiles fails by design).
revoke select on public.profiles from anon, authenticated;
grant select (id, username, display_name, avatar_url, bio, links, theme, is_public, created_at, updated_at)
  on public.profiles to anon, authenticated;

create policy "public profiles are readable" on public.profiles
  for select using (is_public or id = (select private.current_profile_id()));
create policy "a user creates their own profile" on public.profiles
  for insert to authenticated with check (auth_user_id = (select auth.uid()));
create policy "a creator edits their own profile" on public.profiles
  for update to authenticated
  using (id = (select private.current_profile_id()))
  with check (id = (select private.current_profile_id()) and auth_user_id = (select auth.uid()));

-- lists
create policy "public lists are readable" on public.lists
  for select using (
    (is_public and (select private.profile_is_public(owner_id)))
    or owner_id = (select private.current_profile_id())
  );
create policy "owners write their lists" on public.lists
  for all to authenticated
  using (owner_id = (select private.current_profile_id()))
  with check (owner_id = (select private.current_profile_id()));

-- products: public only with a published review.
create policy "reviewed products are readable" on public.products
  for select using (
    (select private.product_is_public(id))
    or owner_id = (select private.current_profile_id())
  );
create policy "owners write their products" on public.products
  for all to authenticated
  using (owner_id = (select private.current_profile_id()))
  with check (owner_id = (select private.current_profile_id()) and (select private.owns_list(list_id)));

-- reviews: a draft (no published_at) is the owner's only.
create policy "published reviews are readable" on public.reviews
  for select using (
    (published_at is not null and (select private.product_is_public(product_id)))
    or (select private.owns_product(product_id))
  );
create policy "owners write their reviews" on public.reviews
  for all to authenticated
  using ((select private.owns_product(product_id)))
  with check ((select private.owns_product(product_id)));

-- referral codes follow their product.
create policy "codes of public products are readable" on public.referral_codes
  for select using (
    (select private.product_is_public(product_id)) or (select private.owns_product(product_id))
  );
create policy "owners write their codes" on public.referral_codes
  for all to authenticated
  using ((select private.owns_product(product_id)))
  with check ((select private.owns_product(product_id)));

-- follows: counts are public; you follow and unfollow as yourself.
create policy "follows are readable" on public.follows
  for select using (true);
create policy "follow as yourself" on public.follows
  for insert to authenticated with check (follower_id = (select private.current_profile_id()));
create policy "unfollow as yourself" on public.follows
  for delete to authenticated using (follower_id = (select private.current_profile_id()));

-- saves: private to the saver.
create policy "saves are the saver's" on public.saves
  for all to authenticated
  using (user_id = (select private.current_profile_id()))
  with check (user_id = (select private.current_profile_id()));

-- notifications: read and mark read your own. Rows are written by the triggers below.
create policy "notifications are the recipient's" on public.notifications
  for select to authenticated using (user_id = (select private.current_profile_id()));
create policy "mark your notifications read" on public.notifications
  for update to authenticated
  using (user_id = (select private.current_profile_id()))
  with check (user_id = (select private.current_profile_id()));

-- ---------------------------------------------------------------------------
-- Notifications for follows and saves
-- ---------------------------------------------------------------------------
create function private.notify_follow() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (user_id, actor_id, kind)
  values (new.followee_id, new.follower_id, 'follow');
  return new;
end;
$$;
create trigger follows_notify after insert on public.follows
  for each row execute function private.notify_follow();

create function private.notify_save() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  owner uuid;
begin
  if new.product_id is not null then
    select pr.owner_id into owner from public.products pr where pr.id = new.product_id;
  else
    select l.owner_id into owner from public.lists l where l.id = new.list_id;
  end if;
  if owner is not null and owner <> new.user_id then
    insert into public.notifications (user_id, actor_id, kind, target_product_id, target_list_id)
    values (owner, new.user_id, 'save', new.product_id, new.list_id);
  end if;
  return new;
end;
$$;
create trigger saves_notify after insert on public.saves
  for each row execute function private.notify_save();

-- ---------------------------------------------------------------------------
-- The Codes tab: shown only when a profile has at least one active code on a
-- public product. security_invoker makes the view obey the policies above.
-- ---------------------------------------------------------------------------
create view public.profile_code_counts with (security_invoker = true) as
  select pr.owner_id as profile_id, count(*)::int as active_codes
  from public.referral_codes rc
  join public.products pr on pr.id = rc.product_id
  where rc.status = 'active'
  group by pr.owner_id;

-- ---------------------------------------------------------------------------
-- Storage: "images" (public: product photos, covers, avatars) already exists;
-- "audio" (private: review recordings). Each user writes under a folder named
-- after their auth id: <auth uid>/<file>.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true), ('audio', 'audio', false)
on conflict (id) do nothing;

create policy "users upload their own images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users replace their own images" on storage.objects
  for update to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users delete their own images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "users upload their own audio" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users read their own audio" on storage.objects
  for select to authenticated
  using (bucket_id = 'audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users delete their own audio" on storage.objects
  for delete to authenticated
  using (bucket_id = 'audio' and (storage.foldername(name))[1] = (select auth.uid())::text);
