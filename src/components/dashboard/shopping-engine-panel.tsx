import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, CookingPot, ShoppingCart, Store } from 'lucide-react'

const cards = [
  { key: 'recipes', title: 'Desde recetas', description: 'Selecciona recetas y genera ingredientes escalados.', href: '/shopping-lists/new', Icon: CookingPot },
  { key: 'menu', title: 'Desde menu semanal', description: 'Convierte tu semana en una lista organizada.', href: '/shopping-lists/new', Icon: Calendar },
  { key: 'event', title: 'Desde evento', description: 'Cumpleanos, cenas y reuniones con lista automatica.', href: '/events/new', Icon: ShoppingCart },
  { key: 'store', title: 'Desde supermercado', description: 'Anade productos por seccion del catalogo activo.', href: '/shopping-lists', Icon: Store },
]

export function ShoppingEnginePanel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {cards.map(({ key, title, description, href, Icon }) => (
        <Card key={key} className="warm-panel">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><Icon className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
            <Link href={href}><Button className="h-11 w-full">Abrir</Button></Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
