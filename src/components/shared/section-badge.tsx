import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { getSectionColors } from '@/lib/constants/sections'

interface SectionBadgeProps {
  name: string
  className?: string
}

export function SectionBadge({ name, className }: SectionBadgeProps) {
  const { light, dark } = getSectionColors(name)

  return (
    <Badge
      variant="outline"
      className={cn('border-0 text-[10px] font-normal', light, dark, className)}
    >
      {name}
    </Badge>
  )
}
