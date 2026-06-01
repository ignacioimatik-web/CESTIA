'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { matchIngredient, type ProductCandidate } from '@/lib/matching/matcher'

export async function getShoppingLists() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: lists } = await supabase
    .from('shopping_lists')
    .select('id, name, is_completed, supermarket_id, created_at, created_by')
    .order('created_at', { ascending: false })

  const listIds = (lists ?? []).map((l) => l.id)
  let itemCounts: Record<string, { total: number; checked: number }> = {}

  if (listIds.length > 0) {
    const { data: items } = await supabase
      .from('shopping_list_items')
      .select('shopping_list_id, is_checked')
      .in('shopping_list_id', listIds)

    const map: Record<string, { total: number; checked: number }> = {}
    for (const item of items ?? []) {
      if (!map[item.shopping_list_id]) map[item.shopping_list_id] = { total: 0, checked: 0 }
      map[item.shopping_list_id].total++
      if (item.is_checked) map[item.shopping_list_id].checked++
    }
    itemCounts = map
  }

  return (lists ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    isCompleted: l.is_completed,
    supermarketId: l.supermarket_id,
    createdAt: l.created_at,
    ...(itemCounts[l.id] ?? { total: 0, checked: 0 }),
  }))
}

export type ShoppingListItemData = {
  id: string
  name: string
  quantity: number
  unit: string
  section: string | null
  isChecked: boolean
  isOwned: boolean
  recipeSources: string[]
  notes: string | null
  sortOrder: number
  matchedProductId: string | null
  matchType: string | null
  matchedProduct?: {
    id: string
    name: string
    brand: string | null
    price: number | null
    unit: string
    quantity: number | null
    imageUrl: string | null
  } | null
}

type RawShoppingListItem = {
  id: string
  name: string
  quantity: number
  unit: string
  section: string | null
  is_checked: boolean
  is_owned: boolean
  recipe_sources: string[] | null
  notes: string | null
  sort_order: number
  matched_product_id: string | null
  match_type: string | null
  matched_product: {
    id: string
    name: string
    brand: string | null
    price: number | null
    unit: string
    quantity: number | null
    image_url: string | null
  } | null
}

type RawSupermarketProduct = {
  id: string
  name: string
  brand: string | null
  price: number | null
  unit: string
  quantity: number | null
  image_url: string | null
  supermarket_section: { name: string | null } | null
}

export async function getShoppingList(id: string) {
  const supabase = await createClient()

  const { data: list } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('id', id)
    .single()

  if (!list) return null

  const { data: rawItems } = await supabase
    .from('shopping_list_items')
    .select('*, matched_product:matched_product_id(*)')
    .eq('shopping_list_id', id)
    .order('sort_order', { ascending: true })

  const items = (rawItems ?? []) as RawShoppingListItem[]

  return {
    id: list.id,
    name: list.name,
    notes: list.notes,
    isCompleted: list.is_completed,
    supermarketId: list.supermarket_id,
    createdBy: list.created_by,
    createdAt: list.created_at,
    updatedAt: list.updated_at,
    items: items.map((i) => {
      const mp = i.matched_product
      return {
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        section: i.section,
        isChecked: i.is_checked,
        isOwned: i.is_owned,
        recipeSources: i.recipe_sources ?? [],
        notes: i.notes,
        sortOrder: i.sort_order,
        matchedProductId: i.matched_product_id,
        matchType: i.match_type,
        matchedProduct: mp ? {
          id: mp.id,
          name: mp.name,
          brand: mp.brand,
          price: mp.price,
          unit: mp.unit,
          quantity: mp.quantity,
          imageUrl: mp.image_url,
        } : null,
      }
    }),
  }
}

export async function createShoppingList(data: {
  name: string
  supermarketId?: string | null
  items: {
    name: string
    quantity: number
    unit: string
    section: string | null
    recipeSources: string[]
    optional: boolean
  }[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

    const { data: list, error: listError } = await supabase
    .from('shopping_lists')
    .insert({
      household_id: member?.household_id ?? null,
      created_by: user.id,
      name: data.name,
      supermarket_id: data.supermarketId ?? null,
      notes: null,
      is_completed: false,
    } as never)
    .select('id')
    .single()

  if (listError) throw new Error(listError.message)

  if (data.items.length > 0) {
    const { error: itemsError } = await supabase
      .from('shopping_list_items')
      .insert(
        data.items.map((item, i) => ({
          shopping_list_id: list.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          section: item.section,
          recipe_sources: item.recipeSources,
          sort_order: i,
          product_id: null,
          recipe_id: null,
          notes: null,
          is_checked: false,
          is_owned: false,
        } as never))
      )

    if (itemsError) throw new Error(itemsError.message)
  }

  revalidatePath('/shopping-lists')
  return list.id
}

export async function updateShoppingList(
  id: string,
  data: { name?: string; is_completed?: boolean }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shopping_lists')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/shopping-lists')
  revalidatePath(`/shopping-lists/${id}`)
}

export async function deleteShoppingList(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shopping_lists')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/shopping-lists')
}

export async function toggleItemChecked(id: string, checked: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shopping_list_items')
    .update({ is_checked: checked } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function toggleItemOwned(id: string, owned: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shopping_list_items')
    .update({ is_owned: owned } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function updateItemQuantity(id: string, quantity: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shopping_list_items')
    .update({ quantity } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function updateItemSection(id: string, section: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shopping_list_items')
    .update({ section } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function getUserSectionPreferences() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data } = await supabase
    .from('user_section_preferences')
    .select('ingredient_id, product_id, section')
    .eq('user_id', user.id)

  const prefs: Record<string, string | null> = {}
  for (const p of data ?? []) {
    if (p.ingredient_id) prefs[`ingredient:${p.ingredient_id}`] = p.section
    if (p.product_id) prefs[`product:${p.product_id}`] = p.section
  }
  return prefs
}

export async function saveUserSectionPreference(data: {
  ingredientId: string | null
  productId: string | null
  section: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('user_section_preferences')
    .upsert({
      user_id: user.id,
      ingredient_id: data.ingredientId ?? null,
      product_id: data.productId ?? null,
      section: data.section,
    } as never, {
      onConflict: 'user_id,ingredient_id,product_id',
    })

  if (error) throw new Error(error.message)
}

export async function deleteItem(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shopping_list_items')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function searchProductsForIngredient(query: string) {
  const supabase = await createClient()

  const { data: rawProducts } = await supabase
    .from('supermarket_products')
    .select(`
      id, name, brand, price, unit, quantity, image_url,
      supermarket_section:supermarket_sections!inner(name)
    `)
    .ilike('name', `%${query}%`)
    .order('price', { ascending: true, nullsFirst: false })
    .limit(20)

  const products = (rawProducts ?? []) as RawSupermarketProduct[]

  const candidates: ProductCandidate[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    unit: p.unit,
    quantity: p.quantity,
    supermarketSection: p.supermarket_section?.name ?? null,
    imageUrl: p.image_url,
    ean: null,
  }))

  return matchIngredient(query, candidates, 5)
}

export async function selectProductForItem(
  itemId: string,
  productId: string,
  matchType: 'exact' | 'fuzzy' | 'manual'
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shopping_list_items')
    .update({
      matched_product_id: productId,
      match_type: matchType,
    } as never)
    .eq('id', itemId)

  if (error) throw new Error(error.message)
}

export async function clearProductMatch(itemId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shopping_list_items')
    .update({
      matched_product_id: null,
      match_type: null,
    } as never)
    .eq('id', itemId)

  if (error) throw new Error(error.message)
}

export async function addItem(
  shoppingListId: string,
  data: { name: string; quantity: number; unit: string; section?: string | null }
) {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('shopping_list_items')
    .select('sort_order')
    .eq('shopping_list_id', shoppingListId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSort = (items?.[0]?.sort_order ?? -1) + 1

  const { error } = await supabase
    .from('shopping_list_items')
    .insert({
      shopping_list_id: shoppingListId,
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      section: data.section ?? null,
      sort_order: nextSort,
      product_id: null,
      recipe_id: null,
      notes: null,
      is_checked: false,
      is_owned: false,
    } as never)

  if (error) throw new Error(error.message)
  revalidatePath(`/shopping-lists/${shoppingListId}`)
}

export async function getRecipesForList() {
  const supabase = await createClient()

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, name, base_servings, created_by')
    .order('name')

  const recipeIds = (recipes ?? []).map((r) => r.id)
  const ingredientMap: Record<string, { name: string; quantity: number; unit: string; optional: boolean; ingredientId: string }[]> = {}

  if (recipeIds.length > 0) {
    const { data: ri } = await supabase
      .from('recipe_ingredients')
      .select('recipe_id, ingredient_id, quantity, unit, optional')

    const ingIds = [...new Set((ri ?? []).map((r) => r.ingredient_id))]
    const ingNames: Record<string, string> = {}

    if (ingIds.length > 0) {
      const { data: names } = await supabase
        .from('ingredients')
        .select('id, name')
        .in('id', ingIds)
      for (const n of names ?? []) ingNames[n.id] = n.name
    }

    for (const r of ri ?? []) {
      if (!ingredientMap[r.recipe_id]) ingredientMap[r.recipe_id] = []
      ingredientMap[r.recipe_id].push({
        ingredientId: r.ingredient_id,
        name: ingNames[r.ingredient_id] ?? '?',
        quantity: r.quantity,
        unit: r.unit,
        optional: r.optional,
      })
    }
  }

  return (recipes ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    baseServings: r.base_servings,
    ingredients: ingredientMap[r.id] ?? [],
    createdBy: r.created_by,
  }))
}
