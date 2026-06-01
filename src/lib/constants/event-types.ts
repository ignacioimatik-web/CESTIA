import {
  Cake,
  Heart,
  Flame,
  CookingPot,
  Utensils,
  Dumbbell,
  Calendar,
  ChevronsRight,
  TreePine,
  Candy,
  type LucideIcon,
} from 'lucide-react'
import type { MealEventType } from '@/types/database'

export type EventTypeConfig = {
  id: MealEventType
  label: string
  description: string
  icon: LucideIcon
  color: string
  defaultAdults: number
  defaultChildren: number
}

export const EVENT_TYPES: EventTypeConfig[] = [
  {
    id: 'birthday',
    label: 'Cumpleaños infantil',
    description: 'Fiesta de cumpleaños para niños',
    icon: Cake,
    color: 'text-pink-500',
    defaultAdults: 4,
    defaultChildren: 8,
  },
  {
    id: 'family_dinner',
    label: 'Comida familiar',
    description: 'Comida o cena con la familia',
    icon: Heart,
    color: 'text-red-500',
    defaultAdults: 6,
    defaultChildren: 2,
  },
  {
    id: 'romantic_dinner',
    label: 'Cena romántica',
    description: 'Cena íntima para dos',
    icon: Flame,
    color: 'text-rose-500',
    defaultAdults: 2,
    defaultChildren: 0,
  },
  {
    id: 'bbq',
    label: 'Barbacoa',
    description: 'Barbacoa con amigos o familia',
    icon: CookingPot,
    color: 'text-orange-500',
    defaultAdults: 8,
    defaultChildren: 4,
  },
  {
    id: 'casual_dinner',
    label: 'Cena informal',
    description: 'Cena entre amigos sin pretensiones',
    icon: Utensils,
    color: 'text-blue-500',
    defaultAdults: 4,
    defaultChildren: 0,
  },
  {
    id: 'sports_meal',
    label: 'Comida de deportistas',
    description: 'Comida alta en proteínas y energía',
    icon: Dumbbell,
    color: 'text-emerald-500',
    defaultAdults: 4,
    defaultChildren: 0,
  },
  {
    id: 'weekly_menu',
    label: 'Menú semanal',
    description: 'Planificación de comidas para la semana',
    icon: Calendar,
    color: 'text-violet-500',
    defaultAdults: 2,
    defaultChildren: 2,
  },
  {
    id: 'batch_cooking',
    label: 'Batch cooking',
    description: 'Cocinar en lote para varios días',
    icon: ChevronsRight,
    color: 'text-indigo-500',
    defaultAdults: 4,
    defaultChildren: 2,
  },
  {
    id: 'christmas',
    label: 'Navidad',
    description: 'Comidas y cenas navideñas',
    icon: TreePine,
    color: 'text-green-600',
    defaultAdults: 8,
    defaultChildren: 4,
  },
  {
    id: 'kids_snack',
    label: 'Merienda infantil',
    description: 'Merienda para niños',
    icon: Candy,
    color: 'text-yellow-500',
    defaultAdults: 2,
    defaultChildren: 6,
  },
]

export function getEventType(id: string): EventTypeConfig | undefined {
  return EVENT_TYPES.find((t) => t.id === id)
}

export function getEventTypeMetadata(
  eventType: string,
  adults: number,
  children: number
): string {
  const config = getEventType(eventType)
  const parts: string[] = []
  if (adults > 0) parts.push(`${adults} adulto${adults > 1 ? 's' : ''}`)
  if (children > 0) parts.push(`${children} niño${children > 1 ? 's' : ''}`)
  return config ? `${config.label} · ${parts.join(', ')}` : parts.join(', ')
}
