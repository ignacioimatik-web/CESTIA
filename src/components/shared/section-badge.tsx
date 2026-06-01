import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface SectionBadgeProps {
  name: string
  className?: string
}

const sectionColors: Record<string, string> = {
  'Frutas y Verduras': 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  'Carnes y Pescados': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  'Huevos y Lácteos': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  Panadería: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Despensa: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  Bebidas: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Congelados: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  Limpieza: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  'Higiene Personal': 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  Bebés: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  Mascotas: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  Otros: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export function SectionBadge({ name, className }: SectionBadgeProps) {
  const colorClass = sectionColors[name] ?? sectionColors['Otros']

  return (
    <Badge
      variant="outline"
      className={cn('border-0 text-[10px] font-normal', colorClass, className)}
    >
      {name}
    </Badge>
  )
}
