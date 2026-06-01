import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Apple, Beef, Fish, Milk, ShoppingBasket, Sparkles } from 'lucide-react'
import type { SectionStat } from './types'

function getSectionIcon(section: string) {
  const name = section.toLowerCase()
  if (name.includes('fruta') || name.includes('verdura')) return <Apple className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
  if (name.includes('carne')) return <Beef className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
  if (name.includes('pesc')) return <Fish className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
  if (name.includes('lact') || name.includes('huevo')) return <Milk className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
  if (name.includes('pan')) return <ShoppingBasket className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
  return <Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
}

export function SupermarketSectionCard({ section }: { section: SectionStat }) {
  const icon = getSectionIcon(section.name)
  return (
    <Card className="warm-panel">
      <CardContent className="p-3 space-y-1">
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
          {icon}
        </div>
        <p className="font-medium text-sm leading-tight">{section.name}</p>
        <p className="text-[11px] text-muted-foreground">Catalogo: {section.productCount}</p>
        <p className="text-[11px] text-muted-foreground">Pendientes: {section.pendingCount}</p>
        <Link href="/shopping-lists" className="text-xs text-primary font-medium">Ver seccion</Link>
      </CardContent>
    </Card>
  )
}
