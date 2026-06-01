import { SupermarketProvider } from '../provider'
import { supermarketRegistry } from '../registry'
import * as api from './api'
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
import type { MercadonaApiProduct } from './types'
import { createAdminClient } from '@/lib/supabase/admin'

const CONFIG: SupermarketConfig = {
  name: 'mercadona',
  displayName: 'Mercadona',
  logoUrl: '/images/supermarkets/mercadona.svg',
  color: '#E30613',
  website: 'https://www.mercadona.es',
  enabled: true,
  externalId: 'a0000000-0000-0000-0000-000000000001',
}

const CATEGORY_TO_SECTION: Record<string, string> = {
  'Frutas y Verduras': 'Fruta y verdura',
  Carnicería: 'Carne',
  Pescadería: 'Pescado',
  Charcutería: 'Charcutería',
  Lácteos: 'Lácteos',
  Huevos: 'Huevos',
  Panadería: 'Panadería',
  Despensa: 'Despensa',
  'Pasta, arroz y legumbres': 'Pasta, arroz y legumbres',
  Conservas: 'Conservas',
  Congelados: 'Congelados',
  Bebidas: 'Bebidas',
  'Desayuno y dulces': 'Desayuno y dulces',
  Limpieza: 'Limpieza',
  'Higiene Personal': 'Higiene',
  Bebés: 'Bebé',
  Mascotas: 'Mascotas',
  Otros: 'Otros',
}

export class MercadonaProvider extends SupermarketProvider {
  readonly config = CONFIG

  constructor() {
    super(CONFIG.externalId)
  }

  async getSupermarketInfo(): Promise<SupermarketInfo> {
    const admin = createAdminClient()

    const { data: dbSuper } = await admin
      .from('supermarkets')
      .select('*')
      .eq('id', this.supermarketId)
      .single()

    const { count: sectionCount } = await admin
      .from('supermarket_sections')
      .select('*', { count: 'exact', head: true })
      .eq('supermarket_id', this.supermarketId)

    const { count: productCount } = await admin
      .from('supermarket_products')
      .select('*', { count: 'exact', head: true })
      .eq('supermarket_id', this.supermarketId)

    return {
      id: this.supermarketId,
      name: CONFIG.name,
      displayName: CONFIG.displayName,
      logoUrl: CONFIG.logoUrl,
      color: CONFIG.color,
      website: CONFIG.website,
      enabled: CONFIG.enabled,
      sectionCount: sectionCount ?? 0,
      productCount: productCount ?? 0,
      lastSync: null,
    }
  }

  async syncCategories(): Promise<SupermarketSection[]> {
    const apiCategories = await api.fetchCategories()
    if (apiCategories.length === 0) {
      // fallback to cache
      const cached = await this.getCachedSections()
      if (cached.length > 0) return cached
      return []
    }

    const admin = createAdminClient()

    for (const cat of apiCategories) {
      await admin.from('product_categories').upsert({
        supermarket_id: this.supermarketId,
        name: cat.name,
        display_order: cat.order,
      } as any, { onConflict: 'supermarket_id,name' })
    }

    const { data } = await admin
      .from('product_categories')
      .select('*')
      .eq('supermarket_id', this.supermarketId)
      .order('display_order', { ascending: true })

    return (data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      displayOrder: s.display_order,
    }))
  }

  mapCategoryToInternalSection(rawCategory: string): string {
    return CATEGORY_TO_SECTION[rawCategory] ?? 'Otros'
  }

  async syncProducts(): Promise<SyncResult> {
    const admin = createAdminClient()

    const { data: categories } = await admin
      .from('product_categories')
      .select('id, name')
      .eq('supermarket_id', this.supermarketId)

    if (!categories || categories.length === 0) {
      return { synced: 0, updated: 0, failed: 0, errors: ['No categories found. Run syncCategories first.'], totalApiRequests: 0, categoriesProcessed: 0, productsFetched: 0, durationMs: 0 }
    }

    let allProducts: RawProduct[] = []

    for (const cat of categories) {
      const apiProducts = await api.fetchProductsByCategory(cat.id)
      for (const p of apiProducts) {
        allProducts.push(this.rawFromApi(p, cat.name))
      }
    }

    return this.saveProducts(allProducts)
  }

  async searchProducts(query: string, page = 1, pageSize = 50): Promise<SearchProductsResult> {
    const cached = await this.getCachedProducts(query, page, pageSize)
    if (cached) return cached

    return { products: [], total: 0, page, pageSize }
  }

  async getProductByExternalId(externalId: ExternalProductId): Promise<SupermarketProduct | null> {
    const cached = await this.getCachedProductByExternalId(externalId)
    if (cached) return cached

    const apiProduct = await api.fetchProductById(externalId)
    if (!apiProduct) return null

    const raw = this.rawFromApi(apiProduct, '')
    const result = await this.saveProducts([raw])
    if (result.synced === 0) return null

    return this.getCachedProductByExternalId(externalId)
  }

  normalizeProduct(raw: RawProduct): Partial<SupermarketProduct> {
    const section = raw.categories.length > 0
      ? this.mapCategoryToInternalSection(raw.categories[0])
      : 'Otros'

    return {
      name: raw.name,
      brand: raw.brand,
      price: raw.price,
      unit: raw.unit ?? 'ud',
      quantity: raw.quantity,
      section,
      imageUrl: raw.imageUrl,
      ean: raw.ean,
      externalId: raw.externalId,
      isSeasonal: raw.isSeasonal,
    }
  }

  private rawFromApi(apiProduct: MercadonaApiProduct, categoryName: string): RawProduct {
    const priceInstructions = apiProduct.price_instructions
    const unitSize = priceInstructions?.unit_size ?? ''
    const parsed = parseMercadonaUnit(unitSize)

    return {
      externalId: apiProduct.id,
      name: apiProduct.display_name,
      brand: apiProduct.brand || null,
      price: priceInstructions?.unit_price ?? null,
      unit: parsed.unit,
      quantity: parsed.quantity,
      imageUrl: apiProduct.thumbnail || null,
      ean: apiProduct.ean || null,
      categories: categoryName ? [categoryName] : (apiProduct.categories?.map((c) => c.name) ?? []),
      isSeasonal: false,
      rawData: apiProduct,
    }
  }
}

function parseMercadonaUnit(unitSize: string): { unit: string; quantity: number | null } {
  // e.g. "1 L", "500 g", "6 ud", "200 ml"
  const match = unitSize.trim().match(/^([\d,]+)\s*(.+)$/)
  if (!match) return { unit: 'ud', quantity: null }

  const rawQty = parseFloat(match[1].replace(',', '.'))
  const rawUnit = match[2].toLowerCase()

  const unitMap: Record<string, string> = {
    l: 'l',
    ml: 'ml',
    g: 'g',
    kg: 'kg',
    ud: 'ud',
    unidades: 'ud',
  }

  const unit = unitMap[rawUnit] ?? rawUnit
  const quantity = isNaN(rawQty) ? null : rawQty
  return { unit, quantity }
}

let _instance: MercadonaProvider | null = null

export function registerMercadona(): MercadonaProvider {
  if (!_instance) {
    _instance = new MercadonaProvider()
    supermarketRegistry.register(_instance)
  }
  return _instance
}
