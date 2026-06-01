'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Users,
  ShoppingCart,
  Trash2,
  Copy,
  Save,
  Loader2,
  Utensils,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getEventType } from '@/lib/constants/event-types'
import {
  deleteEvent,
  duplicateEvent,
  saveAsTemplate,
  generateShoppingListFromEvent,
  getRecipesForEvent,
  updateEvent,
} from '../actions'

type EventDetail = Awaited<ReturnType<typeof import('../actions').getEvent>>

export function EventDetailView({ event }: { event: NonNullable<EventDetail> }) {
  const router = useRouter()
  const config = getEventType(event.event_type)
  const [deleting, setDeleting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [listCreated, setListCreated] = useState<string | null>(null)

  const totalPeople = event.adults + event.children
  const dateFormatted = new Date(event.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  async function handleDelete() {
    if (!confirm('¿Eliminar este evento?')) return
    setDeleting(true)
    try {
      await deleteEvent(event.id)
      router.push('/events')
    } catch {
      setDeleting(false)
    }
  }

  async function handleDuplicate() {
    try {
      const newId = await duplicateEvent(event.id)
      router.push(`/events/${newId}`)
    } catch { /* ignore */ }
  }

  async function handleSaveTemplate() {
    const name = prompt('Nombre para la plantilla:')
    if (!name) return
    try {
      await saveAsTemplate(event.id, name)
    } catch { /* ignore */ }
  }

  async function handleGenerateList() {
    setGenerating(true)
    try {
      const listId = await generateShoppingListFromEvent(event.id)
      setListCreated(listId)
    } catch {
      setGenerating(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <button
        onClick={() => router.push('/events')}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Todos los eventos
      </button>

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {config && <config.icon className={`h-6 w-6 shrink-0 ${config.color}`} />}
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{event.name}</h1>
              <p className="text-sm text-muted-foreground">{config?.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveTemplate}>
              <Save className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {dateFormatted}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {totalPeople} persona{totalPeople !== 1 ? 's' : ''}
            {event.adults > 0 && ` (${event.adults} adulto${event.adults > 1 ? 's' : ''}`}
            {event.children > 0 && `, ${event.children} niño${event.children > 1 ? 's' : ''}`}
            {event.adults > 0 && ')'}
          </span>
        </div>

        {event.notes && (
          <p className="text-sm text-muted-foreground">{event.notes}</p>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Recetas ({event.recipes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {event.recipes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin recetas asignadas
              </p>
            ) : (
              <div className="space-y-2">
                {event.recipes.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-border/40 last:border-0">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium truncate">{r.recipe?.name ?? 'Receta'}</span>
                      {r.recipe?.description && (
                        <p className="text-[10px] text-muted-foreground truncate">{r.recipe.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0 ml-2">
                      {r.servings} raciones
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {event.extraProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Productos extra ({event.extraProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {event.extraProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm py-1">
                    <span className="font-medium tabular-nums">{p.quantity}</span>
                    <span className="text-muted-foreground">{p.unit}</span>
                    <span className="flex-1">{p.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {listCreated ? (
            <Button
              className="h-12 text-base"
              onClick={() => router.push(`/shopping-lists/${listCreated}`)}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Ver lista de compra
            </Button>
          ) : (
            <Button
              className="h-12 text-base"
              onClick={handleGenerateList}
              disabled={generating || event.recipes.length === 0}
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              Generar lista de compra
            </Button>
          )}

          <Button
            variant="outline"
            className="h-12 text-base"
            onClick={() => router.push(`/events/${event.id}/edit`)}
          >
            Editar evento
          </Button>
        </div>
      </div>
    </div>
  )
}
