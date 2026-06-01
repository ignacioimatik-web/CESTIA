import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HouseholdSummary } from './types'

export function HouseholdSummaryCard({ summary }: { summary: HouseholdSummary | null }) {
  return (
    <Card className="warm-panel">
      <CardHeader className="pb-2"><CardTitle className="text-base">Hogar y raciones</CardTitle></CardHeader>
      <CardContent>
        {!summary ? (
          <div className="text-sm text-muted-foreground rounded-xl border border-dashed p-4">Configura tu hogar para ajustar raciones. <Link href="/household" className="text-primary font-medium">Ir a hogar</Link></div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="warm-surface rounded-xl p-2"><p className="text-muted-foreground">Adultos</p><p className="font-semibold">{summary.adults}</p></div>
              <div className="warm-surface rounded-xl p-2"><p className="text-muted-foreground">Ninos</p><p className="font-semibold">{summary.children}</p></div>
              <div className="warm-surface rounded-xl p-2"><p className="text-muted-foreground">Invitados</p><p className="font-semibold">{summary.guests}</p></div>
            </div>
            <p className="text-xs">Modo hogar: <span className="font-semibold">{summary.mode.replaceAll('_', ' ')}</span> · Multiplicador: <span className="font-semibold">x{summary.multiplier}</span></p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/household"><Button className="h-11 w-full">Editar hogar</Button></Link>
              <Link href="/household"><Button variant="outline" className="h-11 w-full">Cambiar personas</Button></Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
