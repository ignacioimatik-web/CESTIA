import { SquareMedia } from './square-media'

export function ActiveShoppingListItemPreview({
  item,
}: {
  item: { name: string; section: string | null; imageUrl: string | null }
}) {
  return (
    <div className="warm-surface rounded-xl p-2 flex items-center gap-2">
      <SquareMedia src={item.imageUrl} alt={item.name} fallback={<span>Item</span>} />
      <div className="min-w-0">
        <p className="text-xs font-medium truncate">{item.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">{item.section ?? 'Otros'}</p>
      </div>
    </div>
  )
}
