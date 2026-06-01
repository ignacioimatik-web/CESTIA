import { describe, it, expect } from 'vitest'
import { scaleIngredients, consolidateIngredients, formatScaledQuantity } from './scaling'

describe('scaleIngredients', () => {
  it('throws if servings are zero', () => {
    expect(() =>
      scaleIngredients([{ name: 'Arroz', quantity: 400, unit: 'g', optional: false, notes: null }], 0, 4)
    ).toThrow('Las raciones deben ser mayores que 0')
  })

  it('throws if target servings are zero', () => {
    expect(() =>
      scaleIngredients([{ name: 'Arroz', quantity: 400, unit: 'g', optional: false, notes: null }], 4, 0)
    ).toThrow('Las raciones deben ser mayores que 0')
  })

  it('returns same quantities when base equals target', () => {
    const result = scaleIngredients(
      [{ name: 'Arroz', quantity: 400, unit: 'g', optional: false, notes: null }],
      4, 4
    )
    expect(result.ingredients[0].roundedQuantity).toBe(400)
    expect(result.ratio).toBe(1)
  })

  it('scales ingredient proportionally', () => {
    const result = scaleIngredients(
      [{ name: 'Arroz', quantity: 400, unit: 'g', optional: false, notes: null }],
      4, 2
    )
    expect(result.ratio).toBe(0.5)
    expect(result.ingredients[0].scaledQuantity).toBe(200)
  })

  it('calculates ratio correctly', () => {
    const result = scaleIngredients(
      [{ name: 'Pollo', quantity: 600, unit: 'g', optional: false, notes: null }],
      4, 6
    )
    expect(result.ratio).toBe(1.5)
    expect(result.ingredients[0].scaledQuantity).toBe(900)
  })
})

describe('intelligent rounding', () => {
  describe('grams (g)', () => {
    it('rounds to nearest 10g for medium amounts (100-999g)', () => {
      const result = scaleIngredients(
        [{ name: 'Arroz', quantity: 400, unit: 'g', optional: false, notes: null }],
        4, 6
      )
      expect(result.ingredients[0].roundedQuantity).toBe(600)
    })

    it('rounds to nearest 5g for small amounts (< 100g)', () => {
      const result = scaleIngredients(
        [{ name: 'Levadura', quantity: 7, unit: 'g', optional: false, notes: null }],
        2, 3
      )
      // 7 * 1.5 = 10.5 -> round to nearest 5g = 10
      expect(result.ingredients[0].roundedQuantity).toBe(10)
    })

    it('rounds to nearest 50g for large amounts (>= 1000g)', () => {
      const result = scaleIngredients(
        [{ name: 'Patatas', quantity: 800, unit: 'g', optional: false, notes: null }],
        4, 6
      )
      // 800 * 1.5 = 1200 -> >= 1000g, rounds to nearest 50g
      expect(result.ingredients[0].roundedQuantity).toBe(1200)
    })
  })

  describe('milliliters (ml)', () => {
    it('rounds to nearest 10ml for medium amounts', () => {
      const result = scaleIngredients(
        [{ name: 'Leche', quantity: 200, unit: 'ml', optional: false, notes: null }],
        2, 3
      )
      expect(result.ingredients[0].roundedQuantity).toBe(300)
    })
  })

  describe('units (ud)', () => {
    it('allows half units', () => {
      const result = scaleIngredients(
        [{ name: 'Huevo', quantity: 3, unit: 'ud', optional: false, notes: null }],
        4, 2
      )
      // 3 * 0.5 = 1.5 -> half_units with allowHalf=true
      expect(result.ingredients[0].roundedQuantity).toBe(1.5)
    })

    it('rounds to nearest 0.5', () => {
      const result = scaleIngredients(
        [{ name: 'Huevo', quantity: 3, unit: 'ud', optional: false, notes: null }],
        4, 3
      )
      // 3 * 0.75 = 2.25 -> round to nearest 0.5 = 2.5
      expect(result.ingredients[0].roundedQuantity).toBe(2.5)
    })

    it('shows note for very small amounts', () => {
      const result = scaleIngredients(
        [{ name: 'Huevo', quantity: 1, unit: 'ud', optional: false, notes: null }],
        4, 1
      )
      // 1 * 0.25 = 0.25 -> < 0.5, shows note
      expect(result.ingredients[0].roundedQuantity).toBe(0.5)
      expect(result.ingredients[0].roundingNote).toBe('media ud')
    })

    it('shows "un poco" for tiny amounts', () => {
      const result = scaleIngredients(
        [{ name: 'Huevo', quantity: 1, unit: 'ud', optional: false, notes: null }],
        8, 1
      )
      // 1 * 0.125 = 0.125 -> < 0.25, shows note
      expect(result.ingredients[0].roundedQuantity).toBe(0.5)
      expect(result.ingredients[0].roundingNote).toBe('un poco')
    })
  })

  describe('whole units (diente, loncha)', () => {
    it('rounds to whole numbers without half', () => {
      const result = scaleIngredients(
        [{ name: 'Ajo', quantity: 3, unit: 'diente', optional: false, notes: null }],
        4, 2
      )
      // 3 * 0.5 = 1.5 -> half_units with allowHalf=false -> round to nearest 1 = 2
      expect(result.ingredients[0].roundedQuantity).toBe(2)
    })
  })

  describe('spoons (tbsp, tsp)', () => {
    it('rounds to nearest 0.25', () => {
      const result = scaleIngredients(
        [{ name: 'Aceite', quantity: 2, unit: 'tbsp', optional: false, notes: null }],
        4, 3
      )
      // 2 * 0.75 = 1.5 -> round to nearest 0.25
      expect(result.ingredients[0].roundedQuantity).toBe(1.5)
    })
  })

  describe('keep_original units (pizca, chorro)', () => {
    it('keeps pizca as 1 unit regardless of scaling', () => {
      const result = scaleIngredients(
        [{ name: 'Sal', quantity: 1, unit: 'pizca', optional: false, notes: null }],
        4, 6
      )
      expect(result.ingredients[0].roundedQuantity).toBe(1)
      expect(result.ingredients[0].roundingNote).toBe('a ojo')
    })

    it('keeps chorro as-is', () => {
      const result = scaleIngredients(
        [{ name: 'Aceite', quantity: 1, unit: 'chorro', optional: false, notes: null }],
        4, 8
      )
      expect(result.ingredients[0].roundedQuantity).toBe(1)
      expect(result.ingredients[0].roundingNote).toBe('a ojo')
    })
  })

  describe('packs and cans', () => {
    it('rounds cans to whole numbers', () => {
      const result = scaleIngredients(
        [{ name: 'Atún', quantity: 2, unit: 'lata', optional: false, notes: null }],
        4, 3
      )
      // 2 * 0.75 = 1.5 -> half_units with allowHalf=false -> round to nearest 1 = 2
      expect(result.ingredients[0].roundedQuantity).toBe(2)
    })
  })
})

describe('formatScaledQuantity', () => {
  it('formats whole numbers cleanly', () => {
    expect(formatScaledQuantity(400, 'g')).toBe('400 g')
  })

  it('formats half as ½ symbol', () => {
    expect(formatScaledQuantity(1.5, 'ud')).toBe('1½ ud')
  })

  it('formats 0.5 as ½ alone', () => {
    expect(formatScaledQuantity(0.5, 'ud')).toBe('½ ud')
  })

  it('handles zero', () => {
    expect(formatScaledQuantity(0, 'g')).toBe('')
  })

  it('formats 0.25 as ¼ symbol', () => {
    expect(formatScaledQuantity(2.25, 'tsp')).toBe('2¼ tsp')
  })

  it('formats 0.75 as ¾ symbol', () => {
    expect(formatScaledQuantity(3.75, 'cup')).toBe('3¾ cup')
  })
})

describe('consolidateIngredients', () => {
  it('merges duplicate ingredients with same name and unit', () => {
    const ingredients = [
      { name: 'Arroz', originalQuantity: 200, scaledQuantity: 300, roundedQuantity: 300, unit: 'g', originalServings: 4, targetServings: 6, optional: false, notes: null },
      { name: 'Arroz', originalQuantity: 100, scaledQuantity: 150, roundedQuantity: 150, unit: 'g', originalServings: 4, targetServings: 6, optional: false, notes: null },
    ]
    const result = consolidateIngredients(ingredients)
    expect(result).toHaveLength(1)
    expect(result[0].roundedQuantity).toBe(450)
  })

  it('keeps different ingredients separate', () => {
    const ingredients = [
      { name: 'Arroz', originalQuantity: 300, scaledQuantity: 300, roundedQuantity: 300, unit: 'g', originalServings: 4, targetServings: 4, optional: false, notes: null },
      { name: 'Pollo', originalQuantity: 600, scaledQuantity: 600, roundedQuantity: 600, unit: 'g', originalServings: 4, targetServings: 4, optional: false, notes: null },
    ]
    const result = consolidateIngredients(ingredients)
    expect(result).toHaveLength(2)
  })
})
