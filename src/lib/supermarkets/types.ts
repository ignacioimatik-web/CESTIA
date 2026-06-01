export interface SupermarketConfig {
  name: string
  displayName: string
  logoUrl: string | null
  color: string | null
  website: string | null
  enabled: boolean
  externalId: string
}

export interface SupermarketInfo {
  id: string
  name: string
  displayName: string
  logoUrl: string | null
  color: string | null
  website: string | null
  enabled: boolean
  sectionCount: number
  productCount: number
  lastSync: string | null
}

export interface SupermarketSection {
  id: string
  name: string
  displayOrder: number
}

export interface SupermarketProduct {
  id: string
  name: string
  brand: string | null
  price: number | null
  unit: string
  quantity: number | null
  category: string | null
  section: string
  sectionDisplayOrder: number
  imageUrl: string | null
  ean: string | null
  externalId: string | null
  isSeasonal: boolean
  lastUpdated: string
  rawData: unknown | null
}

export interface RawProduct {
  externalId: string
  name: string
  brand: string | null
  price: number | null
  unit: string | null
  quantity: number | null
  imageUrl: string | null
  ean: string | null
  categories: string[]
  isSeasonal: boolean
  rawData: unknown
}

export interface SearchProductsParams {
  query: string
  page?: number
  pageSize?: number
}

export interface SearchProductsResult {
  products: SupermarketProduct[]
  total: number
  page: number
  pageSize: number
}

export interface SyncResult {
  synced: number
  updated: number
  failed: number
  errors: string[]
  totalApiRequests: number
  categoriesProcessed: number
  productsFetched: number
  durationMs: number
}

export type ExternalProductId = string
