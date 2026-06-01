import { Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/shared/animations'
import { EventList } from './event-list'

export default function EventsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <FadeIn>
        <div className="mb-6">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Eventos</span>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Eventos</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">Crea eventos con recetas y genera la lista de compra</p>
            </div>
            <Link href="/events/new">
              <Button className="rounded-xl">
                <Plus className="h-4 w-4 mr-1.5" />
                Nuevo evento
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>
      <EventList />
    </div>
  )
}
