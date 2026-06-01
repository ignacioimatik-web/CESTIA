import type { ShoppingListItemData } from '@/app/(dashboard)/shopping-lists/actions'
import { getSectionOrder } from '@/lib/constants/sections'

export type ExportOptions = {
  hideOwned: boolean
  showPrices: boolean
}

const CHECKED = '☑'
const UNCHECKED = '☐'

export function formatText(input: {
  name: string
  supermarketName: string | null
  createdAt: string
  items: ShoppingListItemData[]
  options?: Partial<ExportOptions>
}): string {
  const opts: ExportOptions = {
    hideOwned: false,
    showPrices: false,
    ...input.options,
  }

  const date = new Date(input.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const lines: string[] = []
  lines.push(input.name)
  lines.push('─'.repeat(input.name.length))

  if (input.supermarketName) {
    lines.push(`Supermercado: ${input.supermarketName}`)
  }
  lines.push(`Fecha: ${date}`)
  lines.push('')

  let filtered = input.items
  if (opts.hideOwned) {
    filtered = filtered.filter((i) => !i.isOwned)
  }

  const sections = new Map<string, ShoppingListItemData[]>()
  for (const item of filtered) {
    const key = item.section ?? 'Otros'
    if (!sections.has(key)) sections.set(key, [])
    sections.get(key)!.push(item)
  }

  const sortedSections = [...sections.entries()].sort(
    ([a], [b]) => getSectionOrder(a) - getSectionOrder(b)
  )

  for (const [section, items] of sortedSections) {
    lines.push(`[${section}]`)
    for (const item of items) {
      const check = item.isChecked ? CHECKED : UNCHECKED
      let qty = item.unit === 'ud'
        ? String(Math.round(item.quantity))
        : item.quantity % 1 === 0
          ? String(Math.round(item.quantity))
          : String(item.quantity)
      qty = qty.replace('.', ',')

      let line = `${check} ${item.name} - ${qty} ${item.unit}`

      if (opts.showPrices && item.matchedProduct?.price != null) {
        const total = (item.matchedProduct.price * item.quantity).toFixed(2)
        line += ` (${total.replace('.', ',')}€)`
      }

      if (item.notes) {
        line += ` — ${item.notes}`
      }

      lines.push(line)
    }
    lines.push('')
  }

  return lines.join('\n')
}

export function formatCSV(input: {
  name: string
  supermarketName: string | null
  createdAt: string
  items: ShoppingListItemData[]
  options?: Partial<ExportOptions>
}): string {
  const opts: ExportOptions = {
    hideOwned: false,
    showPrices: false,
    ...input.options,
  }

  let filtered = input.items
  if (opts.hideOwned) {
    filtered = filtered.filter((i) => !i.isOwned)
  }

  const sections = new Map<string, ShoppingListItemData[]>()
  for (const item of filtered) {
    const key = item.section ?? 'Otros'
    if (!sections.has(key)) sections.set(key, [])
    sections.get(key)!.push(item)
  }

  const sortedSections = [...sections.entries()].sort(
    ([a], [b]) => getSectionOrder(a) - getSectionOrder(b)
  )

  const esc = (v: string | number | null | undefined): string => {
    if (v == null) return ''
    const s = String(v).replace(/"/g, '""')
    return /[",;\n]/.test(s) ? `"${s}"` : s
  }

  const rows: string[] = []
  rows.push([
    'Título', 'Supermercado', 'Fecha',
    'Sección', 'Producto', 'Cantidad', 'Unidad',
    'Tachado', 'Precio', 'Notas',
  ].map(esc).join(','))

  for (const [section, items] of sortedSections) {
    for (const item of items) {
      const price = opts.showPrices && item.matchedProduct?.price != null
        ? String((item.matchedProduct.price * item.quantity).toFixed(2))
        : ''
      rows.push([
        input.name,
        input.supermarketName ?? '',
        input.createdAt,
        section,
        item.name,
        item.quantity,
        item.unit,
        item.isChecked ? 'Sí' : 'No',
        price,
        item.notes ?? '',
      ].map(esc).join(','))
    }
  }

  return rows.join('\n')
}
