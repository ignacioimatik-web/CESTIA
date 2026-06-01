'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type RecipeListItem = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  base_servings: number
  prep_time_minutes: number | null
  difficulty: string | null
  category: string | null
  tags: string[]
  is_public: boolean
  is_favorite: boolean
  created_at: string
  ingredient_count: number
}

export type RecipeDetail = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  base_servings: number
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  difficulty: string | null
  category: string | null
  instructions: string | null
  tags: string[]
  is_public: boolean
  is_favorite: boolean
  created_by: string
  household_id: string | null
  created_at: string
  updated_at: string
  ingredients: {
    id: string
    ingredient_id: string
    ingredient_name: string
    quantity: number
    unit: string
    optional: boolean
    notes: string | null
  }[]
}

export type RecipeFormData = {
  name: string
  description?: string | null
  image_url?: string | null
  base_servings: number
  prep_time_minutes?: number | null
  cook_time_minutes?: number | null
  difficulty?: string | null
  category?: string | null
  instructions?: string | null
  tags: string[]
  is_public: boolean
  is_favorite?: boolean
}

export type IngredientFormData = {
  ingredient_name: string
  quantity: number
  unit: string
  optional?: boolean
  notes?: string | null
}

export async function getRecipes(params?: {
  search?: string
  category?: string
  tags?: string[]
  page?: number
  pageSize?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const page = params?.page ?? 1
  const pageSize = Math.min(params?.pageSize ?? 50, 100)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('recipes')
    .select(
      `id, name, description, image_url, base_servings, prep_time_minutes,
       difficulty, category, tags, is_public, is_favorite, created_at,
       created_by`
    )

  if (params?.search) {
    query = query.or(
      `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
    )
  }

  if (params?.category) {
    query = query.eq('category', params.category)
  }

  if (params?.tags && params.tags.length > 0) {
    query = query.contains('tags', params.tags)
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data: recipes, count } = await query

  // Get ingredient counts for each recipe
  const recipeIds = (recipes ?? []).map((r) => r.id)
  let ingredientCounts: Record<string, number> = {}

  if (recipeIds.length > 0) {
    const { data: counts } = await supabase
      .from('recipe_ingredients')
      .select('recipe_id')
      .in('recipe_id', recipeIds)

    const map: Record<string, number> = {}
    for (const c of counts ?? []) {
      map[c.recipe_id] = (map[c.recipe_id] ?? 0) + 1
    }
    ingredientCounts = map
  }

  const list: RecipeListItem[] = (recipes ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    image_url: r.image_url,
    base_servings: r.base_servings,
    prep_time_minutes: r.prep_time_minutes,
    difficulty: r.difficulty,
    category: r.category,
    tags: r.tags ?? [],
    is_public: r.is_public,
    is_favorite: r.is_favorite,
    created_at: r.created_at,
    ingredient_count: ingredientCounts[r.id] ?? 0,
  }))

  return { recipes: list, total: count ?? 0 }
}

export async function getRecipeById(id: string): Promise<RecipeDetail | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (!recipe) return null

  const { data: ingredients } = await supabase
    .from('recipe_ingredients')
    .select('id, ingredient_id, quantity, unit, optional, notes')
    .eq('recipe_id', id)

  const ingredientIds = (ingredients ?? []).map((i) => i.ingredient_id)
  let ingredientNames: Record<string, string> = {}

  if (ingredientIds.length > 0) {
    const { data: names } = await supabase
      .from('ingredients')
      .select('id, name')
      .in('id', ingredientIds)

    for (const n of names ?? []) {
      ingredientNames[n.id] = n.name
    }
  }

  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    image_url: recipe.image_url,
    base_servings: recipe.base_servings,
    prep_time_minutes: recipe.prep_time_minutes,
    cook_time_minutes: recipe.cook_time_minutes,
    difficulty: recipe.difficulty,
    category: recipe.category,
    instructions: recipe.instructions,
    tags: recipe.tags ?? [],
    is_public: recipe.is_public,
    is_favorite: recipe.is_favorite,
    created_by: recipe.created_by,
    household_id: recipe.household_id,
    created_at: recipe.created_at,
    updated_at: recipe.updated_at,
    ingredients: (ingredients ?? []).map((i) => ({
      id: i.id,
      ingredient_id: i.ingredient_id,
      ingredient_name: ingredientNames[i.ingredient_id] ?? '',
      quantity: i.quantity,
      unit: i.unit,
      optional: i.optional,
      notes: i.notes,
    })),
  }
}

async function resolveIngredient(name: string): Promise<string> {
  const supabase = await createClient()
  const trimmed = name.trim()

  const { data: existing } = await supabase
    .from('ingredients')
    .select('id')
    .ilike('name', trimmed)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created } = await supabase
    .from('ingredients')
    .insert({ name: trimmed, image_url: null, category: null, section: null })
    .select('id')
    .single()

  return created!.id
}

export async function createRecipe(data: RecipeFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: recipe, error } = await supabase
    .from('recipes')
    .insert({
      household_id: member?.household_id ?? null,
      created_by: user.id,
      name: data.name,
      description: data.description ?? null,
      image_url: data.image_url ?? null,
      base_servings: data.base_servings,
      prep_time_minutes: data.prep_time_minutes ?? null,
      cook_time_minutes: data.cook_time_minutes ?? null,
      difficulty: (data.difficulty ?? null) as 'easy' | 'medium' | 'hard' | null,
      category: data.category ?? null,
      instructions: data.instructions ?? null,
      tags: data.tags,
      is_public: data.is_public,
      is_favorite: data.is_favorite ?? false,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/recipes')
  return recipe.id
}

export async function updateRecipe(id: string, data: RecipeFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('recipes')
    .update({
      name: data.name,
      description: data.description ?? null,
      image_url: data.image_url ?? null,
      base_servings: data.base_servings,
      prep_time_minutes: data.prep_time_minutes ?? null,
      cook_time_minutes: data.cook_time_minutes ?? null,
      difficulty: (data.difficulty ?? null) as 'easy' | 'medium' | 'hard' | null,
      category: data.category ?? null,
      instructions: data.instructions ?? null,
      tags: data.tags,
      is_public: data.is_public,
    })
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/recipes')
  revalidatePath(`/recipes/${id}`)
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/recipes')
}

export async function addRecipeIngredient(
  recipeId: string,
  data: IngredientFormData
) {
  const supabase = await createClient()
  const ingredientId = await resolveIngredient(data.ingredient_name)

  const { data: item, error } = await supabase
    .from('recipe_ingredients')
    .insert({
      recipe_id: recipeId,
      ingredient_id: ingredientId,
      quantity: data.quantity,
      unit: data.unit,
      optional: data.optional ?? false,
      notes: data.notes ?? null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/recipes/${recipeId}`)
  return { id: item.id, ingredient_id: ingredientId }
}

export async function updateRecipeIngredient(
  id: string,
  data: IngredientFormData
) {
  const supabase = await createClient()
  const ingredientId = await resolveIngredient(data.ingredient_name)

  const { error } = await supabase
    .from('recipe_ingredients')
    .update({
      ingredient_id: ingredientId,
      quantity: data.quantity,
      unit: data.unit,
      optional: data.optional ?? false,
      notes: data.notes ?? null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/recipes/${id}`)
}

export async function deleteRecipeIngredient(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/recipes')
}

export async function searchIngredients(query: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('ingredients')
    .select('id, name, category')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(10)

  return data ?? []
}
