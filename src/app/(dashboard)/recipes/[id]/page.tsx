import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRecipeById } from '../actions'
import { RecipeDetailView } from '../recipe-detail'

type Props = { params: Promise<{ id: string }> }

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params
  const recipe = await getRecipeById(id)

  if (!recipe) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === recipe.created_by

  let household = null
  if (user) {
    const { data: member } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (member) {
      const { data: h } = await supabase
        .from('households')
        .select('adults, young_children, teenagers, frequent_guests')
        .eq('id', member.household_id)
        .single()

      household = h
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <RecipeDetailView recipe={recipe} isOwner={isOwner} household={household} />
    </div>
  )
}
