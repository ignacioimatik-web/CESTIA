import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const quickEvents = ['Cumpleanos infantil', 'Cena romantica', 'Comida familiar', 'Barbacoa', 'Merienda', 'Navidad', 'Batch cooking', 'Cena informal']

export function QuickEventsPanel() {
  return (
    <Card className="warm-panel">
      <CardHeader className="pb-2"><CardTitle className="text-base">Eventos rapidos</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {quickEvents.map((eventName) => (
          <div key={eventName} className="warm-surface rounded-xl p-3 space-y-2">
            <p className="text-sm font-semibold">{eventName}</p>
            <p className="text-xs text-muted-foreground">Configura adultos/ninos y genera lista.</p>
            <Link href="/events/new"><Button className="h-10 w-full">Crear evento</Button></Link>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
