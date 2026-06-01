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
      profiles: DbTable<Profile, ProfileInsert, ProfileUpdate>
      supermarkets: DbTable<Supermarket, SupermarketInsert, SupermarketUpdate>
      product_categories: DbTable<ProductCategory, ProductCategoryInsert, ProductCategoryUpdate>
      supermarket_products: DbTable<SupermarketProductDB, SupermarketProductInsertDB, SupermarketProductUpdateDB>
      supermarket_sections: DbTable<SupermarketSection, SupermarketSectionInsert, SupermarketSectionUpdate>
      user_section_preferences: DbTable<UserSectionPreference, UserSectionPreferenceInsert, UserSectionPreferenceUpdate>
      ingredients: DbTable<Ingredient, IngredientInsert, IngredientUpdate>
      product_ingredient_matches: DbTable<ProductIngredientMatch, ProductIngredientMatchInsert, ProductIngredientMatchUpdate>
      households: DbTable<Household, HouseholdInsert, HouseholdUpdate>
      household_members: DbTable<HouseholdMember, HouseholdMemberInsert, HouseholdMemberUpdate>
      household_favorite_recipes: DbTable<HouseholdFavoriteRecipe, HouseholdFavoriteRecipeInsert, HouseholdFavoriteRecipeUpdate>
      household_usual_products: DbTable<HouseholdUsualProduct, HouseholdUsualProductInsert, HouseholdUsualProductUpdate>
      recurring_shopping_lists: DbTable<RecurringShoppingList, RecurringShoppingListInsert, RecurringShoppingListUpdate>
      recipes: DbTable<Recipe, RecipeInsert, RecipeUpdate>
      recipe_ingredients: DbTable<RecipeIngredient, RecipeIngredientInsert, RecipeIngredientUpdate>
      shopping_lists: DbTable<ShoppingList, ShoppingListInsert, ShoppingListUpdate>
      ingredient_product_matches: DbTable<IngredientProductMatch, IngredientProductMatchInsert, IngredientProductMatchUpdate>
      shopping_list_items: DbTable<ShoppingListItem, ShoppingListItemInsert, ShoppingListItemUpdate>
      meal_plans: DbTable<MealPlan, MealPlanInsert, MealPlanUpdate>
      meal_plan_items: DbTable<MealPlanItem, MealPlanItemInsert, MealPlanItemUpdate>
      events: DbTable<Event, EventInsert, EventUpdate>
      meal_events: DbTable<MealEvent, MealEventInsert, MealEventUpdate>
      meal_event_recipes: DbTable<MealEventRecipe, MealEventRecipeInsert, MealEventRecipeUpdate>
      meal_event_extra_products: DbTable<MealEventExtraProduct, MealEventExtraProductInsert, MealEventExtraProductUpdate>
      user_preferences: DbTable<UserPreference, UserPreferenceInsert, UserPreferenceUpdate>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// -- Insert/Update helpers ------------------------------------------------

// Profiles
type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>
type ProfileUpdate = Partial<Omit<Profile, 'id'>>

// Supermarkets
type SupermarketInsert = Omit<Supermarket, 'id' | 'created_at'>
type SupermarketUpdate = Partial<Omit<Supermarket, 'id'>>

// Product Categories
type ProductCategoryInsert = Omit<ProductCategory, 'id' | 'created_at'>
type ProductCategoryUpdate = Partial<Omit<ProductCategory, 'id'>>

// Supermarket Products
type SupermarketProductInsertDB = Omit<SupermarketProductDB, 'id' | 'created_at' | 'updated_at'>
type SupermarketProductUpdateDB = Partial<Omit<SupermarketProductDB, 'id'>>

// Ingredients
type IngredientInsert = Omit<Ingredient, 'id' | 'created_at'>
type IngredientUpdate = Partial<Omit<Ingredient, 'id'>>
type SupermarketSectionInsert = Omit<SupermarketSection, 'id' | 'created_at'>
type SupermarketSectionUpdate = Partial<Omit<SupermarketSection, 'id'>>
type UserSectionPreferenceInsert = Omit<UserSectionPreference, 'id' | 'created_at' | 'updated_at'>
type UserSectionPreferenceUpdate = Partial<Omit<UserSectionPreference, 'id'>>

// Product Ingredient Matches
type ProductIngredientMatchInsert = Omit<ProductIngredientMatch, 'id' | 'created_at'>
type ProductIngredientMatchUpdate = Partial<Omit<ProductIngredientMatch, 'id'>>
type IngredientProductMatchInsert = Omit<IngredientProductMatch, 'id' | 'created_at'>
type IngredientProductMatchUpdate = Partial<Omit<IngredientProductMatch, 'id'>>

// Households
type HouseholdInsert = Omit<Household, 'id' | 'created_at' | 'updated_at'>
type HouseholdUpdate = Partial<Omit<Household, 'id'>>

// Household Members
type HouseholdMemberInsert = Omit<HouseholdMember, 'id' | 'created_at'>
type HouseholdMemberUpdate = Partial<Omit<HouseholdMember, 'id'>>

// Recipes
type RecipeInsert = Omit<Recipe, 'id' | 'created_at' | 'updated_at'>
type RecipeUpdate = Partial<Omit<Recipe, 'id'>>

// Recipe Ingredients
type RecipeIngredientInsert = Omit<RecipeIngredient, 'id' | 'created_at'>
type RecipeIngredientUpdate = Partial<Omit<RecipeIngredient, 'id'>>

// Shopping Lists
type ShoppingListInsert = Omit<ShoppingList, 'id' | 'created_at' | 'updated_at'>
type ShoppingListUpdate = Partial<Omit<ShoppingList, 'id'>>

// Shopping List Items
type ShoppingListItemInsert = Omit<ShoppingListItem, 'id' | 'created_at'>
type ShoppingListItemUpdate = Partial<Omit<ShoppingListItem, 'id'>>


// Meal Plans
type MealPlanInsert = Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>
type MealPlanUpdate = Partial<Omit<MealPlan, 'id'>>

// Meal Plan Items
type MealPlanItemInsert = Omit<MealPlanItem, 'id' | 'created_at'>
type MealPlanItemUpdate = Partial<Omit<MealPlanItem, 'id'>>

// Events
type EventInsert = Omit<Event, 'id' | 'created_at'>
type EventUpdate = Partial<Omit<Event, 'id'>>

// User Preferences
type UserPreferenceInsert = Omit<UserPreference, 'id' | 'created_at' | 'updated_at'>
type UserPreferenceUpdate = Partial<Omit<UserPreference, 'id'>>

// Meal Events
type MealEventInsert = Omit<MealEvent, 'id' | 'created_at' | 'updated_at'>
type MealEventUpdate = Partial<Omit<MealEvent, 'id'>>

// Meal Event Recipes
type MealEventRecipeInsert = Omit<MealEventRecipe, 'id'>
type MealEventRecipeUpdate = Partial<Omit<MealEventRecipe, 'id'>>

// Meal Event Extra Products
type MealEventExtraProductInsert = Omit<MealEventExtraProduct, 'id'>
type MealEventExtraProductUpdate = Partial<Omit<MealEventExtraProduct, 'id'>>

// Household Favorite Recipes
type HouseholdFavoriteRecipeInsert = HouseholdFavoriteRecipe
type HouseholdFavoriteRecipeUpdate = HouseholdFavoriteRecipe

// Household Usual Products
type HouseholdUsualProductInsert = Omit<HouseholdUsualProduct, 'id' | 'created_at'>
type HouseholdUsualProductUpdate = Partial<Omit<HouseholdUsualProduct, 'id'>>

// Recurring Shopping Lists
type RecurringShoppingListInsert = Omit<RecurringShoppingList, 'id' | 'created_at'>
type RecurringShoppingListUpdate = Partial<Omit<RecurringShoppingList, 'id'>>

// -- Interfaces (table Row types) -----------------------------------------

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Supermarket {
  id: string
  name: string
  display_name: string
  logo_url: string | null
  color: string | null
  website: string | null
  enabled: boolean
  last_synced_at: string | null
  created_at: string
}

export interface ProductCategory {
  id: string
  supermarket_id: string
  name: string
  display_order: number
  created_at: string
}

export interface SupermarketProductDB {
  id: string
  supermarket_id: string
  name: string
  brand: string | null
  price: number | null
  unit: string | null
  quantity: number | null
  category_id: string | null
  supermarket_section: string | null
  image_url: string | null
  ean: string | null
  is_seasonal: boolean
  raw_data: unknown | null
  last_updated: string
  created_at: string
  updated_at: string
}

export interface Ingredient {
  id: string
  name: string
  category: string | null
  section: string | null
  image_url: string | null
  created_at: string
}

export interface SupermarketSection {
  id: string
  supermarket_id: string
  canonical_section: string
  supermarket_section_name: string
  display_order: number
  created_at: string
}

export interface UserSectionPreference {
  id: string
  user_id: string
  ingredient_id: string | null
  product_id: string | null
  section: string
  created_at: string
  updated_at: string
}

export interface ProductIngredientMatch {
  id: string
  product_id: string
  ingredient_id: string
  match_type: 'exact' | 'synonym' | 'category'
  created_at: string
}

export interface IngredientProductMatch {
  id: string
  ingredient_id: string
  product_id: string
  supermarket_id: string
  user_id: string | null
  confidence_score: number
  match_type: 'exact' | 'fuzzy' | 'manual' | 'favorite'
  is_user_preferred: boolean
  created_at: string
}

export interface Household {
  id: string
  name: string
  adults: number
  young_children: number
  teenagers: number
  frequent_guests: number
  weekly_budget: number | null
  primary_supermarket_id: string | null
  dietary_restrictions: string[]
  preferences: string[]
  created_at: string
  updated_at: string
}

export interface HouseholdFavoriteRecipe {
  household_id: string
  recipe_id: string
  created_at: string
}

export interface HouseholdUsualProduct {
  id: string
  household_id: string
  product_id: string | null
  name: string
  quantity: number | null
  unit: string
  frequency: 'weekly' | 'biweekly' | 'monthly'
  section: string | null
  is_active: boolean
  created_at: string
}

export interface RecurringShoppingList {
  id: string
  household_id: string
  name: string
  items: unknown
  frequency: 'weekly' | 'biweekly' | 'monthly'
  day_of_week: number | null
  is_active: boolean
  last_generated_at: string | null
  created_at: string
}

export interface HouseholdMember {
  id: string
  household_id: string
  user_id: string
  role: string
  created_at: string
}

export interface Recipe {
  id: string
  household_id: string | null
  created_by: string
  name: string
  description: string | null
  image_url: string | null
  base_servings: number
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  category: string | null
  instructions: string | null
  tags: string[]
  is_public: boolean
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  ingredient_id: string
  quantity: number
  unit: string
  optional: boolean
  notes: string | null
  created_at: string
}

export interface ShoppingList {
  id: string
  household_id: string | null
  created_by: string
  name: string
  notes: string | null
  is_completed: boolean
  supermarket_id: string | null
  created_at: string
  updated_at: string
}

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  product_id: string | null
  recipe_id: string | null
  name: string
  quantity: number
  unit: string
  is_checked: boolean
  is_owned: boolean
  recipe_sources: string[]
  section: string | null
  matched_product_id: string | null
  match_type: string | null
  notes: string | null
  sort_order: number
  created_at: string
}

export interface MealPlan {
  id: string
  household_id: string | null
  name: string | null
  week_start: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface MealPlanItem {
  id: string
  meal_plan_id: string
  recipe_id: string | null
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  servings: number
  created_at: string
}

export interface Event {
  id: string
  user_id: string
  event_type: string
  entity_type: string | null
  entity_id: string | null
  metadata: Json | null
  created_at: string
}

export interface UserPreference {
  id: string
  user_id: string
  dietary_preferences: string[]
  favorite_supermarket_id: string | null
  theme: 'light' | 'dark' | 'system'
  language: 'es' | 'en'
  created_at: string
  updated_at: string
}

export interface MealEvent {
  id: string
  household_id: string | null
  created_by: string
  name: string
  event_type: MealEventType
  date: string
  adults: number
  children: number
  notes: string | null
  is_template: boolean
  template_name: string | null
  created_at: string
  updated_at: string
}

export type MealEventType =
  | 'birthday'
  | 'family_dinner'
  | 'romantic_dinner'
  | 'bbq'
  | 'casual_dinner'
  | 'sports_meal'
  | 'weekly_menu'
  | 'batch_cooking'
  | 'christmas'
  | 'kids_snack'

export interface MealEventRecipe {
  id: string
  meal_event_id: string
  recipe_id: string
  servings: number
  sort_order: number
}

export interface MealEventExtraProduct {
  id: string
  meal_event_id: string
  name: string
  quantity: number
  unit: string
  section: string | null
  notes: string | null
  sort_order: number
}
