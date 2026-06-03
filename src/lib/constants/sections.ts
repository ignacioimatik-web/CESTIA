export type SectionConfig = {
  id: string
  label: string
  color: string
  darkColor: string
}

export const CANONICAL_SECTIONS: SectionConfig[] = [
  { id: 'fruta-verdura',     label: 'Fruta y verdura',           color: 'bg-green-100 text-green-700',              darkColor: 'dark:bg-green-950 dark:text-green-300' },
  { id: 'carne',             label: 'Carne',                     color: 'bg-red-100 text-red-700',                  darkColor: 'dark:bg-red-950 dark:text-red-300' },
  { id: 'pescado',           label: 'Pescado',                   color: 'bg-blue-100 text-blue-700',                darkColor: 'dark:bg-blue-950 dark:text-blue-300' },
  { id: 'charcuteria',       label: 'Charcutería',               color: 'bg-rose-100 text-rose-700',                darkColor: 'dark:bg-rose-950 dark:text-rose-300' },
  { id: 'lacteos',           label: 'Lácteos',                   color: 'bg-yellow-100 text-yellow-700',            darkColor: 'dark:bg-yellow-950 dark:text-yellow-300' },
  { id: 'huevos',            label: 'Huevos',                    color: 'bg-amber-100 text-amber-700',              darkColor: 'dark:bg-amber-950 dark:text-amber-300' },
  { id: 'panaderia',         label: 'Panadería',                 color: 'bg-orange-100 text-orange-700',            darkColor: 'dark:bg-orange-950 dark:text-orange-300' },
  { id: 'despensa',          label: 'Despensa',                  color: 'bg-stone-100 text-stone-700',              darkColor: 'dark:bg-stone-950 dark:text-stone-300' },
  { id: 'pasta-arroz-legumbres', label: 'Pasta, arroz y legumbres', color: 'bg-warm-100 text-warm-700',             darkColor: 'dark:bg-warm-950 dark:text-warm-300' },
  { id: 'conservas',         label: 'Conservas',                 color: 'bg-teal-100 text-teal-700',                darkColor: 'dark:bg-teal-950 dark:text-teal-300' },
  { id: 'congelados',        label: 'Congelados',                color: 'bg-cyan-100 text-cyan-700',                darkColor: 'dark:bg-cyan-950 dark:text-cyan-300' },
  { id: 'bebidas',           label: 'Bebidas',                   color: 'bg-sky-100 text-sky-700',                  darkColor: 'dark:bg-sky-950 dark:text-sky-300' },
  { id: 'desayuno-dulces',   label: 'Desayuno y dulces',         color: 'bg-amber-50 text-amber-800',               darkColor: 'dark:bg-amber-950 dark:text-amber-200' },
  { id: 'limpieza',          label: 'Limpieza',                  color: 'bg-purple-100 text-purple-700',            darkColor: 'dark:bg-purple-950 dark:text-purple-300' },
  { id: 'higiene',           label: 'Higiene',                   color: 'bg-pink-100 text-pink-700',                darkColor: 'dark:bg-pink-950 dark:text-pink-300' },
  { id: 'bebe',              label: 'Bebé',                      color: 'bg-sky-100 text-sky-700',                  darkColor: 'dark:bg-sky-950 dark:text-sky-300' },
  { id: 'mascotas',          label: 'Mascotas',                  color: 'bg-indigo-100 text-indigo-700',            darkColor: 'dark:bg-indigo-950 dark:text-indigo-300' },
  { id: 'otros',             label: 'Otros',                     color: 'bg-gray-100 text-gray-700',                darkColor: 'dark:bg-gray-800 dark:text-gray-300' },
]

export const SECTION_LABELS = CANONICAL_SECTIONS.map((s) => s.label)
export const SECTION_IDS = new Set(CANONICAL_SECTIONS.map((s) => s.id))

export function getSectionById(id: string): SectionConfig | undefined {
  return CANONICAL_SECTIONS.find((s) => s.id === id)
}

export function getSectionByLabel(label: string): SectionConfig | undefined {
  return CANONICAL_SECTIONS.find((s) => s.label === label)
}

export function getSectionColors(label: string): { light: string; dark: string } {
  const section = getSectionByLabel(label)
  if (!section) {
    const fallback = getSectionById('otros')!
    return { light: fallback.color, dark: fallback.darkColor }
  }
  return { light: section.color, dark: section.darkColor }
}

export function getSectionOrder(label: string): number {
  const idx = CANONICAL_SECTIONS.findIndex((s) => s.label === label)
  return idx >= 0 ? idx : 999
}

export const LEGACY_TO_CANONICAL: Record<string, string> = {
  'Frutas y Verduras': 'Fruta y verdura',
  'Carnicería': 'Carne',
  'Pescadería': 'Pescado',
  'Huevos y Lácteos': 'Lácteos',
  'Panadería': 'Panadería',
  'Despensa': 'Despensa',
  'Bebidas': 'Bebidas',
  'Congelados': 'Congelados',
  'Limpieza': 'Limpieza',
  'Higiene Personal': 'Higiene',
}

function pexel(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`
}

const PXHERE_CHARCUTERIA = 'https://c.pxhere.com/photos/6b/71/hams_majorca_spain_food_serrano_tapas_mallorca_butcher-1063779.jpg!d'
const PIXNIO_CONSERVAS = 'https://pixnio.com/free-images/food-and-drink/five-cans-of-foods-including-tomato-paste-blackeye-peas-corn-and-green-beans.jpg'

export const SECTION_IMAGES: Record<string, string> = {
  'Fruta y verdura':          pexel(18212064),
  'Carne':                    pexel(31732115),
  'Pescado':                  pexel(19142282),
  'Charcutería':              PXHERE_CHARCUTERIA,
  'Lácteos y huevos':         pexel(20489330),
  'Panadería':                pexel(20140442),
  'Pasta, arroz y legumbres': pexel(410648),
  'Conservas':                PIXNIO_CONSERVAS,
  'Aceite, especias y salsas': pexel(4871148),
  'Desayuno y dulces':        pexel(16950137),
  'Congelados':               pexel(5498226),
  'Bebidas':                  pexel(6346098),
  'Limpieza':                 pexel(4492942),
  'Higiene y perfumería':     pexel(16571729),
  'Bebé':                     pexel(6592790),
  'Mascotas':                 pexel(8248845),
  'Otros':                    pexel(22624593),
}

export function getSectionImageUrl(label: string): string | undefined {
  return SECTION_IMAGES[label]
}
