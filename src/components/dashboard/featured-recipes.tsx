import Link from 'next/link'
import type { RecipeCardItem } from './types'
import { FeaturedRecipeCard } from './featured-recipe-card'

export function FeaturedRecipes({ recipes }: { recipes: RecipeCardItem[] }) {
  if (recipes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground rounded-xl border border-dashed p-6 text-center">
        No hay recetas destacadas todavia.{' '}
        <Link className="text-primary font-medium hover:underline" href="/recipes/new">Crear tu primera receta</Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {recipes.map((recipe) => <FeaturedRecipeCard key={recipe.id} recipe={recipe} />)}
    </div>
  )
}
