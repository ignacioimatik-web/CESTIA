-- Fix signup bootstrap reliably (works even when email confirmation is enabled)
-- Create profile + default household + admin membership inside auth trigger.

create or replace function handle_new_user()
returns trigger as $$
declare
  v_household_id uuid;
  v_display_name text;
begin
  v_display_name := coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));

  insert into public.profiles (id, display_name)
  values (new.id, v_display_name)
  on conflict (id) do update set display_name = excluded.display_name;

  insert into public.households (
    name,
    adults,
    young_children,
    teenagers,
    frequent_guests,
    dietary_restrictions,
    preferences
  )
  values (
    'Hogar de ' || v_display_name,
    2,
    0,
    0,
    0,
    '{}',
    '{}'
  )
  returning id into v_household_id;

  insert into public.household_members (household_id, user_id, role)
  values (v_household_id, new.id, 'admin')
  on conflict do nothing;

  return new;
end;
$$ language plpgsql security definer;
