'use client'

import { useState, useMemo } from 'react'
import { Search, Check, Minus, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RecipeForList } from '@/lib/utils/shopping-list-generator'

type SelectedRecipe = {
  recipe: RecipeForList
  servings: number
}

export function RecipeSelector({
  recipes,
  onComplete,
}: {
  recipes: RecipeForList[]
  onComplete: (selected: SelectedRecipe[]) => void
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Map<string, SelectedRecipe>>(new Map())

  const filtered = useMemo(
    () => recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [recipes, search]
  )

  const isAllSelected = recipes.every((r) => selected.has(r.id))
  const totalItems = selected.size

  function toggleRecipe(recipe: RecipeForList) {
    const next = new Map(selected)
    if (next.has(recipe.id)) {
      next.delete(recipe.id)
    } else {
      next.set(recipe.id, { recipe, servings: recipe.baseServings })
    }
    setSelected(next)
  }

  function toggleAll() {
    if (isAllSelected) {
      setSelected(new Map())
    } else {
      const next = new Map<string, SelectedRecipe>()
      for (const r of recipes) {
        next.set(r.id, { recipe: r, servings: r.baseServings })
      }
      setSelected(next)
    }
  }

  function updateServings(id: string, delta: number) {
    const next = new Map(selected)
    const current = next.get(id)
    if (!current) return
    const servings = Math.max(1, current.servings + delta)
    next.set(id, { ...current, servings })
    setSelected(next)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar recetas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          {totalItems} receta{totalItems !== 1 ? 's' : ''} seleccionada{totalItems !== 1 ? 's' : ''}
        </span>
        <Button variant="ghost" size="sm" onClick={toggleAll}>
          {isAllSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {filtered.map((recipe) => {
          const sel = selected.get(recipe.id)
          return (
            <Card
              key={recipe.id}
              className={cn(
                'cursor-pointer transition-all',
                sel && 'ring-2 ring-primary'
              )}
              onClick={() => toggleRecipe(recipe)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">{recipe.name}</CardTitle>
                  <div
                    className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5',
                      sel ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'
                    )}
                  >
                    {sel && <Check className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xs text-muted-foreground mb-2">
                  {recipe.ingredients.length} ingrediente{recipe.ingredients.length !== 1 ? 's' : ''}
                </div>
                {sel && (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateServings(recipe.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Badge variant="secondary" className="text-xs tabular-nums">
                      {sel.servings} pers.
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateServings(recipe.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No se encontraron recetas
          </p>
        )}
      </div>

      <div className="pt-4 border-t mt-4">
        <Button
          className="w-full"
          disabled={selected.size === 0}
          onClick={() => onComplete(Array.from(selected.values()))}
        >
          Generar lista ({totalItems} receta{totalItems !== 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  )
}
