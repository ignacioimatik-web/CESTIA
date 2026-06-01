import { PageHeader } from '@/components/layout/page-header'
import { RecipeForm } from '../recipe-form'

export default function NewRecipePage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <PageHeader title="Nueva receta" description="Añade los ingredientes y pasos de tu receta" />
      <RecipeForm />
    </div>
  )
}
