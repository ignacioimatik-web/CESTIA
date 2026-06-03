'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { ShoppingListItemData } from '@/app/(dashboard)/shopping-lists/actions'

type Props = {
  listName: string
  items: ShoppingListItemData[]
}

export function AiRecipeButton({ listName, items }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState<{
    name: string
    description: string
    prep_time_minutes: number
    cook_time_minutes: number
    base_servings: number
    difficulty: string
    tags: string[]
    ingredients: { name: string; quantity: number; unit: string }[]
    steps: string[]
  } | null>(null)
  const [error, setError] = useState('')

  const uncheckedItems = items.filter((i) => !i.isChecked)
  const actionableItems = uncheckedItems.length > 0 ? uncheckedItems : items

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setRecipe(null)

    try {
      const res = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listName,
          items: actionableItems.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 503) {
          setError('IA no configurada. El administrador debe añadir una API key de OpenAI.')
        } else {
          setError(data.error ?? 'Error generando receta')
        }
        return
      }

      setRecipe(data.recipe)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => { setOpen(true); handleGenerate() }}
        className="rounded-xl h-10"
      >
        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
        Receta con IA
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {loading ? 'Generando receta...' : recipe?.name ?? 'Receta con IA'}
            </DialogTitle>
            <DialogDescription>
              {loading
                ? 'Analizando los ingredientes de tu lista...'
                : recipe?.description ?? ''}
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Creando receta con los ingredientes disponibles...</p>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</div>
          )}

          {recipe && !loading && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="bg-muted px-2 py-1 rounded-md">{recipe.base_servings} raciones</span>
                <span className="bg-muted px-2 py-1 rounded-md">{recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
                <span className="bg-muted px-2 py-1 rounded-md capitalize">{recipe.difficulty}</span>
                {recipe.tags?.slice(0, 3).map((t) => (
                  <span key={t} className="bg-muted px-2 py-1 rounded-md">{t}</span>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Ingredientes</h4>
                <ul className="space-y-1 text-sm">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {ing.name} {ing.quantity > 0 ? `(${ing.quantity} ${ing.unit})` : ''}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Elaboración</h4>
                <ol className="space-y-2 text-sm">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-medium text-primary shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cerrar</Button>} />
            {recipe && !loading && (
              <Button onClick={() => { setOpen(false); setRecipe(null); setError(''); }}>
                Guardar receta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
