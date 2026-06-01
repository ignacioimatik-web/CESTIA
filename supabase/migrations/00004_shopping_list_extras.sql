alter table shopping_list_items add column if not exists is_owned boolean not null default false;
alter table shopping_list_items add column if not exists recipe_sources text[] not null default '{}';
alter table shopping_list_items add column if not exists section text;
