import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardHeroState } from './types'
import { euro } from './helpers'

export function DashboardHero({ state }: { state: DashboardHeroState }) {
  return (
    <Card className="warm-panel">
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Compra inteligente desde tus recetas</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Elige recetas, ajusta personas, genera ingredientes, encuentra productos y organiza tu compra por secciones.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/shopping-lists/new"><Button className="h-9 rounded-lg text-sm">Crear lista</Button></Link>
            <Link href="/recipes/new"><Button variant="outline" className="h-9 rounded-lg text-sm">Nueva receta</Button></Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
          <div className="warm-surface rounded-lg p-2"><p className="text-muted-foreground">Supermercado</p><p className="font-semibold mt-0.5 truncate">{state.supermarketActive ?? 'Sin configurar'}</p></div>
          <div className="warm-surface rounded-lg p-2"><p className="text-muted-foreground">Hogar</p><p className="font-semibold mt-0.5 truncate">{state.householdActive ?? 'Sin hogar'}</p></div>
          <div className="warm-surface rounded-lg p-2"><p className="text-muted-foreground">Lista activa</p><p className="font-semibold mt-0.5 truncate">{state.activeList ?? 'Sin lista'}</p></div>
          <div className="warm-surface rounded-lg p-2"><p className="text-muted-foreground">Pendientes</p><p className="font-semibold mt-0.5">{state.pendingProducts}</p></div>
          <div className="warm-surface rounded-lg p-2"><p className="text-muted-foreground">Coste estimado</p><p className="font-semibold mt-0.5">{euro(state.estimatedCost) ?? '—'}</p></div>
        </div>
      </CardContent>
    </Card>
  )
}
