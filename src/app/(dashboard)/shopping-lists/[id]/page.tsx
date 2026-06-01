import { ShoppingListContent } from '@/components/shopping-list/shopping-list-content'

export default async function ShoppingListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ShoppingListContent id={id} />
}
