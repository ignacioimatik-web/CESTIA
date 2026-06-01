import type {
  SupermarketProduct,
  SupermarketSection,
  SearchProductsParams,
  SearchProductsResult,
  SupermarketConfig,
} from './types'

export abstract class SupermarketProvider {
  abstract readonly config: SupermarketConfig

  abstract getSections(): Promise<SupermarketSection[]>

  abstract searchProducts(params: SearchProductsParams): Promise<SearchProductsResult>

  abstract getProductById(id: string): Promise<SupermarketProduct | null>

  abstract getProductsBySection(sectionId: string): Promise<SupermarketProduct[]>

  abstract getProductByEan(ean: string): Promise<SupermarketProduct | null>

  abstract syncCatalog(): Promise<{ synced: number; updated: number; failed: number }>
}
