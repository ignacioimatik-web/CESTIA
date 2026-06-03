'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { getUserShoppingLists, addProductToList } from '@/app/(dashboard)/shopping-lists/actions'
import { toast } from 'sonner'

type Props = {
  product: { name: string; section: string | null; imageUrl: string | null }
}

export function AddToListDialog({ product }: Props) {
  const [open, setOpen] = useState(false)
  const [lists, setLists] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedList(null)
    getUserShoppingLists().then(setLists).catch(() => setLists([]))
  }, [open])

  async function handleAdd() {
    if (!selectedList) return
    setAdding(true)
    try {
      await addProductToList(selectedList, product)
      toast.success('Producto añadido a la lista')
      setOpen(false)
    } catch {
      toast.error('Error al añadir el producto')
    } finally {
      setAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="rounded-lg h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Añadir</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir a lista</DialogTitle>
          <DialogDescription className="line-clamp-1">{product.name}</DialogDescription>
        </DialogHeader>

        {lists.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No tienes listas de compra activas. Crea una primero.</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {lists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => setSelectedList(list.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedList === list.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted'
                }`}
              >
                {list.name}
              </button>
            ))}
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button onClick={handleAdd} disabled={!selectedList || adding}>
            {adding ? 'Añadiendo...' : 'Añadir a lista'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
