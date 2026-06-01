'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getHousehold() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) return null

  const { data: household } = await supabase
    .from('households')
    .select('*')
    .eq('id', member.household_id)
    .single()

  return household
}

export async function getHouseholdWithDetails() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) return null

  const householdId = member.household_id

  const [household, members, usualProducts, recurringLists, favoriteRecipes] = await Promise.all([
    supabase.from('households').select('*').eq('id', householdId).single(),
    supabase.from('household_members').select('*, user:profiles!inner(*)').eq('household_id', householdId),
    supabase.from('household_usual_products').select('*').eq('household_id', householdId).eq('is_active', true).order('frequency'),
    supabase.from('recurring_shopping_lists').select('*').eq('household_id', householdId).eq('is_active', true),
    supabase.from('household_favorite_recipes').select('*, recipe:recipes(id, name)').eq('household_id', householdId),
  ])

  return {
    household: household.data,
    members: members.data ?? [],
    usualProducts: usualProducts.data ?? [],
    recurringLists: recurringLists.data ?? [],
    favoriteRecipes: favoriteRecipes.data ?? [],
  }
}

export async function updateHousehold(data: {
  name?: string
  adults?: number
  young_children?: number
  teenagers?: number
  frequent_guests?: number
  weekly_budget?: number | null
  primary_supermarket_id?: string | null
  dietary_restrictions?: string[]
  preferences?: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) throw new Error('No household found')

  const { error } = await supabase
    .from('households')
    .update(data)
    .eq('id', member.household_id)

  if (error) throw new Error(error.message)
  revalidatePath('/household')
}

export async function getSupermarkets() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('supermarkets')
    .select('id, name, display_name')
    .eq('enabled', true)
    .order('display_name')

  return data ?? []
}

export async function addUsualProduct(data: {
  name: string
  quantity?: number | null
  unit?: string
  frequency?: 'weekly' | 'biweekly' | 'monthly'
  section?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) throw new Error('No household found')

  const { error } = await supabase
    .from('household_usual_products')
    .insert({
      household_id: member.household_id,
      name: data.name,
      quantity: data.quantity ?? null,
      unit: data.unit ?? 'ud',
      frequency: data.frequency ?? 'weekly',
      section: data.section ?? null,
    } as any)

  if (error) throw new Error(error.message)
  revalidatePath('/household')
}

export async function removeUsualProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('household_usual_products')
    .update({ is_active: false } as any)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/household')
}

export async function addFavoriteRecipe(recipeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) throw new Error('No household found')

  const { error } = await supabase
    .from('household_favorite_recipes')
    .insert({ household_id: member.household_id, recipe_id: recipeId } as any)

  if (error && error.code !== '23505') throw new Error(error.message)
  revalidatePath('/household')
}

export async function removeFavoriteRecipe(recipeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) throw new Error('No household found')

  const { error } = await supabase
    .from('household_favorite_recipes')
    .delete()
    .eq('household_id', member.household_id)
    .eq('recipe_id', recipeId)

  if (error) throw new Error(error.message)
  revalidatePath('/household')
}
