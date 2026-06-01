import { cn } from '@/lib/utils'
import { Clock, Users, ChefHat, CookingPot } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface RecipeCardProps {
  id: string
  name: string
  description?: string | null
  baseServings: number
  prepTimeMinutes?: number | null
  cookTimeMinutes?: number | null
  difficulty?: string | null
  ingredientCount?: number
  category?: string | null
  tags?: string[]
  className?: string
}

const difficultyColor: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}

export function RecipeCard({
  id,
  name,
  description,
  baseServings,
  prepTimeMinutes,
  cookTimeMinutes,
  difficulty,
  ingredientCount,
  category,
  tags,
  className,
}: RecipeCardProps) {
  return (
    <Link href={`/recipes/${id}`}>
        <Card
          className={cn(
           'card-hover cursor-pointer h-full warm-panel overflow-hidden',
           className
          )}
        >
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400" />
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-sm sm:text-base leading-snug">{name}</h3>
            <CookingPot className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
          </div>

          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {baseServings}
            </span>
            {prepTimeMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {prepTimeMinutes}{cookTimeMinutes ? `+${cookTimeMinutes}` : ''}min
              </span>
            )}
            {difficulty && (
              <span className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', difficultyColor[difficulty] ?? '')}>
                <ChefHat className="h-2.5 w-2.5" />
                {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Media' : difficulty === 'hard' ? 'Difícil' : difficulty}
              </span>
            )}
            {ingredientCount !== undefined && (
              <span>{ingredientCount} ingr.</span>
            )}
          </div>

          {category && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 mt-2">
              {category}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
