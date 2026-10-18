-- v1 data model: users -> lists -> items -> referrals (0 or 1 per item).
-- Public read on published lists and their items; creators write their own rows.

create extension if not exists citext;

create type public.item_kind as enum ('product', 'tool', 'book', 'step');

-- Creators. auth_user_id stays null for seeded profiles until someone claims them.
create table public.users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users (id) on delete set null,
  -- citext makes lookups case-insensitive; the ::text cast keeps the check
  -- case-sensitive so handles are stored lowercase.
  handle        citext not null unique check (handle::text ~ '^[a-z0-9_]{2,30}$'),
  name          text not null,
  avatar_url    text,
  bio           text,          -- one line
  about         text,          -- short protocol intro
  social_links  jsonb not null default '[]'::jsonb,  -- [{ "platform": "instagram", "url": "..." }]
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.lists (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  slug         text not null check (slug ~ '^[a-z0-9-]{1,80}$'),
  title        text not null,
  description  text,
  position     integer not null default 0,
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, slug)
);
create index lists_user_position_idx on public.lists (user_id, position);

create table public.items (
  id           uuid primary key default gen_random_uuid(),
  list_id      uuid not null references public.lists (id) on delete cascade,
  slug         text not null check (slug ~ '^[a-z0-9-]{1,80}$'),
  kind         public.item_kind not null default 'product',
  title        text not null,
  url          text,
  image_url    text,           -- always a Supabase Storage URL, never a hotlink
  price        text,
  source       text,
  review       text not null check (length(btrim(review)) > 0),
  description  text,
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (list_id, slug)
);
create index items_list_position_idx on public.items (list_id, position);

create table public.referrals (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null unique references public.items (id) on delete cascade,
  code        text,
  url         text,
  pitch       text,
  created_at  timestamptz not null default now(),
  check (code is not null or url is not null)
);

-- updated_at bookkeeping
create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_touch before update on public.users
  for each row execute function public.touch_updated_at();
create trigger lists_touch before update on public.lists
  for each row execute function public.touch_updated_at();
create trigger items_touch before update on public.items
  for each row execute function public.touch_updated_at();

-- Ownership helpers (security definer so policies don't recurse through RLS).
create function public.owns_user(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.users u
    where u.id = target and u.auth_user_id = (select auth.uid())
  );
$$;

create function public.owns_list(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.lists l
    join public.users u on u.id = l.user_id
    where l.id = target and u.auth_user_id = (select auth.uid())
  );
$$;

create function public.list_is_published(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.lists l where l.id = target and l.published);
$$;

create function public.item_list_id(target uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select i.list_id from public.items i where i.id = target;
$$;

-- Row Level Security
alter table public.users     enable row level security;
alter table public.lists     enable row level security;
alter table public.items     enable row level security;
alter table public.referrals enable row level security;

-- users: profiles are public; a creator edits their own.
-- Anonymous readers never need the auth id. Column privileges hide it from
-- them (selecting `*` on users as anon will fail; always name columns).
revoke select (auth_user_id) on public.users from anon;
create policy "users are public" on public.users
  for select using (true);
create policy "creators insert themselves" on public.users
  for insert to authenticated with check (auth_user_id = (select auth.uid()));
create policy "creators update themselves" on public.users
  for update to authenticated
  using (auth_user_id = (select auth.uid()))
  with check (auth_user_id = (select auth.uid()));

-- lists: published ones are public; owners see and write all of theirs.
create policy "published lists are public" on public.lists
  for select using (published or public.owns_user(user_id));
create policy "owners write lists" on public.lists
  for all to authenticated
  using (public.owns_user(user_id))
  with check (public.owns_user(user_id));

-- items: public when their list is published.
create policy "items of published lists are public" on public.items
  for select using (public.list_is_published(list_id) or public.owns_list(list_id));
create policy "owners write items" on public.items
  for all to authenticated
  using (public.owns_list(list_id))
  with check (public.owns_list(list_id));

-- referrals: same rule, through the item.
create policy "referrals of published items are public" on public.referrals
  for select using (
    public.list_is_published(public.item_list_id(item_id))
    or public.owns_list(public.item_list_id(item_id))
  );
create policy "owners write referrals" on public.referrals
  for all to authenticated
  using (public.owns_list(public.item_list_id(item_id)))
  with check (public.owns_list(public.item_list_id(item_id)));

-- Storage: one public bucket for avatars and item images.
-- Write policies arrive with auth; the seed script uses the service role.
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;
