import { SupermarketProvider } from '../provider'
import { supermarketRegistry } from '../registry'
import type {
  SupermarketConfig,
  SupermarketInfo,
  SupermarketSection,
  SupermarketProduct,
  RawProduct,
  SearchProductsResult,
  SyncResult,
  ExternalProductId,
} from '../types'

const CONFIG: SupermarketConfig = {
  name: 'dia',
  displayName: 'DIA',
  logoUrl: '/images/supermarkets/dia.svg',
  color: '#D91A21',
  website: 'https://www.dia.es',
  enabled: false,
  externalId: 'a0000000-0000-0000-0000-000000000004',
}

export class DiaProvider extends SupermarketProvider {
  readonly config = CONFIG

  constructor() {
    super(CONFIG.externalId)
  }

  async getSupermarketInfo(): Promise<SupermarketInfo> {
    return {
      id: this.supermarketId,
      name: CONFIG.name,
      displayName: CONFIG.displayName,
      logoUrl: CONFIG.logoUrl,
      color: CONFIG.color,
      website: CONFIG.website,
      enabled: CONFIG.enabled,
      sectionCount: 0,
      productCount: 0,
      lastSync: null,
    }
  }

  async syncCategories(): Promise<SupermarketSection[]> { return [] }

  mapCategoryToInternalSection(rawCategory: string): string { return rawCategory || 'Otros' }

  async syncProducts(): Promise<SyncResult> {
    return { synced: 0, updated: 0, failed: 0, errors: ['DIA provider: not yet implemented'], totalApiRequests: 0, categoriesProcessed: 0, productsFetched: 0, durationMs: 0 }
  }

  async searchProducts(_query: string, page = 1, pageSize = 50): Promise<SearchProductsResult> {
    const cached = await this.getCachedProducts(_query, page, pageSize)
    if (cached) return cached
    return { products: [], total: 0, page, pageSize }
  }

  async getProductByExternalId(externalId: ExternalProductId): Promise<SupermarketProduct | null> {
    return this.getCachedProductByExternalId(externalId)
  }

  normalizeProduct(raw: RawProduct): Partial<SupermarketProduct> {
    return { name: raw.name }
  }
}

let _instance: DiaProvider | null = null

export function registerDia(): DiaProvider {
  if (!_instance) {
    _instance = new DiaProvider()
    supermarketRegistry.register(_instance)
  }
  return _instance
}
