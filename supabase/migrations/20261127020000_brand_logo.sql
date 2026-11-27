-- The brand's logo travels with the product, as it did in the first Favolist:
-- found on the product's page when the link is read, copied into our storage,
-- shown in the brand chip at the top of the product card.
alter table public.products add column brand_logo_url text;
