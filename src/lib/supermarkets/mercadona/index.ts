import { SupermarketProvider } from '../provider'
import { createAdminClient } from '@/lib/supabase/admin'
import { supermarketRegistry } from '../registry'
import type {
  SupermarketProduct,
  SupermarketSection,
  SearchProductsParams,
  SearchProductsResult,
  SupermarketConfig,
} from '../types'

const MERCADONA_CONFIG: SupermarketConfig = {
  name: 'mercadona',
  displayName: 'Mercadona',
  logoUrl: '/images/mercadona-logo.svg',
  color: '#E30613',
  enabled: true,
}

const DEFAULT_SECTIONS: SupermarketSection[] = [
  { id: 'frutas-verduras', name: 'Frutas y Verduras', displayOrder: 1 },
  { id: 'carnes-pescados', name: 'Carnes y Pescados', displayOrder: 2 },
  { id: 'huevos-lacteos', name: 'Huevos y Lácteos', displayOrder: 3 },
  { id: 'panaderia', name: 'Panadería', displayOrder: 4 },
  { id: 'despensa', name: 'Despensa', displayOrder: 5 },
  { id: 'bebidas', name: 'Bebidas', displayOrder: 6 },
  { id: 'congelados', name: 'Congelados', displayOrder: 7 },
  { id: 'limpieza', name: 'Limpieza', displayOrder: 8 },
  { id: 'higiene', name: 'Higiene Personal', displayOrder: 9 },
  { id: 'bebes', name: 'Bebés', displayOrder: 10 },
  { id: 'mascotas', name: 'Mascotas', displayOrder: 11 },
  { id: 'otros', name: 'Otros', displayOrder: 12 },
]

export class MercadonaProvider extends SupermarketProvider {
  readonly config = MERCADONA_CONFIG

  async getSections(): Promise<SupermarketSection[]> {
    const admin = createAdminClient()
    const { data } = await admin
      .from('supermarket_sections')
      .select('*')
      .eq('supermarket', 'mercadona')
      .order('display_order', { ascending: true })

    if (data && data.length > 0) {
      return data.map((s) => ({
        id: s.id,
        name: s.name,
        displayOrder: s.display_order,
      }))
    }

    return DEFAULT_SECTIONS
  }

  async searchProducts(params: SearchProductsParams): Promise<SearchProductsResult> {
    const admin = createAdminClient()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 50
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = admin
      .from('supermarket_products')
      .select('*', { count: 'exact' })
      .eq('supermarket', 'mercadona')

    if (params.query) {
      query = query.ilike('name', `%${params.query}%`)
    }

    const { data, count } = await query
      .order('name', { ascending: true })
      .range(from, to)

    const products: SupermarketProduct[] =
      data?.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        unit: p.unit,
        quantity: p.quantity,
        category: p.category,
        section: p.section_id ?? '',
        sectionDisplayOrder: 0,
        imageUrl: p.image_url,
        ean: p.ean,
        isSeasonal: p.is_seasonal,
        lastUpdated: p.last_updated,
      })) ?? []

    return {
      products,
      total: count ?? 0,
      page,
      pageSize,
    }
  }

  async getProductById(id: string): Promise<SupermarketProduct | null> {
    const admin = createAdminClient()
    const { data } = await admin
      .from('supermarket_products')
      .select('*')
      .eq('id', id)
      .single()

    if (!data) return null

    return {
      id: data.id,
      name: data.name,
      brand: data.brand,
      price: data.price,
      unit: data.unit,
      quantity: data.quantity,
      category: data.category,
      section: data.section_id ?? '',
      sectionDisplayOrder: 0,
      imageUrl: data.image_url,
      ean: data.ean,
      isSeasonal: data.is_seasonal,
      lastUpdated: data.last_updated,
    }
  }

  async getProductsBySection(sectionId: string): Promise<SupermarketProduct[]> {
    const admin = createAdminClient()
    const { data } = await admin
      .from('supermarket_products')
      .select('*')
      .eq('supermarket', 'mercadona')
      .eq('section_id', sectionId)
      .order('name', { ascending: true })

    return (
      data?.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        unit: p.unit,
        quantity: p.quantity,
        category: p.category,
        section: p.section_id ?? '',
        sectionDisplayOrder: 0,
        imageUrl: p.image_url,
        ean: p.ean,
        isSeasonal: p.is_seasonal,
        lastUpdated: p.last_updated,
      })) ?? []
    )
  }

  async getProductByEan(ean: string): Promise<SupermarketProduct | null> {
    const admin = createAdminClient()
    const { data } = await admin
      .from('supermarket_products')
      .select('*')
      .eq('supermarket', 'mercadona')
      .eq('ean', ean)
      .single()

    if (!data) return null

    return {
      id: data.id,
      name: data.name,
      brand: data.brand,
      price: data.price,
      unit: data.unit,
      quantity: data.quantity,
      category: data.category,
      section: data.section_id ?? '',
      sectionDisplayOrder: 0,
      imageUrl: data.image_url,
      ean: data.ean,
      isSeasonal: data.is_seasonal,
      lastUpdated: data.last_updated,
    }
  }

  async syncCatalog(): Promise<{ synced: number; updated: number; failed: number }> {
    return { synced: 0, updated: 0, failed: 0 }
  }
}

let _instance: MercadonaProvider | null = null

export function registerMercadona(): MercadonaProvider {
  if (!_instance) {
    _instance = new MercadonaProvider()
    supermarketRegistry.register(_instance)
  }
  return _instance
}
