'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getEvents() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) return []

  const { data } = await supabase
    .from('meal_events')
    .select('*')
    .eq('household_id', member.household_id)
    .eq('is_template', false)
    .order('date', { ascending: false })

  return data ?? []
}

export async function getTemplates() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) return []

  const { data } = await supabase
    .from('meal_events')
    .select('*')
    .eq('household_id', member.household_id)
    .eq('is_template', true)
    .order('template_name')

  return data ?? []
}

export async function getEvent(id: string) {
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('meal_events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) return null

  const [recipes, extraProducts] = await Promise.all([
    supabase
      .from('meal_event_recipes')
      .select('*, recipe:recipes(id, name, base_servings, description)')
      .eq('meal_event_id', id)
      .order('sort_order'),
    supabase
      .from('meal_event_extra_products')
      .select('*')
      .eq('meal_event_id', id)
      .order('sort_order'),
  ])

  return {
    ...event,
    recipes: recipes.data ?? [],
    extraProducts: extraProducts.data ?? [],
  }
}

export async function createEvent(data: {
  name: string
  event_type: string
  date: string
  adults: number
  children: number
  notes?: string | null
  is_template?: boolean
  template_name?: string | null
  recipes?: { recipe_id: string; servings: number }[]
  extra_products?: { name: string; quantity: number; unit: string }[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) throw new Error('No household')

  const { data: event, error } = await supabase
    .from('meal_events')
    .insert({
      household_id: member.household_id,
      created_by: user.id,
      name: data.name,
      event_type: data.event_type,
      date: data.date,
      adults: data.adults,
      children: data.children,
      notes: data.notes ?? null,
      is_template: data.is_template ?? false,
      template_name: data.template_name ?? null,
    } as never)
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  if (data.recipes && data.recipes.length > 0) {
    const { error: rErr } = await supabase
      .from('meal_event_recipes')
      .insert(
        data.recipes.map((r, i) => ({
          meal_event_id: event.id,
          recipe_id: r.recipe_id,
          servings: r.servings,
          sort_order: i,
        } as never))
      )
    if (rErr) throw new Error(rErr.message)
  }

  if (data.extra_products && data.extra_products.length > 0) {
    const { error: pErr } = await supabase
      .from('meal_event_extra_products')
      .insert(
        data.extra_products.map((p, i) => ({
          meal_event_id: event.id,
          name: p.name,
          quantity: p.quantity,
          unit: p.unit,
          sort_order: i,
        } as never))
      )
    if (pErr) throw new Error(pErr.message)
  }

  revalidatePath('/events')
  return event.id
}

export async function updateEvent(
  id: string,
  data: {
    name?: string
    event_type?: string
    date?: string
    adults?: number
    children?: number
    notes?: string | null
    recipes?: { recipe_id: string; servings: number }[]
    extra_products?: { name: string; quantity: number; unit: string }[]
  }
) {
  const updateData: Record<string, unknown> = { ...data }
  delete updateData.recipes
  delete updateData.extra_products
  const supabase = await createClient()

  const { error } = await supabase
    .from('meal_events')
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Replace recipes if provided
  if (data.recipes) {
    await supabase.from('meal_event_recipes').delete().eq('meal_event_id', id)
    if (data.recipes.length > 0) {
      const { error: rErr } = await supabase
        .from('meal_event_recipes')
        .insert(
          data.recipes.map((r, i) => ({
            meal_event_id: id,
            recipe_id: r.recipe_id,
            servings: r.servings,
            sort_order: i,
          } as never))
        )
      if (rErr) throw new Error(rErr.message)
    }
  }

  // Replace extra products if provided
  if (data.extra_products) {
    await supabase.from('meal_event_extra_products').delete().eq('meal_event_id', id)
    if (data.extra_products.length > 0) {
      const { error: pErr } = await supabase
        .from('meal_event_extra_products')
        .insert(
          data.extra_products.map((p, i) => ({
            meal_event_id: id,
            name: p.name,
            quantity: p.quantity,
            unit: p.unit,
            sort_order: i,
          } as never))
        )
      if (pErr) throw new Error(pErr.message)
    }
  }

  revalidatePath('/events')
  revalidatePath(`/events/${id}`)
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('meal_events')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/events')
}

export async function duplicateEvent(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const original = await getEvent(id)
  if (!original) throw new Error('Event not found')

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) throw new Error('No household')

  return await createEvent({
    name: `${original.name} (copia)`,
    event_type: original.event_type,
    date: original.date,
    adults: original.adults,
    children: original.children,
    notes: original.notes,
    recipes: original.recipes.map((r: { recipe_id: string; servings: number }) => ({
      recipe_id: r.recipe_id,
      servings: r.servings,
    })),
    extra_products: original.extraProducts.map((p: { name: string; quantity: number; unit: string }) => ({
      name: p.name,
      quantity: p.quantity,
      unit: p.unit,
    })),
  })
}

export async function saveAsTemplate(id: string, templateName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const original = await getEvent(id)
  if (!original) throw new Error('Event not found')

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) throw new Error('No household')

  return await createEvent({
    name: original.name,
    event_type: original.event_type,
    date: original.date,
    adults: original.adults,
    children: original.children,
    notes: original.notes,
    is_template: true,
    template_name: templateName,
    recipes: original.recipes.map((r: { recipe_id: string; servings: number }) => ({
      recipe_id: r.recipe_id,
      servings: r.servings,
    })),
    extra_products: original.extraProducts.map((p: { name: string; quantity: number; unit: string }) => ({
      name: p.name,
      quantity: p.quantity,
      unit: p.unit,
    })),
  })
}

export async function getRecipesForEvent() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('recipes')
    .select('id, name, base_servings, description')
    .order('name')

  return data ?? []
}

export async function generateShoppingListFromEvent(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) throw new Error('No household')

  const event = await getEvent(eventId)
  if (!event) throw new Error('Event not found')

  // Build items from recipes
  const items: {
    name: string
    quantity: number
    unit: string
    section: string | null
    recipeSources: string[]
    optional: boolean
  }[] = []

  // Add extra products
  for (const p of event.extraProducts) {
    items.push({
      name: p.name,
      quantity: p.quantity,
      unit: p.unit,
      section: p.section,
      recipeSources: [`${event.name}`],
      optional: false,
    })
  }

  const { data: list, error } = await supabase
    .from('shopping_lists')
    .insert({
      household_id: member.household_id,
      created_by: user.id,
      name: `${event.name} - Lista`,
      supermarket_id: null,
      notes: `Evento: ${event.name} (${event.adults} adultos, ${event.children} niños)`,
      is_completed: false,
    } as never)
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  if (items.length > 0) {
    const { error: iErr } = await supabase
      .from('shopping_list_items')
      .insert(
        items.map((item, i) => ({
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

    if (iErr) throw new Error(iErr.message)
  }

  revalidatePath('/shopping-lists')
  return list.id
}
