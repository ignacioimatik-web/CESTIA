import { cn } from '@/lib/utils'
import { CheckCircle2, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ShoppingListCardProps {
  id: string
  name: string
  supermarket?: string | null
  totalItems: number
  checkedItems: number
  isCompleted?: boolean
  className?: string
}

export function ShoppingListCard({
  id,
  name,
  supermarket,
  totalItems,
  checkedItems,
  isCompleted,
  className,
}: ShoppingListCardProps) {
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  return (
    <Card
      className={cn(
        'card-hover border shadow-sm overflow-hidden',
        isCompleted && 'opacity-60',
        className
      )}
    >
      <div className={cn(
        'h-1',
        progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'
      )} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              {name}
              {isCompleted && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
            </CardTitle>
          </div>
          <ShoppingCart className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
        </div>
        {supermarket && (
          <Badge variant="secondary" className="mt-1 text-[10px] h-4">
            {supermarket}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>
            {checkedItems}/{totalItems} productos
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
