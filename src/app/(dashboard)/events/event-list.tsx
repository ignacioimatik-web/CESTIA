'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Users,
  Plus,
  MoreHorizontal,
  Trash2,
  Copy,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FadeIn, StaggerList, StaggerItem } from '@/components/shared/animations'
import { getEventType } from '@/lib/constants/event-types'
import { getEvents, deleteEvent, duplicateEvent, saveAsTemplate } from './actions'

type EventSummary = {
  id: string
  name: string
  event_type: string
  date: string
  adults: number
  children: number
  created_at: string
}

export function EventList() {
  const router = useRouter()
  const [events, setEvents] = useState<EventSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvents().then(setEvents).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este evento?')) return
    await deleteEvent(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateEvent(id)
      const fresh = await getEvents()
      setEvents(fresh)
    } catch { /* ignore */ }
  }

  async function handleSaveTemplate(id: string) {
    const name = prompt('Nombre para la plantilla:')
    if (!name) return
    try {
      await saveAsTemplate(id, name)
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 skeleton rounded-xl" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <FadeIn>
        <Card className="border-dashed mt-4">
          <CardContent className="py-12 text-center">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Sin eventos</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Crea tu primer evento en menos de un minuto</p>
            <Link href="/events/new">
              <Button size="sm" className="mt-4 rounded-lg">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Crear evento
              </Button>
            </Link>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <StaggerList className="space-y-2 mt-4">
      {sorted.map((event) => {
        const config = getEventType(event.event_type)
        const Icon = config?.icon ?? Calendar
        const date = new Date(event.date).toLocaleDateString('es-ES', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })

        return (
          <StaggerItem key={event.id}>
            <Card
              className="card-hover cursor-pointer border shadow-sm"
              onClick={() => router.push(`/events/${event.id}`)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${config?.color ?? 'bg-muted'} bg-opacity-20`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{event.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {config?.label ?? event.event_type} · {date}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.adults + event.children} pers.
                    </span>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => handleDuplicate(event.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSaveTemplate(event.id)}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar como plantilla
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        )
      })}
    </StaggerList>
  )
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter()
  return (
    <button onClick={() => router.push(href)}>
      {children}
    </button>
  )
}
