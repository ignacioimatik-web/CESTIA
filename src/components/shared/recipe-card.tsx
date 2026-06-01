import { cn } from '@/lib/utils'
import { Clock, CookingPot, Users } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface RecipeCardProps {
  id: string
  name: string
  description?: string | null
  baseServings: number
  prepTimeMinutes?: number | null
  ingredientCount?: number
  tags?: string[]
  className?: string
}

export function RecipeCard({
  id,
  name,
  description,
  baseServings,
  prepTimeMinutes,
  ingredientCount,
  tags,
  className,
}: RecipeCardProps) {
  return (
    <Link href={`/recipes/${id}`}>
      <Card
        className={cn(
          'cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm h-full',
          className
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-base">{name}</CardTitle>
              {description && (
                <CardDescription className="line-clamp-2 mt-0.5">
                  {description}
                </CardDescription>
              )}
            </div>
            <CookingPot className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {baseServings} raciones
            </span>
            {prepTimeMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {prepTimeMinutes} min
              </span>
            )}
            {ingredientCount !== undefined && (
              <span className="flex items-center gap-1">
                <span className="font-medium">{ingredientCount}</span> ingredientes
              </span>
            )}
          </div>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] h-4">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
