/**
 * Mercadona Catalog Sync Script
 *
 * Usage:
 *   npx tsx src/scripts/sync-mercadona.ts                    # full sync
 *   npx tsx src/scripts/sync-mercadona.ts --dry-run           # preview only
 *   npx tsx src/scripts/sync-mercadona.ts --verbose           # detailed logs
 *   npx tsx src/scripts/sync-mercadona.ts --categories-only   # sync only categories
 *   npx tsx src/scripts/sync-mercadona.ts --interval 5000     # custom rate limit (ms)
 *
 * Security:
 *   - Requires MERCADONA_SYNC_ENABLED=true in .env.local
 *   - Requires SUPABASE_SERVICE_ROLE_KEY (admin client)
 *   - Designed to be run manually or via cron, not exposed to users
 *   - Respects Mercadona's servers: rate-limited, no scraping bursts
 */

import { createAdminClient } from '@/lib/supabase/admin'
import {
  fetchCategories,
  fetchProductsByCategory,
  configureRateLimit,
  getRequestCount,
} from '@/lib/supermarkets/mercadona/api'
import { MercadonaProvider } from '@/lib/supermarkets/mercadona'
import { syncLogger } from '@/lib/supermarkets/mercadona/logger'
import type { RawProduct } from '@/lib/supermarkets/types'

const MERCADONA_ID = 'a0000000-0000-0000-0000-000000000001'

interface SyncOptions {
  dryRun: boolean
  categoriesOnly: boolean
  verbose: boolean
  interval: number
}

function parseArgs(): SyncOptions {
  const args = process.argv.slice(2)
  return {
    dryRun: args.includes('--dry-run'),
    categoriesOnly: args.includes('--categories-only'),
    verbose: args.includes('--verbose'),
    interval: (() => {
      const idx = args.indexOf('--interval')
      return idx >= 0 ? parseInt(args[idx + 1], 10) : 2_000
    })(),
  }
}

async function main(): Promise<void> {
  const options = parseArgs()
  const startTime = Date.now()

  // -- Feature flag check -----------------------------------------------------
  if (process.env.MERCADONA_SYNC_ENABLED !== 'true') {
    syncLogger.error('sync', 'Mercadona sync is disabled. Set MERCADONA_SYNC_ENABLED=true in .env.local to enable.')
    process.exit(1)
  }

  // -- Configure rate limit ---------------------------------------------------
  configureRateLimit(options.interval)

  // -- Admin DB client --------------------------------------------------------
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    syncLogger.error('sync', 'SUPABASE_SERVICE_ROLE_KEY is required')
    process.exit(1)
  }
  const admin = createAdminClient()

  // -- Check Mercadona exists in DB -------------------------------------------
  const { data: supermarket } = await admin
    .from('supermarkets')
    .select('id, name, last_synced_at')
    .eq('id', MERCADONA_ID)
    .single()

  if (!supermarket) {
    syncLogger.error('sync', 'Mercadona not found in database. Run migrations first.')
    process.exit(1)
  }

  syncLogger.info('sync', 'Starting Mercadona catalog sync', {
    dryRun: options.dryRun,
    categoriesOnly: options.categoriesOnly,
    interval: options.interval,
    lastSync: supermarket.last_synced_at,
  })

  const provider = new MercadonaProvider()

  // -- Step 1: Sync Categories -----------------------------------------------
  syncLogger.info('sync', 'Fetching categories from Mercadona API...')
  const apiCategories = await fetchCategories()
  syncLogger.info('sync', `Fetched ${apiCategories.length} categories from API`)

  if (apiCategories.length === 0) {
    syncLogger.warn('sync', 'No categories returned. API may have changed. Aborting sync.')
    process.exit(1)
  }

  if (!options.dryRun) {
    for (const cat of apiCategories) {
      await admin.from('product_categories').upsert({
        supermarket_id: MERCADONA_ID,
        name: cat.name,
        display_order: cat.order,
      } as never, { onConflict: 'supermarket_id,name' })
    }
    syncLogger.info('sync', `Upserted ${apiCategories.length} categories in database`)
  } else {
    const catNames = apiCategories.map((c) => `  - ${c.name} (id=${c.id})`).join('\n')
    syncLogger.info('sync', `[DRY-RUN] Would upsert ${apiCategories.length} categories:\n${catNames}`)
  }

  if (options.categoriesOnly) {
    const elapsed = Date.now() - startTime
    syncLogger.info('sync', `Categories sync complete in ${elapsed}ms (dryRun=${options.dryRun})`)
    return
  }

  // -- Step 2: Fetch categories from DB (to get DB IDs) -----------------------
  const { data: dbCategories } = await admin
    .from('product_categories')
    .select('id, name')
    .eq('supermarket_id', MERCADONA_ID)
    .order('display_order', { ascending: true })

  if (!dbCategories || dbCategories.length === 0) {
    syncLogger.error('sync', 'No categories in database after upsert')
    process.exit(1)
  }

  // -- Step 3: Fetch products per category ------------------------------------
  const allRawProducts: RawProduct[] = []
  let totalFetched = 0
  for (const cat of dbCategories) {
    syncLogger.info('sync', `Fetching products for category "${cat.name}"...`)
    const products = await fetchProductsByCategory(cat.id)

    if (products.length === 0) {
      syncLogger.warn('sync', `No products for category "${cat.name}" (using API id: ${cat.id})`)
      // Try fetching with the external API category ID
      const externalCat = apiCategories.find((ac) => ac.name === cat.name)
      if (externalCat) {
        syncLogger.info('sync', `Retrying with external category ID: ${externalCat.id}`)
        const retryProducts = await fetchProductsByCategory(externalCat.id)
        for (const p of retryProducts) {
          allRawProducts.push(rawFromApiProduct(p, cat.name))
        }
        totalFetched += retryProducts.length
        if (retryProducts.length > 0) {
          syncLogger.info('sync', `  Fetched ${retryProducts.length} products for "${cat.name}" (via external ID)`)
        }
      }
      continue
    }

    for (const p of products) {
      allRawProducts.push(rawFromApiProduct(p, cat.name))
    }
    totalFetched += products.length
    syncLogger.info('sync', `  Fetched ${products.length} products for "${cat.name}"`)
  }

  syncLogger.info('sync', `Total products fetched: ${totalFetched}`)

  // -- Step 4: Save products to database --------------------------------------
  if (allRawProducts.length === 0) {
    syncLogger.warn('sync', 'No products to sync')
    const elapsed = Date.now() - startTime
    syncLogger.info('sync', `Sync complete in ${elapsed}ms (0 products)`, {
      totalApiRequests: getRequestCount(),
      categoriesProcessed: dbCategories.length,
      productsFetched: totalFetched,
      durationMs: elapsed,
    })
    return
  }

  if (options.dryRun) {
    const firstFew = allRawProducts.slice(0, 5).map((p) => `  - ${p.name} (${p.externalId}) [${p.categories.join(', ')}]`).join('\n')
    syncLogger.info('sync', `[DRY-RUN] Would save ${allRawProducts.length} products. First ${Math.min(5, allRawProducts.length)}:\n${firstFew}`)

    const samplesBySection = new Map<string, number>()
    for (const p of allRawProducts) {
      const section = provider.mapCategoryToInternalSection(p.categories[0] ?? '')
      samplesBySection.set(section, (samplesBySection.get(section) ?? 0) + 1)
    }
    const sectionSummary = Array.from(samplesBySection.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([s, c]) => `  - ${s}: ${c} products`)
      .join('\n')
    syncLogger.info('sync', `[DRY-RUN] Section distribution:\n${sectionSummary}`)

    const elapsed = Date.now() - startTime
    syncLogger.info('sync', `[DRY-RUN] Sync preview complete in ${elapsed}ms`, {
      totalApiRequests: getRequestCount(),
      categoriesProcessed: dbCategories.length,
      productsFetched: totalFetched,
      durationMs: elapsed,
      wouldSave: allRawProducts.length,
    })
    return
  }

  syncLogger.info('sync', `Saving ${allRawProducts.length} products to database...`)
  const result = await provider.saveProducts(allRawProducts, false)
  result.totalApiRequests = getRequestCount()
  result.categoriesProcessed = dbCategories.length
  result.productsFetched = totalFetched
  result.durationMs = Date.now() - startTime

  // -- Final report -----------------------------------------------------------
  const level = result.failed > 0 ? 'warn' : 'info'
  syncLogger[level]('sync', 'Sync complete', {
    synced: result.synced,
    updated: result.updated,
    failed: result.failed,
    errors: result.errors.length,
    totalApiRequests: result.totalApiRequests,
    categoriesProcessed: result.categoriesProcessed,
    productsFetched: result.productsFetched,
    durationMs: result.durationMs,
    errorsDetail: result.failed > 0 ? result.errors.slice(0, 10) : undefined,
  })

  if (result.failed > 0) {
    process.exit(2)
  }
}

/**
 * Convert a Mercadona API product into our internal RawProduct format.
 */
function rawFromApiProduct(apiProduct: Record<string, unknown>, categoryName: string): RawProduct {
  const p = apiProduct as {
    id: string
    display_name: string
    price_instructions?: { unit_price?: number; unit_size?: string; bulk_price?: number | null }
    brand?: string
    categories?: Array<{ id: string; name: string }>
    packaging?: { packaging_type?: string; net_weight?: string }
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

main().catch((err) => {
  syncLogger.error('sync', 'Unhandled error', { error: err instanceof Error ? err.message : String(err) })
  process.exit(1)
})
