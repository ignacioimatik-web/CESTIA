/**
 * Safe HTTP client for Mercadona's public API.
 *
 * Only reads public catalog data. No authentication, no login, no purchases.
 * Results are cached in Supabase — this client is only used for explicit sync.
 *
 * Design:
 * - Rate-limited (configurable interval, default 2s between requests)
 * - Tracks request count per sync session
 * - Respects Retry-After on 429
 * - 10s timeout per request
 * - Graceful on errors: returns null, never throws
 * - Structured logging via syncLogger
 */

import type { MercadonaApiProduct, MercadonaApiCategory, MercadonaApiResponse } from './types'
import { syncLogger } from './logger'

const BASE_URL = 'https://tienda.mercadona.es/api'
const USER_AGENT = 'CestInteligente/1.0 (catalog sync; experimental)'
const DEFAULT_INTERVAL_MS = 2_000

let lastRequestTime = 0
let requestCount = 0
let currentInterval = DEFAULT_INTERVAL_MS

export function configureRateLimit(intervalMs: number): void {
  currentInterval = intervalMs
}

export function getRequestCount(): number {
  return requestCount
}

export function resetRequestCount(): void {
  requestCount = 0
}

async function rateLimitedFetch<T>(path: string): Promise<T | null> {
  const now = Date.now()
  const elapsed = now - lastRequestTime

  if (elapsed < currentInterval) {
    const wait = currentInterval - elapsed
    syncLogger.debug('api', `Rate limit: waiting ${wait}ms before ${path}`)
    await new Promise((r) => setTimeout(r, wait))
  }

  lastRequestTime = Date.now()
  requestCount++

  const url = `${BASE_URL}${path}`
  syncLogger.debug('api', `Fetching ${url}`)

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('retry-after') ?? '30', 10)
        syncLogger.warn('api', `Rate limited (429), retrying after ${retryAfter}s`, { path, retryAfter })
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        return rateLimitedFetch(path)
      }

      syncLogger.warn('api', `HTTP ${res.status} on ${path}`, { status: res.status, statusText: res.statusText })
      return null
    }

    return (await res.json()) as T
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      syncLogger.warn('api', `Timeout on ${path}`)
    } else {
      syncLogger.warn('api', `Fetch error on ${path}`, { error: err instanceof Error ? err.message : String(err) })
    }
    return null
  }
}

export async function fetchCategories(): Promise<MercadonaApiCategory[]> {
  const data = await rateLimitedFetch<MercadonaApiResponse<MercadonaApiCategory[]>>('/categories/')
  return data?.results ?? []
}

export async function fetchProductsByCategory(categoryId: string): Promise<MercadonaApiProduct[]> {
  const data = await rateLimitedFetch<MercadonaApiResponse<MercadonaApiProduct[]>>(
    `/categories/${categoryId}/products/`
  )
  return data?.results ?? []
}

export async function fetchProductById(productId: string): Promise<MercadonaApiProduct | null> {
  return rateLimitedFetch<MercadonaApiProduct>(`/products/${productId}/`)
}
