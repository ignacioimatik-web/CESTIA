export interface IngredientInput {
  name: string
  quantity: number
  unit: string
  optional: boolean
  notes: string | null
}

export interface ScaledIngredient {
  name: string
  originalQuantity: number
  scaledQuantity: number
  roundedQuantity: number
  unit: string
  originalServings: number
  targetServings: number
  optional: boolean
  notes: string | null
  roundingNote?: string
}

export interface ScaleResult {
  ingredients: ScaledIngredient[]
  ratio: number
}

type RoundingStrategy =
  | { kind: 'exact' }
  | { kind: 'round'; precision: number }
  | { kind: 'round_up' }
  | { kind: 'half_units'; allowHalf: boolean }
  | { kind: 'keep_original' }

const UNIT_STRATEGIES: Record<string, RoundingStrategy> = {
  g: { kind: 'round', precision: 10 },
  gr: { kind: 'round', precision: 10 },
  kg: { kind: 'round', precision: 0.1 },
  ml: { kind: 'round', precision: 10 },
  l: { kind: 'round', precision: 0.1 },
  ud: { kind: 'half_units', allowHalf: true },
  unidad: { kind: 'half_units', allowHalf: true },
  diente: { kind: 'half_units', allowHalf: false },
  loncha: { kind: 'half_units', allowHalf: false },
  pieza: { kind: 'half_units', allowHalf: false },
  ramita: { kind: 'half_units', allowHalf: false },
  hoja: { kind: 'half_units', allowHalf: false },
  tsp: { kind: 'round', precision: 0.25 },
  tbsp: { kind: 'round', precision: 0.25 },
  cucharadita: { kind: 'round', precision: 0.25 },
  cucharada: { kind: 'round', precision: 0.25 },
  cup: { kind: 'round', precision: 0.25 },
  taza: { kind: 'round', precision: 0.25 },
  lata: { kind: 'half_units', allowHalf: false },
  paquete: { kind: 'half_units', allowHalf: false },
  pizca: { kind: 'keep_original' },
  chorro: { kind: 'keep_original' },
  pack: { kind: 'half_units', allowHalf: false },
  can: { kind: 'half_units', allowHalf: false },
}

function getStrategy(unit: string): RoundingStrategy {
  return UNIT_STRATEGIES[unit.toLowerCase()] ?? { kind: 'round', precision: 0.01 }
}

export function scaleIngredients(
  ingredients: IngredientInput[],
  baseServings: number,
  targetServings: number
): ScaleResult {
  if (baseServings <= 0 || targetServings <= 0) {
    throw new Error('Las raciones deben ser mayores que 0')
  }

  const ratio = targetServings / baseServings

  const scaled = ingredients.map((ing) => {
    const raw = ing.quantity * ratio
    const strategy = getStrategy(ing.unit)
    const { value: rounded, note } = roundByStrategy(raw, strategy, ing.unit, ing.quantity)

    return {
      name: ing.name,
      originalQuantity: ing.quantity,
      scaledQuantity: fixFloat(raw),
      roundedQuantity: fixFloat(rounded),
      unit: ing.unit,
      originalServings: baseServings,
      targetServings,
      optional: ing.optional,
      notes: ing.notes,
      roundingNote: note,
    }
  })

  return { ingredients: scaled, ratio }
}

function fixFloat(v: number): number {
  return Math.round(v * 1e8) / 1e8
}

function roundByStrategy(
  value: number,
  strategy: RoundingStrategy,
  unit: string,
  originalQuantity: number
): { value: number; note?: string } {
  const abs = Math.abs(value)

  switch (strategy.kind) {
    case 'exact':
      return { value: fixFloat(value) }

    case 'round': {
      const basePrecision = strategy.precision
      let effectivePrecision = basePrecision

      // Tiered precision for grams
      if (unit === 'g' || unit === 'gr') {
        if (abs >= 1000) {
          effectivePrecision = 50
        } else if (abs >= 100) {
          effectivePrecision = 10
        } else {
          effectivePrecision = 5
        }
      }

      // Tiered precision for ml
      if (unit === 'ml') {
        if (abs >= 1000) {
          effectivePrecision = 50
        } else if (abs >= 100) {
          effectivePrecision = 10
        } else {
          effectivePrecision = 5
        }
      }

      const rounded = roundTo(value, effectivePrecision)
      const diff = abs > 0 ? Math.abs(value - rounded) / abs : 0

      return {
        value: rounded,
        note: diff > 0.15 ? 'aproximadamente' : undefined,
      }
    }

    case 'round_up':
      return { value: Math.ceil(value) }

    case 'half_units': {
      if (value < 0.25 && value > 0) {
        return { value: strategy.allowHalf ? 0.5 : 1, note: 'un poco' }
      }
      if (value < 0.5 && value >= 0.25) {
        return { value: strategy.allowHalf ? 0.5 : 1, note: `media ${unit}` }
      }
      const base = strategy.allowHalf ? 0.5 : 1
      const rounded = Math.round(value / base) * base
      if (rounded === 0) return { value: base, note: `1 ${unit} (aproximadamente)` }
      const diff = abs > 0 ? Math.abs(value - rounded) / abs : 0
      return { value: rounded, note: diff > 0.2 ? 'aproximadamente' : undefined }
    }

    case 'keep_original': {
      // Don't scale imprecise units like "pizca" or "chorro"
      return { value: Math.sign(originalQuantity) * 1, note: 'a ojo' }
    }
  }
}

function roundTo(value: number, precision: number): number {
  return fixFloat(Math.round(value / precision) * precision)
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
        scaledQuantity: fixFloat(existing.scaledQuantity + ing.scaledQuantity),
        roundedQuantity: fixFloat(existing.roundedQuantity + ing.roundedQuantity),
      })
    } else {
      consolidated.set(key, { ...ing })
    }
  }

  return Array.from(consolidated.values())
}

export function formatScaledQuantity(quantity: number, unit: string): string {
  if (quantity === 0) return ''

  if (Number.isInteger(quantity)) {
    return `${quantity} ${unit}`
  }

  const rounded = Math.round(quantity * 100) / 100

  if (rounded % 1 === 0) {
    return `${rounded} ${unit}`
  }

  const decimal = rounded % 1
  const whole = Math.floor(rounded)

  if (Math.abs(decimal - 0.5) < 0.01) {
    return whole > 0 ? `${whole}½ ${unit}` : `½ ${unit}`
  }
  if (Math.abs(decimal - 0.25) < 0.01) {
    return whole > 0 ? `${whole}¼ ${unit}` : `¼ ${unit}`
  }
  if (Math.abs(decimal - 0.75) < 0.01) {
    return whole > 0 ? `${whole}¾ ${unit}` : `¾ ${unit}`
  }

  return `${rounded} ${unit}`
}
