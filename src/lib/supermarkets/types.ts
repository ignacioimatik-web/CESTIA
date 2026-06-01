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
  isSeasonal: boolean
  lastUpdated: string
}

export interface SupermarketSection {
  id: string
  name: string
  displayOrder: number
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

export interface SupermarketConfig {
  name: string
  displayName: string
  logoUrl: string
  color: string
  enabled: boolean
}
