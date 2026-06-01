export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

export function minutesToHours(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`

  return formatDate(date)
}

export const dietaryLabels: Record<string, string> = {
  none: 'Sin preferencias',
  vegetarian: 'Vegetariano',
  vegan: 'Vegano',
  gluten_free: 'Sin gluten',
  lactose_free: 'Sin lactosa',
  low_carb: 'Bajo en carbohidratos',
  keto: 'Keto',
  mediterranean: 'Mediterránea',
}

export const supermarketLabels: Record<string, string> = {
  mercadona: 'Mercadona',
  lidl: 'Lidl',
  aldi: 'Aldi',
  dia: 'DIA',
  carrefour: 'Carrefour',
  consum: 'Consum',
  family_cash: 'Family Cash',
}

export const unitLabels: Record<string, string> = {
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'L',
  tsp: 'cucharadita',
  tbsp: 'cucharada',
  cup: 'taza',
  unit: 'unidad',
  slice: 'loncha',
  clove: 'diente',
  pack: 'paquete',
  can: 'lata',
  bunch: 'manojo',
  piece: 'pieza',
}
