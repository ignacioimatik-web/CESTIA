import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardHeroState } from './types'
import { euro } from './helpers'

export function DashboardHero({ state }: { state: DashboardHeroState }) {
  return (
    <Card className="warm-panel">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Compra inteligente desde tus recetas</h1>
          <p className="text-sm text-muted-foreground mt-1">Elige recetas, ajusta personas, genera ingredientes, encuentra productos y organiza tu compra por secciones.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link href="/shopping-lists/new"><Button className="h-12 w-full">Crear lista desde recetas</Button></Link>
          <Link href="/shopping-lists/new"><Button variant="outline" className="h-12 w-full">Planificar menu semanal</Button></Link>
          <Link href="/events/new"><Button variant="outline" className="h-12 w-full">Crear evento</Button></Link>
          <Link href="/shopping-lists"><Button variant="outline" className="h-12 w-full">Explorar supermercado</Button></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="warm-surface rounded-xl p-2"><p className="text-muted-foreground">Supermercado activo</p><p className="font-semibold mt-0.5 truncate">{state.supermarketActive ?? 'Sin configurar'}</p></div>
          <div className="warm-surface rounded-xl p-2"><p className="text-muted-foreground">Hogar activo</p><p className="font-semibold mt-0.5 truncate">{state.householdActive ?? 'Sin hogar'}</p></div>
          <div className="warm-surface rounded-xl p-2"><p className="text-muted-foreground">Lista activa</p><p className="font-semibold mt-0.5 truncate">{state.activeList ?? 'Sin lista'}</p></div>
          <div className="warm-surface rounded-xl p-2"><p className="text-muted-foreground">Pendientes</p><p className="font-semibold mt-0.5">{state.pendingProducts}</p></div>
          <div className="warm-surface rounded-xl p-2"><p className="text-muted-foreground">Coste estimado</p><p className="font-semibold mt-0.5">{euro(state.estimatedCost) ?? 'Sin precios'}</p></div>
        </div>
      </CardContent>
    </Card>
  )
}
