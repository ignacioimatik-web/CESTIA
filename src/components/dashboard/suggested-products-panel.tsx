import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SuggestedProduct } from './types'
import { SuggestedProductCard } from './suggested-product-card'

export function SuggestedProductsPanel({ products }: { products: SuggestedProduct[] }) {
  return (
    <Card className="warm-panel">
      <CardHeader className="pb-2"><CardTitle className="text-base">Productos sugeridos</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {products.length === 0 ? (
          <div className="text-sm text-muted-foreground rounded-xl border border-dashed p-4">Catalogo pendiente de sincronizacion. Usaremos ingredientes genericos hasta tener productos cacheados.</div>
        ) : products.map((p) => <SuggestedProductCard key={p.id} product={p} />)}
      </CardContent>
    </Card>
  )
}
