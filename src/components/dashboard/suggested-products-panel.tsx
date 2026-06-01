import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { euro } from './helpers'
import type { SuggestedProduct } from './types'

export function SuggestedProductsPanel({ products }: { products: SuggestedProduct[] }) {
  return (
    <Card className="warm-panel">
      <CardHeader className="pb-2"><CardTitle className="text-base">Productos sugeridos</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {products.length === 0 ? (
          <div className="text-sm text-muted-foreground rounded-xl border border-dashed p-4">Catalogo pendiente de sincronizacion. Usaremos ingredientes genericos hasta tener productos cacheados.</div>
        ) : products.map((p) => (
          <div key={p.id} className="warm-surface rounded-xl p-3">
            <div className="flex gap-2">
              <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} width={48} height={48} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">Prod.</div>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.brand ?? 'Marca no disponible'} · {p.format}</p>
                <p className="text-xs text-muted-foreground">{euro(p.price) ?? 'Sin precio'} {p.pricePerUnit ? `· ${euro(p.pricePerUnit)}/kg/l` : ''}</p>
                <p className="text-[11px] text-muted-foreground">Seccion: {p.section ?? 'Otros'} · Ingrediente: {p.ingredientName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button className="h-9">Usar</Button>
              <Button variant="outline" className="h-9" disabled title="Cambio manual disponible en lista activa">Cambiar</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
