export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type DbTable<Row, Insert, Update> = {
  Row: Row & Record<string, unknown>
  Insert: Insert & Record<string, unknown>
  Update: Update & Record<string, unknown>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      households: DbTable<Household, HouseholdInsert, HouseholdUpdate>
      household_members: DbTable<HouseholdMember, HouseholdMemberInsert, HouseholdMemberUpdate>
      recipes: DbTable<Recipe, RecipeInsert, RecipeUpdate>
      recipe_ingredients: DbTable<RecipeIngredient, RecipeIngredientInsert, RecipeIngredientUpdate>
      shopping_lists: DbTable<ShoppingList, ShoppingListInsert, ShoppingListUpdate>
      shopping_list_items: DbTable<ShoppingListItem, ShoppingListItemInsert, ShoppingListItemUpdate>
      supermarket_sections: DbTable<SupermarketSection, SupermarketSectionInsert, SupermarketSectionUpdate>
      supermarket_products: DbTable<SupermarketProduct, SupermarketProductInsert, SupermarketProductUpdate>
      meal_plans: DbTable<MealPlan, MealPlanInsert, MealPlanUpdate>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      household_role: 'admin' | 'member'
      dietary_preference: 'none' | 'vegetarian' | 'vegan' | 'gluten_free' | 'lactose_free' | 'low_carb' | 'keto' | 'mediterranean'
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
      unit_type: 'g' | 'kg' | 'ml' | 'l' | 'tsp' | 'tbsp' | 'cup' | 'unit' | 'slice' | 'clove' | 'pack' | 'can' | 'bunch' | 'piece'
      supermarket_name: 'mercadona' | 'lidl' | 'aldi' | 'dia' | 'carrefour' | 'consum' | 'family_cash'
    }
  }
}

type HouseholdInsert = Omit<Household, 'id' | 'created_at' | 'updated_at'>
type HouseholdUpdate = Partial<Omit<Household, 'id'>>

type HouseholdMemberInsert = Omit<HouseholdMember, 'id' | 'created_at'>
type HouseholdMemberUpdate = Partial<Omit<HouseholdMember, 'id'>>

type RecipeInsert = Omit<Recipe, 'id' | 'created_at' | 'updated_at'>
type RecipeUpdate = Partial<Omit<Recipe, 'id'>>

type RecipeIngredientInsert = Omit<RecipeIngredient, 'id' | 'created_at'>
type RecipeIngredientUpdate = Partial<Omit<RecipeIngredient, 'id'>>

type ShoppingListInsert = Omit<ShoppingList, 'id' | 'created_at' | 'updated_at'>
type ShoppingListUpdate = Partial<Omit<ShoppingList, 'id'>>

type ShoppingListItemInsert = Omit<ShoppingListItem, 'id' | 'created_at'>
type ShoppingListItemUpdate = Partial<Omit<ShoppingListItem, 'id'>>

type SupermarketSectionInsert = Omit<SupermarketSection, 'id' | 'created_at'>
type SupermarketSectionUpdate = Partial<Omit<SupermarketSection, 'id'>>

type SupermarketProductInsert = Omit<SupermarketProduct, 'id' | 'created_at' | 'updated_at'>
type SupermarketProductUpdate = Partial<Omit<SupermarketProduct, 'id'>>

type MealPlanInsert = Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>
type MealPlanUpdate = Partial<Omit<MealPlan, 'id'>>

export interface Household {
  id: string
  name: string
  adults: number
  children: number
  favorite_supermarket: Database['public']['Enums']['supermarket_name'] | null
  dietary_preferences: Database['public']['Enums']['dietary_preference'][]
  created_at: string
  updated_at: string
}

export interface HouseholdMember {
  id: string
  household_id: string
  user_id: string
  role: Database['public']['Enums']['household_role']
  created_at: string
}

export interface Recipe {
  id: string
  household_id: string
  created_by: string
  name: string
  description: string | null
  image_url: string | null
  base_servings: number
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  instructions: string | null
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  name: string
  quantity: number
  unit: Database['public']['Enums']['unit_type']
  optional: boolean
  notes: string | null
  supermarket_section_id: string | null
  created_at: string
}

export interface ShoppingList {
  id: string
  household_id: string
  created_by: string
  name: string
  notes: string | null
  is_completed: boolean
  supermarket: Database['public']['Enums']['supermarket_name'] | null
  created_at: string
  updated_at: string
}

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  recipe_id: string | null
  name: string
  quantity: number
  unit: Database['public']['Enums']['unit_type']
  is_checked: boolean
  supermarket_section_id: string | null
  category: string | null
  notes: string | null
  sort_order: number
  created_at: string
}

export interface SupermarketSection {
  id: string
  supermarket: Database['public']['Enums']['supermarket_name']
  name: string
  display_order: number
  created_at: string
}

export interface SupermarketProduct {
  id: string
  supermarket: Database['public']['Enums']['supermarket_name']
  name: string
  brand: string | null
  price: number | null
  unit: Database['public']['Enums']['unit_type']
  quantity: number | null
  category: string | null
  section_id: string | null
  image_url: string | null
  ean: string | null
  is_seasonal: boolean
  last_updated: string
  created_at: string
  updated_at: string
}

export interface MealPlan {
  id: string
  household_id: string
  recipe_id: string
  date: string
  meal_type: Database['public']['Enums']['meal_type']
  servings: number
  created_at: string
  updated_at: string
}
