import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import type { SectionStat } from './types'

export function SupermarketSectionCard({ section }: { section: SectionStat }) {
  const href = `/catalog?section=${encodeURIComponent(section.name)}`
  return (
    <Link href={href} className="block group">
      <Card className="warm-panel overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-28 w-full bg-muted">
          {section.imageUrl ? (
            <Image
              src={section.imageUrl}
              alt={section.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg className="h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
            <p className="text-sm font-semibold text-white drop-shadow-sm">{section.name}</p>
          </div>
        </div>
        <CardContent className="p-3 space-y-1">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Catalogo: <strong className="text-foreground">{section.productCount}</strong></span>
            <span>Pendientes: <strong className="text-foreground">{section.pendingCount}</strong></span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
