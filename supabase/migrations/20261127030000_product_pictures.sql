-- A product can have many pictures (up to 20, enforced by the app), in the
-- creator's order. The first one is the cover: it stays mirrored in image_url,
-- which cards, feeds and list covers read.
alter table public.products add column image_urls text[] not null default '{}';
update public.products set image_urls = array[image_url] where image_url is not null;
