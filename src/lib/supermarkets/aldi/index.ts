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
  name: 'aldi',
  displayName: 'Aldi',
  logoUrl: '/images/supermarkets/aldi.svg',
  color: '#0079C2',
  website: 'https://www.aldi.es',
  enabled: false,
  externalId: 'a0000000-0000-0000-0000-000000000003',
}

export class AldiProvider extends SupermarketProvider {
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

  mapCategoryToInternalSection(rawCategory: string): string { return 'Otros' }

  async syncProducts(): Promise<SyncResult> {
    return { synced: 0, updated: 0, failed: 0, errors: ['Aldi provider: not yet implemented'], totalApiRequests: 0, categoriesProcessed: 0, productsFetched: 0, durationMs: 0 }
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

let _instance: AldiProvider | null = null

export function registerAldi(): AldiProvider {
  if (!_instance) {
    _instance = new AldiProvider()
    supermarketRegistry.register(_instance)
  }
  return _instance
}
