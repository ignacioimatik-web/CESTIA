import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CatalogStatus } from './types'
import { CatalogSyncButton } from './catalog-sync-button'

export function CatalogStatusCard({ status }: { status: CatalogStatus }) {
  return (
    <Card className="warm-panel">
      <CardHeader className="pb-2"><CardTitle className="text-base">Estado del catalogo</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><span className="text-muted-foreground">Supermercado activo:</span> {status.supermarketName ?? 'Sin configurar'}</p>
        <p><span className="text-muted-foreground">Estado:</span> {status.state}</p>
        <p><span className="text-muted-foreground">Ultima sincronizacion:</span> {status.lastSync ?? 'Sin datos'}</p>
        <p><span className="text-muted-foreground">Productos guardados:</span> {status.productCount}</p>
        <p><span className="text-muted-foreground">Categorias guardadas:</span> {status.categoryCount}</p>
        <p><span className="text-muted-foreground">Imagenes disponibles:</span> {status.imagesCount}</p>
        <CatalogSyncButton canSync={status.canSync} />
      </CardContent>
    </Card>
  )
}
