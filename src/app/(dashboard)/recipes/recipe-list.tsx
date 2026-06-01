'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, Plus, CookingPot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RecipeCard } from '@/components/shared/recipe-card'
import { FadeIn, StaggerList, StaggerItem, AnimatePresence } from '@/components/shared/animations'
import { getRecipes } from './actions'
import type { RecipeListItem } from './actions'
import Link from 'next/link'

const CATEGORIES = [
  '', 'Entrantes', 'Ensaladas', 'Sopas y Cremas', 'Arroces',
  'Pastas', 'Carnes', 'Pescados', 'Verduras', 'Legumbres',
  'Postres', 'Repostería', 'Salsas', 'Bebidas',
]

type Props = {
  initialRecipes: RecipeListItem[]
  initialTotal: number
}

export function RecipeList({ initialRecipes, initialTotal }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [recipes, setRecipes] = useState(initialRecipes)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fetchRecipes = useCallback(async (q: string, cat: string) => {
    setLoading(true)
    try {
      const result = await getRecipes({ search: q || undefined, category: cat || undefined })
      setRecipes(result.recipes)
      setTotal(result.total)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchRecipes(search, category), 300)
    return () => clearTimeout(debounceRef.current)
  }, [search, category, fetchRecipes])

  const clearFilters = () => {
    setSearch('')
    setCategory('')
  }

  const hasFilters = search || category

  return (
    <div>
      {/* Search bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recetas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 pr-10 rounded-2xl"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-2xl"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Link href="/recipes/new">
          <Button className="h-12 shrink-0 rounded-2xl px-4">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <FadeIn>
            <div className="warm-panel rounded-2xl p-4 mb-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Categoría</label>
                <Select value={category || null} onValueChange={(v) => setCategory(v ?? '')}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {CATEGORIES.filter(Boolean).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </FadeIn>
        )}
      </AnimatePresence>

      {/* Results count */}
      {!loading && !hasFilters && recipes.length > 0 && (
        <FadeIn delay={0.05}>
          <p className="text-xs text-muted-foreground mb-3">
            {total} receta{total !== 1 ? 's' : ''}
          </p>
        </FadeIn>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <div className="h-1.5 skeleton" />
              <div className="p-4 sm:p-5 space-y-3">
                <div className="h-4 w-3/4 skeleton rounded" />
                <div className="h-3 w-full skeleton rounded" />
                <div className="h-3 w-1/2 skeleton rounded" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 skeleton rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <StaggerList className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <StaggerItem key={r.id}>
              <RecipeCard
                id={r.id}
                name={r.name}
                description={r.description}
                baseServings={r.base_servings}
                prepTimeMinutes={r.prep_time_minutes}
                cookTimeMinutes={null}
                difficulty={r.difficulty}
                ingredientCount={r.ingredient_count}
                category={r.category}
                tags={r.tags}
              />
            </StaggerItem>
          ))}
        </StaggerList>
      ) : (
        <FadeIn>
            <Card className="warm-panel border-dashed">
            <CardContent className="py-12 text-center">
              <CookingPot className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {hasFilters ? 'Sin resultados' : 'No hay recetas todavía'}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {hasFilters ? 'Prueba con otros filtros' : 'Crea tu primera receta para empezar'}
              </p>
              {hasFilters ? (
                <Button variant="link" onClick={clearFilters} className="mt-2 text-xs">
                  Limpiar filtros
                </Button>
              ) : (
                <Link href="/recipes/new">
                  <Button size="sm" className="mt-4 rounded-lg">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Nueva receta
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  )
}
