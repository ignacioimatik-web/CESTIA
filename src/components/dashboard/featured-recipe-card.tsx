import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SquareMedia } from './square-media'
import type { RecipeCardItem } from './types'

export function FeaturedRecipeCard({ recipe }: { recipe: RecipeCardItem }) {
  return (
    <Card className="warm-panel">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{recipe.name}</p>
            <p className="text-xs text-muted-foreground">{(recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0)} min · {recipe.baseServings} raciones</p>
          </div>
          <SquareMedia src={recipe.imageUrl} alt={recipe.name} fallback={<span>Receta</span>} />
        </div>
        <p className="text-xs text-muted-foreground truncate">{recipe.ingredients.join(', ')}</p>
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map((t) => <span key={t} className="text-[10px] px-2 py-0.5 bg-muted rounded-full">{t}</span>)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/shopping-lists/new"><Button className="h-10 w-full">Anadir a compra</Button></Link>
          <Link href={`/recipes/${recipe.id}`}><Button variant="outline" className="h-10 w-full">Ver receta</Button></Link>
        </div>
      </CardContent>
    </Card>
  )
}
