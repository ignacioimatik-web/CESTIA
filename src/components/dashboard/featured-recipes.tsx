import Link from 'next/link'
import type { RecipeCardItem } from './types'
import { FeaturedRecipeCard } from './featured-recipe-card'

export function FeaturedRecipes({ recipes }: { recipes: RecipeCardItem[] }) {
  return (
    <div className="space-y-3">
      {recipes.length === 0 ? (
        <div className="text-sm text-muted-foreground rounded-xl border border-dashed p-4">No hay recetas destacadas todavia. <Link className="text-primary font-medium" href="/recipes/new">Crear receta</Link></div>
      ) : recipes.map((recipe) => <FeaturedRecipeCard key={recipe.id} recipe={recipe} />)}
    </div>
  )
}
