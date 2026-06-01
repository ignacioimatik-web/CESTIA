import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { SectionStat } from './types'

export function SupermarketSectionsGrid({ sections }: { sections: SectionStat[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {sections.map((section) => (
        <Card key={section.key} className="warm-panel">
          <CardContent className="p-3 space-y-1">
            <p className="font-medium text-sm leading-tight">{section.name}</p>
            <p className="text-[11px] text-muted-foreground">Catalogo: {section.productCount}</p>
            <p className="text-[11px] text-muted-foreground">Pendientes: {section.pendingCount}</p>
            <Link href="/shopping-lists" className="text-xs text-primary font-medium">Ver seccion</Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
