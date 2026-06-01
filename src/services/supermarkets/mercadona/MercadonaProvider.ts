import { createAdminClient } from '@/lib/supabase/admin'

type SyncCategory = {
  id: string
  name: string
  order: number
  childCategoryIds: string[]
}

type SyncProduct = {
  externalId: string
  externalCategoryId: string | null
  name: string
  brand: string | null
  price: number | null
  unitPrice: number | null
  packageSize: string | null
  unit: string | null
  quantity: number | null
  imageUrl: string | null
  rawData: unknown
}

type SyncResult = {
  categoriesSynced: number
  productsSynced: number
  mode: 'live' | 'cache' | 'pending'
  errors: string[]
}

const PROVIDER_NAME = 'mercadona'
const MERCADONA_ID = 'a0000000-0000-0000-0000-000000000001'
const DEFAULT_BASE = 'https://tienda.mercadona.es/api'

function isEnabled() {
  return process.env.MERCADONA_SYNC_ENABLED === 'true'
}

function isDryRun() {
  return process.env.MERCADONA_SYNC_DRY_RUN === 'true'
}

function maxCategories() {
  return Number(process.env.MERCADONA_SYNC_MAX_CATEGORIES ?? 25)
}

function maxProductsPerCategory() {
  return Number(process.env.MERCADONA_SYNC_MAX_PRODUCTS_PER_CATEGORY ?? 200)
}

function timeoutMs() {
  return 12000
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs())
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return await response.json() as T
  } finally {
    clearTimeout(timeout)
  }
}

export class MercadonaProvider {
  private readonly admin = createAdminClient()
  private readonly baseUrl = process.env.MERCADONA_PUBLIC_API_BASE ?? DEFAULT_BASE

  async getSupermarketInfo() {
    const [{ data: superInfo }, { count: productCount }, { count: categoryCount }] = await Promise.all([
      this.admin.from('supermarkets').select('id, display_name, last_synced_at').eq('id', MERCADONA_ID).maybeSingle(),
      this.admin.from('supermarket_products').select('*', { count: 'exact', head: true }).eq('supermarket_id', MERCADONA_ID),
      this.admin.from('product_categories').select('*', { count: 'exact', head: true }).eq('supermarket_id', MERCADONA_ID),
    ])

    return {
      id: superInfo?.id ?? MERCADONA_ID,
      name: superInfo?.display_name ?? 'Mercadona',
      lastSyncedAt: superInfo?.last_synced_at ?? null,
      productCount: productCount ?? 0,
      categoryCount: categoryCount ?? 0,
      syncEnabled: isEnabled(),
      dryRun: isDryRun(),
    }
  }

  async syncCategories(): Promise<SyncCategory[]> {
    if (!isEnabled()) {
      await this.log('warn', 'Catalog sync disabled by MERCADONA_SYNC_ENABLED')
      return []
    }

    try {
      const payload = await fetchJson<{
        results?: Array<{ id: string | number; name: string; categories?: Array<{ id: string | number }> }>
      }>(`${this.baseUrl}/categories/`)
      const categories = (payload.results ?? []).slice(0, maxCategories())
      const normalized = categories.map((c, idx) => this.normalizeCategory(c, idx))

      if (!isDryRun()) {
        for (const c of normalized) {
          await this.admin.from('product_categories').upsert({
            supermarket_id: MERCADONA_ID,
            name: c.name,
            display_order: c.order,
          } as never, { onConflict: 'supermarket_id,name' })
        }
      }

      await this.log('info', `Categories sync ok (${normalized.length})`)
      return normalized
    } catch (error) {
      await this.log('error', 'Categories sync failed; using cache', { error: String(error) })
      const { data } = await this.admin
        .from('product_categories')
        .select('id, name, display_order')
        .eq('supermarket_id', MERCADONA_ID)
        .order('display_order', { ascending: true })
      return (data ?? []).map((c) => ({ id: c.id, name: c.name, order: c.display_order }))
    }
  }

  async syncProducts(): Promise<SyncResult> {
    if (!isEnabled()) {
      await this.log('warn', 'Product sync skipped: disabled')
      return { categoriesSynced: 0, productsSynced: 0, mode: 'pending', errors: ['MERCADONA_SYNC_ENABLED=false'] }
    }

    const categories = await this.syncCategories()
    if (categories.length === 0) {
      return { categoriesSynced: 0, productsSynced: 0, mode: 'cache', errors: ['No categories available'] }
    }

    let syncedProducts = 0
    const errors: string[] = []

        for (const category of categories) {
          try {
        for (const childCategoryId of category.childCategoryIds) {
          const endpoint = `${this.baseUrl}/categories/${childCategoryId}/`
          const payload = await fetchJson<{ categories?: Array<{ products?: Array<Record<string, unknown>> }> }>(endpoint)
          const leaves = payload.categories ?? []

          for (const leaf of leaves) {
            const rawProducts = (leaf.products ?? []).slice(0, maxProductsPerCategory())

            for (const raw of rawProducts) {
              const product = this.normalizeProduct(raw, category.id)
              if (!isDryRun()) {
                await this.admin.from('supermarket_products').upsert({
                  supermarket_id: MERCADONA_ID,
                  name: product.name,
                  brand: product.brand,
                  price: product.price,
                  unit_price: product.unitPrice,
                  package_size: product.packageSize,
                  unit: product.unit,
                  quantity: product.quantity,
                  image_url: product.imageUrl,
                  external_id: product.externalId,
                  external_category_id: product.externalCategoryId,
                  raw_data: product.rawData,
                  last_synced_at: new Date().toISOString(),
                  supermarket_section: this.mapCategoryToInternalSection(category.name),
                } as never, { onConflict: 'supermarket_id,external_id' })
              }
              syncedProducts++
            }
          }
        }
      } catch (error) {
        const message = `Category sync failed (${category.name})`
        errors.push(message)
        await this.log('error', message, { error: String(error) })
      }

      await sleep(250)
    }

    if (!isDryRun()) {
      await this.admin
        .from('supermarkets')
        .update({ last_synced_at: new Date().toISOString() } as never)
        .eq('id', MERCADONA_ID)
    }

    await this.log('info', `Product sync completed (${syncedProducts})`, { dryRun: isDryRun() })
    return {
      categoriesSynced: categories.length,
      productsSynced: syncedProducts,
      mode: errors.length > 0 ? 'cache' : 'live',
      errors,
    }
  }

  normalizeCategory(
    input: { id: string | number; name: string; categories?: Array<{ id: string | number }> },
    index: number
  ): SyncCategory {
    return {
      id: String(input.id),
      name: input.name.trim(),
      order: index + 1,
      childCategoryIds: (input.categories ?? []).map((category) => String(category.id)),
    }
  }

  normalizeProduct(raw: Record<string, unknown>, externalCategoryId: string): SyncProduct {
    const display = typeof raw.display_name === 'string' ? raw.display_name : (typeof raw.name === 'string' ? raw.name : 'Producto')
    const brand = typeof raw.brand === 'string' ? raw.brand : null
    const imageUrl = typeof raw.thumbnail === 'string' ? raw.thumbnail : null
    const externalId = typeof raw.id === 'string' ? raw.id : String(raw.id ?? '')

    const priceInstructions = (raw.price_instructions ?? null) as Record<string, unknown> | null
    const price = this.toNumber(priceInstructions?.unit_price)
    const unitPrice = this.toNumber(priceInstructions?.bulk_price)
    const unitSize = this.toNumber(priceInstructions?.unit_size)
    const sizeFormat = typeof priceInstructions?.size_format === 'string' ? priceInstructions.size_format : null
    const packageSize = unitSize !== null && sizeFormat ? `${unitSize} ${sizeFormat}` : null

    const parsed = this.parsePackageSize(packageSize)

    return {
      externalId,
      externalCategoryId,
      name: display,
      brand,
      price,
      unitPrice,
      packageSize,
      unit: parsed.unit,
      quantity: unitSize ?? parsed.quantity,
      imageUrl,
      rawData: raw,
    }
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null
    if (typeof value === 'string') {
      const normalized = Number(value.replace(',', '.'))
      return Number.isFinite(normalized) ? normalized : null
    }
    return null
  }

  mapCategoryToInternalSection(categoryName: string): string {
    const name = categoryName.toLowerCase()
    if (name.includes('fruta') || name.includes('verdura')) return 'Fruta y verdura'
    if (name.includes('carn')) return 'Carne'
    if (name.includes('pesc')) return 'Pescado'
    if (name.includes('charcut')) return 'Charcutería'
    if (name.includes('huevo') || name.includes('láct')) return 'Lácteos y huevos'
    if (name.includes('pan')) return 'Panadería'
    if (name.includes('pasta') || name.includes('arroz') || name.includes('legumbre')) return 'Pasta, arroz y legumbres'
    if (name.includes('conserv')) return 'Conservas'
    if (name.includes('aceite') || name.includes('especia') || name.includes('salsa')) return 'Aceite, especias y salsas'
    if (name.includes('desayuno') || name.includes('dulce')) return 'Desayuno y dulces'
    if (name.includes('congel')) return 'Congelados'
    if (name.includes('bebida')) return 'Bebidas'
    if (name.includes('limpieza')) return 'Limpieza'
    if (name.includes('higiene') || name.includes('perfume')) return 'Higiene y perfumería'
    if (name.includes('bebé') || name.includes('bebe')) return 'Bebé'
    if (name.includes('mascota')) return 'Mascotas'
    return 'Otros'
  }

  async searchCachedProducts(query: string) {
    const { data } = await this.admin
      .from('supermarket_products')
      .select('id, external_id, name, brand, price, unit_price, package_size, image_url, supermarket_section, last_synced_at')
      .eq('supermarket_id', MERCADONA_ID)
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(30)

    return data ?? []
  }

  async getCachedProductByExternalId(id: string) {
    const { data } = await this.admin
      .from('supermarket_products')
      .select('id, external_id, name, brand, price, unit_price, package_size, image_url, supermarket_section, last_synced_at')
      .eq('supermarket_id', MERCADONA_ID)
      .eq('external_id', id)
      .maybeSingle()

    return data
  }

  private parsePackageSize(value: string | null): { unit: string | null; quantity: number | null } {
    if (!value) return { unit: null, quantity: null }
    const match = value.match(/^([\d,.]+)\s*([a-zA-Z]+)/)
    if (!match) return { unit: null, quantity: null }
    return {
      quantity: Number(match[1].replace(',', '.')),
      unit: match[2].toLowerCase(),
    }
  }

  private async log(level: 'info' | 'warn' | 'error', message: string, details?: Record<string, unknown>) {
    console[level === 'error' ? 'error' : 'log'](`[MercadonaProvider] ${message}`, details ?? {})
    await this.admin.from('supermarket_sync_logs').insert({
      supermarket_id: MERCADONA_ID,
      provider_name: PROVIDER_NAME,
      level,
      message,
      details: details ?? null,
    } as never)
  }
}
