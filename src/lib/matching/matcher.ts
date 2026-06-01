/**
 * Product matching engine.
 * Matches generic ingredient names to real supermarket products
 * using normalized name comparison with confidence scoring.
 */

export type MatchResult = {
  productId: string
  productName: string
  brand: string | null
  price: number | null
  unit: string
  quantity: number | null
  section: string | null
  imageUrl: string | null
  ean: string | null
  confidenceScore: number
  matchType: 'exact' | 'fuzzy' | 'manual' | 'favorite'
}

export type ProductCandidate = {
  id: string
  name: string
  brand: string | null
  price: number | null
  unit: string
  quantity: number | null
  supermarketSection: string | null
  imageUrl: string | null
  ean: string | null
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function removeBrandQualifiers(name: string): string {
  return name
    .replace(/\b(hacendado|mercadona|boss|delipius|milreal|carrefour|dia)\b/gi, '')
    .replace(/\b(bandeja|bolsa|pack|malla|caja|envase)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(str: string): string[] {
  return normalize(str).split(/\s+/).filter((t) => t.length > 1)
}

function keywordOverlap(ingredient: string, product: string): number {
  const ingTokens = tokenize(ingredient)
  const prodTokens = tokenize(product)

  if (ingTokens.length === 0 || prodTokens.length === 0) return 0

  let matchCount = 0
  for (const ingTok of ingTokens) {
    for (const prodTok of prodTokens) {
      if (ingTok === prodTok || prodTok.includes(ingTok) || ingTok.includes(prodTok)) {
        matchCount++
        break
      }
    }
  }

  return matchCount / ingTokens.length
}

export function matchIngredient(
  ingredientName: string,
  candidates: ProductCandidate[],
  topN = 5
): MatchResult[] {
  const normalizedIng = normalize(ingredientName)
  const cleanIng = removeBrandQualifiers(normalizedIng)
  const ingTokens = tokenize(cleanIng)

  const scored = candidates.map((product) => {
    const normalizedProd = normalize(product.name)
    const cleanProd = removeBrandQualifiers(normalizedProd)
    const prodTokens = tokenize(cleanProd)

    const overlap = keywordOverlap(cleanIng, cleanProd)

    let score = overlap * 100
    let matchType: MatchResult['matchType'] = 'fuzzy'

    // Exact match (full normalized string equality)
    if (normalizedIng === normalizedProd) {
      score = 100
      matchType = 'exact'
    }
    // Ingredient name is a substring of product name or vice versa
    else if (normalizedProd.includes(normalizedIng) || normalizedIng.includes(normalizedProd)) {
      score = Math.max(score, 90)
      if (matchType === 'fuzzy') matchType = 'exact'
    }
    // All ingredient tokens appear in product
    else if (
      ingTokens.length > 0 &&
      ingTokens.every((t) => normalizedProd.includes(t))
    ) {
      score = Math.max(score, 80)
    }

    // Bonus: shorter product name = closer match (less qualifiers)
    if (score > 0) {
      const lengthRatio = normalizedIng.length / normalizedProd.length
      if (lengthRatio > 0.5) score = Math.min(100, score * (1 + lengthRatio * 0.1))
    }

    // Penalize if product has qualifiers that ingredient doesn't
    const extraTokens = prodTokens.filter((t) => !ingTokens.includes(t))
    const penalty = extraTokens.length * 3
    score = Math.max(0, score - penalty)

    return {
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      price: product.price,
      unit: product.unit,
      quantity: product.quantity,
      section: product.supermarketSection,
      imageUrl: product.imageUrl,
      ean: product.ean,
      confidenceScore: Math.round(score * 100) / 100,
      matchType: score >= 100 ? 'exact' : matchType,
    }
  })

  return scored
    .filter((m) => m.confidenceScore > 30)
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, topN)
}

export function pickBestMatch(matches: MatchResult[]): MatchResult | null {
  return matches.length > 0 ? matches[0] : null
}
