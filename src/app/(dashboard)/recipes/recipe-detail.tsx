'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ServingsSelector } from '@/components/recipes/servings-selector'
import { FadeIn, StaggerList, StaggerItem } from '@/components/shared/animations'
import {
  Clock, Users, ChefHat, Pencil, Trash2, ArrowLeft,
  Globe, Lock, AlertTriangle, CookingPot, ShoppingCart,
} from 'lucide-react'
import { deleteRecipe } from './actions'
import { cn } from '@/lib/utils'
import { scaleIngredients, formatScaledQuantity } from '@/lib/utils/scaling'
import { suggestServings, generateSummary, type HouseholdComposition } from '@/lib/household/multiplier'
import type { RecipeDetail } from './actions'

type Props = {
  recipe: RecipeDetail
  isOwner: boolean
  household: {
    adults: number
    teenagers: number
    young_children: number
    frequent_guests: number
  } | null
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Fácil', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  medium: { label: 'Media', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  hard: { label: 'Difícil', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
}

export function RecipeDetailView({ recipe, isOwner, household }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [servings, setServings] = useState(recipe.base_servings)

  const scaled = useMemo(() => {
    const ingredients = recipe.ingredients.map((i) => ({
      name: i.ingredient_name,
      quantity: i.quantity,
      unit: i.unit,
      optional: i.optional,
      notes: i.notes,
    }))

    const result = scaleIngredients(ingredients, recipe.base_servings, servings)
    return result.ingredients
  }, [recipe.ingredients, recipe.base_servings, servings])

  const householdComp: HouseholdComposition | null = household ? {
    adults: household.adults,
    teenagers: household.teenagers,
    youngChildren: household.young_children,
    frequentGuests: household.frequent_guests,
  } : null

  const hasRoundingNotes = scaled.some((i) => i.roundingNote)

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta receta?')) return
    setDeleting(true)
    try {
      await deleteRecipe(recipe.id)
      toast.success('Receta eliminada')
      router.push('/recipes')
    } catch {
      toast.error('Error al eliminar la receta')
    } finally {
      setDeleting(false)
    }
  }

  const diff = recipe.difficulty ? difficultyConfig[recipe.difficulty] : null

  return (
    <div className="max-w-3xl mx-auto px-1">
      {/* Header nav */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/recipes">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <Link href={`/shopping-lists/new?recipe=${recipe.id}`}>
              <Button variant="outline" size="sm" className="h-10 rounded-xl px-3">
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              Lista
            </Button>
          </Link>
          {isOwner && (
            <>
              <Link href={`/recipes/${recipe.id}/edit`}>
                <Button variant="outline" size="sm" className="h-10 rounded-xl px-3">
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Editar
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                disabled={deleting}
                onClick={handleDelete}
                className="h-10 rounded-xl text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      <FadeIn>
        {/* Title & meta */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{recipe.name}</h1>
              {recipe.description && (
                <p className="text-muted-foreground mt-1.5 text-sm sm:text-base leading-relaxed">
                  {recipe.description}
                </p>
              )}
            </div>
            {recipe.is_public ? (
              <Globe className="h-5 w-5 shrink-0 text-muted-foreground/60 mt-1.5" />
            ) : (
              <Lock className="h-5 w-5 shrink-0 text-muted-foreground/60 mt-1.5" />
            )}
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {recipe.base_servings} raciones
            </span>
            {recipe.prep_time_minutes !== null && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Prep: {recipe.prep_time_minutes} min
              </span>
            )}
            {recipe.cook_time_minutes !== null && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Cocción: {recipe.cook_time_minutes} min
              </span>
            )}
            {diff && (
              <span className={cn('inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium', diff.color)}>
                <ChefHat className="h-3.5 w-3.5" />
                {diff.label}
              </span>
            )}
          </div>

          {/* Category & tags */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {recipe.category && (
              <Badge variant="outline" className="text-xs">{recipe.category}</Badge>
            )}
            {recipe.tags.length > 0 && recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Servings + household */}
        <Card className="mb-6 warm-panel bg-muted/20">
          <CardContent className="p-4 sm:p-5">
            <ServingsSelector
              baseServings={recipe.base_servings}
              value={servings}
              onChange={setServings}
            />

            {householdComp && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Tu hogar: {generateSummary(householdComp)}.
                  {' '}
                  <button
                    className="underline hover:text-foreground cursor-pointer font-medium"
                    onClick={() => setServings(suggestServings(householdComp, recipe.base_servings))}
                  >
                    Sugerir {suggestServings(householdComp, recipe.base_servings)} raciones
                  </button>
                </span>
              </div>
            )}

            {hasRoundingNotes && (
              <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 text-xs mt-3 pt-3 border-t border-border/50">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Algunas cantidades son aproximadas. Ajusta al gusto.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ingredients */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">
              Ingredientes
              <span className="text-muted-foreground font-normal ml-1">({scaled.length})</span>
            </h2>
            {servings !== recipe.base_servings && (
              <span className="text-xs text-muted-foreground">
                Escalado: {recipe.base_servings} → {servings}
              </span>
            )}
          </div>

          <div className="space-y-0.5">
            {scaled.map((ing) => (
              <div
                key={`${ing.name}-${ing.unit}`}
                className="flex items-center gap-3 text-sm py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                <span className="font-medium tabular-nums shrink-0 min-w-[4rem] text-right text-foreground">
                  {formatScaledQuantity(ing.roundedQuantity, ing.unit)}
                </span>
                <span className="flex-1 min-w-0">
                  {ing.name}
                  {ing.optional && (
                    <span className="text-xs text-muted-foreground italic ml-1">(opcional)</span>
                  )}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {ing.notes && (
                    <span className="text-[10px] text-muted-foreground italic hidden sm:block max-w-20 truncate" title={ing.notes}>
                      {ing.notes}
                    </span>
                  )}
                  {ing.roundingNote && (
                    <span className="text-[10px] text-muted-foreground italic">{ing.roundingNote}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        {recipe.instructions && (
          <div>
            <Separator className="mb-6" />
            <div>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <CookingPot className="h-4 w-4 text-muted-foreground" />
                Instrucciones
              </h2>
              <div className="text-sm leading-relaxed whitespace-pre-line text-foreground/90 bg-muted/20 rounded-xl p-4 sm:p-5">
                {recipe.instructions}
              </div>
            </div>
          </div>
        )}
      </FadeIn>
    </div>
  )
}
