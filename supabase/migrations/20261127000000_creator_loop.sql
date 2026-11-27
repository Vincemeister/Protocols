-- Phase 3 (creator loop) additions.
--
--   * /welcome is an app address now, so it may not be a username
--   * username_available(): the "Available" check on the welcome screen. A
--     plain select cannot answer it, because private profiles are hidden by
--     row-level security but their usernames are still taken.
--   * reorder_products(): writes a whole list order in one statement (C8)
--   * upload limits and allowed file types on the two storage buckets

alter table public.profiles drop constraint profiles_username_not_reserved;
alter table public.profiles add constraint profiles_username_not_reserved check (
  username::text not in (
    'about', 'admin', 'api', 'auth', 'brand', 'codes', 'contact', 'create', 'dev', 'explore',
    'favolist', 'home', 'legal', 'lists', 'new', 'notifications', 'privacy', 'products',
    'saved', 'search', 'settings', 'static', 'terms', 'welcome', 'www'
  )
);

create function public.username_available(candidate text) returns boolean
language sql stable security definer set search_path = '' as $$
  select candidate ~ '^[a-z0-9._]{3,30}$'
    and candidate not in (
      'about', 'admin', 'api', 'auth', 'brand', 'codes', 'contact', 'create', 'dev', 'explore',
      'favolist', 'home', 'legal', 'lists', 'new', 'notifications', 'privacy', 'products',
      'saved', 'search', 'settings', 'static', 'terms', 'welcome', 'www'
    )
    and not exists (select 1 from public.profiles p where p.username = candidate::public.citext);
$$;
revoke execute on function public.username_available(text) from public, anon;
grant execute on function public.username_available(text) to authenticated;

-- ids in their new order. Runs as the caller, so the "owners write their
-- products" policy still decides which rows may change; ids from another list
-- or another owner are simply not updated.
create function public.reorder_products(target_list uuid, ordered_ids uuid[]) returns void
language sql security invoker set search_path = '' as $$
  update public.products p
  set position = o.ord::int
  from unnest(ordered_ids) with ordinality as o(id, ord)
  where p.id = o.id and p.list_id = target_list;
$$;
revoke execute on function public.reorder_products(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_products(uuid, uuid[]) to authenticated;

-- Pictures up to 8 MB, recordings up to 10 MB (two minutes of speech is far below that).
update storage.buckets
set file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
where id = 'images';
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-m4a', 'audio/aac']
where id = 'audio';
