import type { SectionStat } from './types'
import { SupermarketSectionCard } from './supermarket-section-card'

export function SupermarketSectionsGrid({ sections }: { sections: SectionStat[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {sections.map((section) => <SupermarketSectionCard key={section.key} section={section} />)}
    </div>
  )
}
