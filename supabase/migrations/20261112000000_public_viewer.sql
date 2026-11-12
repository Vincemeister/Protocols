-- Phase 2 (public viewer) additions to the v1 data model.
--
--   * slugs, so a list and a product have readable addresses:
--       /vince.rehms/camera-bag-essentials/everyday-sling-6l
--   * profiles.about, the long text of the About tab
--   * likes (the heart on a product card; the brief's first cut left it out,
--     the designed screens have it)
--   * count views for followers and likes
--   * usernames that would collide with the app's own addresses are refused

alter table public.profiles add column about text;

alter table public.profiles add constraint profiles_username_not_reserved check (
  username::text not in (
    'about', 'admin', 'api', 'auth', 'brand', 'codes', 'contact', 'create', 'dev', 'explore',
    'favolist', 'home', 'legal', 'lists', 'new', 'notifications', 'privacy', 'products',
    'saved', 'search', 'settings', 'static', 'terms', 'www'
  )
);

-- A list's slug is unique per creator and may not shadow the profile tabs.
alter table public.lists add column slug text not null
  check (slug ~ '^[a-z0-9-]{1,80}$' and slug not in ('products', 'codes', 'about'));
create unique index lists_owner_slug_idx on public.lists (owner_id, slug);

-- A product's slug is unique within its list.
alter table public.products add column slug text not null check (slug ~ '^[a-z0-9-]{1,80}$');
create unique index products_list_slug_idx on public.products (list_id, slug);

create table public.likes (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index likes_product_idx on public.likes (product_id);

alter table public.likes enable row level security;
create policy "likes are readable" on public.likes
  for select using (true);
create policy "like as yourself" on public.likes
  for insert to authenticated with check (user_id = (select private.current_profile_id()));
create policy "unlike as yourself" on public.likes
  for delete to authenticated using (user_id = (select private.current_profile_id()));

-- Counts for the profile header and the product cards. security_invoker makes
-- the views obey the row-level rules of the tables underneath.
create view public.profile_follow_counts with (security_invoker = true) as
  select p.id as profile_id,
         (select count(*)::int from public.follows f where f.followee_id = p.id) as followers,
         (select count(*)::int from public.follows f where f.follower_id = p.id) as following
  from public.profiles p;

create view public.product_like_counts with (security_invoker = true) as
  select l.product_id, count(*)::int as likes
  from public.likes l
  group by l.product_id;

-- about is readable like the other public profile columns
grant select (about) on public.profiles to anon, authenticated;
