'use client'

import { PageHeader } from '@/components/layout/page-header'
import { ShoppingListCard } from '@/components/shared/shopping-list-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus } from 'lucide-react'

const exampleLists = [
  {
    id: '1',
    name: 'Compra semanal',
    supermarket: 'Mercadona',
    totalItems: 12,
    checkedItems: 5,
  },
  {
    id: '2',
    name: 'Cena del sábado',
    supermarket: 'Mercadona',
    totalItems: 8,
    checkedItems: 8,
    isCompleted: true,
  },
]

export default function ShoppingListsPage() {
  const hasLists = exampleLists.length > 0

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <PageHeader
        title="Lista de Compra"
        description="Tus listas generadas desde recetas"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-1.5" />
            Nueva lista
          </Button>
        }
      />

      {hasLists ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exampleLists.map((list) => (
            <ShoppingListCard key={list.id} {...list} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title="Sin listas de compra"
          description="Selecciona recetas y genera tu primera lista organizada por secciones."
          action={
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              Generar lista
            </Button>
          }
        />
      )}
    </div>
  )
}
