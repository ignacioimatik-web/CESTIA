-- Fix infinite RLS recursion caused by self-referencing policies on household_members.
-- Creates security-definer helper functions that bypass RLS to break the cycle.

create or replace function public.is_household_member(household_id uuid, user_id uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.household_members
    where household_members.household_id = is_household_member.household_id
      and household_members.user_id = is_household_member.user_id
  );
$$;

create or replace function public.is_household_admin(household_id uuid, user_id uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.household_members
    where household_members.household_id = is_household_admin.household_id
      and household_members.user_id = is_household_admin.user_id
      and household_members.role = 'admin'
  );
$$;

-- households
drop policy if exists "Members can view households" on public.households;
create policy "Members can view households"
  on public.households for select
  using (public.is_household_member(id, auth.uid()));

drop policy if exists "Admins can update households" on public.households;
create policy "Admins can update households"
  on public.households for update
  using (public.is_household_admin(id, auth.uid()));

-- household_members
drop policy if exists "Members can view household members" on public.household_members;
create policy "Members can view household members"
  on public.household_members for select
  using (public.is_household_member(household_id, auth.uid()));

drop policy if exists "Admins can manage household members" on public.household_members;
create policy "Admins can manage household members"
  on public.household_members for insert
  with check (public.is_household_admin(household_id, auth.uid()));

drop policy if exists "Admins can update household members" on public.household_members;
create policy "Admins can update household members"
  on public.household_members for update
  using (public.is_household_admin(household_id, auth.uid()));

-- household_favorite_recipes
drop policy if exists "Members can manage favorites" on public.household_favorite_recipes;
create policy "Members can manage favorites"
  on public.household_favorite_recipes for all
  using (public.is_household_member(household_id, auth.uid()));

drop policy if exists "Users can view household favorites" on public.household_favorite_recipes;
create policy "Users can view household favorites"
  on public.household_favorite_recipes for select
  using (public.is_household_member(household_id, auth.uid()));

-- shopping_lists
drop policy if exists "Members can read shopping lists" on public.shopping_lists;
create policy "Members can read shopping lists"
  on public.shopping_lists for select
  using (public.is_household_member(household_id, auth.uid()) or created_by = auth.uid());
