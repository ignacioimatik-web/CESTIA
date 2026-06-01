'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RecipeSelector } from '@/components/shopping-list/recipe-selector'
import { generateShoppingList, type RecipeForList } from '@/lib/utils/shopping-list-generator'
import { createShoppingList, getRecipesForList, getUserSectionPreferences } from '../actions'

type Step = 'select-recipes' | 'review'

export default function NewShoppingListPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('select-recipes')
  const [loading, setLoading] = useState(false)
  const [loadingRecipes, setLoadingRecipes] = useState(true)
  const [recipes, setRecipes] = useState<RecipeForList[]>([])
  const [listName, setListName] = useState('')
  const [selectedRecipes, setSelectedRecipes] = useState<RecipeForList[]>([])
  const [recipeServings, setRecipeServings] = useState<Record<string, number>>({})
  const [preferences, setPreferences] = useState<Record<string, string | null>>({})

  useEffect(() => {
    Promise.all([
      getRecipesForList(),
      getUserSectionPreferences(),
    ]).then(([r, prefs]) => {
      setRecipes(r.filter((r) => r.ingredients.length > 0))
      setPreferences(prefs)
      setLoadingRecipes(false)
    })
  }, [])

  function handleRecipesSelected(
    selected: { recipe: RecipeForList; servings: number }[]
  ) {
    const rfl = selected.map((s) => s.recipe)
    const servings: Record<string, number> = {}
    for (const sel of selected) {
      servings[sel.recipe.id] = sel.servings
    }

    setSelectedRecipes(rfl)
    setRecipeServings(servings)
    setListName(
      selected.length === 1
        ? `Compra: ${selected[0].recipe.name}`
        : `Compra (${selected.length} recetas)`
    )
    setStep('review')
  }

  async function handleCreate() {
    setLoading(true)
    const items = generateShoppingList(selectedRecipes, recipeServings, preferences)
    const id = await createShoppingList({
      name: listName.trim() || 'Lista de compra',
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        section: i.section,
        recipeSources: i.recipeSources,
        optional: i.optional,
      })),
    })
    router.push(`/shopping-lists/${id}`)
  }

  if (step === 'select-recipes') {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <Link
          href="/shopping-lists"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Link>
        <h1 className="text-xl font-semibold mb-1">Nueva lista de compra</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Selecciona las recetas para generar la lista
        </p>
        {loadingRecipes ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 skeleton rounded-xl" />
            ))}
          </div>
        ) : (
          <RecipeSelector recipes={recipes} onComplete={handleRecipesSelected} />
        )}
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <button
        onClick={() => setStep('select-recipes')}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Cambiar recetas
      </button>

      <h1 className="text-xl font-semibold mb-1">Revisar lista</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {selectedRecipes.length} receta{selectedRecipes.length !== 1 ? 's' : ''} seleccionada{selectedRecipes.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-4 warm-panel rounded-2xl p-4 sm:p-5">
        <div>
          <Label htmlFor="name">Nombre de la lista</Label>
          <Input
            id="name"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="border rounded-xl divide-y">
          <div className="px-4 py-3 bg-muted/30 font-medium text-sm flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Resumen
          </div>
          {selectedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="px-4 py-3 flex items-center justify-between text-sm"
            >
              <span>{recipe.name}</span>
              <span className="text-muted-foreground">
                {recipeServings[recipe.id] ?? recipe.baseServings} pers.
              </span>
            </div>
          ))}
        </div>

        <Button className="w-full h-12 rounded-xl text-base" onClick={handleCreate} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Crear lista
        </Button>
      </div>
    </div>
  )
}
