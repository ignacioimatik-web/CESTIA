-- Add difficulty and category columns to recipes
alter table recipes add column if not exists difficulty text check (difficulty in ('easy', 'medium', 'hard'));
alter table recipes add column if not exists category text;
