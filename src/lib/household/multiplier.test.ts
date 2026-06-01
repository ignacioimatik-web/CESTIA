import { describe, it, expect } from 'vitest'
import {
  householdServings,
  suggestServings,
  suggestMultiplier,
  generateSummary,
  isLargeBatch,
  suggestQuantityWarnings,
} from './multiplier'

describe('householdServings', () => {
  it('2 adults = 2.0', () => {
    expect(householdServings({ adults: 2, teenagers: 0, youngChildren: 0, frequentGuests: 0 })).toBe(2.0)
  })

  it('2 adults + 2 children = 3.0', () => {
    expect(householdServings({ adults: 2, teenagers: 0, youngChildren: 2, frequentGuests: 0 })).toBe(3.0)
  })

  it('2 adults + 1 teen + 1 child = 3.3', () => {
    expect(householdServings({ adults: 2, teenagers: 1, youngChildren: 1, frequentGuests: 0 })).toBe(3.3)
  })

  it('2 adults + 1 guest = 2.5', () => {
    expect(householdServings({ adults: 2, teenagers: 0, youngChildren: 0, frequentGuests: 1 })).toBe(2.5)
  })
})

describe('suggestServings', () => {
  it('4-pax recipe for 2 adults → 2', () => {
    expect(suggestServings({ adults: 2, teenagers: 0, youngChildren: 0, frequentGuests: 0 }, 4)).toBe(2)
  })

  it('4-pax recipe for 2 adults + 4 children → 4', () => {
    expect(suggestServings({ adults: 2, teenagers: 0, youngChildren: 4, frequentGuests: 0 }, 4)).toBe(4)
  })

  it('4-pax recipe for 4 adults → 4', () => {
    expect(suggestServings({ adults: 4, teenagers: 0, youngChildren: 0, frequentGuests: 0 }, 4)).toBe(4)
  })
})

describe('suggestMultiplier', () => {
  it('2 adults / 4 base = 0.5', () => {
    expect(suggestMultiplier({ adults: 2, teenagers: 0, youngChildren: 0, frequentGuests: 0 }, 4)).toBe(0.5)
  })
})

describe('generateSummary', () => {
  it('2 adults', () => {
    expect(generateSummary({ adults: 2, teenagers: 0, youngChildren: 0, frequentGuests: 0 })).toContain('2 adultos')
  })

  it('2 adults + 2 children', () => {
    const s = generateSummary({ adults: 2, teenagers: 0, youngChildren: 2, frequentGuests: 0 })
    expect(s).toContain('2 adultos')
    expect(s).toContain('2 niños pequeños')
  })

  it('empty household', () => {
    expect(generateSummary({ adults: 0, teenagers: 0, youngChildren: 0, frequentGuests: 0 })).toBe('Hogar vacío')
  })
})

describe('isLargeBatch', () => {
  it('small batch is not large', () => {
    expect(isLargeBatch({ adults: 2, teenagers: 0, youngChildren: 0, frequentGuests: 0 }, 4)).toBe(false)
  })

  it('large family is large batch', () => {
    expect(isLargeBatch({ adults: 10, teenagers: 0, youngChildren: 0, frequentGuests: 0 }, 4)).toBe(true)
  })
})

describe('suggestQuantityWarnings', () => {
  it('warns for 24 eggs', () => {
    expect(suggestQuantityWarnings('ud', 24)).toContain('Cantidad grande')
  })

  it('no warning for 6 eggs', () => {
    expect(suggestQuantityWarnings('ud', 6)).toBeNull()
  })

  it('warns for 5 kg', () => {
    expect(suggestQuantityWarnings('kg', 5)).toContain('Cantidad grande')
  })

  it('warns for 2000g', () => {
    expect(suggestQuantityWarnings('g', 2000)).toContain('Cantidad grande')
  })
})
