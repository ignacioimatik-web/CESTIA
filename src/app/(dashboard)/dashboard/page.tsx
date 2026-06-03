import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { DashboardHero } from '@/components/dashboard/dashboard-hero'
import { ShoppingEnginePanel } from '@/components/dashboard/shopping-engine-panel'
import { HouseholdSummaryCard } from '@/components/dashboard/household-summary-card'
import { FeaturedRecipes } from '@/components/dashboard/featured-recipes'
import { ActiveShoppingListCard } from '@/components/dashboard/active-shopping-list-card'
import { SupermarketSectionsGrid } from '@/components/dashboard/supermarket-sections-grid'
import { SuggestedProductsPanel } from '@/components/dashboard/suggested-products-panel'
import { QuickEventsPanel } from '@/components/dashboard/quick-events-panel'
import { SmartTemplatesPanel } from '@/components/dashboard/smart-templates-panel'
import { CatalogStatusCard } from '@/components/dashboard/catalog-status-card'
import { getHouseholdMode, getPendingProducts, getServingsMultiplier } from '@/components/dashboard/helpers'
import type { ActiveListSummary, CatalogStatus, RecipeCardItem, SectionStat, SuggestedProduct } from '@/components/dashboard/types'

const sectionNames = [
  'Fruta y verdura',
  'Carne',
  'Pescado',
  'Charcutería',
  'Lácteos y huevos',
  'Panadería',
  'Pasta, arroz y legumbres',
  'Conservas',
  'Aceite, especias y salsas',
  'Desayuno y dulces',
  'Congelados',
  'Bebidas',
  'Limpieza',
  'Higiene y perfumería',
  'Bebé',
  'Mascotas',
  'Otros',
]

function normalizeSection(value: string | null | undefined): string {
  const raw = (value ?? 'Otros')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
  const known: Record<string, string> = {
    'fruta y verdura': 'Fruta y verdura',
    carne: 'Carne',
    pescado: 'Pescado',
    charcuteria: 'Charcutería',
    'charcuteria y quesos': 'Charcutería',
    'lacteos y huevos': 'Lácteos y huevos',
    panaderia: 'Panadería',
    'pasta, arroz y legumbres': 'Pasta, arroz y legumbres',
    conservas: 'Conservas',
    'aceite, especias y salsas': 'Aceite, especias y salsas',
    'desayuno y dulces': 'Desayuno y dulces',
    congelados: 'Congelados',
    bebidas: 'Bebidas',
    limpieza: 'Limpieza',
    'higiene y perfumeria': 'Higiene y perfumería',
    bebe: 'Bebé',
    mascotas: 'Mascotas',
    otros: 'Otros',
  }
  return known[raw] ?? 'Otros'
}

type ListItemRow = {
  shopping_list_id: string
  name: string
  section: string | null
  is_checked: boolean
  quantity: number
  matched_product: {
    id: string
    name: string
    brand: string | null
    price: number | null
    unit: string
    quantity: number | null
    image_url: string | null
    supermarket_section: string | null
  } | null
}

type RecipeIngredientRow = {
  recipe_id: string
  ingredient: { name?: string } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user

  if (!user) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-6 space-y-4">
        <Card className="warm-panel"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Necesitas iniciar sesion para usar el dashboard operativo.</p><div className="flex gap-2 mt-3"><Link href="/login"><Button>Entrar</Button></Link><Link href="/register"><Button variant="outline">Crear cuenta</Button></Link></div></CardContent></Card>
      </div>
    )
  }

  const { data: membership } = await supabase.from('household_members').select('household_id, role').eq('user_id', user.id).maybeSingle()
  const householdId = membership?.household_id ?? null

  const [householdRes, recipesRes, recipeIngRes, listsRes, marketsRes] = await Promise.all([
    householdId ? supabase.from('households').select('*').eq('id', householdId).single() : Promise.resolve({ data: null }),
    supabase.from('recipes').select('id,name,image_url,prep_time_minutes,cook_time_minutes,base_servings,tags,created_at').order('created_at', { ascending: false }).limit(8),
    supabase.from('recipe_ingredients').select('recipe_id, ingredient:ingredients(name)').limit(120),
    supabase.from('shopping_lists').select('id,name,is_completed,supermarket_id,created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('supermarkets').select('id,display_name,last_synced_at').eq('enabled', true),
  ])

  const household = householdRes.data
  const markets = marketsRes.data ?? []
  const activeMarket = markets.find((m) => m.id === household?.primary_supermarket_id) ?? null

  const lists = listsRes.data ?? []
  const listIds = lists.map((l) => l.id)
  const activeListMeta = lists.find((l) => !l.is_completed) ?? null

  const { data: listItems } = listIds.length
    ? await supabase.from('shopping_list_items').select('shopping_list_id,name,section,is_checked,quantity,matched_product:matched_product_id(id,name,brand,price,unit,quantity,image_url,supermarket_section)').in('shopping_list_id', listIds)
    : { data: [] }

  const allListItems = (listItems ?? []) as ListItemRow[]
  const activeListItems = allListItems.filter((i) => i.shopping_list_id === activeListMeta?.id)
  const checkedItems = activeListItems.filter((i) => i.is_checked).length
  const pendingItems = getPendingProducts(activeListItems.length, checkedItems)
  const estimatedCostRaw = activeListItems.reduce((sum, i) => {
    const p = i.matched_product?.price
    return p ? sum + Number(p) * Number(i.quantity || 1) : sum
  }, 0)
  const estimatedCost = estimatedCostRaw > 0 ? estimatedCostRaw : null

  const sectionSummaryMap = new Map<string, number>()
  for (const item of activeListItems) {
    const key = normalizeSection(item.section)
    sectionSummaryMap.set(key, (sectionSummaryMap.get(key) ?? 0) + 1)
  }
  const activeListSummary: ActiveListSummary | null = activeListMeta ? {
    id: activeListMeta.id,
    name: activeListMeta.name,
    supermarket: activeMarket?.display_name ?? null,
    totalItems: activeListItems.length,
    pendingItems,
    checkedItems,
    sections: Array.from(sectionSummaryMap.entries()).map(([name, count]) => ({ name, count })),
    previewItems: activeListItems.slice(0, 4).map((item) => ({
      name: item.name,
      section: item.section,
      imageUrl: item.matched_product?.image_url ?? null,
    })),
  } : null

  const recipeIngs = (recipeIngRes.data ?? []) as RecipeIngredientRow[]
  const ingredientByRecipe = new Map<string, string[]>()
  for (const ri of recipeIngs) {
    const current = ingredientByRecipe.get(ri.recipe_id) ?? []
    const name = ri.ingredient?.name
    if (name && !current.includes(name)) current.push(name)
    ingredientByRecipe.set(ri.recipe_id, current)
  }

  const featuredRecipes: RecipeCardItem[] = (recipesRes.data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    imageUrl: r.image_url,
    prepMinutes: r.prep_time_minutes,
    cookMinutes: r.cook_time_minutes,
    baseServings: r.base_servings,
    tags: r.tags ?? ['seed/demo'],
    ingredients: (ingredientByRecipe.get(r.id) ?? []).slice(0, 4),
  }))

  const sectionCatalogMap = new Map<string, number>()
  const { data: productCounts } = activeMarket
    ? await supabase.from('supermarket_products').select('supermarket_section').eq('supermarket_id', activeMarket.id)
    : { data: [] }
  for (const p of productCounts ?? []) {
    const key = normalizeSection(p.supermarket_section)
    sectionCatalogMap.set(key, (sectionCatalogMap.get(key) ?? 0) + 1)
  }

  const sections: SectionStat[] = sectionNames.map((name, idx) => ({
    key: `${idx}`,
    name,
    productCount: sectionCatalogMap.get(name) ?? 0,
    pendingCount: activeListItems.filter((i) => !i.is_checked && normalizeSection(i.section) === name).length,
  }))

  const suggestedProducts: SuggestedProduct[] = activeListItems
    .filter((i) => i.matched_product)
    .slice(0, 6)
    .map((i) => {
      const p = i.matched_product!
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        format: `${p.quantity ?? ''} ${p.unit}`.trim(),
        price: p.price,
        pricePerUnit: p.price && p.quantity ? Number((p.price / p.quantity).toFixed(2)) : null,
        section: p.supermarket_section ?? null,
        ingredientName: i.name,
        imageUrl: p.image_url,
      }
    })

  const imagesCount = suggestedProducts.filter((p) => !!p.imageUrl).length
  const catalogStatus: CatalogStatus = {
    supermarketName: activeMarket?.display_name ?? null,
    state: activeMarket ? ((productCounts?.length ?? 0) > 0 ? 'conectado' : 'pendiente') : 'error',
    lastSync: activeMarket?.last_synced_at ?? null,
    productCount: productCounts?.length ?? 0,
    categoryCount: sections.filter((s) => s.productCount > 0).length,
    imagesCount,
    canSync: membership?.role === 'admin' || process.env.NODE_ENV !== 'production',
  }

  const householdSummary = household ? {
    adults: household.adults,
    children: household.young_children,
    guests: household.frequent_guests,
    mode: getHouseholdMode(household.adults, household.young_children, household.frequent_guests),
    multiplier: getServingsMultiplier(household.adults, household.young_children, household.frequent_guests),
  } : null

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-6 space-y-5">
      <DashboardHero state={{
        supermarketActive: activeMarket?.display_name ?? null,
        householdActive: household?.name ?? null,
        activeList: activeListMeta?.name ?? null,
        pendingProducts: pendingItems,
        estimatedCost,
      }} />

      <div>
        <Link href="/shopping-lists/new" className="inline-flex">
          <Button className="h-12 rounded-xl px-6 text-base">Crear lista</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ShoppingEnginePanel />
        <ActiveShoppingListCard list={activeListSummary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HouseholdSummaryCard summary={householdSummary} />
        <FeaturedRecipes recipes={featuredRecipes} />
      </div>

      <SupermarketSectionsGrid sections={sections} />

      <QuickEventsPanel />
      <SmartTemplatesPanel />

      <CatalogStatusCard status={catalogStatus} />

      <SuggestedProductsPanel products={suggestedProducts} />
    </div>
  )
}
