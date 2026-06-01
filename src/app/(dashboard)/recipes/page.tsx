'use client'

import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { RecipeCard } from '@/components/shared/recipe-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CookingPot, Plus, Search } from 'lucide-react'
import Link from 'next/link'

// Example data for visual demonstration
const exampleRecipes = [
  {
    id: '1',
    name: 'Tortilla de Patatas',
    description: 'La clásica tortilla española con cebolla caramelizada',
    baseServings: 4,
    prepTimeMinutes: 35,
    ingredientCount: 5,
    tags: ['española', 'clásica'],
  },
  {
    id: '2',
    name: 'Ensalada César',
    description: 'Ensalada fresca con pollo, croutons y parmesano',
    baseServings: 2,
    prepTimeMinutes: 15,
    ingredientCount: 5,
    tags: ['ensalada', 'rápida', 'fresca'],
  },
]

export default function RecipesPage() {
  const hasRecipes = exampleRecipes.length > 0

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <PageHeader
        title="Recetas"
        description="Tus recetas favoritas, siempre a mano"
        action={
          <Link href="/recipes/new">
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              Nueva receta
            </Button>
          </Link>
        }
      />

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar recetas..."
          className="pl-10 h-11"
        />
      </div>

      {hasRecipes ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exampleRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CookingPot}
          title="No hay recetas"
          description="Crea tu primera receta para empezar a generar listas de compra inteligentes."
          action={
            <Link href="/recipes/new">
              <Button>
                <Plus className="h-4 w-4 mr-1.5" />
                Crear receta
              </Button>
            </Link>
          }
        />
      )}
    </div>
  )
}
