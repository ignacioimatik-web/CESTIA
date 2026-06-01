import type { HouseholdSummary } from './types'

export function getPendingProducts(total: number, checked: number) {
  return Math.max(total - checked, 0)
}

export function getProgress(total: number, checked: number) {
  if (total <= 0) return 0
  return Math.round((checked / total) * 100)
}

export function getHouseholdMode(adults: number, children: number, guests: number): HouseholdSummary['mode'] {
  const people = adults + children
  if (guests >= 4) return 'evento'
  if (people <= 1) return 'persona_sola'
  if (people === 2) return 'pareja'
  if (people >= 6) return 'familia_numerosa'
  return 'familia'
}

export function getServingsMultiplier(adults: number, children: number, guests: number) {
  return Number((adults + children * 0.7 + guests * 0.8).toFixed(1))
}

export function euro(value: number | null) {
  if (value === null) return null
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
}
