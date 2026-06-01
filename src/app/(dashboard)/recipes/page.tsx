import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { getRecipes } from './actions'
import { RecipeList } from './recipe-list'

export default async function RecipesPage() {
  const { recipes, total } = await getRecipes()

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <PageHeader
        title="Recetas"
        description="Tus recetas favoritas, siempre a mano"
        action={
          <div className="flex items-center gap-2">
            <Link href="/shopping-lists/new">
              <Button variant="outline">
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                Generar lista
              </Button>
            </Link>
            <Link href="/recipes/new">
              <Button>
                <Plus className="h-4 w-4 mr-1.5" />
                Nueva receta
              </Button>
            </Link>
          </div>
        }
      />

      <RecipeList initialRecipes={recipes} initialTotal={total} />
    </div>
  )
}
