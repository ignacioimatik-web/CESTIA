/**
 * Household composition → serving multiplier.
 *
 * Each member type contributes a fractional "serving equivalent":
 *   Adult       = 1.0
 *   Teenager    = 0.8
 *   Young child = 0.5
 *   Guest       = 0.5  (average extra person)
 *
 * The total household equivalent is divided by the recipe base servings
 * to produce a suggested multiplier, which is then rounded to a practical
 * step (0.5 for recipes < 10 portions, 1.0 for larger).
 */

export type HouseholdComposition = {
  adults: number
  teenagers: number
  youngChildren: number
  frequentGuests: number
}

const SERVING_EQUIVALENTS = {
  adult: 1.0,
  teenager: 0.8,
  youngChild: 0.5,
  guest: 0.5,
} as const

export function householdServings(household: HouseholdComposition): number {
  return (
    household.adults * SERVING_EQUIVALENTS.adult +
    household.teenagers * SERVING_EQUIVALENTS.teenager +
    household.youngChildren * SERVING_EQUIVALENTS.youngChild +
    household.frequentGuests * SERVING_EQUIVALENTS.guest
  )
}

export function suggestServings(
  household: HouseholdComposition,
  recipeBaseServings: number
): number {
  const totalHousehold = householdServings(household)

  if (recipeBaseServings <= 0) return Math.max(1, Math.round(totalHousehold))

  // Suggested = total household equivalents, rounded to nearest serving step
  const step = totalHousehold > 10 ? 2 : 1
  const raw = totalHousehold
  const suggested = Math.max(1, Math.round(raw / step) * step)

  return suggested
}

export function suggestMultiplier(
  household: HouseholdComposition,
  recipeBaseServings: number
): number {
  const suggested = suggestServings(household, recipeBaseServings)
  return suggested / recipeBaseServings
}

export function generateSummary(household: HouseholdComposition): string {
  const parts: string[] = []
  if (household.adults > 0) parts.push(`${household.adults} adulto${household.adults > 1 ? 's' : ''}`)
  if (household.teenagers > 0) parts.push(`${household.teenagers} adolescente${household.teenagers > 1 ? 's' : ''}`)
  if (household.youngChildren > 0) parts.push(`${household.youngChildren} niño${household.youngChildren > 1 ? 's' : ''} peque${household.youngChildren > 1 ? 'ños' : 'ño'}`)
  if (household.frequentGuests > 0) parts.push(`${household.frequentGuests} invitado${household.frequentGuests > 1 ? 's' : ''} frecuente${household.frequentGuests > 1 ? 's' : ''}`)

  if (parts.length === 0) return 'Hogar vacío'
  return parts.join(', ')
}

export function isLargeBatch(
  household: HouseholdComposition,
  recipeBaseServings: number
): boolean {
  const suggested = suggestServings(household, recipeBaseServings)
  return suggested >= recipeBaseServings * 2 && suggested > 8
}

export function suggestQuantityWarnings(
  unit: string,
  scaledQuantity: number
): string | null {
  if (unit === 'ud' && scaledQuantity >= 12) {
    return `Cantidad grande: ${scaledQuantity} unidades. ¿Seguro que necesitas tantas?`
  }
  if (unit === 'g' && scaledQuantity >= 2000) {
    return `Cantidad grande: ${scaledQuantity}g (${(scaledQuantity / 1000).toFixed(1)} kg).`
  }
  if (unit === 'kg' && scaledQuantity >= 5) {
    return `Cantidad grande: ${scaledQuantity} kg. ¿Prefieres comprar a granel?`
  }
  if (unit === 'l' && scaledQuantity >= 5) {
    return `Cantidad grande: ${scaledQuantity} litros.`
  }
  return null
}
