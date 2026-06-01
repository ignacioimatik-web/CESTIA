import { Button } from '@/components/ui/button'
import { SquareMedia } from './square-media'
import { euro } from './helpers'
import type { SuggestedProduct } from './types'

export function SuggestedProductCard({ product }: { product: SuggestedProduct }) {
  return (
    <div className="warm-surface rounded-xl p-3">
      <div className="flex gap-2">
        <SquareMedia src={product.imageUrl} alt={product.name} fallback={<span>Prod.</span>} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground truncate">{product.brand ?? 'Marca no disponible'} · {product.format}</p>
          <p className="text-xs text-muted-foreground">{euro(product.price) ?? 'Sin precio'} {product.pricePerUnit ? `· ${euro(product.pricePerUnit)}/kg/l` : ''}</p>
          <p className="text-[11px] text-muted-foreground">Seccion: {product.section ?? 'Otros'} · Ingrediente: {product.ingredientName}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Button className="h-9" disabled title="Uso directo en sugeridos: proximamente">Usar</Button>
        <Button variant="outline" className="h-9" disabled title="Cambio manual disponible en lista activa">Cambiar</Button>
      </div>
    </div>
  )
}
