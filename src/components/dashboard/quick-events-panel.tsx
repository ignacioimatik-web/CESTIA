import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const quickEvents = ['Cumpleanos infantil', 'Cena romantica', 'Comida familiar', 'Barbacoa', 'Merienda', 'Navidad', 'Batch cooking', 'Cena informal']

function defaultPeople(eventName: string) {
  if (eventName === 'Cumpleanos infantil') return { adults: 8, children: 10 }
  if (eventName === 'Cena romantica') return { adults: 2, children: 0 }
  if (eventName === 'Comida familiar') return { adults: 6, children: 3 }
  if (eventName === 'Barbacoa') return { adults: 10, children: 4 }
  if (eventName === 'Merienda') return { adults: 4, children: 4 }
  if (eventName === 'Navidad') return { adults: 10, children: 5 }
  if (eventName === 'Batch cooking') return { adults: 2, children: 0 }
  return { adults: 4, children: 1 }
}

export function QuickEventsPanel() {
  return (
    <Card className="warm-panel">
      <CardHeader className="pb-2"><CardTitle className="text-base">Eventos rapidos</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {quickEvents.map((eventName) => (
          <div key={eventName} className="warm-surface rounded-xl p-3 space-y-2">
            <p className="text-sm font-semibold">{eventName}</p>
            <p className="text-xs text-muted-foreground">Configura adultos/ninos y genera lista.</p>
            <Link href={`/events/new?template=${encodeURIComponent(eventName)}&adults=${defaultPeople(eventName).adults}&children=${defaultPeople(eventName).children}`}><Button className="h-10 w-full">Crear evento</Button></Link>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
