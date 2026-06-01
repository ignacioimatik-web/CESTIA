import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { getRecipeById } from '../../actions'
import { RecipeForm } from '../../recipe-form'

type Props = { params: Promise<{ id: string }> }

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params
  const recipe = await getRecipeById(id)

  if (!recipe) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.id !== recipe.created_by) redirect('/recipes')

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <PageHeader title="Editar receta" description={recipe.name} />
      <RecipeForm recipe={recipe} />
    </div>
  )
}
