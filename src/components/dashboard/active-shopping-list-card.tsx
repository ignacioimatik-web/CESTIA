import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProgress } from './helpers'
import type { ActiveListSummary } from './types'

export function ActiveShoppingListCard({ list }: { list: ActiveListSummary | null }) {
  if (!list) {
    return (
      <Card className="warm-panel">
        <CardContent className="p-5 text-sm text-muted-foreground">
          No hay lista activa. <Link href="/shopping-lists/new" className="text-primary font-medium">Crear primera lista</Link>
        </CardContent>
      </Card>
    )
  }

  const progress = getProgress(list.totalItems, list.checkedItems)

  return (
    <Card className="warm-panel">
      <CardHeader className="pb-2"><CardTitle className="text-base">Lista activa</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-semibold text-sm">{list.name}</p>
          <p className="text-xs text-muted-foreground">{list.supermarket ?? 'Sin supermercado'} · {list.totalItems} productos · {list.sections.length} secciones</p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div>
        <p className="text-xs text-muted-foreground">{list.checkedItems} comprados · {list.pendingItems} pendientes</p>
        <div className="flex flex-wrap gap-1">{list.sections.slice(0, 5).map((s) => <span key={s.name} className="text-[10px] px-2 py-1 rounded-full bg-muted">{s.name} ({s.count})</span>)}</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link href={`/shopping-lists/${list.id}`}><Button className="h-10 w-full">Abrir lista</Button></Link>
          <Link href={`/shopping-lists/${list.id}`}><Button variant="outline" className="h-10 w-full">Exportar</Button></Link>
          <Button variant="outline" className="h-10" disabled title="Disponible proximamente">Compartir</Button>
          <Button variant="destructive" className="h-10" disabled title="Vaciar pendiente de accion segura">Vaciar</Button>
        </div>
      </CardContent>
    </Card>
  )
}
