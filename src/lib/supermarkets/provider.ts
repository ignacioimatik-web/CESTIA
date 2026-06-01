import { createAdminClient } from '@/lib/supabase/admin'
import type {
  SupermarketConfig,
  SupermarketInfo,
  SupermarketSection,
  SupermarketProduct,
  RawProduct,
  SearchProductsResult,
  SyncResult,
  ExternalProductId,
} from './types'

export abstract class SupermarketProvider {
  abstract readonly config: SupermarketConfig
  protected readonly supermarketId: string

  constructor(supermarketId: string) {
    this.supermarketId = supermarketId
  }

  // -- Info -------------------------------------------------------------------

  abstract getSupermarketInfo(): Promise<SupermarketInfo>

  // -- Sections ---------------------------------------------------------------

  abstract syncCategories(): Promise<SupermarketSection[]>

  abstract mapCategoryToInternalSection(rawCategory: string): string

  // -- Products ---------------------------------------------------------------

  abstract syncProducts(): Promise<SyncResult>

  abstract searchProducts(query: string, page?: number, pageSize?: number): Promise<SearchProductsResult>

  abstract getProductByExternalId(externalId: ExternalProductId): Promise<SupermarketProduct | null>

  abstract normalizeProduct(raw: RawProduct): Partial<SupermarketProduct>

  // -- Cache helpers (provided by base class) ---------------------------------

  protected async getCachedSections(): Promise<SupermarketSection[]> {
    const admin = createAdminClient()
    const { data } = await admin
      .from('supermarket_sections')
      .select('canonical_section, supermarket_section_name, display_order')
      .eq('supermarket_id', this.supermarketId)
      .order('display_order', { ascending: true })

    if (!data || data.length === 0) return []

    return data.map((s) => ({
      id: s.canonical_section,
      name: s.supermarket_section_name,
      displayOrder: s.display_order,
    }))
  }

  protected async getCachedProducts(query: string, page: number, pageSize: number): Promise<SearchProductsResult | null> {
    const admin = createAdminClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let dbQuery = admin
      .from('supermarket_products')
      .select('*', { count: 'exact' })
      .eq('supermarket_id', this.supermarketId)

    if (query) {
      dbQuery = dbQuery.ilike('name', `%${query}%`)
    }

    const { data, count } = await dbQuery
      .order('name', { ascending: true })
      .range(from, to)

    if (!data || data.length === 0) return null

    return {
      products: data.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        unit: p.unit ?? '',
        quantity: p.quantity,
        category: p.supermarket_section ?? null,
        section: p.supermarket_section ?? '',
        sectionDisplayOrder: 0,
        imageUrl: p.image_url,
        ean: p.ean,
        externalId: p.id,
        isSeasonal: p.is_seasonal,
        lastUpdated: p.last_updated,
        rawData: p.raw_data ?? null,
      })),
      total: count ?? 0,
      page,
      pageSize,
    }
  }

  protected async getCachedProductByExternalId(externalId: string): Promise<SupermarketProduct | null> {
    const admin = createAdminClient()
    const { data } = await admin
      .from('supermarket_products')
      .select('*')
      .eq('supermarket_id', this.supermarketId)
      .or(`id.eq.${externalId},ean.eq.${externalId}`)
      .maybeSingle()

    if (!data) return null

    return {
      id: data.id,
      name: data.name,
      brand: data.brand,
      price: data.price,
      unit: data.unit ?? '',
      quantity: data.quantity,
      category: data.supermarket_section ?? null,
      section: data.supermarket_section ?? '',
      sectionDisplayOrder: 0,
      imageUrl: data.image_url,
      ean: data.ean,
      externalId: data.id,
      isSeasonal: data.is_seasonal,
      lastUpdated: data.last_updated,
      rawData: data.raw_data ?? null,
    }
  }

  protected async saveProducts(products: RawProduct[], isDryRun = false): Promise<SyncResult> {
    const admin = createAdminClient()
    const result: SyncResult = { synced: 0, updated: 0, failed: 0, errors: [], totalApiRequests: 0, categoriesProcessed: 0, productsFetched: products.length, durationMs: 0 }

    if (isDryRun) {
      return result
    }

    for (const raw of products) {
      try {
        const normalized = this.normalizeProduct(raw)

        const { error } = await admin
          .from('supermarket_products')
          .upsert({
            supermarket_id: this.supermarketId,
            name: normalized.name ?? raw.name,
            brand: normalized.brand ?? raw.brand,
            price: normalized.price ?? raw.price,
            unit: normalized.unit ?? raw.unit ?? 'ud',
            quantity: normalized.quantity ?? raw.quantity,
            supermarket_section: normalized.section || null,
            image_url: normalized.imageUrl ?? raw.imageUrl,
            ean: normalized.ean ?? raw.ean,
            is_seasonal: normalized.isSeasonal ?? raw.isSeasonal,
            raw_data: raw.rawData ?? null,
          } as never, { onConflict: 'id' })

        if (error) {
          result.failed++
          result.errors.push(`Failed to save product "${raw.name}": ${error.message}`)
        } else {
          result.synced++
        }
      } catch (err) {
        result.failed++
        result.errors.push(`Error saving product "${raw.name}": ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    if (result.synced > 0 || result.updated > 0) {
      await admin.from('supermarkets').update({ last_synced_at: new Date().toISOString() } as never).eq('id', this.supermarketId)
    }

    return result
  }
}
