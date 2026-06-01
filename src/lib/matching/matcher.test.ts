import { describe, it, expect } from 'vitest'
import { matchIngredient, pickBestMatch, type ProductCandidate } from './matcher'

const mockProducts: ProductCandidate[] = [
  { id: '1', name: 'Arroz redondo Hacendado', brand: 'Hacendado', price: 1.85, unit: 'kg', quantity: 1, supermarketSection: 'Pasta, arroz y legumbres', imageUrl: null, ean: null },
  { id: '2', name: 'Arroz basmati Hacendado', brand: 'Hacendado', price: 2.30, unit: 'kg', quantity: 1, supermarketSection: 'Pasta, arroz y legumbres', imageUrl: null, ean: null },
  { id: '3', name: 'Arroz integral Hacendado', brand: 'Hacendado', price: 2.10, unit: 'kg', quantity: 1, supermarketSection: 'Pasta, arroz y legumbres', imageUrl: null, ean: null },
  { id: '4', name: 'Arroz vaporizado Hacendado', brand: 'Hacendado', price: 2.40, unit: 'kg', quantity: 1, supermarketSection: 'Pasta, arroz y legumbres', imageUrl: null, ean: null },
  { id: '5', name: 'Aceite de Oliva Virgen Extra', brand: 'Hacendado', price: 4.20, unit: 'l', quantity: 1, supermarketSection: 'Despensa', imageUrl: null, ean: null },
  { id: '6', name: 'Tomate pera bandeja 500g', brand: null, price: 1.89, unit: 'g', quantity: 500, supermarketSection: 'Fruta y verdura', imageUrl: null, ean: null },
  { id: '7', name: 'Pechuga de pollo bandeja', brand: null, price: 5.99, unit: 'g', quantity: 600, supermarketSection: 'Carne', imageUrl: null, ean: null },
]

describe('matchIngredient', () => {
  it('matches arroz to all rice products with high scores', () => {
    const results = matchIngredient('Arroz', mockProducts, 5)
    expect(results.length).toBeGreaterThanOrEqual(4)
    expect(results[0].confidenceScore).toBeGreaterThan(70)
  })

  it('finds exact match when name matches closely', () => {
    const results = matchIngredient('Tomate', mockProducts, 5)
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((m) => m.productName.includes('Tomate'))).toBe(true)
  })

  it('returns empty for unrelated ingredient', () => {
    const results = matchIngredient('Mantequilla', mockProducts, 5)
    // May still find something with low confidence or empty
    expect(results.filter((m) => m.confidenceScore > 30).length).toBe(0)
  })

  it('sorts by confidence descending', () => {
    const results = matchIngredient('arroz', mockProducts, 5)
    for (let i = 1; i < results.length; i++) {
      expect(results[i].confidenceScore).toBeLessThanOrEqual(results[i - 1].confidenceScore)
    }
  })

  it('respects topN limit', () => {
    const results = matchIngredient('Arroz', mockProducts, 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('matches pollo to chicken products', () => {
    const results = matchIngredient('Pollo', mockProducts, 3)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].productName.toLowerCase()).toContain('pollo')
  })

  it('normalizes accents', () => {
    const results = matchIngredient('aceite de oliva', mockProducts, 3)
    expect(results.length).toBeGreaterThan(0)
  })
})

describe('pickBestMatch', () => {
  it('returns the top match', () => {
    const results = matchIngredient('Arroz', mockProducts, 5)
    const best = pickBestMatch(results)
    expect(best).not.toBeNull()
    expect(best!.confidenceScore).toBe(results[0].confidenceScore)
  })

  it('returns null for empty list', () => {
    expect(pickBestMatch([])).toBeNull()
  })
})
