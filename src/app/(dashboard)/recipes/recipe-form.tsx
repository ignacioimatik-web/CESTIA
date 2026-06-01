'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createRecipe,
  updateRecipe,
  addRecipeIngredient,
  updateRecipeIngredient,
  deleteRecipeIngredient,
  searchIngredients,
} from './actions'
import type { RecipeDetail, IngredientFormData } from './actions'
import { Plus, Trash2, Save, X, Check, ChefHat } from 'lucide-react'

const CATEGORIES = [
  'Entrantes', 'Ensaladas', 'Sopas y Cremas', 'Arroces',
  'Pastas', 'Carnes', 'Pescados', 'Verduras', 'Legumbres',
  'Postres', 'Repostería', 'Salsas', 'Bebidas',
]

const UNITS = ['g', 'kg', 'ml', 'l', 'ud', 'tsp', 'tbsp', 'cup', 'pizca', 'lata', 'paquete', 'chorro', 'ramita', 'diente', 'loncha', 'hoja', 'cucharada', 'cucharadita']

const DIFFICULTIES = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Media' },
  { value: 'hard', label: 'Difícil' },
]

type IngredientRow = IngredientFormData & { id?: string; _key: string }

type Props = {
  recipe?: RecipeDetail | null
}

export function RecipeForm({ recipe }: Props) {
  const router = useRouter()
  const isEdit = !!recipe

  const [name, setName] = useState(recipe?.name ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [baseServings, setBaseServings] = useState(recipe?.base_servings ?? 4)
  const [prepTime, setPrepTime] = useState(recipe?.prep_time_minutes?.toString() ?? '')
  const [cookTime, setCookTime] = useState(recipe?.cook_time_minutes?.toString() ?? '')
  const [difficulty, setDifficulty] = useState(recipe?.difficulty ?? '')
  const [category, setCategory] = useState(recipe?.category ?? '')
  const [instructions, setInstructions] = useState(recipe?.instructions ?? '')
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState<string[]>(recipe?.tags ?? [])
  const [isPublic, setIsPublic] = useState(recipe?.is_public ?? true)
  const [saving, setSaving] = useState(false)

  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    recipe?.ingredients.map((i) => ({
      id: i.id,
      _key: i.id,
      ingredient_name: i.ingredient_name,
      quantity: i.quantity,
      unit: i.unit,
      optional: i.optional,
      notes: i.notes,
    })) ?? []
  )

  const [newName, setNewName] = useState('')
  const [newQty, setNewQty] = useState('')
  const [newUnit, setNewUnit] = useState('g')
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const searchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) { setSuggestions([]); return }
    const results = await searchIngredients(q)
    setSuggestions(results)
    setShowSuggestions(results.length > 0)
  }, [])

  const onNewNameChange = (v: string) => {
    setNewName(v)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchSuggestions(v), 200)
  }

  const pickSuggestion = (name: string) => {
    setNewName(name)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const addIngredient = () => {
    if (!newName.trim() || !newQty) return
    setIngredients((prev) => [
      ...prev,
      { _key: `new-${Date.now()}`, ingredient_name: newName.trim(), quantity: parseFloat(newQty), unit: newUnit, optional: false },
    ])
    setNewName('')
    setNewQty('')
    setNewUnit('g')
    setSuggestions([])
  }

  const removeIngredient = (key: string) => {
    setIngredients((prev) => prev.filter((i) => i._key !== key))
  }

  const toggleOptional = (key: string) => {
    setIngredients((prev) =>
      prev.map((i) => (i._key === key ? { ...i, optional: !i.optional } : i))
    )
  }

  const addTag = () => {
    const t = tagsInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagsInput('')
  }

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t))

  const handleSave = async (draft?: boolean) => {
    if (!name.trim()) { toast.error('El nombre es obligatorio'); return }
    setSaving(true)
    try {
      const data = {
        name: name.trim(),
        description: description || null,
        base_servings: baseServings,
        prep_time_minutes: prepTime ? parseInt(prepTime) : null,
        cook_time_minutes: cookTime ? parseInt(cookTime) : null,
        difficulty: difficulty || null,
        category: category || null,
        instructions: instructions || null,
        tags,
        is_public: !draft,
      }

      let recipeId: string
      if (isEdit) {
        await updateRecipe(recipe!.id, data)
        recipeId = recipe!.id
      } else {
        recipeId = await createRecipe(data)
      }

      for (const ing of ingredients) {
        if (ing.id) {
          await updateRecipeIngredient(ing.id, {
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity,
            unit: ing.unit,
            optional: ing.optional,
            notes: ing.notes,
          })
        } else {
          await addRecipeIngredient(recipeId, {
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity,
            unit: ing.unit,
            optional: ing.optional,
            notes: ing.notes,
          })
        }
      }

      toast.success(isEdit ? 'Receta actualizada' : 'Receta creada')
      router.push(`/recipes/${recipeId}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <CardSection title="Información básica">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tortilla de Patatas" className="h-11" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc">Descripción</Label>
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Una breve descripción..." rows={2} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="servings">Raciones</Label>
            <Input id="servings" type="number" min={1} value={baseServings} onChange={(e) => setBaseServings(parseInt(e.target.value) || 4)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prep">Preparación</Label>
            <Input id="prep" type="number" min={0} placeholder="min" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cook">Cocinado</Label>
            <Input id="cook" type="number" min={0} placeholder="min" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="h-11" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificultad</Label>
            <Select value={difficulty || null} onValueChange={(v) => setDifficulty(v ?? '')}>
              <SelectTrigger id="difficulty" className="h-11"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={category || null} onValueChange={(v) => setCategory(v ?? '')}>
              <SelectTrigger id="category" className="h-11"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Etiquetas</Label>
          <div className="flex gap-2">
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Añadir etiqueta..." className="h-11" />
            <Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0" onClick={addTag}><Plus className="h-4 w-4" /></Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button onClick={() => removeTag(t)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
          <span className="text-sm">Receta pública (visible para otros usuarios)</span>
        </label>
      </CardSection>

      <CardSection title="Ingredientes" description={ingredients.length > 0 ? `${ingredients.length} ingredientes` : undefined}>
        {ingredients.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {ingredients.map((ing) => (
              <div key={ing._key} className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg px-3 py-2">
                <span className="font-medium tabular-nums shrink-0 w-14 text-right">{ing.quantity}</span>
                <span className="text-muted-foreground shrink-0 w-12">{ing.unit}</span>
                <span className="flex-1 min-w-0 truncate">{ing.ingredient_name}</span>
                {ing.optional && <span className="text-[10px] text-muted-foreground italic shrink-0">opcional</span>}
                <button onClick={() => toggleOptional(ing._key)} className="shrink-0 text-muted-foreground hover:text-foreground">
                  <Check className={`h-3.5 w-3.5 ${ing.optional ? 'text-amber-500' : ''}`} />
                </button>
                <button onClick={() => removeIngredient(ing._key)} className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 relative">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Ingrediente</Label>
            <Input value={newName} onChange={(e) => onNewNameChange(e.target.value)} placeholder="Nombre" className="h-11" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())} />
            {showSuggestions && (
              <div ref={suggestRef} className="absolute z-10 top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg max-h-40 overflow-auto">
                {suggestions.map((s) => (
                  <button key={s.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-muted" onClick={() => pickSuggestion(s.name)}>
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-16 space-y-1">
            <Label className="text-xs">Cant.</Label>
            <Input type="number" step="0.01" min={0} value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="0" className="h-11" />
          </div>
          <div className="w-20 space-y-1">
            <Label className="text-xs">Unidad</Label>
            <Select value={newUnit} onValueChange={(v) => setNewUnit(v ?? 'g')}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" size="icon" className="h-11 w-11 shrink-0 mb-0" onClick={addIngredient} disabled={!newName.trim() || !newQty}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardSection>

      <CardSection title="Instrucciones" description="Pasos para preparar la receta">
        <div className="space-y-2">
          <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="1. Lavar y cortar los ingredientes&#10;2. ..." rows={6} />
        </div>
      </CardSection>

      <div className="flex gap-3 pb-8">
        <Button className="flex-1 h-12 text-base gap-2" disabled={saving} onClick={() => handleSave(false)}>
          <Save className="h-4 w-4" />
          {saving ? 'Guardando...' : isEdit ? 'Actualizar receta' : 'Guardar receta'}
        </Button>
        {!isEdit && (
          <Button variant="outline" className="h-12" disabled={saving} onClick={() => handleSave(true)}>
            <ChefHat className="h-4 w-4" />
            Borrador
          </Button>
        )}
      </div>
    </div>
  )
}

function CardSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="warm-panel rounded-2xl p-4 sm:p-5 space-y-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}
