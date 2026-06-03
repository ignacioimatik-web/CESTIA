import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { RecipeCardItem } from './types'

export function FeaturedRecipeCard({ recipe }: { recipe: RecipeCardItem }) {
  const totalMinutes = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0)

  return (
    <Card className="warm-panel overflow-hidden group">
      <div className="relative h-40 sm:h-48 w-full bg-muted">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-14 w-14 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        {totalMinutes > 0 && (
          <span className="absolute top-2 right-2 bg-black/50 text-white text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
            {totalMinutes} min
          </span>
        )}
        {recipe.baseServings > 0 && (
          <span className="absolute top-2 left-2 bg-black/50 text-white text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
            {recipe.baseServings} raciones
          </span>
        )}
      </div>
      <CardContent className="p-3 space-y-2">
        <p className="font-semibold text-sm leading-tight line-clamp-2">{recipe.name}</p>
        {recipe.ingredients.length > 0 && (
          <p className="text-[11px] text-muted-foreground line-clamp-2">{recipe.ingredients.join(', ')}</p>
        )}
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{t}</span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Link href="/shopping-lists/new"><Button className="h-9 w-full text-xs rounded-lg">Añadir a compra</Button></Link>
          <Link href={`/recipes/${recipe.id}`}><Button variant="outline" className="h-9 w-full text-xs rounded-lg">Ver receta</Button></Link>
        </div>
      </CardContent>
    </Card>
  )
}
