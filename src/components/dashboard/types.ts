export type DashboardHeroState = {
  supermarketActive: string | null
  householdActive: string | null
  activeList: string | null
  pendingProducts: number
  estimatedCost: number | null
}

export type HouseholdSummary = {
  adults: number
  children: number
  guests: number
  mode: 'persona_sola' | 'pareja' | 'familia' | 'familia_numerosa' | 'evento'
  multiplier: number
}

export type RecipeCardItem = {
  id: string
  name: string
  imageUrl: string | null
  prepMinutes: number | null
  cookMinutes: number | null
  baseServings: number
  tags: string[]
  ingredients: string[]
}

export type ActiveListSummary = {
  id: string
  name: string
  supermarket: string | null
  totalItems: number
  pendingItems: number
  checkedItems: number
  sections: { name: string; count: number }[]
}

export type SectionStat = {
  key: string
  name: string
  productCount: number
  pendingCount: number
}

export type SuggestedProduct = {
  id: string
  name: string
  brand: string | null
  format: string
  price: number | null
  pricePerUnit: number | null
  section: string | null
  ingredientName: string
  imageUrl: string | null
}

export type CatalogStatus = {
  supermarketName: string | null
  state: 'conectado' | 'cache' | 'pendiente' | 'error'
  lastSync: string | null
  productCount: number
  categoryCount: number
  imagesCount: number
  canSync: boolean
}
