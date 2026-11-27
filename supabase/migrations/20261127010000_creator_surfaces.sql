-- Phase 4 (creator surfaces) additions.
--
--   * /follows and /referrals are app addresses now
--   * a creator can remove one of their followers (C12)
--   * delete_my_account(): everything of the caller's, then the sign-in itself (C17)

alter table public.profiles drop constraint profiles_username_not_reserved;
alter table public.profiles add constraint profiles_username_not_reserved check (
  username::text not in (
    'about', 'admin', 'api', 'auth', 'brand', 'codes', 'contact', 'create', 'dev', 'explore',
    'favolist', 'follows', 'home', 'legal', 'lists', 'new', 'notifications', 'privacy', 'products',
    'referrals', 'saved', 'search', 'settings', 'static', 'terms', 'welcome', 'www'
  )
);

create or replace function public.username_available(candidate text) returns boolean
language sql stable security definer set search_path = '' as $$
  select candidate ~ '^[a-z0-9._]{3,30}$'
    and candidate not in (
      'about', 'admin', 'api', 'auth', 'brand', 'codes', 'contact', 'create', 'dev', 'explore',
      'favolist', 'follows', 'home', 'legal', 'lists', 'new', 'notifications', 'privacy', 'products',
      'referrals', 'saved', 'search', 'settings', 'static', 'terms', 'welcome', 'www'
    )
    and not exists (select 1 from public.profiles p where p.username = candidate::public.citext);
$$;

-- Until now only the follower could end a follow.
create policy "remove your follower" on public.follows
  for delete to authenticated using (followee_id = (select private.current_profile_id()));

-- Deleting an account removes the profile (lists, products, reviews, codes,
-- follows, saves, likes and notifications go with it through their foreign
-- keys) and then the sign-in. It runs as the definer because a user cannot
-- delete their own row in auth.users; it only ever touches the caller.
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  delete from public.profiles where auth_user_id = uid;
  delete from auth.users where id = uid;
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
