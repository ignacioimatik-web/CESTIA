import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { RecipeCardItem } from './types'

export function FeaturedRecipes({ recipes }: { recipes: RecipeCardItem[] }) {
  return (
    <div className="space-y-3">
      {recipes.length === 0 ? (
        <div className="text-sm text-muted-foreground rounded-xl border border-dashed p-4">No hay recetas destacadas todavia. <Link className="text-primary font-medium" href="/recipes/new">Crear receta</Link></div>
      ) : recipes.map((recipe) => (
        <Card key={recipe.id} className="warm-panel">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">{recipe.name}</p>
                <p className="text-xs text-muted-foreground">{(recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0)} min · {recipe.baseServings} raciones</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden">
                {recipe.imageUrl ? <Image src={recipe.imageUrl} alt={recipe.name} width={48} height={48} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">Receta</div>}
              </div>
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
      ))}
    </div>
  )
}
