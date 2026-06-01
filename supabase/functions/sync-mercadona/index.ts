/**
 * Mercadona Catalog Sync — Supabase Edge Function
 *
 * Triggers:
 *   - Manual: curl -X POST https://<project>.supabase.co/functions/v1/sync-mercadona \
 *       -H "Authorization: Bearer <anon-key>" \
 *       -H "x-sync-secret: <SYNC_SECRET>"
 *   - Scheduled: via cron (Supabase Cron or external)
 *
 * Security:
 *   - Requires x-sync-secret header matching SYNC_SECRET env var
 *   - Requires MERCADONA_SYNC_ENABLED=true
 *   - Not exposed to normal users
 *   - Supports dry_run: true in request body for preview
 *
 * Response: JSON with sync results
 */

import { createClient } from '@supabase/supabase-js'
import { fetchCategories, fetchProductsByCategory, configureRateLimit, getRequestCount } from '../../../src/lib/supermarkets/mercadona/api.ts'
import { MercadonaProvider } from '../../../src/lib/supermarkets/mercadona/index.ts'
import { syncLogger } from '../../../src/lib/supermarkets/mercadona/logger.ts'
import type { RawProduct } from '../../../src/lib/supermarkets/types.ts'

const MERCADONA_ID = 'a0000000-0000-0000-0000-000000000001'

interface SyncRequest {
  dry_run?: boolean
  categories_only?: boolean
  interval_ms?: number
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now()

  // -- CORS headers -----------------------------------------------------------
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-secret',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // -- Auth: validate sync secret ---------------------------------------------
  const syncSecret = req.headers.get('x-sync-secret')
  if (syncSecret !== Deno.env.get('SYNC_SECRET')) {
    syncLogger.error('edge', 'Unauthorized sync attempt')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // -- Feature flag -----------------------------------------------------------
  if (Deno.env.get('MERCADONA_SYNC_ENABLED') !== 'true') {
    syncLogger.error('edge', 'Mercadona sync is disabled')
    return new Response(JSON.stringify({ error: 'Sync disabled. Set MERCADONA_SYNC_ENABLED=true' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // -- Parse request body -----------------------------------------------------
  let body: SyncRequest = {}
  try {
    body = await req.json()
  } catch {
    // empty body is fine, use defaults
  }

  const options = {
    dryRun: body.dry_run ?? false,
    categoriesOnly: body.categories_only ?? false,
    interval: body.interval_ms ?? 2_000,
  }

  configureRateLimit(options.interval)

  // -- Supabase admin client --------------------------------------------------
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const admin = createClient(supabaseUrl, serviceRoleKey)

  // -- Check Mercadona exists -------------------------------------------------
  const { data: supermarket } = await admin
    .from('supermarkets')
    .select('id, last_synced_at')
    .eq('id', MERCADONA_ID)
    .single()

  if (!supermarket) {
    return new Response(JSON.stringify({ error: 'Mercadona not found in database' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  syncLogger.info('edge', 'Starting sync', {
    dryRun: options.dryRun,
    categoriesOnly: options.categoriesOnly,
    lastSync: supermarket.last_synced_at,
  })

  const provider = new MercadonaProvider()

  // -- Step 1: Sync Categories -----------------------------------------------
  syncLogger.info('edge', 'Fetching categories...')
  const apiCategories = await fetchCategories()

  if (apiCategories.length === 0) {
    return new Response(JSON.stringify({ error: 'No categories returned. API may have changed.' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!options.dryRun) {
    for (const cat of apiCategories) {
      await admin.from('product_categories').upsert({
        supermarket_id: MERCADONA_ID,
        name: cat.name,
        display_order: cat.order,
      } as any, { onConflict: 'supermarket_id,name' })
    }
  }

  if (options.categoriesOnly) {
    return new Response(JSON.stringify({
      status: 'ok',
      categoriesSynced: apiCategories.length,
      dryRun: options.dryRun,
      durationMs: Date.now() - startTime,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  // -- Step 2: Get DB categories ----------------------------------------------
  const { data: dbCategories } = await admin
    .from('product_categories')
    .select('id, name')
    .eq('supermarket_id', MERCADONA_ID)
    .order('display_order', { ascending: true })

  if (!dbCategories || dbCategories.length === 0) {
    return new Response(JSON.stringify({ error: 'No categories in database' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // -- Step 3: Fetch products per category ------------------------------------
  let allRawProducts: RawProduct[] = []
  let totalFetched = 0

  for (const cat of dbCategories) {
    syncLogger.info('edge', `Fetching products for "${cat.name}"...`)
    const products = await fetchProductsByCategory(cat.id)

    if (products.length === 0) {
      const externalCat = apiCategories.find((ac) => ac.name === cat.name)
      if (externalCat) {
        const retry = await fetchProductsByCategory(externalCat.id)
        for (const p of retry) {
          allRawProducts.push(rawFromApiProduct(p, cat.name))
        }
        totalFetched += retry.length
      }
      continue
    }

    for (const p of products) {
      allRawProducts.push(rawFromApiProduct(p, cat.name))
    }
    totalFetched += products.length
  }

  // -- Step 4: Dry-run report -------------------------------------------------
  if (options.dryRun) {
    const sectionCounts = new Map<string, number>()
    for (const p of allRawProducts) {
      const section = provider.mapCategoryToInternalSection(p.categories[0] ?? '')
      sectionCounts.set(section, (sectionCounts.get(section) ?? 0) + 1)
    }

    return new Response(JSON.stringify({
      status: 'dry-run',
      categoriesProcessed: dbCategories.length,
      productsFetched: totalFetched,
      wouldSave: allRawProducts.length,
      sectionDistribution: Object.fromEntries(sectionCounts),
      totalApiRequests: getRequestCount(),
      durationMs: Date.now() - startTime,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  // -- Step 5: Save products --------------------------------------------------
  syncLogger.info('edge', `Saving ${allRawProducts.length} products...`)
  const result = await provider.saveProducts(allRawProducts, false)
  result.totalApiRequests = getRequestCount()
  result.categoriesProcessed = dbCategories.length
  result.productsFetched = totalFetched
  result.durationMs = Date.now() - startTime

  return new Response(JSON.stringify({
    status: result.failed > 0 ? 'partial' : 'ok',
    ...result,
    errorsDetail: result.failed > 0 ? result.errors.slice(0, 20) : undefined,
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})

function rawFromApiProduct(apiProduct: Record<string, unknown>, categoryName: string): RawProduct {
  const p = apiProduct as {
    id: string
    display_name: string
    price_instructions?: { unit_price?: number; unit_size?: string; bulk_price?: number | null }
    brand?: string
    categories?: Array<{ id: string; name: string }>
    thumbnail?: string
    ean?: string | null
  }

  const unitSize = p.price_instructions?.unit_size ?? ''
  const parsed = parseUnit(unitSize)

  return {
    externalId: p.id,
    name: p.display_name ?? 'Unknown',
    brand: p.brand || null,
    price: p.price_instructions?.unit_price ?? null,
    unit: parsed.unit,
    quantity: parsed.quantity,
    imageUrl: p.thumbnail || null,
    ean: p.ean || null,
    categories: categoryName ? [categoryName] : (p.categories?.map((c) => c.name) ?? []),
    isSeasonal: false,
    rawData: p,
  }
}

function parseUnit(unitSize: string): { unit: string; quantity: number | null } {
  const match = unitSize.trim().match(/^([\d,]+)\s*(.+)$/)
  if (!match) return { unit: 'ud', quantity: null }

  const rawQty = parseFloat(match[1].replace(',', '.'))
  const rawUnit = match[2].toLowerCase()

  const unitMap: Record<string, string> = {
    l: 'l', ml: 'ml', g: 'g', kg: 'kg',
    ud: 'ud', unidades: 'ud',
  }

  return {
    unit: unitMap[rawUnit] ?? rawUnit,
    quantity: isNaN(rawQty) ? null : rawQty,
  }
}
