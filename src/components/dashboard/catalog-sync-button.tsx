'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CatalogSyncButton({ canSync }: { canSync: boolean }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSync() {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/sync/mercadona', { method: 'POST' })
      const payload = await response.json()
      if (!response.ok) {
        setMessage(payload?.error ?? 'No se pudo sincronizar')
      } else {
        setMessage('Sincronizacion lanzada correctamente')
      }
    } catch {
      setMessage('Error de red al sincronizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <Button
        className="h-10 w-full"
        onClick={handleSync}
        disabled={!canSync || loading}
        title={canSync ? '' : 'Solo admin o entorno desarrollo'}
      >
        {loading ? 'Sincronizando...' : 'Sincronizar catalogo'}
      </Button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}
