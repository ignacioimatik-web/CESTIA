alter table public.supermarket_products
  add constraint supermarket_products_supermarket_external_unique
  unique (supermarket_id, external_id);
