export interface ScaledIngredient {
  name: string
  scaledQuantity: number
  unit: string
  originalQuantity: number
  originalServings: number
  targetServings: number
  optional: boolean
  notes: string | null
}

export interface IngredientInput {
  name: string
  quantity: number
  unit: string
  optional: boolean
  notes: string | null
}

export function scaleIngredients(
  ingredients: IngredientInput[],
  baseServings: number,
  targetServings: number
): ScaledIngredient[] {
  if (baseServings <= 0 || targetServings <= 0) {
    throw new Error('Servings must be greater than 0')
  }

  const ratio = targetServings / baseServings

  return ingredients.map((ing) => ({
    name: ing.name,
    scaledQuantity: Math.round(ing.quantity * ratio * 100) / 100,
    unit: ing.unit,
    originalQuantity: ing.quantity,
    originalServings: baseServings,
    targetServings,
    optional: ing.optional,
    notes: ing.notes,
  }))
}

export function consolidateIngredients(
  ingredients: ScaledIngredient[]
): ScaledIngredient[] {
  const consolidated = new Map<string, ScaledIngredient>()

  for (const ing of ingredients) {
    const key = `${ing.name}-${ing.unit}`.toLowerCase()
    const existing = consolidated.get(key)

    if (existing) {
      consolidated.set(key, {
        ...existing,
        scaledQuantity: existing.scaledQuantity + ing.scaledQuantity,
      })
    } else {
      consolidated.set(key, { ...ing })
    }
  }

  return Array.from(consolidated.values())
}

export function formatQuantity(quantity: number, unit: string): string {
  if (quantity === 0) return ''

  const rounded = Math.round(quantity * 100) / 100

  if (unit === 'unit') {
    return rounded % 1 === 0 ? `${rounded}` : `${rounded}`
  }

  return `${rounded} ${unit}`
}
