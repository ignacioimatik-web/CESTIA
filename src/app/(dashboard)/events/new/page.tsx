'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { FadeIn } from '@/components/shared/animations'
import {
  EVENT_TYPES,
  getEventType,
} from '@/lib/constants/event-types'
import { createEvent, getRecipesForEvent } from '../actions'

export default function NewEventPage() {
  const router = useRouter()
  const [step, setStep] = useState<'type' | 'details'>('type')
  const [saving, setSaving] = useState(false)
  const [recipes, setRecipes] = useState<{ id: string; name: string; base_servings: number }[]>([])

  // Form state
  const [eventType, setEventType] = useState<string>('family_dinner')
  const [name, setName] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [notes, setNotes] = useState('')
  const [selectedRecipes, setSelectedRecipes] = useState<{ recipe_id: string; servings: number }[]>([])
  const [extraProducts, setExtraProducts] = useState<{ name: string; quantity: number; unit: string }[]>([])

  useEffect(() => {
    getRecipesForEvent().then(setRecipes)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const template = params.get('template')
    const adultsParam = params.get('adults')
    const childrenParam = params.get('children')
    if (!template) return

    queueMicrotask(() => {
      setName(template)
      setAdults(adultsParam ? Math.max(0, Number(adultsParam) || 0) : 2)
      setChildren(childrenParam ? Math.max(0, Number(childrenParam) || 0) : 0)
      setStep('details')
    })
  }, [])

  function selectType(type: string) {
    const config = getEventType(type)
    setEventType(type)
    setAdults(config?.defaultAdults ?? 2)
    setChildren(config?.defaultChildren ?? 0)
    setName(config?.label ?? '')
    setStep('details')
  }

  function addRecipe() {
    if (recipes.length === 0) return
    const recipe = recipes[0]
    setSelectedRecipes((prev) => [...prev, { recipe_id: recipe.id, servings: recipe.base_servings }])
  }

  function removeRecipe(idx: number) {
    setSelectedRecipes((prev) => prev.filter((_, i) => i !== idx))
  }

  function addProduct() {
    setExtraProducts((prev) => [...prev, { name: '', quantity: 1, unit: 'ud' }])
  }

  function removeProduct(idx: number) {
    setExtraProducts((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const id = await createEvent({
        name,
        event_type: eventType,
        date,
        adults,
        children,
        notes: notes || null,
        recipes: selectedRecipes,
        extra_products: extraProducts.filter((p) => p.name.trim()),
      })
      router.push(`/events/${id}`)
    } catch {
      setSaving(false)
    }
  }

  const config = getEventType(eventType)
  const Icon = config?.icon

  if (step === 'type') {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <FadeIn>
          <button
            onClick={() => router.push('/events')}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">Nuevo evento</h1>
          <p className="text-sm text-muted-foreground mb-6">
            ¿Qué tipo de evento quieres crear?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EVENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => selectType(type.id)}
                className="flex items-start gap-4 p-4 rounded-xl border text-left hover:bg-muted/50 hover:border-primary/30 transition-all card-hover"
              >
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${type.color} bg-opacity-20`}>
                  <type.icon className={`h-5 w-5 ${type.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{type.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{type.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {type.defaultAdults} adultos · {type.defaultChildren} niños
                  </p>
                </div>
              </button>
            ))}
          </div>
        </FadeIn>
      </div>
    )
  }

  return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <FadeIn>
          <button
            onClick={() => setStep('type')}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Cambiar tipo
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="border shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  {Icon && <Icon className={`h-5 w-5 ${config?.color}`} />}
                  <div>
                    <h1 className="text-lg font-semibold">{config?.label}</h1>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nombre del evento</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-10 rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="date">Fecha</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-10 rounded-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="adults">Adultos</Label>
                    <Input id="adults" type="number" min={0} value={adults} onChange={(e) => setAdults(Math.max(0, parseInt(e.target.value) || 0))} className="h-10 rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="children">Niños</Label>
                    <Input id="children" type="number" min={0} value={children} onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))} className="h-10 rounded-lg" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notas</Label>
                  <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alergias, preferencias..." className="h-10 rounded-lg" />
                </div>
              </CardContent>
            </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Recetas</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRecipe} className="rounded-lg">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Añadir receta
              </Button>
            </div>
            {selectedRecipes.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Añade recetas para este evento
              </p>
            )}
            {selectedRecipes.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select
                  value={r.recipe_id}
                  onValueChange={(v: string | null) => {
                    setSelectedRecipes((prev) => {
                      const next = [...prev]
                      next[i] = { ...next[i], recipe_id: v ?? r.recipe_id }
                      return next
                    })
                  }}
                >
                  <SelectTrigger className="flex-1 h-9">
                    <SelectValue placeholder="Seleccionar receta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map((rec) => (
                      <SelectItem key={rec.id} value={rec.id}>{rec.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={r.servings}
                  onChange={(e) => {
                    setSelectedRecipes((prev) => {
                      const next = [...prev]
                      next[i] = { ...next[i], servings: parseInt(e.target.value) || 1 }
                      return next
                    })
                  }}
                  className="w-16 h-9 text-center"
                  title="Raciones"
                />
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeRecipe(i)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Productos extra</Label>
              <Button type="button" variant="outline" size="sm" onClick={addProduct} className="rounded-lg">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Añadir producto
              </Button>
            </div>
            {extraProducts.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Añade productos que no están en las recetas
              </p>
            )}
            {extraProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={p.name}
                  onChange={(e) => {
                    setExtraProducts((prev) => {
                      const next = [...prev]
                      next[i] = { ...next[i], name: e.target.value }
                      return next
                    })
                  }}
                  placeholder="Producto..."
                  className="flex-1 h-9"
                />
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={p.quantity}
                  onChange={(e) => {
                    setExtraProducts((prev) => {
                      const next = [...prev]
                      next[i] = { ...next[i], quantity: parseFloat(e.target.value) || 0 }
                      return next
                    })
                  }}
                  className="w-16 h-9 text-center"
                />
                <Input
                  value={p.unit}
                  onChange={(e) => {
                    setExtraProducts((prev) => {
                      const next = [...prev]
                      next[i] = { ...next[i], unit: e.target.value }
                      return next
                    })
                  }}
                  className="w-14 h-9 text-center"
                />
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeProduct(i)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={saving}>
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Crear evento
            </>
          )}
        </Button>
      </form>
        </FadeIn>
    </div>
  )
}
