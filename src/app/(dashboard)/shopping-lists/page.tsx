import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingListCard } from '@/components/shared/shopping-list-card'
import { Button } from '@/components/ui/button'
import { FadeIn, StaggerList, StaggerItem } from '@/components/shared/animations'
import { ShoppingCart, Plus, Sparkles } from 'lucide-react'
import { getShoppingLists } from './actions'

export default async function ShoppingListsPage() {
  const lists = await getShoppingLists()

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <FadeIn>
        <div className="mb-6">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Compra</span>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Lista de Compra</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">Tus listas generadas desde recetas</p>
            </div>
            <Link href="/shopping-lists/new">
              <Button className="rounded-xl">
                <Plus className="h-4 w-4 mr-1.5" />
                Nueva lista
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      {lists.length > 0 ? (
        <StaggerList className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <StaggerItem key={list.id}>
              <Link href={`/shopping-lists/${list.id}`} className="block">
                <ShoppingListCard
                  id={list.id}
                  name={list.name}
                  totalItems={list.total}
                  checkedItems={list.checked}
                  isCompleted={list.isCompleted}
                />
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      ) : (
        <FadeIn>
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Sin listas de compra</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Selecciona recetas y genera tu primera lista organizada por secciones.
              </p>
              <Link href="/shopping-lists/new">
                <Button size="sm" className="mt-4 rounded-lg">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Generar lista
                </Button>
              </Link>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  )
}
