import { scaleIngredients, type IngredientInput } from './scaling'
import { LEGACY_TO_CANONICAL, getSectionOrder } from '@/lib/constants/sections'

export type RecipeForList = {
  id: string
  name: string
  baseServings: number
  ingredients: { name: string; quantity: number; unit: string; optional: boolean; ingredientId?: string }[]
}

export type UsualProduct = {
  name: string
  quantity: number | null
  unit: string
  section: string | null
  frequency: 'weekly' | 'biweekly' | 'monthly'
}

export type GeneratedItem = {
  name: string
  quantity: number
  unit: string
  section: string | null
  recipeSources: string[]
  optional: boolean
}

type SectionPreferenceMap = Record<string, string | null>

const SECTION_KEYWORDS: [string, string][] = [
  ['tomate', 'Fruta y verdura'],
  ['cebolla', 'Fruta y verdura'],
  ['ajo', 'Fruta y verdura'],
  ['pimiento', 'Fruta y verdura'],
  ['patata', 'Fruta y verdura'],
  ['zanahoria', 'Fruta y verdura'],
  ['lechuga', 'Fruta y verdura'],
  ['espinaca', 'Fruta y verdura'],
  ['brócoli', 'Fruta y verdura'],
  ['calabacín', 'Fruta y verdura'],
  ['berenjena', 'Fruta y verdura'],
  ['pepino', 'Fruta y verdura'],
  ['calabaza', 'Fruta y verdura'],
  ['espárrago', 'Fruta y verdura'],
  ['alcachofa', 'Fruta y verdura'],
  ['remolacha', 'Fruta y verdura'],
  ['coliflor', 'Fruta y verdura'],
  ['repollo', 'Fruta y verdura'],
  ['apio', 'Fruta y verdura'],
  ['puerro', 'Fruta y verdura'],
  ['berro', 'Fruta y verdura'],
  ['endibia', 'Fruta y verdura'],
  ['rábano', 'Fruta y verdura'],
  ['limón', 'Fruta y verdura'],
  ['naranja', 'Fruta y verdura'],
  ['mandarina', 'Fruta y verdura'],
  ['pomelo', 'Fruta y verdura'],
  ['plátano', 'Fruta y verdura'],
  ['manzana', 'Fruta y verdura'],
  ['pera', 'Fruta y verdura'],
  ['melocotón', 'Fruta y verdura'],
  ['albaricoque', 'Fruta y verdura'],
  ['ciruela', 'Fruta y verdura'],
  ['cereza', 'Fruta y verdura'],
  ['fresa', 'Fruta y verdura'],
  ['arándano', 'Fruta y verdura'],
  ['frambuesa', 'Fruta y verdura'],
  ['mango', 'Fruta y verdura'],
  ['piña', 'Fruta y verdura'],
  ['kiwi', 'Fruta y verdura'],
  ['uva', 'Fruta y verdura'],
  ['sandía', 'Fruta y verdura'],
  ['melón', 'Fruta y verdura'],
  ['aguacate', 'Fruta y verdura'],
  ['fruta', 'Fruta y verdura'],
  ['verdura', 'Fruta y verdura'],
  ['hortaliza', 'Fruta y verdura'],

  ['pollo', 'Carne'],
  ['carne', 'Carne'],
  ['ternera', 'Carne'],
  ['cerdo', 'Carne'],
  ['cordero', 'Carne'],
  ['pavo', 'Carne'],
  ['conejo', 'Carne'],
  ['filete', 'Carne'],
  ['solomillo', 'Carne'],
  ['lomo', 'Carne'],
  ['entrecot', 'Carne'],
  ['chuleta', 'Carne'],
  ['costilla', 'Carne'],
  ['pechuga', 'Carne'],
  ['muslo', 'Carne'],
  ['ala', 'Carne'],
  ['hamburguesa', 'Carne'],
  ['albóndiga', 'Carne'],
  ['picada', 'Carne'],
  ['carne picada', 'Carne'],

  ['pescado', 'Pescado'],
  ['salmón', 'Pescado'],
  ['merluza', 'Pescado'],
  ['bacalao', 'Pescado'],
  ['atún', 'Pescado'],
  ['gamba', 'Pescado'],
  ['langostino', 'Pescado'],
  ['mejillón', 'Pescado'],
  ['almeja', 'Pescado'],
  ['calamar', 'Pescado'],
  ['pulpo', 'Pescado'],
  ['boquerón', 'Pescado'],
  ['sardina', 'Pescado'],
  ['trucha', 'Pescado'],
  ['dorada', 'Pescado'],
  ['lubina', 'Pescado'],
  ['rape', 'Pescado'],
  ['lenguado', 'Pescado'],
  ['mariscos', 'Pescado'],
  ['pescadilla', 'Pescado'],

  ['chorizo', 'Charcutería'],
  ['salchicha', 'Charcutería'],
  ['bacon', 'Charcutería'],
  ['jamón', 'Charcutería'],
  ['lomo embuchado', 'Charcutería'],
  ['salchichón', 'Charcutería'],
  ['fuet', 'Charcutería'],
  ['mortadela', 'Charcutería'],
  ['butifarra', 'Charcutería'],
  ['sobrasada', 'Charcutería'],
  ['paté', 'Charcutería'],
  ['charcutería', 'Charcutería'],
  ['embutido', 'Charcutería'],

  ['leche', 'Lácteos'],
  ['queso', 'Lácteos'],
  ['yogur', 'Lácteos'],
  ['mantequilla', 'Lácteos'],
  ['nata', 'Lácteos'],
  ['requesón', 'Lácteos'],
  ['cuajada', 'Lácteos'],
  ['crema de leche', 'Lácteos'],
  ['lácteo', 'Lácteos'],

  ['huevo', 'Huevos'],

  ['pan', 'Panadería'],
  ['baguette', 'Panadería'],
  ['bollo', 'Panadería'],

  ['harina', 'Despensa'],
  ['sal', 'Despensa'],
  ['azúcar', 'Despensa'],
  ['especia', 'Despensa'],
  ['vinagre', 'Despensa'],
  ['aceite', 'Despensa'],
  ['caldo', 'Despensa'],
  ['salsa', 'Despensa'],
  ['levadura', 'Despensa'],
  ['mostaza', 'Despensa'],
  ['kétchup', 'Despensa'],
  ['mayonesa', 'Despensa'],
  ['soja', 'Despensa'],
  ['miel', 'Despensa'],
  ['cacao', 'Despensa'],
  ['gelatina', 'Despensa'],
  ['maizena', 'Despensa'],
  ['pan rallado', 'Despensa'],
  ['almendra', 'Despensa'],
  ['nuez', 'Despensa'],
  ['pipas', 'Despensa'],
  ['fruto seco', 'Despensa'],
  ['semilla', 'Despensa'],
  ['oregano', 'Despensa'],
  ['pimenton', 'Despensa'],
  ['canela', 'Despensa'],
  ['laurel', 'Despensa'],
  ['curry', 'Despensa'],
  ['comino', 'Despensa'],

  ['arroz', 'Pasta, arroz y legumbres'],
  ['pasta', 'Pasta, arroz y legumbres'],
  ['lenteja', 'Pasta, arroz y legumbres'],
  ['garbanzo', 'Pasta, arroz y legumbres'],
  ['alubia', 'Pasta, arroz y legumbres'],
  ['judía', 'Pasta, arroz y legumbres'],
  ['espagueti', 'Pasta, arroz y legumbres'],
  ['macarrón', 'Pasta, arroz y legumbres'],
  ['fideo', 'Pasta, arroz y legumbres'],
  ['cuscús', 'Pasta, arroz y legumbres'],
  ['quinoa', 'Pasta, arroz y legumbres'],
  ['legumbre', 'Pasta, arroz y legumbres'],

  ['conserva', 'Conservas'],
  ['lata', 'Conservas'],
  ['tomate frito', 'Conservas'],
  ['tomate triturado', 'Conservas'],
  ['pimiento asado', 'Conservas'],
  ['espárrago blanco', 'Conservas'],
  ['atún en conserva', 'Conservas'],
  ['mejillón en escabeche', 'Conservas'],

  ['helado', 'Congelados'],
  ['congelado', 'Congelados'],

  ['agua', 'Bebidas'],
  ['vino', 'Bebidas'],
  ['cerveza', 'Bebidas'],
  ['refresco', 'Bebidas'],
  ['zumo', 'Bebidas'],
  ['café', 'Bebidas'],
  ['té', 'Bebidas'],
  ['infusión', 'Bebidas'],
  ['gaseosa', 'Bebidas'],
  ['sidra', 'Bebidas'],
  ['licor', 'Bebidas'],
  ['bebida', 'Bebidas'],

  ['cereal', 'Desayuno y dulces'],
  ['galleta', 'Desayuno y dulces'],
  ['mermelada', 'Desayuno y dulces'],
  ['chocolate', 'Desayuno y dulces'],
  ['nutella', 'Desayuno y dulces'],
  ['magdalena', 'Desayuno y dulces'],
  ['bizcocho', 'Desayuno y dulces'],
  ['pastel', 'Desayuno y dulces'],
  ['dulce', 'Desayuno y dulces'],
  ['desayuno', 'Desayuno y dulces'],
  ['tostada', 'Desayuno y dulces'],
  ['molde', 'Desayuno y dulces'],
]

function inferSection(name: string): string | null {
  const lower = name.toLowerCase().trim()
  for (const [keyword, section] of SECTION_KEYWORDS) {
    if (lower.startsWith(keyword) || lower.includes(keyword)) {
      return section
    }
  }
  return null
}

export function generateShoppingList(
  recipes: RecipeForList[],
  recipeServings: Record<string, number>,
  preferences?: SectionPreferenceMap,
  usualProducts?: UsualProduct[]
): GeneratedItem[] {
  const consolidated = new Map<string, GeneratedItem>()

  for (const recipe of recipes) {
    const targetServings = recipeServings[recipe.id] ?? recipe.baseServings

    const ingredients: IngredientInput[] = recipe.ingredients.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      optional: i.optional,
      notes: null,
    }))

    const scaled = scaleIngredients(ingredients, recipe.baseServings, targetServings)

    for (const ing of scaled.ingredients) {
      const key = `${ing.name}-${ing.unit}`.toLowerCase()
      const existing = consolidated.get(key)

      const sourceLabel = `${recipe.name} (${targetServings} pers.)`

      if (existing) {
        existing.quantity += ing.roundedQuantity
        if (!existing.recipeSources.includes(sourceLabel)) {
          existing.recipeSources.push(sourceLabel)
        }
        if (!ing.optional) existing.optional = false
      } else {
        const recipeIngredient = recipe.ingredients.find(
          (ri) => ri.name.toLowerCase() === ing.name.toLowerCase()
        )
        const preferenceKey = recipeIngredient?.ingredientId
          ? `ingredient:${recipeIngredient.ingredientId}`
          : null

        const preferredSection = preferenceKey && preferences?.[preferenceKey]
          ? preferences[preferenceKey]
          : null

        const legacyLabel = recipeIngredient ? inferSection(recipeIngredient.name) : null
        const canonicalLabel = legacyLabel ? (LEGACY_TO_CANONICAL[legacyLabel] ?? legacyLabel) : null

        consolidated.set(key, {
          name: ing.name,
          quantity: ing.roundedQuantity,
          unit: ing.unit,
          section: preferredSection ?? canonicalLabel ?? null,
          recipeSources: [sourceLabel],
          optional: ing.optional,
        })
      }
    }
  }

  if (usualProducts && usualProducts.length > 0) {
    for (const up of usualProducts) {
      if (up.frequency !== 'weekly') continue
      const key = `${up.name}-${up.unit}`.toLowerCase()
      if (!consolidated.has(key)) {
        const section = up.section ?? inferSection(up.name)
        consolidated.set(key, {
          name: up.name,
          quantity: up.quantity ?? 1,
          unit: up.unit,
          section,
          recipeSources: ['Producto habitual'],
          optional: false,
        })
      }
    }
  }

  return Array.from(consolidated.values()).sort((a, b) => {
    const aIdx = a.section ? getSectionOrder(a.section) : 999
    const bIdx = b.section ? getSectionOrder(b.section) : 999
    if (aIdx !== bIdx) return aIdx - bIdx
    return a.name.localeCompare(b.name)
  })
}
