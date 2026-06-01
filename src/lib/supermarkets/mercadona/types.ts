export interface MercadonaApiProduct {
  id: string
  display_name: string
  price_instructions: {
    unit_price: number
    unit_size: string
    bulk_price: number | null
  }
  brand: string
  categories: Array<{
    id: string
    name: string
  }>
  packaging: {
    packaging_type: string
    net_weight: string
  }
  share_uri: string
  thumbnail: string
  ean: string | null
}

export interface MercadonaApiCategory {
  id: string
  name: string
  parent_id: string | null
  order: number
}

export interface MercadonaApiResponse<T> {
  results: T
  total: number
}
