const categories = ['Healthy', 'Alta proteina', 'De la abuela', 'Deportistas', 'Para adelgazar', 'Veganas', 'Vegetarianas', 'Familia numerosa', 'Ninos', 'Cenas rapidas', 'Batch cooking', 'Bajo coste', 'Cenas romanticas', 'Cumpleanos']

export function RecipeCategoryRail() {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-2 min-w-max">
        {categories.map((c) => (
          <span key={c} className="px-3 py-1.5 rounded-full text-xs bg-muted text-foreground">{c}</span>
        ))}
      </div>
    </div>
  )
}
