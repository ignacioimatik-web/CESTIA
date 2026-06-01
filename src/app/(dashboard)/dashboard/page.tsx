import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  Home,
  ShoppingCart,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

function euros(value: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user

  if (!user) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-6 sm:py-8 space-y-6">
        <Card className="warm-panel">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Panel</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bienvenido</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Para ver tus listas, recetas y progreso, entra con tu cuenta.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/login"><Button className="h-11 rounded-xl">Entrar</Button></Link>
                <Link href="/register"><Button variant="outline" className="h-11 rounded-xl">Crear cuenta</Button></Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="warm-panel"><CardContent className="p-4"><p className="text-sm font-semibold">Proximas listas de compra</p><p className="text-xs text-muted-foreground mt-1">Inicia sesion para verlas.</p></CardContent></Card>
          <Card className="warm-panel"><CardContent className="p-4"><p className="text-sm font-semibold">Recetas recientes</p><p className="text-xs text-muted-foreground mt-1">Inicia sesion para verlas.</p></CardContent></Card>
          <Card className="warm-panel"><CardContent className="p-4"><p className="text-sm font-semibold">Recetas recomendadas</p><p className="text-xs text-muted-foreground mt-1">Inicia sesion para verlas.</p></CardContent></Card>
        </div>
      </div>
    )
  }

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const householdId = member?.household_id ?? null

  const [householdRes, supermarketsRes, recentRecipesRes, allRecipesRes, favoriteRecipesRes, listsRes, eventRecipeRes] = await Promise.all([
    householdId
      ? supabase.from('households').select('*').eq('id', householdId).single()
      : Promise.resolve({ data: null } as any),
    supabase.from('supermarkets').select('id, display_name').eq('enabled', true),
    supabase
      .from('recipes')
      .select('id, name, created_at, category')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('recipes')
      .select('id, name, category, is_favorite, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    householdId
      ? supabase
        .from('household_favorite_recipes')
        .select('recipe:recipes(id, name, category)')
        .eq('household_id', householdId)
      : Promise.resolve({ data: [] } as any),
    supabase
      .from('shopping_lists')
      .select('id, name, is_completed, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    householdId
      ? supabase
        .from('meal_event_recipes')
        .select('recipe_id, recipe:recipes(id, name, category), meal_event:meal_events!inner(household_id)')
        .eq('meal_event.household_id', householdId)
      : Promise.resolve({ data: [] } as any),
  ])

  const household = householdRes.data
  const supermarkets = supermarketsRes.data ?? []
  const supermarketName = supermarkets.find((s) => s.id === household?.primary_supermarket_id)?.display_name ?? null

  const lists = listsRes.data ?? []
  const listIds = lists.map((l) => l.id)
  const activeLists = lists.filter((l) => !l.is_completed)

  let itemRows: { shopping_list_id: string; is_checked: boolean; quantity: number; matched_product: { price: number | null } | null }[] = []
  if (listIds.length > 0) {
    const { data } = await supabase
      .from('shopping_list_items')
      .select('shopping_list_id, is_checked, quantity, matched_product:matched_product_id(price)')
      .in('shopping_list_id', listIds)
    itemRows = (data ?? []) as any
  }

  const pendingProducts = itemRows.filter((i) => !i.is_checked).length
  const estimatedSpend = itemRows.reduce((sum, row) => {
    const price = row.matched_product?.price
    if (price === null || price === undefined) return sum
    return sum + Number(price) * Number(row.quantity || 1)
  }, 0)
  const hasPriceData = itemRows.some((i) => i.matched_product?.price !== null && i.matched_product?.price !== undefined)

  const recentRecipes = recentRecipesRes.data ?? []
  const directFavorites = (allRecipesRes.data ?? []).filter((r) => r.is_favorite)
  const householdFavorites = (favoriteRecipesRes.data ?? [])
    .map((f: any) => f.recipe)
    .filter(Boolean)
  const favoriteMap = new Map<string, { id: string; name: string; category: string | null }>()
  for (const recipe of [...householdFavorites, ...directFavorites]) {
    favoriteMap.set(recipe.id, recipe)
  }
  const favoriteRecipes = Array.from(favoriteMap.values()).slice(0, 4)

  const usageCount = new Map<string, { id: string; name: string; category: string | null; count: number }>()
  for (const row of (eventRecipeRes.data ?? []) as any[]) {
    const recipe = row.recipe
    if (!recipe) continue
    const prev = usageCount.get(recipe.id)
    usageCount.set(recipe.id, {
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      count: (prev?.count ?? 0) + 1,
    })
  }
  const recommendedRecipes = Array.from(usageCount.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-6 sm:py-8 space-y-6">
      <Card className="warm-panel">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-primary mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Panel</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Organiza tu semana</h1>
              <p className="text-sm text-muted-foreground mt-1">Tu hogar, tus recetas y tu compra en un solo sitio.</p>
            </div>
            <Link href="/shopping-lists/new">
              <Button className="h-12 rounded-xl px-5 text-base">Crear lista</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="warm-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Home className="h-4 w-4" />Resumen del hogar</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="warm-surface rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Hogar actual</p>
            <p className="text-sm font-semibold mt-1 truncate">{household?.name ?? 'Sin hogar configurado'}</p>
          </div>
          <div className="warm-surface rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Supermercado principal</p>
            <p className="text-sm font-semibold mt-1 truncate">{supermarketName ?? 'Sin definir'}</p>
          </div>
          <div className="warm-surface rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Productos pendientes</p>
            <p className="text-lg font-bold mt-1">{pendingProducts}</p>
          </div>
          <div className="warm-surface rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Gasto estimado</p>
            <p className="text-lg font-bold mt-1">{hasPriceData ? euros(estimatedSpend) : 'Sin precios'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/shopping-lists/new">
          <Card className="warm-panel card-hover"><CardContent className="p-4 flex items-center justify-between"><span className="font-semibold">Crear lista</span><ShoppingCart className="h-4 w-4" /></CardContent></Card>
        </Link>
        <Link href="/shopping-lists/new">
          <Card className="warm-panel card-hover"><CardContent className="p-4 flex items-center justify-between"><span className="font-semibold">Planificar menu</span><ClipboardList className="h-4 w-4" /></CardContent></Card>
        </Link>
        <Link href="/events/new">
          <Card className="warm-panel card-hover"><CardContent className="p-4 flex items-center justify-between"><span className="font-semibold">Evento</span><Calendar className="h-4 w-4" /></CardContent></Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="warm-panel">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Proximas listas de compra</CardTitle>
            <Link href="/shopping-lists" className="text-xs text-primary font-medium">Ver todas</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeLists.length === 0 ? (
              <div className="text-sm text-muted-foreground rounded-xl border border-dashed p-4">
                No hay listas activas. <Link href="/shopping-lists/new" className="text-primary font-medium">Crear una ahora</Link>
              </div>
            ) : activeLists.slice(0, 4).map((list) => (
              <Link key={list.id} href={`/shopping-lists/${list.id}`} className="block warm-surface rounded-xl p-3">
                <p className="font-medium text-sm truncate">{list.name}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="warm-panel">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recetas recientes</CardTitle>
            <Link href="/recipes" className="text-xs text-primary font-medium">Ver todas</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentRecipes.length === 0 ? (
              <div className="text-sm text-muted-foreground rounded-xl border border-dashed p-4">
                Aun no hay recetas. <Link href="/recipes/new" className="text-primary font-medium">Crear primera receta</Link>
              </div>
            ) : recentRecipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block warm-surface rounded-xl p-3">
                <p className="font-medium text-sm truncate">{recipe.name}</p>
                {recipe.category && <p className="text-xs text-muted-foreground mt-0.5">{recipe.category}</p>}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="warm-panel">
          <CardHeader className="pb-2"><CardTitle className="text-base">Recetas recomendadas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recommendedRecipes.length === 0 ? (
              <div className="text-sm text-muted-foreground rounded-xl border border-dashed p-4">
                Todavia no hay historial de eventos para recomendar.
              </div>
            ) : recommendedRecipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block warm-surface rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm truncate">{recipe.name}</p>
                  <Badge variant="secondary" className="text-[10px]">{recipe.count} usos</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="warm-panel">
          <CardHeader className="pb-2"><CardTitle className="text-base">Recetas favoritas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {favoriteRecipes.length === 0 ? (
              <div className="text-sm text-muted-foreground rounded-xl border border-dashed p-4">
                No tienes favoritas aun. Marca tus favoritas desde recetas.
              </div>
            ) : favoriteRecipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block warm-surface rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm truncate">{recipe.name}</p>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                {recipe.category && <p className="text-xs text-muted-foreground mt-0.5">{recipe.category}</p>}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
